import { useState } from 'react'
import { apiFetch } from '../lib/api'
import { useQuery } from '@tanstack/react-query'
import ProductCard from '../components/ProductCard'

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState(null)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch('/categories'),
  })

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['templates', selectedCategory],
    queryFn: () => {
      const qs = selectedCategory ? `?category_id=${selectedCategory}` : ''
      return apiFetch(`/templates${qs}`)
    },
  })

  // Normalize API responses
  const categories = categoriesData?.data || []
  const templates = productsData?.data || []

  return (
    <div className="py-8 px-4 flex flex-col gap-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Khám phá Templates</h1>
          <p className="text-[#A0A4A8] text-sm">Tìm kiếm template phù hợp nhất cho dự án của bạn.</p>
        </div>
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar flex-nowrap md:flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedCategory === null 
                ? 'bg-primary text-bg-dark' 
                : 'bg-transparent border border-[#6B6E70] text-white/70 hover:border-primary hover:text-white'
            }`}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedCategory === category.id 
                  ? 'bg-primary text-bg-dark' 
                  : 'bg-transparent border border-[#6B6E70] text-white/70 hover:border-primary hover:text-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12 w-full">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {templates.length > 0 ? (
            templates.map((template) => (
              <ProductCard key={template.id} template={template} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-16 text-center bg-[#181c1f] rounded-xl border border-[#6B6E70]/20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-white font-semibold mb-1">Không tìm thấy kết quả</p>
              <p className="text-[#A0A4A8] text-sm mb-4">Không có template nào phù hợp với bộ lọc đã chọn.</p>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-sm px-6 py-2 rounded-full bg-primary text-bg-dark hover:bg-primary/90 transition-colors font-semibold shadow-lg shadow-primary/20"
              >
                Xem tất cả template
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
