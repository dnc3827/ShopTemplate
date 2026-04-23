import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

export default function AdminPromotions() {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [newPromo, setNewPromo] = useState({ discount_pct: 10, starts_at: '', ends_at: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: () => apiFetch('/admin/promotions'),
  })

  // Mutations
  const deactivateMut = useMutation({
    mutationFn: (id) => apiFetch(`/admin/promotions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Đã hủy kích hoạt khuyến mãi')
      queryClient.invalidateQueries(['admin-promotions'])
    },
    onError: (err) => toast.error(err.message)
  })

  const createMut = useMutation({
    mutationFn: (body) => {
       // Append precise ISO strings for simple datetime-local inputs
       const startsAtISO = new Date(body.starts_at).toISOString()
       const endsAtISO = new Date(body.ends_at).toISOString()
       return apiFetch('/admin/promotions', {
        method: 'POST',
        body: JSON.stringify({
          discount_pct: body.discount_pct,
          starts_at: startsAtISO,
          ends_at: endsAtISO
        })
      })
    },
    onSuccess: () => {
      toast.success('Tạo chương trình khuyến mãi thành công')
      setIsCreating(false)
      setNewPromo({ discount_pct: 10, starts_at: '', ends_at: '' })
      queryClient.invalidateQueries(['admin-promotions'])
    },
    onError: (err) => toast.error(err.message) // Surfaces the overlap 409 error clearly
  })

  const handleDeactivate = (id) => {
    if (window.confirm('Hủy kích hoạt chương trình này ngay lập tức?')) {
      deactivateMut.mutate(id)
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!newPromo.starts_at || !newPromo.ends_at) {
       toast.error("Vui lòng chọn thời gian")
       return
    }
    createMut.mutate(newPromo)
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      
      {!isCreating ? (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Chương trình Khuyến mãi</h1>
            <p className="text-gray-400 text-sm">Thiết lập các sự kiện giảm giá đồng loạt trên nền tảng</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>+ Tạo Sự kiện Mới</Button>
        </div>
      ) : (
         <div className="bg-surface rounded-xl p-6 border border-muted/30">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Chương trình Mới</h2>
                <Button variant="ghost" onClick={() => setIsCreating(false)}>Trở về</Button>
             </div>
             
             <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-lg">
                <Input 
                  label="Tỷ lệ giảm giá (%)" 
                  type="number" 
                  min="1" max="99" 
                  required 
                  value={newPromo.discount_pct}
                  onChange={e => setNewPromo({...newPromo, discount_pct: Number(e.target.value)})}
                />
                <Input 
                  label="Thời gian băt đầu" 
                  type="datetime-local" 
                  required 
                  value={newPromo.starts_at}
                  onChange={e => setNewPromo({...newPromo, starts_at: e.target.value})}
                />
                <Input 
                  label="Thời gian kết thúc" 
                  type="datetime-local" 
                  required 
                  value={newPromo.ends_at}
                  onChange={e => setNewPromo({...newPromo, ends_at: e.target.value})}
                />
                <Button type="submit" className="mt-2" isLoading={createMut.isPending}>Khởi tạo cấu hình</Button>
             </form>
         </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
           <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
        </div>
      ) : (
        <div className="bg-surface border border-muted/30 rounded-xl overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-dark/50 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-3 font-medium">Giảm giá</th>
                <th className="px-6 py-3 font-medium">Thời gian Bắt đầu</th>
                <th className="px-6 py-3 font-medium">Thời gian Kết thúc</th>
                <th className="px-6 py-3 font-medium text-center">Trạng thái</th>
                <th className="px-6 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/20 text-sm text-gray-300">
              {(data?.data || []).map(promo => {
                 const now = new Date()
                 const starts = new Date(promo.starts_at)
                 const ends = new Date(promo.ends_at)
                 let status = 'Chờ chạy'
                 let badgeColor = 'bg-surface text-gray-400'
                 
                 if (!promo.is_active) {
                    status = 'Đã hủy'
                    badgeColor = 'bg-red-500/20 text-red-500'
                 } else if (now > ends) {
                    status = 'Hết hạn'
                    badgeColor = 'bg-yellow-500/20 text-yellow-500'
                 } else if (now >= starts && now <= ends) {
                    status = 'Đang diễn ra'
                    badgeColor = 'bg-green-500/20 text-green-400'
                 }

                 return (
                  <tr key={promo.id} className="hover:bg-bg-dark/30">
                    <td className="px-6 py-4 font-bold text-white text-lg">-{promo.discount_pct}%</td>
                    <td className="px-6 py-4">{starts.toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4">{ends.toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-1 text-xs font-bold rounded ${badgeColor}`}>
                         {status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Button 
                         variant="ghost" 
                         size="sm"
                         className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                         disabled={!promo.is_active || now > ends}
                         onClick={() => handleDeactivate(promo.id)}
                       >
                         Dừng chương trình
                       </Button>
                    </td>
                  </tr>
                 )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
