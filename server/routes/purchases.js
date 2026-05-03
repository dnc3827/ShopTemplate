import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

/**
 * GET /api/purchases/check?template_id=xxx
 * Kiểm tra user đã mua template này chưa
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
        purchased_at: null,
      }
    })
  }

  // Template trả phí → kiểm tra purchases
  const { data: purchase, error: purchaseError } = await supabaseAdmin
    .from('purchases')
    .select('id, purchased_at')
    .eq('user_id', req.user.id)
    .eq('template_id', template_id)
    .single()

  if (purchaseError || !purchase) {
    return res.json({
      data: {
        allowed: false,
        status: 'not_purchased',
        purchased_at: null,
      }
    })
  }

  // Đã mua → cho phép vĩnh viễn
  return res.json({
    data: {
      allowed: true,
      status: 'purchased',
      purchased_at: purchase.purchased_at,
    }
  })
})

export default router
