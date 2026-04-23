import dotenv from 'dotenv'
dotenv.config()

const TURNSTILE_SECRET = process.env.CLOUDFLARE_TURNSTILE_SECRET
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Middleware: Verify Cloudflare Turnstile token
 * Đọc token từ body.turnstile_token
 * Trả 400 nếu thiếu hoặc sai token
 */
export const turnstile = async (req, res, next) => {
  // Bỏ qua trong môi trường test/dev nếu không có secret
  if (!TURNSTILE_SECRET) {
    console.warn('[DEV] Turnstile secret not set — skipping verification')
    return next()
  }

  const token = req.body?.turnstile_token

  if (!token) {
    return res.status(400).json({ error: 'Turnstile token is required' })
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET,
        response: token,
        remoteip: req.ip,
      }),
    })

    const data = await response.json()

    if (!data.success) {
      return res.status(400).json({
        error: 'Xác minh bot thất bại. Vui lòng thử lại.',
        errors: data['error-codes'],
      })
    }

    next()
  } catch (err) {
    console.error('Turnstile verification error:', err)
    // Fail open — không chặn user nếu Turnstile API lỗi
    next()
  }
}
