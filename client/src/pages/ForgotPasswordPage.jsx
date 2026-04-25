import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'
import Turnstile from '../components/ui/Turnstile'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  const handleTurnstileSuccess = useCallback((token) => {
    setTurnstileToken(token)
  }, [])

  const handleTurnstileExpired = useCallback(() => {
    setTurnstileToken('')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    /* TODO: Bật lại Turnstile sau khi fix config
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.error('Vui lòng xác minh Captcha.')
      return
    }
    */

    setLoading(true)

    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email, turnstile_token: turnstileToken }),
      })
      toast.success('Nếu email tồn tại, mã OTP đã được gửi.')
      // Truyền email qua state để OTPPage dùng
      navigate('/quen-mat-khau/otp', { state: { email } })
    } catch (err) {
      toast.error(err.message || 'Không thể gửi OTP. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quên mật khẩu</h1>
          <p className="text-[#A0A4A8]">Nhập email để nhận mã OTP đặt lại mật khẩu</p>
        </div>

        <div className="bg-[#181c1f] rounded-2xl p-8 flex flex-col gap-6 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              id="forgot-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="!bg-[#121619] !border-[#6B6E70] !rounded-lg focus:!border-[#86C232] focus:!ring-[#86C232] text-white"
            />

{/* TODO: Bật lại Turnstile sau khi fix config
            <Turnstile 
              onSuccess={handleTurnstileSuccess} 
              onExpired={handleTurnstileExpired}
            />
            */}

            <Button 
              type="submit" 
              className={`w-full font-semibold shadow-lg transition-all ${
                loading
                  ? '!bg-[#474B4F] !text-white shadow-none opacity-80 cursor-not-allowed border-none'
                  : '!bg-[#61892F] !text-white shadow-[#61892F]/20 hover:scale-[1.02]'
              }`} 
              size="lg" 
              disabled={loading}
              isLoading={loading}
            >
              Gửi mã OTP
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
