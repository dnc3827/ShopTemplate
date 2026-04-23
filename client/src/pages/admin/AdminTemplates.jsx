import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

export default function AdminTemplates() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState(null)

  const { data: tpData, isLoading } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: () => apiFetch('/admin/templates'),
  })

  // We also need categories for the create/edit dropdown
  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => apiFetch('/admin/categories'),
  })

  const templates = tpData?.data || []
  const categories = catData?.data || []

  // Mutations
  const toggleStatusMut = useMutation({
    mutationFn: ({ id, status }) => apiFetch(`/admin/templates/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công')
      queryClient.invalidateQueries(['admin-templates'])
    },
    onError: (err) => toast.error(err.message)
  })

  const deleteMut = useMutation({
    mutationFn: (id) => apiFetch(`/admin/templates/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Đã ẩn template (Soft delete)')
      queryClient.invalidateQueries(['admin-templates'])
    },
    onError: (err) => toast.error(err.message)
  })

  const saveMut = useMutation({
    mutationFn: (body) => {
      if (currentTemplate?.id) {
        return apiFetch(`/admin/templates/${currentTemplate.id}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        })
      }
      return apiFetch('/admin/templates', {
        method: 'POST',
        body: JSON.stringify(body)
      })
    },
    onSuccess: () => {
      toast.success('Đã lưu Template thành công')
      setIsEditing(false)
      setCurrentTemplate(null)
      queryClient.invalidateQueries(['admin-templates'])
    },
    onError: (err) => toast.error(err.message)
  })

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn ẩn (soft delete) template này?')) {
      deleteMut.mutate(id)
    }
  }

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible'
    toggleStatusMut.mutate({ id, status: newStatus })
  }

  const openForm = (tpl = null) => {
    setCurrentTemplate(tpl || {
      slug: '', name: '', short_desc: '', long_desc: '', 
      icon: '', image_url: '', video_url: '', app_url: '', 
      category_id: categories[0]?.id || '', price: 0, status: 'visible'
    })
    setIsEditing(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    saveMut.mutate(currentTemplate)
  }

  if (isEditing) {
    return (
      <div className="p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {currentTemplate.id ? 'Sửa Template' : 'Thêm Template Mới'}
          </h2>
          <Button variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
        </div>

        <form onSubmit={handleSave} className="bg-surface rounded-xl p-6 flex flex-col gap-4 border border-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Tên Template" required value={currentTemplate.name}
              onChange={e => setCurrentTemplate({...currentTemplate, name: e.target.value})}
            />
            <Input 
              label="Slug (URL-friendly)" required value={currentTemplate.slug}
              onChange={e => setCurrentTemplate({...currentTemplate, slug: e.target.value})}
            />
            <Input 
              label="Mô tả ngắn" value={currentTemplate.short_desc}
              onChange={e => setCurrentTemplate({...currentTemplate, short_desc: e.target.value})}
            />
            <Input 
              label="URL Ứng dụng (Trỏ tới web thật)" required type="url" value={currentTemplate.app_url}
              onChange={e => setCurrentTemplate({...currentTemplate, app_url: e.target.value})}
            />
            <div className="flex flex-col gap-1">
              <Input 
                label="Giá cơ bản (VNĐ)" type="number" required value={currentTemplate.price}
                onChange={e => setCurrentTemplate({...currentTemplate, price: Number(e.target.value)})}
              />
              <div className="flex justify-between items-center px-1">
                <p className="text-[10px] text-gray-500 italic">Nhập giá theo đơn vị đồng. VD: 99000 = 99.000đ</p>
                <p className="text-xs font-bold text-primary-light">Preview: {Number(currentTemplate.price || 0).toLocaleString('vi-VN')} đ</p>
              </div>
            </div>
             <div className="w-full">
              <label className="block text-sm font-medium text-gray-300 mb-1">Danh mục</label>
              <select 
                className="w-full bg-surface border border-muted/30 rounded px-3 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={currentTemplate.category_id}
                onChange={e => setCurrentTemplate({...currentTemplate, category_id: e.target.value})}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input 
              label="Image URL" value={currentTemplate.image_url}
              onChange={e => setCurrentTemplate({...currentTemplate, image_url: e.target.value})}
            />
            <Input 
              label="Video URL" value={currentTemplate.video_url}
              onChange={e => setCurrentTemplate({...currentTemplate, video_url: e.target.value})}
            />
             <Input 
              label="Icon URL" value={currentTemplate.icon}
              onChange={e => setCurrentTemplate({...currentTemplate, icon: e.target.value})}
            />
             <div className="w-full">
              <label className="block text-sm font-medium text-gray-300 mb-1">Trạng thái</label>
              <select 
                className="w-full bg-surface border border-muted/30 rounded px-3 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={currentTemplate.status}
                onChange={e => setCurrentTemplate({...currentTemplate, status: e.target.value})}
              >
                <option value="visible">Hiển thị (Visible)</option>
                <option value="hidden">Ẩn (Hidden)</option>
                <option value="coming_soon">Sắp ra mắt (Coming Soon)</option>
              </select>
            </div>
          </div>
          
          <div className="w-full mt-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả dài (HTML/Text)</label>
            <div className="quill-dark">
              <ReactQuill 
                theme="snow"
                value={currentTemplate.long_desc || ''}
                onChange={(content) => setCurrentTemplate({...currentTemplate, long_desc: content})}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'clean']
                  ]
                }}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
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
          <h1 className="text-2xl font-bold text-white mb-1">Quản lý Templates</h1>
          <p className="text-gray-400 text-sm">Hiển thị và kiểm soát các mẫu giao diện</p>
        </div>
        <Button onClick={() => openForm()}>+ Thêm mới</Button>
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
                <th className="px-4 py-3 font-medium">Tên (Slug)</th>
                <th className="px-4 py-3 font-medium">Danh mục</th>
                <th className="px-4 py-3 font-medium">Giá</th>
                <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/20 text-sm text-gray-300">
              {templates.map(tpl => (
                <tr key={tpl.id} className="hover:bg-bg-dark/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                       {tpl.icon && <img src={tpl.icon} className="w-5 h-5 rounded object-cover"/>}
                       <div>
                         <p className="text-white font-medium">{tpl.name}</p>
                         <p className="text-gray-500 text-xs">{tpl.slug}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{tpl.categories?.name}</td>
                  <td className="px-4 py-3 font-medium">{Number(tpl.price).toLocaleString('vi-VN')} đ</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(tpl.id, tpl.status)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold cursor-pointer transition-colors text-white ${
                        tpl.status === 'visible' ? 'bg-green-600 hover:bg-green-700' :
                        tpl.status === 'hidden' ? 'bg-red-600 hover:bg-red-700' :
                        'bg-yellow-600 hover:bg-yellow-700'
                      }`}
                      title="Bấm để ẩn/hiện"
                    >
                      {tpl.status.toUpperCase()}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openForm(tpl)}
                        className="p-1.5 text-primary-light hover:bg-surface rounded transition-colors"
                        title="Sửa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(tpl.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        title="Ẩn (Soft Delete)"
                      >
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
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
