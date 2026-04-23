import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { auth } from '../../middleware/auth.js'
import { adminAuth } from '../../middleware/adminAuth.js'
import { supabaseAdmin } from '../../lib/supabase.js'

const router = Router()
// Tất cả routes admin phải qua auth + adminAuth
router.use(auth, adminAuth)

const VALID_STATUS = ['visible', 'hidden', 'coming_soon']

const templateValidators = [
  body('slug').trim().notEmpty().withMessage('slug là bắt buộc'),
  body('name').trim().notEmpty().withMessage('name là bắt buộc'),
  body('app_url').isURL().withMessage('app_url phải là URL hợp lệ'),
  body('price').isNumeric({ min: 0 }).withMessage('price phải là số không âm'),
  body('status').optional().isIn(VALID_STATUS).withMessage('status không hợp lệ'),
]

/**
 * GET /api/admin/templates
 * Danh sách tất cả templates (kể cả hidden/coming_soon)
 */
router.get('/', async (req, res) => {
  const { limit = 50, offset = 0 } = req.query

  const { data, error } = await supabaseAdmin
    .from('templates')
    .select('*, categories(id, name)')
    .order('sort_order', { ascending: true })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (error) {
    console.error('admin getTemplates error:', error)
    return res.status(500).json({ error: 'Không thể lấy danh sách template' })
  }

  res.json({ data: data || [] })
})

/**
 * GET /api/admin/templates/:id
 */
router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('templates')
    .select('*, categories(id, name)')
    .eq('id', req.params.id)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Template không tồn tại' })
  res.json({ data })
})

/**
 * POST /api/admin/templates
 * Tạo template mới
 */
router.post('/', templateValidators, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  const { slug, name, short_desc, long_desc, icon, image_url, video_url, app_url,
    category_id, price = 0, status = 'visible', sort_order = 0 } = req.body

  const { data, error } = await supabaseAdmin
    .from('templates')
    .insert({ slug, name, short_desc, long_desc, icon, image_url, video_url,
      app_url, category_id, price, status, sort_order })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Slug đã tồn tại' })
    console.error('admin createTemplate error:', error)
    return res.status(500).json({ error: 'Không thể tạo template' })
  }

  res.status(201).json({ data })
})

/**
 * PUT /api/admin/templates/:id
 * Cập nhật toàn bộ template
 */
router.put('/:id', templateValidators, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  const { slug, name, short_desc, long_desc, icon, image_url, video_url, app_url,
    category_id, price, status, sort_order } = req.body

  const { data, error } = await supabaseAdmin
    .from('templates')
    .update({ slug, name, short_desc, long_desc, icon, image_url, video_url,
      app_url, category_id, price, status, sort_order, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Slug đã tồn tại' })
    console.error('admin updateTemplate error:', error)
    return res.status(500).json({ error: 'Không thể cập nhật template' })
  }
  if (!data) return res.status(404).json({ error: 'Template không tồn tại' })

  res.json({ data })
})

/**
 * PATCH /api/admin/templates/:id/status
 * Ẩn/hiện nhanh (toggle status)
 */
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body
  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({ error: 'status không hợp lệ' })
  }

  const { data, error } = await supabaseAdmin
    .from('templates')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('id, status')
    .single()

  if (error || !data) return res.status(404).json({ error: 'Template không tồn tại' })
  res.json({ data })
})

/**
 * DELETE /api/admin/templates/:id
 * Soft delete: đặt status = 'hidden', KHÔNG xóa thật
 */
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('templates')
    .update({ status: 'hidden', updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('id, status')
    .single()

  if (error || !data) return res.status(404).json({ error: 'Template không tồn tại' })
  res.json({ data, message: 'Template đã được ẩn' })
})

export default router
