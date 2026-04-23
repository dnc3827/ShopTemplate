import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { otpLimiter, authLimiter } from '../middleware/rateLimit.js'
import { createOtp, verifyOtp } from '../services/otp.service.js'
import axios from 'axios'

const router = Router()

/**
 * POST /api/auth/forgot-password
 * Gửi OTP đặt lại mật khẩu qua email
 * Body: { email, turnstile_token }
 */
router.post(
  '/forgot-password',
  otpLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('turnstile_token').notEmpty().withMessage('Vui lòng xác thực Captcha (Turnstile)')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const { email, turnstile_token } = req.body

    try {
      // 1. Verify Turnstile
      if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
        const verifyRes = await axios.post(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
            response: turnstile_token,
          },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )

        if (!verifyRes.data.success) {
          return res.status(400).json({ error: 'Xác thực Captcha thất bại. Vui lòng tải lại trang và thử lại.' })
        }
      }

      // 2. Tạo và gửi OTP (giữ nguyên logic gốc)
      await createOtp(email)
      
      // Luôn trả 200 để không tiết lộ email có tồn tại hay không
      res.json({ message: 'Nếu email tồn tại, mã OTP đã được gửi.' })
    } catch (err) {
      // Bắt mọi lỗi từ DB, Resend hoặc Axios
      console.error('[auth.js] forgot-password error:', err)
      res.status(500).json({ error: 'Hệ thống không thể gửi OTP lúc này. Vui lòng thử lại sau.' })
    }
  }
)

/**
 * POST /api/auth/verify-otp
 * Xác minh OTP và đổi mật khẩu
 * Body: { email, otp, new_password }
 */
router.post(
  '/verify-otp',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP phải là 6 chữ số'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('Mật khẩu mới phải có ít nhất 8 ký tự'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const { email, otp, new_password } = req.body

    try {
      const result = await verifyOtp(email, otp, new_password)

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
          attempts_left: result.attemptsLeft ?? undefined,
        })
      }

      res.json({ message: 'Đổi mật khẩu thành công' })
    } catch (err) {
      console.error('verify-otp error:', err)
      res.status(500).json({ error: 'Không thể xác minh OTP. Vui lòng thử lại.' })
    }
  }
)

export default router
