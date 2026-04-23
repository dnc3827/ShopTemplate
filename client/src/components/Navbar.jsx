import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, profile } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-[#101417]/90 backdrop-blur-md border-b border-[#6B6E70]/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {/* Simple Text Logo */}
          <span className="text-xl font-bold text-primary-light">ShopTemplate</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/san-pham" className="text-gray-300 hover:text-white transition-colors">
            Khám phá
          </Link>
          {user && (
            <div className="flex items-center gap-6">
              {profile?.is_admin && (
                <Link to="/admin" className="text-primary-light font-bold hover:text-white transition-colors">
                  Admin
                </Link>
              )}
              <Link to="/tai-khoan" className="text-gray-300 hover:text-white transition-colors">
                Tài khoản
              </Link>
            </div>
          )}
          {!user && (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="bg-primary hover:bg-primary/90 text-bg-dark px-4 py-2 rounded text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
               >
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
        
        {/* Placeholder for Mobile Burger if you want it here, but we are using BottomNav for primary mobile routing */}
      </div>
    </header>
  )
}
