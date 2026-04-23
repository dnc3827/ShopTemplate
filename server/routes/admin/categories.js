import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { auth } from '../../middleware/auth.js'
import { adminAuth } from '../../middleware/adminAuth.js'
import { supabaseAdmin } from '../../lib/supabase.js'

const router = Router()
router.use(auth, adminAuth)

/**
 * GET /api/admin/categories
 */
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return res.status(500).json({ error: 'Không thể lấy danh mục' })
  res.json({ data: data || [] })
})

/**
 * POST /api/admin/categories
 */
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('name là bắt buộc'),
    body('is_free').isBoolean().withMessage('is_free phải là boolean'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const { name, is_free = false, sort_order = 0 } = req.body

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ name, is_free, sort_order })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Tên danh mục đã tồn tại' })
      return res.status(500).json({ error: 'Không thể tạo danh mục' })
    }

    res.status(201).json({ data })
  }
)

/**
 * PUT /api/admin/categories/:id
 */
router.put('/:id',
  [body('name').trim().notEmpty().withMessage('name là bắt buộc')],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const { name, is_free, sort_order } = req.body

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ name, is_free, sort_order })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Tên danh mục đã tồn tại' })
      return res.status(500).json({ error: 'Không thể cập nhật danh mục' })
    }
    if (!data) return res.status(404).json({ error: 'Danh mục không tồn tại' })

    res.json({ data })
  }
)

/**
 * DELETE /api/admin/categories/:id
 * ⚠️ Kiểm tra còn template không trước khi xóa
 */
router.delete('/:id', async (req, res) => {
  // Kiểm tra danh mục còn template không
  const { count, error: countError } = await supabaseAdmin
    .from('templates')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', req.params.id)

  if (countError) return res.status(500).json({ error: 'Không thể kiểm tra danh mục' })

  if (count > 0) {
    return res.status(400).json({
      error: `Không thể xóa: danh mục còn ${count} template. Hãy chuyển hoặc xóa template trước.`,
    })
  }

  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: 'Không thể xóa danh mục' })

  res.json({ message: 'Đã xóa danh mục' })
})

export default router
