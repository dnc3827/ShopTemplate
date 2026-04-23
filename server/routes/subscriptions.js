import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { supabaseAdmin } from '../lib/supabase.js'
import { getSubscriptionStatus, getUserSubscription } from '../services/subscription.service.js'

const router = Router()

/**
 * GET /api/subscriptions/check?template_id=xxx
 * Kiểm tra quyền truy cập template của user đang đăng nhập
 * user_id lấy từ req.user (JWT) — KHÔNG từ query params
 */
router.get('/check', auth, async (req, res) => {
  const { template_id } = req.query

  if (!template_id) {
    return res.status(400).json({ error: 'template_id is required' })
  }

  // Lấy thông tin template để kiểm tra loại (free hay trả phí)
  const { data: template, error: tplError } = await supabaseAdmin
    .from('templates')
    .select('id, price, categories ( is_free )')
    .eq('id', template_id)
    .single()

  if (tplError || !template) {
    return res.status(404).json({ error: 'Template not found' })
  }

  // Template miễn phí → luôn cho phép
  const isFreeTemplate = template.price === 0 || template.categories?.is_free === true

  if (isFreeTemplate) {
    return res.json({
      data: {
        allowed: true,
        status: 'free',
        days: null,
        subscription: null,
      }
    })
  }

  // Template trả phí → kiểm tra subscription
  // user_id lấy từ JWT, KHÔNG từ body hay query
  const subscription = await getUserSubscription(req.user.id, template_id)

  if (!subscription) {
    return res.json({
      data: {
        allowed: false,
        status: 'not_subscribed',
        days: null,
        subscription: null,
      }
    })
  }

  // Tính trạng thái động
  const subscriptionStatus = getSubscriptionStatus(subscription.expires_at)

  res.json({
    data: {
      ...subscriptionStatus,
      subscription: {
        id: subscription.id,
        expires_at: subscription.expires_at,
        is_active: subscription.is_active,
      },
    }
  })
})

export default router
