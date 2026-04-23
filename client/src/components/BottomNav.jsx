import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// SVG Icons can be directly embedded for simplicity and reducing dependencies 
// or replaced with lucide-react if required later.
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
)
const ExploreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
)
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
const AdminIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h10"/></svg>
)

export default function BottomNav() {
  const { user, profile } = useAuth()

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-[#101417]/90 backdrop-blur-md border-t border-[#6B6E70]/30 z-50 flex items-center justify-around pb-safe">
      <NavLink 
        to="/" 
        className={({isActive}) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-gray-400'}`}
      >
        <HomeIcon />
        <span className="text-[10px] uppercase">Trang chủ</span>
      </NavLink>
      <NavLink 
        to="/san-pham" 
        className={({isActive}) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-gray-400'}`}
      >
        <ExploreIcon />
        <span className="text-[10px] uppercase">Khám phá</span>
      </NavLink>
      {profile?.is_admin && (
         <NavLink 
            to="/admin" 
            className={({isActive}) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-gray-400'}`}
         >
            <AdminIcon />
            <span className="text-[10px] uppercase">Quản trị</span>
         </NavLink>
      )}
      <NavLink 
        to={user ? "/tai-khoan" : "/login"} 
        className={({isActive}) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-gray-400'}`}
      >
        <UserIcon />
        <span className="text-[10px] uppercase">{user ? "Tài khoản" : "Cá nhân"}</span>
      </NavLink>
    </div>
  )
}
