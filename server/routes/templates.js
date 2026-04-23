import { supabaseAdmin } from '../lib/supabase.js'
import { getActivePromotion } from '../services/promotion.service.js'

/**
 * Tính giá sau khuyến mãi động — KHÔNG lưu DB
 */
function calcDiscountedPrice(price, promoPct) {
  if (!promoPct) return null
  return Math.round(price * (1 - promoPct / 100))
}

/**
 * GET /api/templates
 * Query params: ?category_id=, ?limit=, ?offset=
 */
export const getTemplates = async (req, res) => {
  const { category_id, limit = 20, offset = 0 } = req.query

  let query = supabaseAdmin
    .from('templates')
    .select(`
      id, slug, name, short_desc, icon, image_url, app_url,
      price, status, sort_order, created_at,
      categories ( id, name, is_free )
    `)
    .eq('status', 'visible')
    .order('sort_order', { ascending: true })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (category_id) {
    query = query.eq('category_id', category_id)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('getTemplates error:', error)
    return res.status(500).json({ error: 'Failed to fetch templates' })
  }

  // Tính discounted_price động
  const promo = await getActivePromotion()
  const templates = (data || []).map(t => ({
    ...t,
    discounted_price: t.price > 0 ? calcDiscountedPrice(t.price, promo?.discount_pct) : null,
    promo_pct: promo?.discount_pct || null,
  }))

  res.json({ data: templates, meta: { limit: Number(limit), offset: Number(offset) } })
}

/**
 * GET /api/templates/:slug
 */
export const getTemplateBySlug = async (req, res) => {
  const { slug } = req.params

  const { data, error } = await supabaseAdmin
    .from('templates')
    .select(`
      id, slug, name, short_desc, long_desc, icon, image_url, video_url, app_url,
      price, status, sort_order, created_at, updated_at,
      categories ( id, name, is_free )
    `)
    .eq('slug', slug)
    .eq('status', 'visible')
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Template not found' })
  }

  const promo = await getActivePromotion()
  const template = {
    ...data,
    discounted_price: data.price > 0 ? calcDiscountedPrice(data.price, promo?.discount_pct) : null,
    promo_pct: promo?.discount_pct || null,
  }

  res.json({ data: template })
}

/**
 * GET /api/templates/by-id/:id
 * Lấy template theo UUID (dùng cho CheckoutPage)
 */
export const getTemplateById = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabaseAdmin
    .from('templates')
    .select(`
      id, slug, name, short_desc, long_desc, icon, image_url, video_url, app_url,
      price, status, sort_order, created_at, updated_at,
      categories ( id, name, is_free )
    `)
    .eq('id', id)
    .eq('status', 'visible')
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Template not found' })
  }

  const promo = await getActivePromotion()
  const template = {
    ...data,
    discounted_price: data.price > 0 ? calcDiscountedPrice(data.price, promo?.discount_pct) : null,
    promo_pct: promo?.discount_pct || null,
  }

  res.json({ data: template })
}

import { Router } from 'express'

const router = Router()

router.get('/', getTemplates)
router.get('/by-id/:id', getTemplateById)
router.get('/:slug', getTemplateBySlug)

export default router
