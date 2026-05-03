import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { verifyWebhookSignature } from '../services/payos.service.js'
import { sendPurchaseEmail } from '../services/email.service.js'

const router = Router()

/**
 * POST /api/webhook/payos
 * Nhận callback từ PayOS khi thanh toán hoàn tất
 *
 * ⚠️ Luôn trả 200 (idempotent) — PayOS sẽ retry nếu không nhận được 200
 * ⚠️ Verify HMAC bắt buộc trước khi xử lý
 */
router.post('/payos', async (req, res) => {
  try {
    const body = req.body

    // Bước 1: Verify HMAC checksum
    const isValid = verifyWebhookSignature(body)

    if (!isValid) {
      console.warn('PayOS webhook: invalid HMAC signature', body)
      return res.status(200).json({ success: false, message: 'Invalid signature' })
    }

    const webhookBody = req.body
    const orderCode = webhookBody.data?.orderCode
    const isPaid = webhookBody.code === '00' && webhookBody.success === true

    console.log('[Webhook] HMAC verified, processing...')
    console.log('[Webhook] Order code:', orderCode)
    console.log('[Webhook] Is Paid:', isPaid)

    // Bước 2: Chỉ xử lý khi thanh toán thành công
    if (!isPaid) {
      return res.status(200).json({ success: true, message: 'Non-paid event acknowledged' })
    }

    // Bước 3: Tìm order theo orderCode
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, template_id, status')
      .eq('order_code', String(orderCode))
      .single()

    console.log('[Webhook] Found order:', order)

    if (orderError || !order) {
      console.error('PayOS webhook: order not found', orderCode)
      return res.status(200).json({ success: false, message: 'Order not found' })
    }

    // Bước 4: Idempotency — bỏ qua nếu đã paid
    if (order.status === 'paid') {
      return res.status(200).json({ success: true, message: 'Already processed' })
    }

    // Bước 5: Cập nhật order → paid
    const paidAt = new Date().toISOString()
    const updateResult = await supabaseAdmin
      .from('orders')
      .update({ status: 'paid', paid_at: paidAt })
      .eq('id', order.id)
      .select()

    console.log('[Webhook] Order updated:', updateResult)

    // Bước 6: Lưu vào bảng purchases (one-time purchase, không có expires_at)
    const purchaseResult = await supabaseAdmin
      .from('purchases')
      .upsert(
        {
          user_id: order.user_id,
          template_id: order.template_id,
          order_id: order.id,
          purchased_at: paidAt,
        },
        { onConflict: 'user_id,template_id' }
      )
      .select()

    console.log('[Webhook] Purchase created:', purchaseResult)

    if (purchaseResult.error) {
      console.error('PayOS webhook: upsert purchase error', purchaseResult.error)
      // Không throw — đã paid, sẽ handle thủ công nếu cần
    }

    // Bước 7: Gửi email thông báo (non-blocking)
    try {
      // Lấy email user + thông tin template để gửi email
      const [userRes, templateRes] = await Promise.all([
        supabaseAdmin.auth.admin.getUserById(order.user_id),
        supabaseAdmin.from('templates').select('name, app_url').eq('id', order.template_id).single(),
      ])

      const userEmail = userRes?.data?.user?.email
      const templateName = templateRes?.data?.name
      const appUrl = templateRes?.data?.app_url

      if (userEmail && templateName) {
        await sendPurchaseEmail(userEmail, templateName, appUrl)
        console.log('[Webhook] Purchase email sent to:', userEmail)
      }
    } catch (emailErr) {
      // Email thất bại không ảnh hưởng đến order
      console.error('[Webhook] Send purchase email failed:', emailErr.message)
    }

    console.log(`[Webhook] order ${orderCode} processed successfully`)
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
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, template_id, status')
      .eq('order_code', String(order_code))
      .single()

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.status === 'paid') {
      return res.status(200).json({ success: true, message: 'Already processed' })
    }

    const paidAt = new Date().toISOString()

    // Cập nhật order → paid
    await supabaseAdmin
      .from('orders')
      .update({ status: 'paid', paid_at: paidAt })
      .eq('id', order.id)

    // Upsert purchase
    const { error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .upsert(
        {
          user_id: order.user_id,
          template_id: order.template_id,
          order_id: order.id,
          purchased_at: paidAt,
        },
        { onConflict: 'user_id,template_id' }
      )

    if (purchaseError) {
      console.error('[DEV] manual-confirm: upsert purchase error', purchaseError)
    }

    console.log(`[DEV] manual-confirm: order ${order_code} activated successfully`)
    return res.status(200).json({ success: true, message: 'Order manually confirmed' })

  } catch (err) {
    console.error('[DEV] manual-confirm error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
