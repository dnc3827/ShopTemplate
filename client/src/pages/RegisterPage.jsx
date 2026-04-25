import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'
import Turnstile from '../components/ui/Turnstile'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY

export default function RegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // useEffect guard — KHÔNG dùng if() trong render
  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])



  const handleRegister = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        toast.error(error.message || 'Đăng ký thất bại')
        return
      }
      // Tạo profile sau khi đăng ký thành công
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
        })
      }
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.')
      navigate('/')
    } catch {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-bold text-[#86C232] tracking-tight mb-4">
            ShopTemplate
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Tạo tài khoản</h1>
          <p className="text-[#A0A4A8] text-sm">Bắt đầu trải nghiệm miễn phí</p>
        </div>

        <div className="bg-[#181c1f] rounded-2xl p-8 flex flex-col gap-6 shadow-xl">
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <Input
              id="register-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="!bg-[#121619] !border-[#6B6E70] !rounded-lg focus:!border-[#86C232] focus:!ring-[#86C232] text-white"
            />
            <Input
              id="register-password"
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              required
              autoComplete="new-password"
              className="!bg-[#121619] !border-[#6B6E70] !rounded-lg focus:!border-[#86C232] focus:!ring-[#86C232] text-white"
            />
            <Input
              id="register-confirm-password"
              label="Xác nhận mật khẩu"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              required
              autoComplete="new-password"
              className="!bg-[#121619] !border-[#6B6E70] !rounded-lg focus:!border-[#86C232] focus:!ring-[#86C232] text-white"
            />

{/* TODO: Bật lại Turnstile sau khi fix config
            <Turnstile />
            */}

            <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" size="lg" isLoading={loading}>
              Đăng ký tài khoản
            </Button>
          </form>

          <p className="text-center text-sm text-[#A0A4A8]">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-[#86C232] hover:text-[#61892F] font-bold transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
