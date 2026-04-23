import { supabaseAnon } from '../lib/supabase.js'

/**
 * Middleware: Xác minh JWT từ Authorization header
 * Gắn thông tin user vào req.user
 */
export const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  const token = authHeader.replace('Bearer ', '').trim()

  if (!token) {
    return res.status(401).json({ error: 'Token is required' })
  }

  const { data: { user }, error } = await supabaseAnon.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  req.user = user
  next()
}
