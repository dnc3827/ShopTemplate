import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60

export default function OTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN)
  const [errors, setErrors] = useState(Array(OTP_LENGTH).fill(false))

  const inputRefs = useRef([])

  // Đếm ngược 60s kể từ khi vào trang
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Redirect về forgot-password nếu không có email
  useEffect(() => {
    if (!email) {
      navigate('/quen-mat-khau', { replace: true })
    }
  }, [email, navigate])

  // Auto-focus ô đầu tiên khi load
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleOtpChange = (index, value) => {
    // Chỉ nhận ký tự số
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Chỉ lấy ký tự cuối nếu paste nhiều

    setOtp(newOtp)
    setErrors(Array(OTP_LENGTH).fill(false)) // Reset lỗi khi nhập

    // Auto-focus ô tiếp theo
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Backspace → xóa & focus lùi
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        inputRefs.current[index - 1]?.focus()
      }
    }
    // Arrow keys
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const newOtp = [...otp]
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    setOtp(newOtp)
    // Focus ô cuối có dữ liệu
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[lastFilled]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')

    if (otpCode.length < OTP_LENGTH) {
      toast.error('Vui lòng nhập đủ 6 ký tự OTP')
      return
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)
    try {
      await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp: otpCode, new_password: newPassword }),
      })
      toast.success('Đổi mật khẩu thành công!')
      navigate('/login', { replace: true })
    } catch (err) {
      // Highlight các ô OTP màu đỏ khi sai
      setErrors(Array(OTP_LENGTH).fill(true))
      toast.error(err.message || 'Mã OTP không đúng')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      toast.success('Đã gửi lại mã OTP')
      setResendCooldown(RESEND_COOLDOWN)
      setOtp(Array(OTP_LENGTH).fill(''))
      setErrors(Array(OTP_LENGTH).fill(false))
      inputRefs.current[0]?.focus()
    } catch {
      toast.error('Không thể gửi lại OTP. Vui lòng thử lại.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Nhập mã OTP</h1>
          <p className="text-[#A0A4A8]">
            Mã đã được gửi đến <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <div className="bg-[#181c1f] rounded-2xl p-8 flex flex-col gap-6 shadow-xl border border-[#6B6E70]/20">
          {/* 6 OTP Inputs */}
          <div className="grid grid-cols-6 gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-full aspect-square text-center text-xl font-bold rounded-lg border bg-[#121619] text-white transition-all focus:outline-none focus:ring-2
                  ${errors[index]
                    ? 'border-[#E74C3C] text-[#E74C3C] focus:ring-[#E74C3C] animate-shake'
                    : 'border-[#6B6E70]/30 focus:border-[#86C232] focus:ring-[#86C232]'
                  }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              id="otp-new-password"
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              required
              className="!bg-[#121619] !border-[#6B6E70] !rounded-lg focus:!border-[#86C232] focus:!ring-[#86C232] text-white"
            />
            <Input
              id="otp-confirm-password"
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              required
              className="!bg-[#121619] !border-[#6B6E70] !rounded-lg focus:!border-[#86C232] focus:!ring-[#86C232] text-white"
            />
            <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" size="lg" isLoading={loading}>
              Đổi mật khẩu
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="text-center text-sm text-[#A0A4A8]">
            {resendCooldown > 0 ? (
              <span>Gửi lại sau <span className="text-[#86C232] font-semibold">{resendCooldown}s</span></span>
            ) : (
              <button
                onClick={handleResend}
                className="text-white hover:text-[#86C232] font-bold transition-colors"
                style={{ textDecoration: 'underline' }}
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
