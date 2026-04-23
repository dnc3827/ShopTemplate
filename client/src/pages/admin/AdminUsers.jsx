import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiFetch('/admin/users'),
  })

  // Mutations
  const banMut = useMutation({
    mutationFn: ({ id, is_banned }) => apiFetch(`/admin/users/${id}/ban`, { 
        method: 'PATCH',
        body: JSON.stringify({ is_banned })
    }),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái người dùng thành công')
      queryClient.invalidateQueries(['admin-users'])
    },
    onError: (err) => toast.error(err.message)
  })

  const deleteMut = useMutation({
    mutationFn: (id) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Đã khóa và ẩn (soft delete) tài khoản người dùng')
      queryClient.invalidateQueries(['admin-users'])
    },
    onError: (err) => toast.error(err.message)
  })

  const handleToggleBan = (user) => {
    const actionStr = user.is_banned ? 'MỞ KHÓA' : 'TẠM KHÓA'
    if (window.confirm(`Xác nhận \${actionStr} tài khoản \${user.email}?`)) {
       banMut.mutate({ id: user.id, is_banned: !user.is_banned })
    }
  }

  const handleDelete = (user) => {
    if (window.confirm(`Xác nhận XÓA TÀI KHOẢN \${user.email}? Người dùng sẽ bị văng khỏi hệ thống lập tức. (Soft delete)`)) {
       deleteMut.mutate(user.id)
    }
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
       <div>
         <h1 className="text-2xl font-bold text-white mb-1">Khách hàng</h1>
         <p className="text-gray-400 text-sm">Quản lý tài khoản và truy cập hệ thống</p>
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
                <th className="px-6 py-3 font-medium">Tài khoản (Email)</th>
                <th className="px-6 py-3 font-medium">Quyền</th>
                <th className="px-6 py-3 font-medium text-center">Trạng thái Cấm</th>
                <th className="px-6 py-3 font-medium">Ngày tham gia</th>
                <th className="px-6 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/20 text-sm text-gray-300">
              {(data?.data || []).map(usr => (
                 <tr key={usr.id} className="hover:bg-bg-dark/30">
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="font-medium text-white">{usr.email}</span>
                          <span className="text-xs text-gray-500 font-mono scale-90 origin-left">{usr.id}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       {usr.is_admin ? (
                         <span className="text-primary-light font-bold">Admin</span>
                       ) : (
                         <span className="text-gray-400">User</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-center">
                       {usr.is_banned ? (
                           <span className="px-2 py-1 text-xs font-bold rounded bg-red-500/20 text-red-500">Đã Khóa</span>
                       ) : (
                           <span className="px-2 py-1 text-xs font-bold rounded bg-green-500/10 text-green-400">Hoạt Động</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                        {new Date(usr.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {!usr.is_admin && (
                          <div className="flex items-center justify-end gap-2">
                             <Button 
                                variant={usr.is_banned ? "primary" : "outline"} size="sm" 
                                className={usr.is_banned ? "bg-green-600 hover:bg-green-700 text-white" : "bg-yellow-600 hover:bg-yellow-700 text-white border-none"}
                                onClick={() => handleToggleBan(usr)}
                             >
                                {usr.is_banned ? 'Bỏ khóa' : 'Khóa'}
                             </Button>
                             <Button 
                                variant="ghost" size="sm" 
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDelete(usr)}
                             >
                                Xóa
                             </Button>
                          </div>
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
