import React from 'react'

export default function SubscriptionBadge({ status, daysLeft }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider bg-[#86C232]/20 text-[#86C232]">
        Đang kích hoạt
      </span>
    )
  }
  
  if (status === 'expiring') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider bg-[#F39C12]/20 text-[#F39C12]">
        Sắp hết hạn ({daysLeft} ngày)
      </span>
    )
  }
  
  if (status === 'grace') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider bg-[#E74C3C]/20 text-[#E74C3C]">
        Quá hạn ({daysLeft} ngày)
      </span>
    )
  }
  
  if (status === 'locked') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider bg-[#E74C3C]/20 text-[#E74C3C]">
        Đã khóa
      </span>
    )
  }

  return null
}
