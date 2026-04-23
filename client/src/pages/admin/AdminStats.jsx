import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'

export default function AdminStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiFetch('/admin/stats'),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
      </div>
    )
  }

  const summary = data?.data?.summary || {}
  const recentOrders = data?.data?.recent_orders || []

  return (
    <div className="p-4 md:p-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Thống kê Tổng quan</h1>
        <p className="text-gray-400">Hiệu suất và doanh thu của hệ thống</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-muted/30 rounded-xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-1">Tổng Doanh thu</p>
          <p className="text-2xl font-bold text-primary-light">
            {(summary.total_revenue || 0).toLocaleString('vi-VN')} đ
          </p>
          <div className="mt-2 text-xs flex flex-col gap-1 text-gray-500">
            <span>30 ngày: {(summary.revenue_30d || 0).toLocaleString('vi-VN')} đ</span>
            <span>7 ngày: {(summary.revenue_7d || 0).toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        <div className="bg-surface border border-muted/30 rounded-xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-1">Đơn hàng Thành công</p>
          <p className="text-2xl font-bold text-white">{summary.total_orders || 0}</p>
        </div>

        <div className="bg-surface border border-muted/30 rounded-xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-1">Tổng Người dùng</p>
          <p className="text-2xl font-bold text-white">{summary.total_users || 0}</p>
        </div>

        <div className="bg-surface border border-muted/30 rounded-xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-1">Templates Hoạt động</p>
          <p className="text-2xl font-bold text-white">{summary.total_templates || 0}</p>
        </div>
      </div>

      {/* Simple HTML/CSS Bar Chart for Revenue approximation (Optional UX touch) */}
      <div className="bg-surface border border-muted/30 rounded-xl p-6">
         <h2 className="text-lg font-bold text-white mb-6">Tốc độ Doanh thu (Gần đây)</h2>
         <div className="flex items-end gap-4 h-32">
            {/* Visualizing relation between 7d and 30d as a simple split for aesthetic */}
            <div className="w-16 bg-muted/20 relative rounded-t flex items-end">
               <div 
                 className="w-full bg-primary-light/50 rounded-t" 
                 style={{ height: '100%' }}
                 title={`30 Ngày: ${(summary.revenue_30d || 0).toLocaleString()}đ`}
               ></div>
               <span className="absolute -bottom-6 left-1 text-xs text-gray-400">30d</span>
            </div>
            <div className="w-16 bg-muted/20 relative rounded-t flex items-end">
               <div 
                 className="w-full bg-primary rounded-t" 
                 style={{ height: summary.revenue_30d ? `${Math.min(100, (summary.revenue_7d / summary.revenue_30d) * 100)}%` : '0%' }}
                 title={`7 Ngày: ${(summary.revenue_7d || 0).toLocaleString()}đ`}
               ></div>
                <span className="absolute -bottom-6 left-2 text-xs text-gray-400">7d</span>
            </div>
         </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-surface border border-muted/30 rounded-xl overflow-hidden mt-4">
        <div className="px-6 py-4 border-b border-muted/30">
          <h2 className="text-lg font-bold text-white">Đơn hàng gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-dark/50 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-3 font-medium">Mã Đơn</th>
                <th className="px-6 py-3 font-medium">Khách hàng</th>
                <th className="px-6 py-3 font-medium">Template</th>
                <th className="px-6 py-3 font-medium">Gói</th>
                <th className="px-6 py-3 font-medium">Số tiền</th>
                <th className="px-6 py-3 font-medium">Ngày trả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/20">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="text-sm text-gray-300 hover:bg-bg-dark/30">
                    <td className="px-6 py-4 font-mono text-xs">{order.order_code}</td>
                    <td className="px-6 py-4">{order.profiles?.email}</td>
                    <td className="px-6 py-4">{order.templates?.name}</td>
                    <td className="px-6 py-4">{order.plan}</td>
                    <td className="px-6 py-4 font-bold text-primary-light">
                      {Number(order.amount).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.paid_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
