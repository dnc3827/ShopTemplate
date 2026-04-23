import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { adminAuth } from '../../middleware/adminAuth.js'
import { supabaseAdmin } from '../../lib/supabase.js'

const router = Router()
router.use(auth, adminAuth)

/**
 * GET /api/admin/users
 * Danh sách tất cả users (từ bảng profiles)
 */
router.get('/', async (req, res) => {
  const { limit = 50, offset = 0 } = req.query

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, display_name, is_admin, is_banned, is_deleted, created_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (error) {
    console.error('admin getUsers error:', error)
    return res.status(500).json({ error: 'Không thể lấy danh sách users' })
  }

  res.json({ data: data || [] })
})

/**
 * PATCH /api/admin/users/:id/ban
 * Ban hoặc unban user
 * Body: { is_banned: boolean }
 */
router.patch('/:id/ban', async (req, res) => {
  const { is_banned } = req.body

  if (typeof is_banned !== 'boolean') {
    return res.status(400).json({ error: 'is_banned phải là boolean' })
  }

  // Không được tự ban chính mình
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Không thể ban chính mình' })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ is_banned })
    .eq('id', req.params.id)
    .eq('is_deleted', false)
    .select('id, email, is_banned')
    .single()

  if (error || !data) return res.status(404).json({ error: 'User không tồn tại' })

  const action = is_banned ? 'đã bị ban' : 'đã được mở ban'
  res.json({ data, message: `User ${action}` })
})

/**
 * DELETE /api/admin/users/:id
 * Soft delete: đánh dấu is_deleted = true, KHÔNG xóa thật
 */
router.delete('/:id', async (req, res) => {
  // Không được tự xóa chính mình
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Không thể xóa chính mình' })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ is_deleted: true, is_banned: true })
    .eq('id', req.params.id)
    .select('id, email, is_deleted')
    .single()

  if (error || !data) return res.status(404).json({ error: 'User không tồn tại' })
  res.json({ data, message: 'User đã bị xóa' })
})

export default router
