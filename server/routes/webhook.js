import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { verifyWebhookSignature } from '../services/payos.service.js'

const router = Router()

// Days to add per plan
const PLAN_DAYS = { '1month': 30, '3months': 90, '1year': 365 }

/**
 * POST /api/webhook/payos
 * Nhận callback từ PayOS khi thanh toán hoàn tất
 *
 * ⚠️ Luôn trả 200 (idempotent) — PayOS sẽ retry nếu không nhận được 200
 * ⚠️ Verify HMAC bắt buộc trước khi xử lý
 */
router.post('/payos', async (req, res) => {
  // Bước 1: Luôn ack 200 trước — sau đó xử lý bất đồng bộ hoặc inline
  // (Theo pattern idempotent — PayOS không chờ response body)

  try {
    const body = req.body

    // Bước 2: Verify HMAC checksum
    const isValid = verifyWebhookSignature(body)

    if (!isValid) {
      console.warn('PayOS webhook: invalid HMAC signature', body)
      // Trả 200 nhưng không xử lý — tránh expose logic lỗi
      return res.status(200).json({ success: false, message: 'Invalid signature' })
    }

    const { orderCode, status } = body

    console.log('[Webhook] HMAC verified, processing...')
    console.log('[Webhook] Order code:', orderCode)
    console.log('[Webhook] Status:', status)

    // Bước 3: Chỉ xử lý khi status = PAID
    if (status !== 'PAID') {
      return res.status(200).json({ success: true, message: 'Non-paid event acknowledged' })
    }

    // Bước 4: Tìm order theo orderCode
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, template_id, plan, status')
      .eq('order_code', String(orderCode))
      .single()

    console.log('[Webhook] Found order:', order)

    if (orderError || !order) {
      console.error('PayOS webhook: order not found', orderCode)
      return res.status(200).json({ success: false, message: 'Order not found' })
    }

    // Bước 5: Idempotency — bỏ qua nếu đã paid
    if (order.status === 'paid') {
      return res.status(200).json({ success: true, message: 'Already processed' })
    }

    // Bước 6: Cập nhật order → paid
    const paidAt = new Date().toISOString()
    const updateResult = await supabaseAdmin
      .from('orders')
      .update({ status: 'paid', paid_at: paidAt })
      .eq('id', order.id)
      .select()

    console.log('[Webhook] Order updated:', updateResult)

    // Bước 7: Tính expires_at theo plan
    const days = PLAN_DAYS[order.plan]
    const expiresAt = days
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      : null  // null = vĩnh viễn (không có plan phù hợp thì activate vĩnh viễn)

    // Bước 8: Upsert subscription
    const subResult = await supabaseAdmin
      .from('subscriptions')
      .upsert(
        {
          user_id: order.user_id,
          template_id: order.template_id,
          expires_at: expiresAt,
          is_active: true,
          updated_at: paidAt,
        },
        { onConflict: 'user_id,template_id' }
      )
      .select()

    console.log('[Webhook] Subscription created:', subResult)

    if (subResult.error) {
      console.error('PayOS webhook: upsert subscription error', subResult.error)
      // Không throw — đã paid, sẽ handle thủ công nếu cần
    }

    console.log(`PayOS webhook: order ${orderCode} processed successfully`)
    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('PayOS webhook unhandled error:', err)
    // Luôn trả 200 — tránh PayOS retry vô hạn
    return res.status(200).json({ success: false, message: 'Internal error' })
  }
})

/**
 * POST /api/webhook/manual-confirm
 * ⚠️ CHỈ DÙNG KHI DEVELOPMENT — mô phỏng PayOS webhook để test local
 * Khi NODE_ENV !== 'development', endpoint này trả 404.
 */
router.post('/manual-confirm', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' })
  }

  const { order_code } = req.body
  if (!order_code) {
    return res.status(400).json({ error: 'order_code is required' })
  }

  try {
    // Tìm order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, template_id, plan, status')
      .eq('order_code', String(order_code))
      .single()

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.status === 'paid') {
      return res.status(200).json({ success: true, message: 'Already processed' })
    }

    // Cập nhật order → paid
    const paidAt = new Date().toISOString()
    await supabaseAdmin
      .from('orders')
      .update({ status: 'paid', paid_at: paidAt })
      .eq('id', order.id)

    // Tính expires_at theo plan
    const days = PLAN_DAYS[order.plan]
    const expiresAt = days
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      : null

    // Upsert subscription
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert(
        {
          user_id: order.user_id,
          template_id: order.template_id,
          expires_at: expiresAt,
          is_active: true,
          updated_at: paidAt,
        },
        { onConflict: 'user_id,template_id' }
      )

    if (subError) {
      console.error('[DEV] manual-confirm: upsert subscription error', subError)
    }

    console.log(`[DEV] manual-confirm: order ${order_code} activated successfully`)
    return res.status(200).json({ success: true, message: 'Order manually confirmed' })

  } catch (err) {
    console.error('[DEV] manual-confirm error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

