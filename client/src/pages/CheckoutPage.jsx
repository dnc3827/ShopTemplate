import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useQuery } from '@tanstack/react-query'
import Button from '../components/ui/Button'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'

const PLANS = [
  {
    id: '1month',
    label: '1 Tháng',
    multiplier: 1,
    planDiscount: 0,
    badge: null,
  },
  {
    id: '3months',
    label: '3 Tháng',
    multiplier: 3,
    planDiscount: 15,
    badge: 'Tiết kiệm 15%',
    popular: true,
  },
  {
    id: '1year',
    label: '1 Năm',
    multiplier: 12,
    planDiscount: 30,
    badge: 'Tiết kiệm 30%',
  },
]

const POLLING_INTERVAL = 3000 // 3 giây
const TIMEOUT_MS = 10 * 60 * 1000 // 10 phút

// Tính giá frontend (để preview — server sẽ recalculate)
function calcPreviewAmount(basePrice, promoPct, plan) {
  const p = PLANS.find(pl => pl.id === plan)
  if (!p) return basePrice
  const afterPromo = basePrice * (1 - (promoPct || 0) / 100)
  const subtotal = afterPromo * p.multiplier
  return Math.round(subtotal * (1 - p.planDiscount / 100))
}

export default function CheckoutPage() {
  const { template_id } = useParams()
  const navigate = useNavigate()

  const [selectedPlan, setSelectedPlan] = useState('1month')
  const [orderCode, setOrderCode] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [countdown, setCountdown] = useState(TIMEOUT_MS / 1000) // giây
  const [timedOut, setTimedOut] = useState(false)

  const pollingRef = useRef(null)
  const timeoutRef = useRef(null)
  const countdownRef = useRef(null)

  // Lấy thông tin template
  const { data: tplData, isLoading: tplLoading } = useQuery({
    queryKey: ['template-checkout', template_id],
    queryFn: () => apiFetch(`/templates/by-id/${template_id}`),
    enabled: !!template_id,
  })

  const template = tplData?.data

  // Cleanup polling khi unmount
  useEffect(() => {
    return () => {
      clearInterval(pollingRef.current)
      clearTimeout(timeoutRef.current)
      clearInterval(countdownRef.current)
    }
  }, [])

  const stopPolling = useCallback(() => {
    clearInterval(pollingRef.current)
    clearTimeout(timeoutRef.current)
    clearInterval(countdownRef.current)
    setPolling(false)
  }, [])

  const startPolling = useCallback((code) => {
    setPolling(true)
    setCountdown(TIMEOUT_MS / 1000)
    setTimedOut(false)

    // Countdown MM:SS
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(countdownRef.current)
          return 0
        }
        return c - 1
      })
    }, 1000)

    // Timeout sau 10 phút
    timeoutRef.current = setTimeout(() => {
      stopPolling()
      setTimedOut(true)
    }, TIMEOUT_MS)

    // Poll mỗi 3 giây
    pollingRef.current = setInterval(async () => {
      try {
        const result = await apiFetch(`/checkout/${code}/status`)
        if (result?.data?.status === 'paid') {
          stopPolling()
          navigate('/thanh-toan-thanh-cong', {
            state: {
              template_id,
              template_name: template?.name,
              order_code: code,
              plan: selectedPlan,
            }
          })
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, POLLING_INTERVAL)
  }, [navigate, stopPolling, template, template_id, selectedPlan])

  const handlePayment = async () => {
    setPaymentLoading(true)
    try {
      const result = await apiFetch('/checkout/create', {
        method: 'POST',
        body: JSON.stringify({ template_id, plan: selectedPlan }),
      })

      const { order_code, qr_code } = result.data

      // Render QR bằng qrcode.js — KHÔNG redirect PayOS
      const dataUrl = await QRCode.toDataURL(qr_code, {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })

      setQrDataUrl(dataUrl)
      setOrderCode(order_code)
      startPolling(order_code)
    } catch (err) {
      toast.error(err.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (tplLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Template không tồn tại</h2>
      </div>
    )
  }

  const basePrice = template.price
  const promoPct = template.promo_pct || 0

  return (
    <div className="py-8 px-4 max-w-2xl mx-auto flex flex-col gap-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#A0A4A8] hover:text-white transition-colors text-sm w-fit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Quay về chi tiết sản phẩm
      </button>

      <h1 className="text-3xl font-bold text-white">Thanh toán</h1>

      {/* Tóm tắt sản phẩm */}
      <div className="flex items-center gap-4 p-4 bg-[#181c1f] border border-[#6B6E70]/20 rounded-[12px]">
        {template.image_url && (
          <img src={template.image_url} alt={template.name} className="w-16 h-16 rounded-[8px] object-contain bg-[#121619]" />
        )}
        <div>
          <h2 className="text-white font-semibold text-base">{template.name}</h2>
          <p className="text-[#A0A4A8] text-sm">{template.short_desc}</p>
        </div>
      </div>

      {/* Plan Selection */}
      {!qrDataUrl && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[#A0A4A8] uppercase tracking-wider">Chọn gói đăng ký</h3>
          {PLANS.map(plan => {
            const price = calcPreviewAmount(basePrice, promoPct, plan.id)
            const isSelected = selectedPlan === plan.id
            return (
              <button
                key={plan.id}
                id={`plan-${plan.id}`}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-[#86C232] bg-[#86C232]/10'
                    : 'border-[#6B6E70]/30 bg-[#181c1f]/50 hover:border-[#86C232]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-[#86C232]' : 'border-[#6B6E70]'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#86C232]"></div>}
                  </div>
                  <span className="text-white font-medium">{plan.label}</span>
                  {plan.popular && (
                    <span className="text-[10px] font-semibold bg-[#61892F] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Phổ biến
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {plan.badge && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#86C232] text-[#121619]">
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex flex-col items-end">
                    <span className="text-white font-bold">{price.toLocaleString('vi-VN')} đ</span>
                    <span className="text-[10px] text-[#A0A4A8]">
                      {Math.round(price / plan.multiplier).toLocaleString('vi-VN')} đ / tháng
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Total Card */}
      {!qrDataUrl && (
        <div className="bg-[#181c1f] rounded-[12px] p-4 border border-[#6B6E70]/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#A0A4A8] uppercase tracking-wider">Tổng thanh toán</span>
            <span className="text-2xl font-bold text-[#86C232]">
              {calcPreviewAmount(basePrice, promoPct, selectedPlan).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
      )}

      {/* QR Code Area */}
      {qrDataUrl && (
        <div className="flex flex-col items-center gap-4 p-6 bg-[#181c1f] border border-[#6B6E70]/20 rounded-[12px]">
          <p className="text-white font-semibold text-center text-sm uppercase tracking-wider">Quét mã QR để thanh toán</p>
          <div className="p-4 bg-white rounded-lg">
            <img src={qrDataUrl} alt="QR thanh toán" className="w-56 h-56" />
          </div>

          {!timedOut ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#86C232] border-t-transparent"></span>
              <span className={`font-mono text-lg font-bold ${
                countdown < 60 ? 'text-[#E74C3C] animate-pulse' : 'text-[#86C232]'
              }`}>
                {formatCountdown(countdown)}
              </span>
              <p className="text-[#A0A4A8] text-sm text-center">Đang chờ xác nhận thanh toán...</p>
              {orderCode && (
                <div className="w-full bg-[#121619] border border-[#6B6E70]/40 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                  <span className="text-[#A0A4A8] text-sm font-mono truncate">Mã đơn: {orderCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(String(orderCode))
                      toast.success('Đã sao chép mã đơn hàng!')
                    }}
                    className="flex-shrink-0 p-1.5 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    title="Sao chép mã"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center flex flex-col gap-3">
              <p className="text-[#E74C3C] font-medium">Đã hết thời gian chờ (10 phút)</p>
              <Button
                onClick={() => {
                  setQrDataUrl(null)
                  setOrderCode(null)
                  setTimedOut(false)
                }}
                variant="secondary"
              >
                Tạo lại đơn hàng
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Pay Button */}
      {!qrDataUrl &&          <Button
            id="btn-pay"
            onClick={handlePayment}
            isLoading={paymentLoading}
            className="w-full text-lg font-semibold shadow-lg shadow-primary/20"
            size="lg"
          >
          {paymentLoading ? 'Đang xử lý...' : 'Thanh toán ngay'}
        </Button>
      }

      <p className="text-center text-xs text-[#A0A4A8]">
        Thanh toán an toàn qua PayOS. Không có ô nhập mã giảm giá — giảm giá áp dụng tự động.
      </p>
    </div>
  )
}
