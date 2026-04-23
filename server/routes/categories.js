import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

/**
 * GET /api/categories
 * Danh sách tất cả danh mục (public)
 */
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, name, is_free, sort_order')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('getCategories error:', error)
    return res.status(500).json({ error: 'Failed to fetch categories' })
  }

  res.json({ data: data || [] })
})

export default router
