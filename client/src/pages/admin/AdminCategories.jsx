import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => apiFetch('/admin/categories'),
  })

  const categories = data?.data || []

  // Mutations
  const deleteMut = useMutation({
    mutationFn: (id) => apiFetch(`/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Đã xóa danh mục')
      queryClient.invalidateQueries(['admin-categories'])
    },
    onError: (err) => toast.error(err.message) // This will catch the 400 error about existing templates
  })

  const saveMut = useMutation({
    mutationFn: (body) => {
      if (currentCategory?.id) {
        return apiFetch(`/admin/categories/${currentCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        })
      }
      return apiFetch('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(body)
      })
    },
    onSuccess: () => {
      toast.success('Đã lưu Danh mục')
      setIsEditing(false)
      setCurrentCategory(null)
      queryClient.invalidateQueries(['admin-categories'])
    },
    onError: (err) => toast.error(err.message)
  })

  const handleDelete = (id) => {
    if (window.confirm('Cảnh báo: Nếu danh mục này vẫn còn template, hệ thống sẽ chặn xóa. Bạn có chắc chắn muốn xóa?')) {
      deleteMut.mutate(id)
    }
  }

  const openForm = (cat = null) => {
    setCurrentCategory(cat || { name: '', is_free: false, sort_order: 0 })
    setIsEditing(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    saveMut.mutate(currentCategory)
  }

  if (isEditing) {
    return (
      <div className="p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {currentCategory.id ? 'Sửa Danh mục' : 'Thêm Danh mục Mới'}
          </h2>
          <Button variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
        </div>

        <form onSubmit={handleSave} className="bg-surface rounded-xl p-6 flex flex-col gap-4 max-w-lg border border-muted/30">
          <Input 
            label="Tên Danh mục" required value={currentCategory.name}
            onChange={e => setCurrentCategory({...currentCategory, name: e.target.value})}
          />
          <Input 
            label="Thứ tự hiển thị (Sort Order)" type="number" required value={currentCategory.sort_order}
            onChange={e => setCurrentCategory({...currentCategory, sort_order: Number(e.target.value)})}
          />
          <label className="flex items-center gap-2 cursor-pointer mt-2 text-white">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={currentCategory.is_free}
              onChange={e => setCurrentCategory({...currentCategory, is_free: e.target.checked})}
            />
            Đây là danh mục Miễn Phí (is_free)
          </label>

          <div className="flex justify-start mt-4">
            <Button type="submit" isLoading={saveMut.isPending}>Lưu thông tin</Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Danh mục sản phẩm</h1>
          <p className="text-gray-400 text-sm">Quản lý cách phân loại template</p>
        </div>
        <Button onClick={() => openForm()}>+ Thêm mới</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
           <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
        </div>
      ) : (
        <div className="bg-surface border border-muted/30 rounded-xl overflow-x-auto max-w-3xl">
          <table className="w-full text-left">
            <thead className="bg-bg-dark/50 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-3 font-medium">Tên Danh mục</th>
                <th className="px-6 py-3 font-medium text-center">Thứ tự</th>
                <th className="px-6 py-3 font-medium text-center">Loại biên</th>
                <th className="px-6 py-3 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/20 text-sm text-gray-300">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-bg-dark/30">
                  <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                  <td className="px-6 py-4 text-center">{cat.sort_order}</td>
                  <td className="px-6 py-4 text-center">
                     {cat.is_free ? (
                        <span className="px-2 py-1 bg-primary-light/20 text-primary-light text-xs rounded font-bold uppercase">Miễn phí</span>
                     ) : (
                        <span className="px-2 py-1 bg-surface text-gray-400 border border-muted/30 text-xs rounded font-bold uppercase">Có Phí</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => openForm(cat)}
                        className="p-1.5 text-primary-light hover:bg-surface rounded transition-colors"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
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
