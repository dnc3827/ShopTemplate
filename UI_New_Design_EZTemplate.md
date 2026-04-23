# EZTemplate UI New Design Specification
Tài liệu hướng dẫn triển khai giao diện EZTemplate đã nâng cấp (Cập nhật: 18/04/2026).

---

## PHẦN 1 — DESIGN TOKENS MỚI

### 🎨 Bảng màu (Palette)
Hệ màu Dark Mode chuyên sâu, tập trung vào độ tương phản cao và chiều sâu không gian.
- **Background (Nền):** `#222629` (Nền chính toàn trang)
- **Surface (Bề mặt):** `#474B4F` (Nền card, form, sidebar)
- **Primary (Chủ đạo):** `#61892F` (Xanh lá đậm cho CTA, Trạng thái chính)
- **Primary Light (Điểm nhấn):** `#86C232` (Xanh sáng cho hover, badge, giá mới)
- **Muted (Phụ):** `#6B6E70` (Border, Text phụ, Divider)
- **Text Primary:** `#FFFFFF` (Tiêu đề, Text nội dung chính)
- **Text Secondary:** `#A0A4A8` (Mô tả, Caption, Text phụ)
- **Danger:** `#E74C3C` (Lỗi, Hết hạn)
- **Warning:** `#F39C12` (Cảnh báo, Sắp hết hạn)

### 🔠 Typography (Be Vietnam Pro)
- **Display Hero:** `text-4xl` (Mobile) / `text-6xl` (Desktop), `font-bold`, `leading-tight`
- **Heading 1:** `24px`, `font-bold`
- **Heading 2:** `20px`, `font-semibold`
- **Body:** `14px`, `font-normal`, `leading-relaxed`
- **Caption:** `12px`, `font-normal`, `text-secondary`

### 📏 Spacing & Radius
- **Border Radius:**
  - Button/Input: `rounded-lg` (8px)
  - Card: `rounded-xl` (12px)
  - Modal/Container: `rounded-2xl` (16px)
- **Spacing Scale:**
  - Section Gap: `gap-12` (Mobile) / `gap-20` (Desktop)
  - Element Gap: `gap-4` hoặc `gap-6`
  - Container Padding: `px-4` (Mobile) / `px-8` (Desktop)

### ✨ Effects
- **Shadow:** `shadow-[0_4px_20px_rgba(0,0,0,0.3)]`
- **Transition:** `duration-200 ease-in-out` cho tất cả hover states.

---

## PHẦN 2 — COMPONENT MỚI

### 1. Button (CTA Chính)
- **HTML:** `<button class="w-full bg-[#61892F] hover:bg-[#86C232] text-white font-semibold py-4 rounded-lg transition-all transform active:scale-[0.98]">Nội dung</button>`
- **States:**
  - Hover: Đổi màu sang `#86C232`, phóng to nhẹ `scale-102`.
  - Active: Nhấn xuống `scale-98`.
  - Disabled: `opacity-50 cursor-not-allowed`.

### 2. Product Card (Thẻ sản phẩm)
- **Cấu trúc:** Card với tỉ lệ ảnh 16:9, badge góc trái/phải, thông tin giá bên dưới.
- **Hiệu ứng:** Hover trượt lên `translate-y-[-4px]` và đổi màu border sang `#86C232`.

### 3. Badge Trạng thái
- **Success:** `bg-[#86C232]/10 text-[#86C232]`
- **Warning:** `bg-[#F39C12]/10 text-[#F39C12]`
- **Error:** `bg-[#E74C3C]/10 text-[#E74C3C]`

---

## PHẦN 3 — CHI TIẾT CÁC TRANG

### 1. Trang chủ (Landing Page)
- **HTML:** Tham khảo mã nguồn tại màn hình {{DATA:SCREEN:SCREEN_15}}.
- **Animation:** Sử dụng `Intersection Observer` để kích hoạt hiệu ứng `fade-up` khi cuộn trang.

### 2. Danh sách Sản phẩm (Products Page)
- **HTML:** Tham khảo mã nguồn tại màn hình {{DATA:SCREEN:SCREEN_14}}.
- **Interaction:** Filter tabs cuộn ngang trên mobile, border-bottom chạy mượt khi chuyển tab.

### 3. Chi tiết Sản phẩm (Product Detail)
- **HTML:** Tham khảo mã nguồn tại màn hình {{DATA:SCREEN:SCREEN_17}}.
- **Layout:** Chuyển từ 1 cột (Mobile) sang 2 cột (Desktop) linh hoạt.

### 4. Thanh toán & QR (Checkout)
- **HTML:** Tham khảo mã nguồn tại màn hình {{DATA:SCREEN:SCREEN_8}}.
- **Feature:** Tích hợp bộ đếm ngược thời gian thực và nút copy nội dung chuyển khoản với toast thông báo.

### 5. Tài khoản người dùng (Account Page)
- **HTML:** Tham khảo mã nguồn tại màn hình {{DATA:SCREEN:SCREEN_3}}.
- **Visual:** Sử dụng hệ thống badge màu sắc để phân biệt thời hạn sử dụng gói dịch vụ.

### 6. Đăng nhập & Quên mật khẩu
- **HTML:** Tham khảo mã nguồn tại màn hình {{DATA:SCREEN:SCREEN_12}} và {{DATA:SCREEN:SCREEN_9}}.

---

## PHẦN 4 — HƯỚNG DẪN IMPLEMENT (DÀNH CHO DEV)

### Danh sách thay đổi quan trọng:
1. **Tiếng Việt 100%:** Toàn bộ text đã được chuẩn hóa, không còn trộn lẫn tiếng Anh.
2. **Depth & Layering:** Sử dụng màu `#474B4F` (Surface) chồng lên `#222629` (Background) để tạo chiều sâu thay vì dùng shadow quá đậm.
3. **Glassmorphism:** Sử dụng `backdrop-blur-md` cho Navbar và Bottom Navigation để tạo cảm giác hiện đại.

### Thứ tự triển khai:
1. Cấu hình `tailwind.config.js` với bảng màu và font Be Vietnam Pro.
2. Build các UI Components cơ bản (Button, Input, Badge).
3. Triển khai Layout chung (Navbar, Bottom Navigation).
4. Implement từng trang theo thứ tự: Landing -> Products -> Detail -> Account -> Checkout.

### Chú ý khi đưa vào React/JSX:
- Sử dụng `dangerouslySetInnerHTML` nếu cần render HTML từ mô tả template.
- Tách các logic như Countdown, Toast notification thành các Custom Hooks riêng biệt.
- Đảm bảo các SVG Icons được nhúng trực tiếp hoặc qua thư viện để giữ độ sắc nét.

---
*EZTemplate UI Team — Design for conversion.*