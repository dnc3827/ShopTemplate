import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { auth } from '../../middleware/auth.js'
import { adminAuth } from '../../middleware/adminAuth.js'
import { supabaseAdmin } from '../../lib/supabase.js'

const router = Router()
router.use(auth, adminAuth)

/**
 * GET /api/admin/promotions
 */
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('promotions')
    .select('*')
    .order('starts_at', { ascending: false })

  if (error) return res.status(500).json({ error: 'Không thể lấy danh sách khuyến mãi' })
  res.json({ data: data || [] })
})

/**
 * POST /api/admin/promotions
 * Tạo promotion mới — kiểm tra không overlap thời gian với promotions khác đang active
 */
router.post('/',
  [
    body('discount_pct')
      .isInt({ min: 1, max: 99 })
      .withMessage('discount_pct phải từ 1 đến 99'),
    body('starts_at').isISO8601().withMessage('starts_at phải là ISO8601 date'),
    body('ends_at').isISO8601().withMessage('ends_at phải là ISO8601 date'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const { discount_pct, starts_at, ends_at } = req.body

    if (new Date(ends_at) <= new Date(starts_at)) {
      return res.status(400).json({ error: 'ends_at phải sau starts_at' })
    }

    // Kiểm tra overlap với promotion đang active
    // Overlap nếu starts_at_new < ends_at_existing AND ends_at_new > starts_at_existing
    const { data: overlapping, error: overlapError } = await supabaseAdmin
      .from('promotions')
      .select('id, starts_at, ends_at, discount_pct')
      .eq('is_active', true)
      .lt('starts_at', ends_at)   // existing starts before new ends
      .gt('ends_at', starts_at)   // existing ends after new starts

    if (overlapError) return res.status(500).json({ error: 'Không thể kiểm tra overlap' })

    if (overlapping && overlapping.length > 0) {
      const conflict = overlapping[0]
      return res.status(409).json({
        error: `Trùng thời gian với khuyến mãi đang chạy (${conflict.discount_pct}% — từ ${conflict.starts_at} đến ${conflict.ends_at})`,
        conflict,
      })
    }

    const { data, error } = await supabaseAdmin
      .from('promotions')
      .insert({ discount_pct, starts_at, ends_at, is_active: true })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Không thể tạo khuyến mãi' })
    res.status(201).json({ data })
  }
)

/**
 * DELETE /api/admin/promotions/:id
 * Hủy kích hoạt promotion (soft deactivate)
 */
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('promotions')
    .update({ is_active: false })
    .eq('id', req.params.id)
    .select('id, is_active')
    .single()

  if (error || !data) return res.status(404).json({ error: 'Khuyến mãi không tồn tại' })
  res.json({ data, message: 'Đã hủy kích hoạt khuyến mãi' })
})

export default router
