import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useQuery } from '@tanstack/react-query'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0)

  // Helper function to extract YouTube Embed URL
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return null;
    
    // Matches watch?v=ID, v/ID, embed/ID, shorts/ID, youtu.be/ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}` 
      : null;
  }

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['template', slug],
    queryFn: () => apiFetch(`/templates/${slug}`),
  })

  const template = detailData?.data

  const { data: subCheck, isLoading: checkLoading } = useQuery({
    queryKey: ['subscriptionCheck', template?.id],
    queryFn: () => apiFetch(`/subscriptions/check?template_id=${template.id}`),
    enabled: !!user && !!template?.id, 
  })

  if (detailLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Template không tồn tại</h2>
        <Link to="/san-pham" className="text-primary hover:underline">Quay lại danh sách</Link>
      </div>
    )
  }

  const isFree = template.price === 0 || template.categories?.is_free
  const activeSubscription = subCheck?.data?.allowed

  const mediaItems = []
  if (template?.video_url) mediaItems.push({ type: 'video', url: template.video_url, thumbnail: template.image_url || null })
  if (template?.image_url) mediaItems.push({ type: 'image', url: template.image_url, thumbnail: template.image_url })

  const safeIdx = mediaItems.length > 0 ? selectedMediaIdx % mediaItems.length : 0
  const currentMedia = mediaItems[safeIdx]

  const handlePrevMedia = () => {
     setSelectedMediaIdx((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const handleNextMedia = () => {
     setSelectedMediaIdx((prev) => (prev + 1) % mediaItems.length)
  }

  const handleActionClick = () => {
    if (activeSubscription || isFree) {
      window.open(template.app_url, '_blank')
    } else {
      if (!user) {
        navigate('/login')
      } else {
        navigate(`/checkout/${template.id}`)
      }
    }
  }

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Go Back */}
      <Link to="/san-pham" className="flex items-center gap-2 text-[#6B6E70] hover:text-white group w-fit text-sm font-medium transition-colors">
        <svg className="transform group-hover:-translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        <span>Trở về danh sách</span>
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Left Column: Media Carousel (55% on desktop) */}
        <div className="w-full lg:w-[55%] flex flex-col gap-4">
           {mediaItems.length > 0 ? (
             <div className="aspect-video bg-[#121619] rounded-[12px] overflow-hidden relative shadow-lg group">
                
                {currentMedia.type === 'video' ? (
                   getYoutubeEmbedUrl(currentMedia.url) ? (
                     <iframe 
                       src={getYoutubeEmbedUrl(currentMedia.url)} 
                       className="w-full h-full border-0"
                       allowFullScreen
                       title={template.name}
                     ></iframe>
                   ) : (
                     <video src={currentMedia.url} controls className="w-full h-full object-contain" poster={currentMedia.thumbnail} />
                   )
                ) : (
                   <img src={currentMedia.url} alt={template.name} className="w-full h-full object-contain bg-[#121619]" />
                )}

                {isFree && (
                  <div className="absolute top-4 left-4 bg-[#61892F] text-white text-sm font-bold px-3 py-1.5 rounded shadow-lg z-10 pointer-events-none">
                    MIỄN PHÍ
                  </div>
                )}

                {/* Left / Right Nav Buttons */}
                {mediaItems.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevMedia}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button 
                      onClick={handleNextMedia}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </>
                )}
             </div>
           ) : (
             <div className="aspect-video bg-[#181c1f] rounded-[12px] overflow-hidden flex items-center justify-center">
                <span className="text-[#6B6E70]">Chưa có hình ảnh/video mô tả</span>
             </div>
           )}
           
           {/* Thumbnails */}
           {mediaItems.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto hide-scrollbar">
                 {mediaItems.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedMediaIdx(idx)}
                      className={`w-24 h-16 rounded-lg cursor-pointer overflow-hidden flex-shrink-0 relative transition-all duration-200 ${safeIdx === idx ? 'border-2 border-[#86C232]' : 'border-2 border-transparent opacity-60 hover:opacity-100'}`}
                    >
                       <img src={item.thumbnail || "https://via.placeholder.com/150/121619/6B6E70?text=Video"} className="w-full h-full object-contain bg-[#121619]" />
                       {item.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            {/* Play icon overlay for Video Thumbnail */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-80"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          </div>
                       )}
                    </div>
                 ))}
              </div>
           )}
        </div>

        {/* Right Column: Info Area (45% on desktop) */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {template.icon && <img src={template.icon} alt="Icon" className="w-8 h-8 object-contain" />}
              <span className="px-3 py-1 rounded text-xs font-bold uppercase bg-[#181c1f] text-[#86C232] border border-[#6B6E70]/20">
                {template.categories?.name}
              </span>
            </div>
            
            <h1 className="text-2xl font-bold text-white leading-tight">
              {template.name}
            </h1>
            
            <p className="text-sm text-[#A0A4A8] leading-relaxed">
              {template.short_desc}
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-[#181c1f] rounded-[12px] p-6 flex flex-col gap-4 shadow-xl border border-[#6B6E70]/20">
             <span className="text-[#A0A4A8] font-semibold text-xs uppercase tracking-wider">Bản quyền sử dụng</span>
             
             <div className="flex flex-col gap-1">
                 {isFree ? (
                    <span className="text-3xl font-bold text-[#86C232]">Miễn phí</span>
                 ) : (
                    <>
                      {template.discounted_price ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base text-[#6B6E70] line-through">
                              {template.price.toLocaleString('vi-VN')} đ
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#86C232]/15 text-[#86C232]">
                              -{Math.round((1 - template.discounted_price / template.price) * 100)}%
                            </span>
                          </div>
                          <span className="text-3xl font-bold text-[#86C232] tracking-tight">
                            {template.discounted_price.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold text-[#86C232] tracking-tight">
                          {template.price.toLocaleString('vi-VN')} đ
                        </span>
                      )}
                    </>
                 )}
             </div>
              
             {/* Action Button */}
             <div className="mt-2">
               {checkLoading ? (
                 <Button variant="outline" className="w-full" disabled isLoading>Đang tải...</Button>
               ) : (
                  <Button 
                    onClick={handleActionClick} 
                    className="w-full !py-3.5 !rounded-lg font-semibold shadow-lg shadow-primary/20" 
                  >
                    {(activeSubscription || isFree) ? "Truy cập ứng dụng" : "Mua ngay"}
                  </Button>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: Description */}
      <div className="mt-4 bg-[#181c1f] rounded-[12px] p-[24px] shadow-lg border border-[#6B6E70]/20">
         <h2 className="text-xl font-semibold text-white border-b-2 border-primary pb-[12px] mb-[24px]">
            Mô tả sản phẩm
         </h2>

         <div 
            className="text-[#A0A4A8] text-[15px] leading-[1.8] break-words overflow-hidden whitespace-pre-wrap
                       prose prose-invert max-w-none
                       prose-h3:text-white prose-h3:font-bold prose-h3:text-[18px] prose-h3:mt-6 prose-h3:mb-3
                       prose-h4:text-white prose-h4:font-bold prose-h4:text-[16px] prose-h4:mt-5 prose-h4:mb-2
                       prose-strong:text-white prose-strong:font-bold
                       prose-p:mb-4
                       prose-ul:list-none prose-ul:pl-0 prose-li:relative prose-li:pl-6 prose-li:mb-2
                       marker:content-['']"
         >
           {/* Custom CSS specifically for injecting the checkmarks where Tailwind typography creates lists */}
           <style>
             {`
               .prose-ul li::before {
                 content: "✓";
                 position: absolute;
                 left: 0;
                 color: #86C232;
                 font-weight: bold;
               }
             `}
           </style>
           {template.long_desc ? (
              <div dangerouslySetInnerHTML={{ __html: template.long_desc }} />
           ) : (
              <p>Đang cập nhật mô tả chi tiết cho sản phẩm này.</p>
           )}
         </div>
      </div>

    </div>
  )
}
