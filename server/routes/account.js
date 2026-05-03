import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

/**
 * GET /api/account/purchases
 * Danh sách template đã mua của user (one-time, không có hạn)
 * user_id lấy từ req.user (JWT) — KHÔNG từ params
 */
router.get('/purchases', auth, async (req, res) => {
  const userId = req.user.id

  const { data, error } = await supabaseAdmin
    .from('purchases')
    .select(`
      id, purchased_at, order_id,
      templates ( id, slug, name, icon, image_url, app_url, price )
    `)
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false })

  if (error) {
    console.error('getAccountPurchases error:', error)
    return res.status(500).json({ error: 'Failed to fetch purchases' })
  }

  res.json({ data: data || [] })
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
      id, order_code, amount, original_amount, discount_pct,
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
