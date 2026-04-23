import { supabaseAdmin } from '../lib/supabase.js'

/**
 * Middleware: Kiểm tra quyền admin
 * Phải chạy SAU middleware auth.js
 * Query bảng profiles để verify is_admin = true
 */
export const adminAuth = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('is_admin, is_banned, is_deleted')
    .eq('id', req.user.id)
    .single()

  if (error || !profile) {
    return res.status(403).json({ error: 'Profile not found' })
  }

  if (profile.is_banned) {
    return res.status(403).json({ error: 'Account is banned' })
  }

  if (profile.is_deleted) {
    return res.status(403).json({ error: 'Account is deleted' })
  }

  if (!profile.is_admin) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}
