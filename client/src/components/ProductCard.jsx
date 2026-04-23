import { Link } from 'react-router-dom'

export default function ProductCard({ template }) {
  const isFree = template.price === 0 || template.categories?.is_free

  const getInitials = (name) => {
    if (!name) return 'EZ'
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Link 
      to={`/san-pham/${template.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-[#6B6E70]/20 hover:border-[#86C232] hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-xl transition-all duration-300 ease cursor-pointer"
      style={{ background: 'linear-gradient(to right, #181c1f 0%, #181c1f 100%)' }}
    >
      {/* Image Area placeholder */}
      <div className="relative aspect-video flex items-center justify-center overflow-hidden">
        {template.image_url ? (
          <img 
            src={template.image_url} 
            alt={template.name} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center font-bold"
            style={{ background: 'linear-gradient(to bottom right, #181c1f, #121619)' }}
          >
            {template.icon ? (
              // Safety check: render as img if it's a URL, otherwise as text/emoji as explicitly requested
              (template.icon.startsWith('http') || template.icon.startsWith('/')) ? (
                 <img src={template.icon} alt="icon" className="w-[48px] h-[48px] object-contain" />
              ) : (
                 <div className="text-[48px] leading-none">{template.icon}</div>
              )
            ) : (
              <div className="text-[#86C232] text-[32px]">{getInitials(template.name)}</div>
            )}
          </div>
        )}
        
        {isFree ? (
          <div className="absolute top-2 left-2 bg-[#61892F] text-white text-xs font-bold px-2 py-1 rounded shadow">
            MIỄN PHÍ
          </div>
        ) : template.categories?.name && (
          <div className="absolute top-2 left-2 bg-[#121619]/60 backdrop-blur-sm text-[#86C232] text-xs font-bold px-2 py-1 rounded shadow border border-[#6B6E70]/20 uppercase">
            {template.categories.name}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base text-white mb-1 line-clamp-1 group-hover:text-[#86C232] transition-colors">{template.name}</h3>
        {template.short_desc && (
          <p className="text-[#A0A4A8] text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
            {template.short_desc}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-3">
          <div className="flex items-center">
            {isFree ? (
              <span className="bg-[#86C232]/10 text-[#86C232] font-semibold text-xs px-2.5 py-1 rounded">Miễn phí</span>
            ) : (
              <span className="text-white font-semibold text-sm">
                {template.price.toLocaleString('vi-VN')} đ
              </span>
            )}
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6B6E70] group-hover:text-white transition-colors"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </div>
      </div>
    </Link>
  )
}
