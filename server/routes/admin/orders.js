import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { adminAuth } from '../../middleware/adminAuth.js'
import { supabaseAdmin } from '../../lib/supabase.js'

const router = Router()
router.use(auth, adminAuth)

/**
 * GET /api/admin/orders
 * Lịch sử tất cả đơn hàng (sort paid_at DESC)
 */
router.get('/', async (req, res) => {
  const { limit = 50, offset = 0, status } = req.query

  let query = supabaseAdmin
    .from('orders')
    .select(`
      id, order_code, plan, amount, original_amount, discount_pct,
      status, created_at, paid_at,
      profiles ( id, email, display_name ),
      templates ( id, slug, name )
    `)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('admin getOrders error:', error)
    return res.status(500).json({ error: 'Không thể lấy danh sách đơn hàng' })
  }

  res.json({ data: data || [] })
})

/**
 * PATCH /api/admin/orders/:id/activate
 * Mở thủ công: đặt order status = 'paid' và upsert subscription
 * Dùng khi cần xử lý đơn hàng thủ công (PayOS lỗi, chuyển khoản tay, etc.)
 */
router.patch('/:id/activate', async (req, res) => {
  // Lấy đơn hàng
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, status, user_id, template_id, plan')
    .eq('id', req.params.id)
    .single()

  if (orderError || !order) {
    return res.status(404).json({ error: 'Đơn hàng không tồn tại' })
  }

  if (order.status === 'paid') {
    return res.status(400).json({ error: 'Đơn hàng đã được thanh toán trước đó' })
  }

  const PLAN_DAYS = { '1month': 30, '3months': 90, '1year': 365 }
  const paidAt  = new Date().toISOString()
  const days    = PLAN_DAYS[order.plan]
  const expiresAt = days
    ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    : null

  // Cập nhật order → paid
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'paid', paid_at: paidAt })
    .eq('id', order.id)

  if (updateError) {
    return res.status(500).json({ error: 'Không thể cập nhật đơn hàng' })
  }

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
    console.error('admin activate order sub upsert error:', subError)
    // Order đã paid — chấp nhận partial success, log để xử lý thủ công
  }

  res.json({ message: 'Đơn hàng đã được kích hoạt thủ công', data: { id: order.id, status: 'paid', paid_at: paidAt, expires_at: expiresAt } })
})

export default router
