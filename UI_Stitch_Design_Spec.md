TỔNG HỢP CHI TIẾT THIẾT KẾ EZTEMPLATE (VERIDIAN SLATE)

Dưới đây là mô tả chi tiết cho từng màn hình của hệ thống EZTemplate theo đúng thứ tự yêu cầu. Toàn bộ thiết kế sử dụng hệ màu Dark Mode chuyên sâu và font Be Vietnam Pro.



1. LandingPage (Trang chủ)

LAYOUT





Cấu trúc: [NAVBAR] -> [HERO] -> [FEATURES] -> [HIGHLIGHTS] -> [BOTTOM NAV]



Spacing: Gap giữa các section: py-16 (Desktop) / py-10 (Mobile). Padding ngang container: px-6.



Số cột: Mobile (1 cột), Desktop (3-4 cột cho Grid).

COMPONENTS





Hero Buttons: 





Chính: bg-[#61892F], rounded-lg, py-4.



Phụ: border-[#6B6E70], text-white.



Feature Cards: bg-[#474B4F], rounded-xl (12px), border-[#6B6E70]/20.



Product Card Mini: 16:9 ratio, border-radius 12px, shadow đậm.

TYPOGRAPHY





Hero Title: text-4xl (Mobile) / text-6xl (Desktop), weight 700.



Section Title: text-2xl, weight 700, margin-bottom 8.



Body Text: text-sm, weight 400, color-[#A0A4A8].

STATES & INTERACTIONS





Card Hover: hover:-translate-y-1, hover:border-[#86C232].



Button Hover: hover:bg-[#86C232], hover:scale-[1.02].



Scroll: Fade-in up animation cho từng block content.

TAILWIND CLASSES CHÍNH

bg-[#222629], text-white, backdrop-blur-md, sticky top-0, flex-col, gap-12.



2. ProductsPage (Danh sách sản phẩm)

LAYOUT





Cấu trúc: [HEADER] -> [HORIZONTAL FILTER TABS] -> [PRODUCT GRID] -> [BOTTOM NAV]



Số cột: Mobile (2 cột), Desktop (4 cột). Gap: gap-4.

COMPONENTS





Filter Tabs: 





Active: bg-[#61892F], text-white, rounded-full.



Inactive: border-[#6B6E70], rounded-full.



Product Card: Image area + Info area. Badge "MIỄN PHÍ" hoặc "VIP" ở góc.

TYPOGRAPHY





Page Title: text-3xl, weight 700.



Product Name: text-base, weight 600, truncate 1 dòng.



Price: text-[#86C232], weight 600.

STATES & INTERACTIONS





Tab Switch: Smooth transition màu nền.



Card Hover: Scale ảnh nhẹ + hiện viền xanh lá sáng.

TAILWIND CLASSES CHÍNH

overflow-x-auto (cho tabs), grid-cols-2, aspect-video (cho ảnh), rounded-full.



3. ProductDetailPage (Chi tiết sản phẩm)

LAYOUT





Cấu trúc: [TOP BAR] -> [MEDIA CAROUSEL] -> [PRODUCT INFO] -> [PRICE CARD] -> [DESCRIPTION]



Số cột: Mobile (1 cột), Desktop (2 cột chia 60/40).

COMPONENTS





Media Carousel: Ảnh lớn + Thumbnails nhỏ bên dưới (rounded-lg).



Price Card: bg-[#474B4F], shadow-xl, p-6.



Feature List: Bullet point bằng icon check màu [#86C232].

TYPOGRAPHY





Product Name: text-2xl, weight 700.



Main Price: text-3xl, weight 700, text-[#86C232].



Description Heading: text-xl, weight 600, border-b-2 border-[#61892F].

STATES & INTERACTIONS





Thumbnail Click: Thay đổi ảnh chính với hiệu ứng cross-fade.



CTA Button: active:scale-95 tạo cảm giác bấm thật.

TAILWIND CLASSES CHÍNH

flex-col, lg:flex-row, sticky bottom-0 (cho nút Mua ngay trên mobile), leading-relaxed.



4. CheckoutPage (Thanh toán)

LAYOUT





Cấu trúc: [MINIMAL HEADER] -> [PLAN SELECTION] -> [TOTAL CARD] -> [QR SECTION]



Spacing: space-y-6.

COMPONENTS





Plan Option: Border mỏng, khi chọn hiện border xanh 2px + nền xanh mờ (10% opacity).



QR Frame: bg-white, padding 4, rounded-lg, căn giữa.



Copy Box: bg-[#474B4F], flex justify-between, icon copy bên phải.

TYPOGRAPHY





Section Label: text-sm, weight 600, uppercase, tracking-wider.



Total Amount: text-2xl, weight 700.



Bank Info: text-sm, font-mono (cho STK).

STATES & INTERACTIONS





Copy Click: Hiện Toast notification "Đã sao chép".



Countdown: Text đổi sang màu [#E74C3C] khi dưới 60 giây.

TAILWIND CLASSES CHÍNH

border-2, border-[#86C232], bg-[#86C232]/10, animate-pulse (cho trạng thái chờ).



5. AccountPage (Tài khoản)

LAYOUT





Cấu trúc: [USER PROFILE HEADER] -> [TABS: ĐĂNG KÝ / LỊCH SỬ] -> [SUBSCRIPTION LIST]



Spacing: px-4, space-y-4.

COMPONENTS





Subscription Card: bg-[#474B4F], rounded-xl, padding 4.



Status Badge: 





Còn hạn: bg-[#86C232]/20, text-[#86C232].



Sắp hết: bg-[#F39C12]/20, text-[#F39C12].



Hết hạn: bg-[#E74C3C]/20, text-[#E74C3C].

TYPOGRAPHY





User Email: text-gray-400, text-sm.



Template Title: text-base, weight 600.



Expiry Date: text-xs.

STATES & INTERACTIONS





Tab Change: Border-bottom chạy mượt dưới tab active.

TAILWIND CLASSES CHÍNH

flex items-center, justify-between, border-b-2, rounded-xl.



6. LoginPage & RegisterPage (Đăng nhập & Đăng ký)

LAYOUT





Cấu trúc: [LOGO] -> [FORM CONTAINER] -> [SOCIAL LOGIN] -> [DIVIDER] -> [INPUTS] -> [SUBMIT]



Căn chỉnh: Căn giữa màn hình (flex items-center justify-center).

COMPONENTS





Auth Card: max-w-[400px], bg-[#474B4F], rounded-2xl, p-8.



Input Field: bg-[#222629], border-[#6B6E70], rounded-lg, focus:border-[#86C232].



Google Button: border-[#6B6E70], hover:bg-white/5.

TYPOGRAPHY





Title: text-2xl, weight 700.



Label: text-xs, weight 500, margin-bottom 1.

STATES & INTERACTIONS





Input Focus: Highlight border xanh lá.



Loading: Nút submit hiện spinner màu trắng.

TAILWIND CLASSES CHÍNH

w-full, focus:ring-1, focus:ring-[#86C232], transition-all.



7. ForgotPasswordPage, OTPPage (Quên mật khẩu & OTP)

LAYOUT





ForgotPassword: Input email đơn giản.



OTP: 6 ô input vuông xếp ngang (gap-2).

COMPONENTS





OTP Input: 48x48px, bg-[#474B4F], text-center, text-xl, weight 700.



Back Button: Icon mũi tên + text "Quay lại" ở góc trên trái.

TYPOGRAPHY





Instruction: text-sm, text-[#A0A4A8], text-center.



Timer: text-[#86C232], weight 600.

STATES & INTERACTIONS





OTP Error: Border đỏ + hiệu ứng rung (shake animation).



Auto-focus: Tự động nhảy sang ô tiếp theo sau khi nhập xong 1 số.

TAILWIND CLASSES CHÍNH

grid-cols-6, aspect-square, animate-shake.



Tài liệu này được trích xuất từ hệ thống EZTemplate UI System v2.0.