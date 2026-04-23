import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { auth } from '../middleware/auth.js'
import { checkoutLimiter } from '../middleware/rateLimit.js'
import { supabaseAdmin } from '../lib/supabase.js'
import { getActivePromotion } from '../services/promotion.service.js'
import { calculateAmount, createPayosOrder, getPayosOrderStatus } from '../services/payos.service.js'
import crypto from 'crypto'

const router = Router()

const VALID_PLANS = ['1month', '3months', '1year']

/**
 * POST /api/checkout/create
 * Tạo đơn hàng PayOS và trả về QR code
 * user_id lấy từ req.user (JWT) — KHÔNG từ body
 */
router.post(
  '/create',
  auth,
  checkoutLimiter,
  [
    body('template_id').isUUID().withMessage('template_id không hợp lệ'),
    body('plan').isIn(VALID_PLANS).withMessage('Plan phải là 1month, 3months hoặc 1year'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const { template_id, plan } = req.body
    const userId = req.user.id

    // Lấy thông tin template
    const { data: template, error: tplError } = await supabaseAdmin
      .from('templates')
      .select('id, name, price, status')
      .eq('id', template_id)
      .single()

    if (tplError || !template) {
      return res.status(404).json({ error: 'Template không tồn tại' })
    }

    if (template.status !== 'visible') {
      return res.status(400).json({ error: 'Template không khả dụng' })
    }

    if (template.price === 0) {
      return res.status(400).json({ error: 'Template này miễn phí, không cần thanh toán' })
    }

    // Kiểm tra đã có subscription còn hiệu lực chưa
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, expires_at')
      .eq('user_id', userId)
      .eq('template_id', template_id)
      .single()

    if (existingSub?.expires_at) {
      const daysLeft = Math.ceil((new Date(existingSub.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
      // Cho phép gia hạn nếu còn <= 7 ngày
      if (daysLeft > 7) {
        return res.status(409).json({ error: 'Bạn đã có subscription còn hiệu lực' })
      }
    }

    // Lấy promotion đang active (nếu có)
    const promo = await getActivePromotion()
    const promoPct = promo?.discount_pct || 0

    // Tính amount bằng calculateAmount() — KHÔNG lưu DB trực tiếp
    const originalAmount = calculateAmount(template.price, 0, plan)
    const amount = calculateAmount(template.price, promoPct, plan)
    const discountPct = promoPct

    // Tạo order_code unique (timestamp + random)
    const orderCode = Date.now().toString()

    // Lưu đơn hàng vào DB với status 'pending'
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_code: orderCode,
        user_id: userId,
        template_id,
        plan,
        amount,
        original_amount: originalAmount,
        discount_pct: discountPct,
        status: 'pending',
      })
      .select('id, order_code')
      .single()

    if (orderError) {
      console.error('checkout createOrder error:', orderError)
      return res.status(500).json({ error: 'Không thể tạo đơn hàng' })
    }

    // Tạo đơn PayOS + lấy QR code
    let qrCode, payosOrderId
    try {
      const payosResult = await createPayosOrder({
        orderCode,
        amount,
        description: `EZT-${template_id.substring(0, 8)}`,
        returnUrl: `${process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/thanh-toan-thanh-cong`,
        cancelUrl: `${process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/checkout/${template_id}`,
      })
      qrCode = payosResult.qrCode
      payosOrderId = payosResult.payosOrderId
    } catch (payosErr) {
      console.error('PayOS createOrder failed:', payosErr)
      // Cập nhật order thành failed
      await supabaseAdmin.from('orders').update({ status: 'failed' }).eq('id', order.id)
      return res.status(502).json({ error: 'Không thể tạo thanh toán PayOS. Vui lòng thử lại.' })
    }

    // Cập nhật order với payos_order_id và qr_code
    await supabaseAdmin
      .from('orders')
      .update({ payos_order_id: payosOrderId, qr_code: qrCode })
      .eq('id', order.id)

    res.json({
      data: {
        order_code: orderCode,
        qr_code: qrCode,
        amount,
        original_amount: originalAmount,
        discount_pct: discountPct,
        plan,
      }
    })
  }
)

/**
 * GET /api/checkout/:order_code/status
 * Polling trạng thái đơn hàng từ PayOS
 * user_id từ req.user, chỉ cho xem đơn của chính mình
 */
router.get('/:order_code/status', auth, async (req, res) => {
  const { order_code } = req.params
  const userId = req.user.id

  // Lấy đơn hàng từ DB (verify ownership)
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, status, amount, plan, template_id, paid_at')
    .eq('order_code', order_code)
    .eq('user_id', userId)
    .single()

  if (orderError || !order) {
    return res.status(404).json({ error: 'Đơn hàng không tồn tại' })
  }

  // Nếu đã paid trong DB → trả về ngay, không cần hỏi PayOS
  if (order.status === 'paid') {
    return res.json({ data: { status: 'paid', paid_at: order.paid_at } })
  }

  // Nếu đang pending → hỏi PayOS
  try {
    const { status: payosStatus } = await getPayosOrderStatus(order_code)
    const normalizedStatus = payosStatus?.toLowerCase() === 'paid' ? 'paid' : order.status

    res.json({ data: { status: normalizedStatus } })
  } catch (err) {
    console.error('polling PayOS error:', err)
    // Trả về status hiện tại trong DB nếu PayOS không phản hồi
    res.json({ data: { status: order.status } })
  }
})

export default router
