import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { apiFetch } from '../lib/api'
import { useQuery } from '@tanstack/react-query'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../hooks/useAuth'

export default function LandingPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['templates-highlight'],
    queryFn: () => apiFetch('/templates?limit=4'),
  })

  // Normalize API response formatting which brings wrapped `data` object
  const templates = data?.data || []

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    setTimeout(() => {
      const elements = document.querySelectorAll('.fade-up');
      elements.forEach(el => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [templates]);

  return (
    <div className="page-fade-in flex flex-col relative w-full">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 pt-20 pb-16 px-4 flex flex-col items-center">
        {/* Top Radial Glow Effect */}
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[350px] md:h-[500px] bg-white opacity-[0.07] blur-[100px] md:blur-[140px] rounded-[100%] pointer-events-none"></div>
        
        <h1 className="relative z-10 text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
          Xây dựng dự án nhanh hơn với<br />
          <span className="text-[#86C232]">PhanMemMau</span>
        </h1>
        <p className="text-[15px] md:text-lg text-[#A0A4A8] max-w-xl mx-auto leading-relaxed">
          Kho giao diện chất lượng cao, tối ưu hóa cho tốc độ và trải nghiệm người dùng. Bắt đầu ngay hôm nay để tiết kiệm hàng trăm giờ code.
        </p>
        <div className="flex flex-col w-full max-w-[340px] gap-3 pt-4">
          <Link to="/san-pham" className="w-full">
            <Button size="lg" className="w-full !rounded-lg !py-3.5 hover:scale-[1.02] transition-all">Khám phá Template</Button>
          </Link>
        </div>
      </section>

      {/* Tại sao chọn PhanMemMau */}
      <section className="px-4 max-w-7xl mx-auto w-full py-10 md:py-16 fade-up">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            Tại sao chọn PhanMemMau
          </h2>
          <div className="w-12 h-1 bg-[#86C232] mt-3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[12px] p-[24px] border border-[#6B6E70]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:border-[#86C232] hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(to right, #181c1f 0%, #181c1f 100%)' }}>
            <div className="text-[32px] mb-[12px]">📱</div>
            <h3 className="text-white font-semibold text-lg mb-2">Mobile-first</h3>
            <p className="text-[#A0A4A8] text-sm font-normal">Thiết kế cho điện thoại, dùng mọi lúc mọi nơi</p>
          </div>
          <div className="rounded-[12px] p-[24px] border border-[#6B6E70]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:border-[#86C232] hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(to right, #181c1f 0%, #181c1f 100%)' }}>
            <div className="text-[32px] mb-[12px]">⚡</div>
            <h3 className="text-white font-semibold text-lg mb-2">Dùng ngay</h3>
            <p className="text-[#A0A4A8] text-sm font-normal">Không cần cài đặt, đăng ký là dùng được</p>
          </div>
          <div className="rounded-[12px] p-[24px] border border-[#6B6E70]/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:border-[#86C232] hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(to right, #181c1f 0%, #181c1f 100%)' }}>
            <div className="text-[32px] mb-[12px]">💰</div>
            <h3 className="text-white font-semibold text-lg mb-2">Giá hợp lý</h3>
            <p className="text-[#A0A4A8] text-sm font-normal">Bắt đầu miễn phí, nâng cấp khi cần</p>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="px-4 py-8 md:py-16 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Template Nổi Bật</h2>
            <div className="w-12 h-1 bg-[#86C232] mt-3"></div>
          </div>
          <Link to="/san-pham" className="text-[#86C232] hover:text-[#9fe240] font-medium flex items-center gap-1 text-sm md:text-base pb-1 transition-colors">
            Xem tất cả <span>&rarr;</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 fade-up">
              {templates.length > 0 ? (
                templates.map((template) => (
                  <ProductCard key={template.id} template={template} />
                ))
              ) : (
                <p className="col-span-full text-center text-[#A0A4A8] py-8">Chưa có template nào.</p>
              )}
            </div>
          </>
        )}
      </section>
      
      {/* Spacer for bottom nav on mobile */}
      <div className="h-4"></div>
    </div>
  )
}
