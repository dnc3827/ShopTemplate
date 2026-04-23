import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/api'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import SubscriptionBadge from '../components/SubscriptionBadge'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const PLAN_LABELS = { '1month': '1 Tháng', '3months': '3 Tháng', '1year': '1 Năm' }

export default function AccountPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('subscriptions')

  // Guard: useEffect redirect — KHÔNG dùng if() trong render
  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ['account-subscriptions'],
    queryFn: () => apiFetch('/account/subscriptions'),
    enabled: !!user,
  })

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['account-orders'],
    queryFn: () => apiFetch('/account/orders'),
    enabled: !!user,
  })

  const subscriptions = subData?.data || []
  const orders = orderData?.data || []

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  }

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-2 font-inter">
        <h1 className="text-3xl font-bold text-white tracking-tight">Tài khoản</h1>
        <p className="text-[#A0A4A8] text-sm">{user?.email}</p>
        <div className="mt-4">
          <Button id="btn-signout" onClick={handleSignOut} variant="outline" size="sm" className="!border-[#6B6E70]/30 !text-[#A0A4A8] hover:!text-white hover:!bg-white/5 transition-all">
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#6B6E70]/30 w-full overflow-x-auto hide-scrollbar">
        <button
          id="tab-subscriptions"
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 px-6 text-sm font-semibold transition-all relative ${
            activeTab === 'subscriptions'
              ? 'text-[#86C232]'
              : 'text-[#A0A4A8] hover:text-white'
          }`}
        >
          Đăng ký của tôi
          {activeTab === 'subscriptions' && (
            <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#86C232] rounded-full transition-transform shadow-[0_0_10px_rgba(134,194,50,0.5)]"></div>
          )}
        </button>
        <button
          id="tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-6 text-sm font-semibold transition-all relative ${
            activeTab === 'orders'
              ? 'text-[#86C232]'
              : 'text-[#A0A4A8] hover:text-white'
          }`}
        >
          Lịch sử thanh toán
          {activeTab === 'orders' && (
            <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#86C232] rounded-full transition-transform shadow-[0_0_10px_rgba(134,194,50,0.5)]"></div>
          )}
        </button>
      </div>

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="flex flex-col gap-4 mt-2">
          {subLoading ? (
            <div className="flex justify-center p-12">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#86C232] border-t-transparent"></span>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center p-12 bg-[#181c1f] rounded-2xl border border-[#6B6E70]/20 shadow-xl">
              <p className="text-[#A0A4A8] mb-6">Bạn chưa có đăng ký nào.</p>
              <Link to="/san-pham">
                <Button>Khám phá templates</Button>
              </Link>
            </div>
          ) : (
            subscriptions.map(sub => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-5 bg-[#181c1f] border border-[#6B6E70]/20 rounded-2xl hover:border-[#86C232]/40 transition-all shadow-md group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl border border-[#6B6E70]/20 bg-[#121619] flex items-center justify-center overflow-hidden">
                    {sub.templates?.icon ? (
                      <img src={sub.templates.icon} alt="" className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-[#86C232] font-bold text-lg">{sub.templates?.name?.substring(0,2).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold text-base group-hover:text-[#86C232] transition-colors">{sub.templates?.name}</p>
                    <p className="text-[#A0A4A8] text-xs mt-1">
                      Hết hạn: <span className="text-white font-medium">{formatDate(sub.expires_at)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <SubscriptionBadge status={sub.status} daysLeft={sub.days} />
                    <div className="flex gap-2">
                      {(sub.status === 'expiring' || sub.status === 'grace' || sub.status === 'locked') && (
                        <Link to={`/checkout/${sub.templates?.id}`}>
                          <Button size="sm">Gia hạn</Button>
                        </Link>
                      )}
                      {(sub.status === 'active' || sub.status === 'expiring') && sub.templates?.app_url && (
                        <a href={sub.templates.app_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm">Mở app</Button>
                        </a>
                      )}
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="flex flex-col gap-4 mt-2">
          {orderLoading ? (
            <div className="flex justify-center p-12">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#86C232] border-t-transparent"></span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-12 bg-[#181c1f] rounded-2xl border border-[#6B6E70]/20 shadow-xl">
              <p className="text-[#A0A4A8]">Bạn chưa có giao dịch nào.</p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between p-5 bg-[#181c1f] border border-[#6B6E70]/20 rounded-2xl shadow-md"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-white font-bold text-base">{order.templates?.name}</p>
                  <p className="text-[#A0A4A8] text-xs flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#121619] border border-[#6B6E70]/20">{PLAN_LABELS[order.plan]}</span>
                    <span>•</span>
                    <span className="font-medium text-[#6B6E70]">{formatDate(order.paid_at || order.created_at)}</span>
                  </p>
                  <span className="font-mono text-[10px] text-[#6B6E70] leading-none opacity-60">ID: {order.order_code}</span>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="text-[#86C232] font-bold text-xl tracking-tight">
                    {Number(order.amount).toLocaleString('vi-VN')} đ
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest ${
                    order.status === 'paid'
                      ? 'bg-[#86C232]/10 text-[#86C232] border border-[#86C232]/20'
                      : order.status === 'pending'
                      ? 'bg-[#F39C12]/10 text-[#F39C12] border border-[#F39C12]/20'
                      : 'bg-[#E74C3C]/10 text-[#E74C3C] border border-[#E74C3C]/20'
                  }`}>
                    {order.status === 'paid' ? 'Thành công' : order.status === 'pending' ? 'Chờ xử lý' : 'Thất bại'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
