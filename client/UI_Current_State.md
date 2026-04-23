# EZTemplate UI Current State Audit

Hồ sơ hiện trạng giao diện hệ thống EZTemplate (Cập nhật: 18/04/2026). Tài liệu này phục vụ cho việc chuẩn bị nâng cấp UI đồng bộ.

---

## PHẦN 1 — DESIGN TOKENS ĐANG DÙNG

### 🎨 Màu sắc (Palette)
Được cấu hình trong `tailwind.config.js`:
- **Primary:** `#61892F` (Xanh đậm - Chủ đạo)
- **Primary-light:** `#86C232` (Xanh sáng - Nhấn mạnh, Badge)
- **Background:** `#222629` (Đen xám - Nền toàn trang)
- **Surface:** `#474B4F` (Xám vừa - Nền card, input, sidebar)
- **Muted:** `#6B6E70` (Xám nhạt - Chữ phụ, border)
- **Status:**
  - Success: `text-green-400`, `bg-green-500/10`
  - Warning/Pending: `text-yellow-400`, `bg-yellow-500/10`
  - Error/Expired: `text-red-400`, `bg-red-500/10`

### 🔠 Typography
- **Font Family:** `Be Vietnam Pro`, `sans-serif` (được import trong `main.jsx`/`index.html`).
- **Font Sizes:**
  - Hero Header: `text-4xl` (Mobile) / `text-6xl` (Desktop)
  - Section Header: `text-2k` / `text-3xl`
  - Body Text: `text-base` (16px) / `text-sm` (14px)
  - Small/Muted: `text-xs` (12px) hoặc `text-[10px]`

### ⬜ Border Radius
- **Standard:** `rounded` (~4px-6px) dùng cho Button cơ bản.
- **Large:** `rounded-xl` (~12px) dùng cho Card, Container, Input form.
- **Full:** `rounded-full` dùng cho Categories filter, Badge trạng thái.

### 🌑 Shadow & Border
- **Border:** `border-muted/20` hoặc `border-muted/30` (đường kẻ mờ tinh tế).
- **Shadow:**
  - Hover Card: `0 8px 24px rgba(134,194,50,0.15)` (Đổ bóng xanh nhạt).

### 📏 Spacing Pattern
- **Page Container:** `max-w-7xl` hoặc `max-w-3xl` (tùy trang), `mx-auto`, `px-4`.
- **Gap:**
  - Grid: `gap-4` (Mobile) / `gap-6` hoặc `gap-8` (Desktop).
  - List: `gap-4`.
  - Sections: `gap-16` hoặc `py-8` / `py-12`.

---

## PHẦN 2 — COMPONENT INVENTORY

### 1. Button (`src/components/ui/Button.jsx`)
- **Tailwind Classes:** `inline-flex items-center justify-center font-medium transition-all duration-200 ease`.
- **Variants:**
  - `primary`: `#61892F` nền, hover nhảy lên `#86C232` + `scale-102`.
  - `secondary`: `bg-surface` nền, viền mờ.
  - `outline`: Viền `primary`, nền trong suất.
  - `ghost`: Nền trong suốt, hover hiện `surface`.
- **Mô tả:** Nút trung tâm, hỗ trợ trạng thái `isLoading` (spinner) và `disabled`.

### 2. Input (`src/components/ui/Input.jsx`)
- **Tailwind Classes:** `w-full bg-surface border border-muted/30 rounded px-3 py-2 text-white focus:border-primary focus:ring-1`.
- **Mô tả:** Ô nhập liệu dark-mode, có nhãn (label) đi kèm và handling lỗi (`error`) màu đỏ.

### 3. ProductCard (`src/components/ProductCard.jsx`)
- **Tailwind Classes:** `group flex flex-col bg-surface rounded-xl overflow-hidden border border-muted/20 hover:border-primary-light transition-all`.
- **Mô tả:** Thẻ sản phẩm. Media tỉ lệ `aspect-video`. Hỗ trợ Placeholder Gradient nếu thiếu ảnh. Có hiệu ứng hover trượt lên (`-translate-y-1`).

### 4. Navbar & BottomNav
- **Navbar:** Sticky top, `backdrop-blur-md`, viền dưới mờ.
- **BottomNav:** Fixed bottom (chỉ mobile), nền `surface`, icon SVG nhúng trực tiếp.

---

## PHẦN 3 — TỪNG TRANG

| Trang | Route | Cấu trúc Layout | Note Giao Diện |
| :--- | :--- | :--- | :--- |
| **Landing** | `/` | Hero section -> Services Grid -> Highlights Grid | Có hiệu ứng `reveal` khi cuộn trang. |
| **Danh sách SP** | `/san-pham` | Category Filter (Horizontal Scroll) -> Product Grid | Filter dạng viên thuốc (pill buttons). |
| **Chi tiết SP** | `/san-pham/:slug` | 2 Column (Media | Info) -> Description (Flat) | Media hỗ trợ Carousel (YouTube/Image). |
| **Thanh toán** | `/checkout/:id`| Centralized Form -> QR Code Display | QR được render trực tiếp, có đồng hồ đếm ngược. |
| **Đăng nhập/Ký**| `/login` | Centered Box (Max-w-md) | Tích hợp Cloudflare Turnstile và Google Auth button. |
| **Tài khoản** | `/tai-khoan` | Header -> Tabs (Subscriptions / Orders) | Dùng List layout đơn giản, icon nhỏ cho từng sub. |
| **Admin Layout**| `/admin/*` | Sidebar (Desktop) / Mobile Tabs -> Main Content | Phân chia admin area bằng border mờ. |

---

## PHẦN 4 — DANH SÁCH FILE CẦN SỬA
Dưới đây là danh sách toàn bộ các file logic UI (`.jsx`) cần được Stitch rà soát để nâng cấp đồng bộ:

### Components
- `client/src/components/Navbar.jsx`
- `client/src/components/BottomNav.jsx`
- `client/src/components/ProductCard.jsx`
- `client/src/components/SubscriptionBadge.jsx`
- `client/src/components/ui/Button.jsx`
- `client/src/components/ui/Input.jsx`

### Pages (Public)
- `client/src/pages/LandingPage.jsx`
- `client/src/pages/ProductsPage.jsx`
- `client/src/pages/ProductDetailPage.jsx`
- `client/src/pages/CheckoutPage.jsx`
- `client/src/pages/AccountPage.jsx`
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/RegisterPage.jsx`
- `client/src/pages/OTPPage.jsx`
- `client/src/pages/ForgotPasswordPage.jsx`
- `client/src/pages/PaymentSuccessPage.jsx`

### Pages (Admin)
- `client/src/pages/admin/AdminLayout.jsx`
- `client/src/pages/admin/AdminDashboard.jsx`
- `client/src/pages/admin/AdminTemplates.jsx`
- `client/src/pages/admin/AdminCategories.jsx`
- `client/src/pages/admin/AdminPromotions.jsx`
- `client/src/pages/admin/AdminOrders.jsx`
- `client/src/pages/admin/AdminUsers.jsx`
- `client/src/pages/admin/AdminStats.jsx`

### Styling
- `client/tailwind.config.js`
- `client/src/index.css`
