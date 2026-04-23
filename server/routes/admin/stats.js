import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { adminAuth } from '../../middleware/adminAuth.js'
import { supabaseAdmin } from '../../lib/supabase.js'

const router = Router()
router.use(auth, adminAuth)

/**
 * GET /api/admin/stats
 * Tổng quan doanh thu và hệ thống
 */
router.get('/', async (req, res) => {
  try {
    // Chạy song song để tối ưu thời gian
    const [
      usersResult,
      templatesResult,
      ordersResult,
      recentOrdersResult,
    ] = await Promise.all([
      // Tổng số user chưa xóa
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_deleted', false),

      // Tổng số template đang visible
      supabaseAdmin
        .from('templates')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'visible'),

      // Tổng doanh thu và số đơn paid
      supabaseAdmin
        .from('orders')
        .select('amount, created_at')
        .eq('status', 'paid'),

      // 10 đơn hàng gần nhất
      supabaseAdmin
        .from('orders')
        .select(`
          id, order_code, amount, plan, status, created_at, paid_at,
          profiles ( email, display_name ),
          templates ( name, slug )
        `)
        .eq('status', 'paid')
        .order('paid_at', { ascending: false })
        .limit(10),
    ])

    // Tính tổng doanh thu
    const paidOrders = ordersResult.data || []
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.amount), 0)

    // Doanh thu 30 ngày gần nhất
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const revenue30d = paidOrders
      .filter(o => o.created_at >= thirtyDaysAgo)
      .reduce((sum, o) => sum + Number(o.amount), 0)

    // Doanh thu 7 ngày gần nhất
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const revenue7d = paidOrders
      .filter(o => o.created_at >= sevenDaysAgo)
      .reduce((sum, o) => sum + Number(o.amount), 0)

    res.json({
      data: {
        summary: {
          total_users:    usersResult.count   ?? 0,
          total_templates: templatesResult.count ?? 0,
          total_orders:   paidOrders.length,
          total_revenue:  totalRevenue,
          revenue_30d:    revenue30d,
          revenue_7d:     revenue7d,
        },
        recent_orders: recentOrdersResult.data || [],
      }
    })
  } catch (err) {
    console.error('admin stats error:', err)
    res.status(500).json({ error: 'Không thể lấy thống kê' })
  }
})

export default router
