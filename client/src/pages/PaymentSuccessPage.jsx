import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { apiFetch } from '../lib/api'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const IS_DEV = import.meta.env.DEV

export default function PaymentSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const state = location.state || {}

  const [appUrl, setAppUrl] = useState(null)
  const [templateName, setTemplateName] = useState(state.template_name || null)
  const [confirming, setConfirming] = useState(false)

  // Nếu không có state (refresh page) → về trang chủ
  useEffect(() => {
    if (!state.order_code) {
      navigate('/', { replace: true })
    }
  }, [state.order_code, navigate])

  // Lấy app_url + tên template từ API
  useEffect(() => {
    if (state.template_id) {
      apiFetch(`/templates/by-id/${state.template_id}`)
        .then(res => {
          setAppUrl(res?.data?.app_url)
          if (res?.data?.name) setTemplateName(res.data.name)
        })
        .catch(() => {})
    }
  }, [state.template_id])

  const handleManualConfirm = async () => {
    if (!state.order_code) return
    setConfirming(true)
    try {
      await apiFetch('/webhook/manual-confirm', {
        method: 'POST',
        body: JSON.stringify({ order_code: state.order_code }),
      })
      toast.success('Đã xác nhận thanh toán thủ công!')
      navigate('/tai-khoan')
    } catch (err) {
      toast.error(err.message || 'Xác nhận thất bại')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-8">
      {/* Animated checkmark */}
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-4 border-primary-light animate-scale-in">
        <svg
          className="w-12 h-12 text-primary-light"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Mua hàng thành công!</h1>
        <p className="text-gray-400">Cảm ơn bạn đã tin dùng PhanMemMau</p>
      </div>

      {/* Summary Card */}
      <div className="w-full max-w-md bg-surface/50 border border-primary-light/30 rounded-xl p-6 flex flex-col gap-4">
        <h2 className="text-white font-semibold text-lg">Tóm tắt đơn hàng</h2>

        {templateName && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Template</span>
            <span className="text-white font-medium">{templateName}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Loại bản quyền</span>
          <span className="text-[#86C232] font-bold">Vĩnh viễn ∞</span>
        </div>

        {state.order_code && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Mã đơn hàng</span>
            <span className="text-gray-300 font-mono">{state.order_code}</span>
          </div>
        )}

        {/* Email notification notice */}
        {user?.email && (
          <div className="flex items-start gap-2 bg-[#181c1f] rounded-lg px-3 py-2 border border-[#6B6E70]/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#86C232] flex-shrink-0 mt-0.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <p className="text-[#A0A4A8] text-xs leading-relaxed">
              Link truy cập đã được gửi đến <span className="text-white font-medium">{user.email}</span>
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        {appUrl && (
          <Button
            id="btn-open-app"
            onClick={() => window.open(appUrl, '_blank')}
            className="w-full font-bold shadow-lg shadow-primary/20 !bg-[#61892F] hover:!bg-[#4f7326]"
            size="lg"
          >
            Truy cập ứng dụng của bạn →
          </Button>
        )}

        <Button
          id="btn-home"
          onClick={() => navigate('/')}
          variant="ghost"
          className="w-full"
          size="lg"
        >
          Về trang chủ
        </Button>

        {/* DEV ONLY: Manual confirm button */}
        {IS_DEV && state.order_code && (
          <div className="mt-2 border border-yellow-500/30 rounded-xl p-4 bg-yellow-500/5 flex flex-col gap-2">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider">⚠ Dev Mode Only</p>
            <p className="text-gray-400 text-xs">
              Webhook PayOS không thể gọi localhost. Dùng nút này để xác nhận thanh toán thủ công và tạo purchase.
            </p>
            <Button
              id="btn-manual-confirm"
              onClick={handleManualConfirm}
              isLoading={confirming}
              className="w-full !bg-yellow-600 hover:!bg-yellow-700 text-white font-semibold"
              size="sm"
            >
              Xác nhận thanh toán thủ công
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scale-in {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.5s ease-out; }
      `}</style>
    </div>
  )
}
