import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { supabaseAdmin } from '../lib/supabase.js'
import { getSubscriptionStatus } from '../services/subscription.service.js'

const router = Router()

/**
 * GET /api/account/subscriptions
 * Danh sách subscriptions của user đang đăng nhập
 * user_id lấy từ req.user (JWT) — KHÔNG từ params
 */
router.get('/subscriptions', auth, async (req, res) => {
  const userId = req.user.id

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select(`
      id, expires_at, is_active, created_at, updated_at,
      templates ( id, slug, name, icon, image_url, app_url, price )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAccountSubscriptions error:', error)
    return res.status(500).json({ error: 'Failed to fetch subscriptions' })
  }

  // Tính trạng thái mỗi subscription động — KHÔNG lưu DB
  const subscriptions = (data || []).map(sub => ({
    ...sub,
    ...getSubscriptionStatus(sub.expires_at),
  }))

  res.json({ data: subscriptions })
})

/**
 * GET /api/account/orders
 * Lịch sử thanh toán của user đang đăng nhập
 * Sắp xếp paid_at DESC
 */
router.get('/orders', auth, async (req, res) => {
  const userId = req.user.id

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id, order_code, plan, amount, original_amount, discount_pct,
      status, created_at, paid_at,
      templates ( id, slug, name, icon )
    `)
    .eq('user_id', userId)
    .order('paid_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAccountOrders error:', error)
    return res.status(500).json({ error: 'Failed to fetch orders' })
  }

  res.json({ data: data || [] })
})

export default router
