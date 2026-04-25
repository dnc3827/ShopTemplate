import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const PLAN_LABELS = { '1month': '1 Tháng', '3months': '3 Tháng', '1year': '1 Năm' }

export default function AdminOrders() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiFetch('/admin/orders'),
  })

  // Mutations
  const activateMut = useMutation({
    mutationFn: (id) => apiFetch(`/admin/orders/${id}/activate`, { method: 'PATCH' }),
    onSuccess: () => {
      toast.success('Đã kích hoạt đơn hàng thủ công thành công, gói cước đã được cập nhật.')
      queryClient.invalidateQueries(['admin-orders'])
      queryClient.invalidateQueries(['admin-stats'])
    },
    onError: (err) => toast.error(err.message)
  })

  const handleManualActivate = (order) => {
    if (window.confirm(`Xác nhận đánh dấu ĐÃ THANH TOÁN (Thủ Công) cho đơn ${order.order_code}?\nKhách hàng sẽ nhận được gói ${PLAN_LABELS[order.plan]} ngay lập tức.`)) {
      activateMut.mutate(order.id)
    }
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
       <div>
         <h1 className="text-2xl font-bold text-white mb-1">Quản lý Đơn hàng</h1>
         <p className="text-gray-400 text-sm">Lịch sử giao dịch và kích hoạt thủ công khi phát sinh lỗi thanh toán bên thứ ba</p>
       </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
           <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
        </div>
      ) : (
        <div className="bg-surface border border-muted/30 rounded-xl overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-dark/50 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-3 font-medium">User ID</th>
                <th className="px-6 py-3 font-medium">Template & Gói</th>
                <th className="px-6 py-3 font-medium">Số tiền</th>
                <th className="px-6 py-3 font-medium text-center">Trạng thái</th>
                <th className="px-6 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/20 text-sm text-gray-300">
              {(data?.data || []).map(order => (
                 <tr key={order.id} className="hover:bg-bg-dark/30">
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-mono">{order.user_id?.substring(0, 22)}...</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="font-medium text-white">{order.templates?.name}</span>
                          <span className="text-xs text-primary-light font-bold uppercase">{PLAN_LABELS[order.plan]}</span>
                          <span className="text-[10px] text-gray-500 font-mono mt-1">Mã HĐ: {order.order_code}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-bold tracking-tight text-white">
                        {Number(order.amount).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 text-center">
                       {order.status === 'paid' ? (
                          <span className="px-2 py-1 text-xs font-bold rounded bg-green-500/10 text-green-400">Đã thanh toán</span>
                       ) : order.status === 'pending' ? (
                          <span className="px-2 py-1 text-xs font-bold rounded bg-yellow-500/10 text-yellow-500">Chờ PayOS</span>
                       ) : (
                          <span className="px-2 py-1 text-xs font-bold rounded bg-red-500/10 text-red-500">Thất bại</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {order.status !== 'paid' && (
                          <Button 
                             variant="outline" size="sm" 
                             className="border-primary text-primary hover:bg-primary/20"
                             onClick={() => handleManualActivate(order)}
                          >
                             Mở thủ công
                          </Button>
                       )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
