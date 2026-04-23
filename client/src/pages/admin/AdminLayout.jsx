import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ADMIN_LINKS = [
  { name: 'Dashboard', path: '/admin', end: true },
  { name: 'Khuyến mãi', path: '/admin/promotions' },
  { name: 'Quản lý Đơn hàng', path: '/admin/orders' },
  { name: 'Templates', path: '/admin/templates' },
  { name: 'Danh mục', path: '/admin/categories' },
  { name: 'Khách hàng', path: '/admin/users' },
  { name: 'Thống kê Doanh thu', path: '/admin/stats' }, // Tách riêng stats
]

export default function AdminLayout() {
  const { profile } = useAuth()

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] gap-6 py-6 border-t border-muted/20">
      
      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:flex flex-col w-64 bg-surface/30 border border-muted/20 rounded-xl p-4 gap-2">
        <h2 className="text-white font-bold px-3 py-2 mb-2">Quản trị viên</h2>
        {ADMIN_LINKS.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.end}
            className={({ isActive }) => `px-3 py-2 rounded-lg font-medium transition-colors ${
              isActive 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:bg-surface hover:text-white'
            }`}
          >
            {link.name}
          </NavLink>
        ))}
      </aside>

      {/* Mobile Tabs Wrapper (Scrollable Horizontal) */}
      <nav className="md:hidden flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {ADMIN_LINKS.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.end}
            className={({ isActive }) => `whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              isActive 
                ? 'bg-primary border-primary text-white' 
                : 'bg-surface border-muted/30 text-gray-300'
            }`}
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 bg-surface/10 rounded-xl">
        <Outlet />
      </main>
    </div>
  )
}
