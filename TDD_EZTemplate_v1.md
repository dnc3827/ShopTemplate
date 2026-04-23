# TDD — EZTemplate | SaaS Platform
**Version:** 2.0  
**Ngày:** 04/04/2026  
**Stack:** React + Vite + TailwindCSS + Supabase + Express.js

---

## CHECKLIST TRƯỚC KHI CODE

```
✅ Mỗi API endpoint làm đúng 1 việc
✅ Field names nhất quán giữa schema và business logic
✅ Mỗi FE screen có BE API tương ứng
✅ discounted_price KHÔNG lưu DB — tính động
✅ subscription status KHÔNG lưu DB — tính động
✅ user_id luôn lấy từ JWT — không từ request body
✅ Chỉ 1 createClient() Supabase trong toàn bộ project
✅ File có JSX phải đặt đuôi .jsx
✅ Project đặt ở C:\Projects\ — không có ký tự đặc biệt
```

---

---

## MODULES — CHIA NHỎ CHO AI CODE

> Mỗi module gửi cho AI kèm theo:
> 1. Phần CHECKLIST TRƯỚC KHI CODE (luôn luôn)
> 2. Phần TDD tương ứng với module đó (chỉ phần liên quan)
> 3. 20 điểm dễ sai ở Phần 4

```
MODULE 1 — Setup + Database         → Gemini 3 Flash
MODULE 2A — Backend Core            → Claude Sonnet 4.6 Thinking
MODULE 2B — Backend Checkout + Auth → Claude Sonnet 4.6 Thinking
MODULE 2C — Backend Admin           → Claude Sonnet 4.6 Thinking
MODULE 3A — Frontend Public         → Gemini 3.1 Pro High
MODULE 3B — Frontend Auth + Checkout→ Claude Sonnet 4.6 Thinking
MODULE 3C — Frontend Admin          → Gemini 3.1 Pro High
MODULE 4  — PWA + Deploy            → Gemini 3 Flash
```

---

### MODULE 1 — Setup + Database
**Model:** Gemini 3 Flash  
**TDD cần:** Phần 1 + đầu Phần 4 (Bước 1-2)  
**Prompt:**
```
Đọc kỹ TDD đính kèm phần MODULE 1.
Thực hiện Bước 1 và Bước 2 trong Phần 4:

Bước 1 — Setup project:
- Tạo 2 thư mục: server/ và client/
- server: npm init + cài express, @supabase/supabase-js,
          cors, dotenv, express-validator, express-rate-limit
- client: npm create vite@latest -- --template react
          + cài tailwindcss, react-router-dom,
          @tanstack/react-query, react-hot-toast,
          @supabase/supabase-js, qrcode
- client/package.json: thêm postinstall dùng Node.js (không chmod)
- Tạo tailwind.config.js với đầy đủ custom colors

Bước 2 — Database:
- Tạo file schema.sql với toàn bộ nội dung Phần 1
- Tạo file seed.sql: INSERT categories Free + Trả phí

KHÔNG implement bất kỳ logic nào khác.
```

---

### MODULE 2A — Backend Core (Templates + Categories + Middleware)
**Model:** Claude Sonnet 4.6 Thinking  
**TDD cần:** Phần 2 (middleware, lib, templates, categories, subscriptions, account)  
**Prompt:**
```
Đọc kỹ TDD đính kèm phần MODULE 2A.
Implement theo thứ tự:

1. lib/supabase.js (anon + admin — chỉ 1 createClient mỗi loại)
2. middleware/auth.js (verify JWT, gắn req.user)
3. middleware/adminAuth.js (verify is_admin)
4. middleware/rateLimit.js (rate limiting cho login/register/OTP)
5. server.js (Express + CORS từ env + mount routes)
6. routes/templates.js + routes/categories.js (public)
7. routes/subscriptions.js (check quyền truy cập)
8. routes/account.js (subscription + order history của user)
9. services/subscription.service.js (getSubscriptionStatus)
10. services/promotion.service.js (getActivePromotion)

Bắt buộc:
- CORS đọc từ process.env.ALLOWED_ORIGINS
- user_id từ req.user (JWT), không từ body
- discounted_price tính động, không lưu DB
- subscription status tính động, không lưu DB
```

---

### MODULE 2B — Backend Checkout + Auth + Webhook
**Model:** Claude Sonnet 4.6 Thinking  
**TDD cần:** Phần 2 (checkout, webhook, auth/OTP)  
**Prompt:**
```
Đọc kỹ TDD đính kèm phần MODULE 2B.
Implement theo thứ tự:

1. services/email.service.js (gửi OTP qua Resend)
2. services/otp.service.js (tạo, verify, hủy OTP)
3. routes/auth.js (forgot-password + verify-otp)
4. middleware/turnstile.js (verify Cloudflare Turnstile)
5. services/payos.service.js (tạo đơn, verify webhook HMAC)
6. routes/checkout.js (tạo đơn + polling status)
7. routes/webhook.js (nhận PayOS callback)

Bắt buộc:
- OTP: hủy mã cũ trước khi tạo mới
- OTP: tối đa 5 lần sai → hủy mã
- Webhook: verify HMAC bắt buộc
- Webhook: luôn trả 200 (idempotent)
- Checkout: tính amount bằng calculateAmount()
```

---

### MODULE 2C — Backend Admin
**Model:** Claude Sonnet 4.6 Thinking  
**TDD cần:** Phần 2 (admin routes)  
**Prompt:**
```
Đọc kỹ TDD đính kèm phần MODULE 2C.
Implement toàn bộ admin routes:

1. routes/admin/templates.js (CRUD + soft delete)
2. routes/admin/categories.js (CRUD + kiểm tra còn sản phẩm)
3. routes/admin/promotions.js (tạo + kiểm tra overlap)
4. routes/admin/users.js (danh sách + ban + soft delete)
5. routes/admin/orders.js (lịch sử + mở thủ công)
6. routes/admin/stats.js (tổng quan doanh thu)

Bắt buộc:
- Tất cả routes phải qua middleware adminAuth
- Soft delete: không xóa thật, chỉ đánh dấu is_deleted=true
- Xóa danh mục: kiểm tra còn template không
- Promotion: kiểm tra không overlap thời gian
```

---

### MODULE 3A — Frontend Public Pages
**Model:** Gemini 3.1 Pro High  
**TDD cần:** Phần 3 (LandingPage, ProductsPage, ProductDetailPage)  
**Prompt:**
```
Đọc kỹ TDD đính kèm phần MODULE 3A.
Implement theo thứ tự:

1. lib/supabase.js (1 instance duy nhất)
2. lib/api.js (fetch wrapper với token từ getSession())
3. hooks/useAuth.jsx (AuthProvider + useAuth)
4. App.jsx (routing đầy đủ — chỉ khai báo routes, chưa implement pages)
5. components/Navbar.jsx + BottomNav.jsx
6. components/ProductCard.jsx + SubscriptionBadge.jsx
7. components/ui/Button.jsx + Input.jsx
8. pages/LandingPage.jsx
9. pages/ProductsPage.jsx
10. pages/ProductDetailPage.jsx

Màu sắc bắt buộc (đã có trong tailwind.config.js):
primary: #61892F | primary-light: #86C232
background: #222629 | surface: #474B4F | muted: #6B6E70

Grid bắt buộc:
- Mobile: 2 cột (grid-cols-2)
- Tablet: 3 cột (md:grid-cols-3)
- Desktop: 4 cột (lg:grid-cols-4)

Bắt buộc:
- Token: supabase.auth.getSession() không localStorage
- API URL: import.meta.env.VITE_API_URL không hardcode
- Guard: useEffect không if() trong render
- File JSX: đuôi .jsx
```

---

### MODULE 3B — Frontend Auth + Checkout + Account
**Model:** Claude Sonnet 4.6 Thinking  
**TDD cần:** Phần 3 (LoginPage, RegisterPage, ForgotPasswordPage, OTPPage, CheckoutPage, PaymentSuccessPage, AccountPage)  
**Prompt:**
```
Đọc kỹ TDD đính kèm phần MODULE 3B.
Implement theo thứ tự:

1. pages/LoginPage.jsx (email + Google + Turnstile)
2. pages/RegisterPage.jsx (email + Turnstile)
3. pages/ForgotPasswordPage.jsx (nhập email + Turnstile)
4. pages/OTPPage.jsx (6 ô auto-focus + đếm ngược 60s)
5. pages/CheckoutPage.jsx (chọn gói + QR + polling)
6. pages/PaymentSuccessPage.jsx (animation check + tóm tắt)
7. pages/AccountPage.jsx (subscription + lịch sử)

Đặc biệt CheckoutPage:
- Render QR bằng qrcode.js (không redirect PayOS)
- Polling mỗi 3 giây: GET /api/checkout/:order_code/status
- Timeout 10 phút → hiện thông báo
- Countdown MM:SS
- Spinner màu primary-light (#86C232)
```

---

### MODULE 3C — Frontend Admin
**Model:** Gemini 3.1 Pro High  
**TDD cần:** Phần 3 (Admin pages)  
**Prompt:**
```
Đọc kỹ TDD đính kèm phần MODULE 3C.
Implement toàn bộ admin pages:

1. pages/admin/AdminDashboard.jsx (layout sidebar/bottom tabs)
2. pages/admin/AdminTemplates.jsx (CRUD + ẩn/hiện)
3. pages/admin/AdminCategories.jsx (CRUD + cảnh báo xóa)
4. pages/admin/AdminPromotions.jsx (tạo chương trình giảm giá)
5. pages/admin/AdminUsers.jsx (danh sách + ban + xóa)
6. pages/admin/AdminOrders.jsx (lịch sử + mở thủ công)
7. pages/admin/AdminStats.jsx (biểu đồ doanh thu)

Bắt buộc:
- Sidebar desktop / bottom tabs mobile
- Kiểm tra is_admin, redirect / nếu không phải admin
- Confirm dialog trước khi ban/xóa user
- Confirm dialog trước khi xóa danh mục
```

---

### MODULE 4 — PWA + Deploy
**Model:** Gemini 3 Flash  
**TDD cần:** Phần 4 (Bước 5) + Phần 6  
**Prompt:**
```
Đọc kỹ TDD đính kèm phần MODULE 4.
Thực hiện:

1. vite.config.js: thêm vite-plugin-pwa
   - name: "EZTemplate"
   - theme_color: "#222629"
   - Icons: 192x192 và 512x512

2. Kiểm tra toàn bộ checklist Phần 6 trước khi deploy:
   - tailwind.config.js có đủ custom colors
   - postinstall dùng Node.js
   - CORS từ env
   - 1 createClient duy nhất

⚠️ Nếu vite-plugin-pwa lỗi JSON parse trên Windows:
   Comment out PWA trong vite.config.js
   Báo lại để xử lý sau
```

---


## PHẦN 1 — DATABASE

### Schema SQL (chạy trên Supabase SQL Editor)

```sql
-- Bảng profiles
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  display_name  TEXT,
  is_admin      BOOLEAN DEFAULT false,
  is_banned     BOOLEAN DEFAULT false,
  is_deleted    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Bảng categories
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  is_free       BOOLEAN DEFAULT false,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);
-- Seed: INSERT INTO categories (name, is_free) VALUES ('Free', true), ('Trả phí', false);

-- Bảng templates
CREATE TABLE templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  short_desc    TEXT,
  long_desc     TEXT,
  icon          TEXT,
  image_url     TEXT,
  video_url     TEXT,
  app_url       TEXT NOT NULL,
  category_id   UUID REFERENCES categories(id),
  price         NUMERIC DEFAULT 0,
  status        TEXT DEFAULT 'visible'
                CHECK (status IN ('visible', 'hidden', 'coming_soon')),
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Bảng promotions
CREATE TABLE promotions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_pct  INTEGER NOT NULL CHECK (discount_pct > 0 AND discount_pct < 100),
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Bảng subscriptions
CREATE TABLE subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id   UUID NOT NULL REFERENCES templates(id),
  expires_at    TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, template_id)
);

-- Bảng orders
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code      TEXT NOT NULL UNIQUE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  template_id     UUID NOT NULL REFERENCES templates(id),
  plan            TEXT NOT NULL CHECK (plan IN ('1month', '3months', '1year')),
  amount          NUMERIC NOT NULL,
  original_amount NUMERIC NOT NULL,
  discount_pct    INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  payos_order_id  TEXT,
  qr_code         TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  paid_at         TIMESTAMPTZ
);

-- Bảng otp_codes
CREATE TABLE otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INTEGER DEFAULT 0,
  is_used     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_otp_email ON otp_codes(email, is_used);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_self" ON profiles
  USING (id = auth.uid());

CREATE POLICY "subscriptions_self" ON subscriptions
  USING (user_id = auth.uid());

CREATE POLICY "orders_self" ON orders
  USING (user_id = auth.uid());

CREATE POLICY "templates_public_read" ON templates
  FOR SELECT USING (status = 'visible');

CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (true);
```

---

## PHẦN 2 — BACKEND

### Cấu trúc thư mục
```
server/
├── server.js
├── middleware/
│   ├── auth.js
│   ├── adminAuth.js
│   ├── turnstile.js
│   └── rateLimit.js
├── routes/
│   ├── auth.js
│   ├── templates.js
│   ├── categories.js
│   ├── checkout.js
│   ├── webhook.js
│   ├── subscriptions.js
│   ├── account.js
│   └── admin/
│       ├── templates.js
│       ├── categories.js
│       ├── promotions.js
│       ├── users.js
│       ├── orders.js
│       └── stats.js
├── services/
│   ├── otp.service.js
│   ├── payos.service.js
│   ├── subscription.service.js
│   ├── promotion.service.js
│   └── email.service.js
└── lib/
    └── supabase.js
```

### server.js
```javascript
// CORS: đọc từ env ALLOWED_ORIGINS (comma-separated)
// const origins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
// cors({ origin: origins })
// KHÔNG hardcode domain

// Routes:
// /api/auth, /api/templates, /api/categories
// /api/checkout, /api/webhook, /api/subscriptions
// /api/account, /api/admin/*
// Port: process.env.PORT || 3001
```

### lib/supabase.js
```javascript
// supabaseAnon:  dùng SUPABASE_ANON_KEY  (cho auth)
// supabaseAdmin: dùng SUPABASE_SERVICE_ROLE_KEY (cho DB queries)
// Chỉ 1 file này tạo client — tất cả file khác import từ đây
```

### middleware/auth.js
```javascript
// Verify JWT từ Authorization header
// Dùng supabase.auth.getUser(token)
// Gắn user vào req.user
// Trả 401 nếu thiếu hoặc sai token
```

### middleware/adminAuth.js
```javascript
// Chạy sau auth.js
// Query profiles WHERE id = req.user.id
// Kiểm tra is_admin = true
// Trả 403 nếu không phải admin
```

### Environment Variables

**server/.env**
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
RESEND_API_KEY=
CLOUDFLARE_TURNSTILE_SECRET=
ALLOWED_ORIGINS=http://localhost:5173
PORT=3001
```

**client/.env**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3001/api
# Production: VITE_API_URL=https://xxx.railway.app/api ← có https:// VÀ /api ở cuối
VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=
```

### API Endpoints

#### Auth
```
POST /api/auth/forgot-password   → gửi OTP qua email
POST /api/auth/verify-otp        → xác minh OTP + đổi mật khẩu
```

#### Templates (Public)
```
GET  /api/templates              → danh sách (?category_id=, ?limit=, ?offset=)
GET  /api/templates/:slug        → chi tiết 1 template
GET  /api/categories             → danh sách danh mục
```

#### Checkout (Auth)
```
POST /api/checkout/create                  → tạo đơn hàng + QR PayOS
GET  /api/checkout/:order_code/status      → polling trạng thái đơn
```

#### Webhook (No Auth)
```
POST /api/webhook/payos          → nhận callback từ PayOS
```

#### Subscriptions (Auth)
```
GET  /api/subscriptions/check    → kiểm tra quyền truy cập (?template_id=)
```

#### Account (Auth)
```
GET  /api/account/subscriptions  → danh sách subscription của user
GET  /api/account/orders         → lịch sử thanh toán
```

#### Admin (Admin Auth)
```
GET/POST/PUT/DELETE /api/admin/templates/:id
GET/POST/PUT/DELETE /api/admin/categories/:id
GET/POST/DELETE     /api/admin/promotions/:id
GET                 /api/admin/users
PATCH               /api/admin/users/:id/ban
DELETE              /api/admin/users/:id
GET                 /api/admin/orders
GET                 /api/admin/stats
```

### Business Logic quan trọng

**Tính giá đơn hàng — KHÔNG lưu DB:**
```javascript
function calculateAmount(basePrice, promoPct, plan) {
  const multiplier    = { '1month': 1, '3months': 3, '1year': 12 }
  const planDiscount  = { '1month': 0, '3months': 15, '1year': 30 }
  const afterPromo    = basePrice * (1 - promoPct / 100)
  const subtotal      = afterPromo * multiplier[plan]
  const finalAmount   = subtotal * (1 - planDiscount[plan] / 100)
  return Math.round(finalAmount)
}
```

**Tính trạng thái subscription — KHÔNG lưu DB:**
```javascript
function getSubscriptionStatus(expires_at) {
  if (!expires_at) return { status: 'active', allowed: true, days: null }
  const now = new Date()
  const exp = new Date(expires_at)
  const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
  if (days > 7)  return { status: 'active',   allowed: true,  days }
  if (days > 0)  return { status: 'expiring', allowed: true,  days }
  if (days >= -3) return { status: 'grace',   allowed: false, days: Math.abs(days) }
  return               { status: 'locked',   allowed: false, days: 0 }
}
```

**Tính promotion active:**
```javascript
async function getActivePromotion() {
  const now = new Date().toISOString()
  const { data } = await supabaseAdmin
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .lte('starts_at', now)
    .gte('ends_at', now)
    .single()
  return data // null nếu không có
}
```

**Luồng PayOS webhook (đầy đủ):**
```javascript
// 1. Verify HMAC checksum
// 2. Tìm order theo orderCode
// 3. Nếu status = 'PAID' và order chưa paid:
//    - Cập nhật order: status='paid', paid_at=now()
//    - Tính expires_at theo plan
//    - Upsert subscriptions
// 4. Luôn trả 200 (idempotent)
```

---

## PHẦN 3 — FRONTEND

### Cấu trúc thư mục
```
client/src/
├── lib/
│   ├── supabase.js      -- 1 instance duy nhất
│   └── api.js           -- fetch wrapper với token
├── hooks/
│   ├── useAuth.jsx      -- AuthProvider + useAuth
│   └── useSubscription.jsx
├── components/
│   ├── Navbar.jsx
│   ├── BottomNav.jsx
│   ├── ProductCard.jsx
│   ├── SubscriptionBadge.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Toast.jsx
├── pages/
│   ├── LandingPage.jsx
│   ├── ProductsPage.jsx
│   ├── ProductDetailPage.jsx
│   ├── CheckoutPage.jsx
│   ├── PaymentSuccessPage.jsx
│   ├── AccountPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ForgotPasswordPage.jsx
│   ├── OTPPage.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── AdminTemplates.jsx
│       ├── AdminCategories.jsx
│       ├── AdminPromotions.jsx
│       ├── AdminUsers.jsx
│       ├── AdminOrders.jsx
│       └── AdminStats.jsx
└── App.jsx
```

### lib/api.js
```javascript
// Token: const { data: { session } } = await supabase.auth.getSession()
// API URL: const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
// KHÔNG hardcode '/api' — KHÔNG localStorage key cứng
```

### App.jsx routing
```javascript
// Public routes: /, /san-pham, /san-pham/:slug, /login, /register
//                /quen-mat-khau, /quen-mat-khau/otp
// Auth routes:   /checkout/:id, /thanh-toan-thanh-cong, /tai-khoan
// Admin routes:  /admin/* (kiểm tra is_admin)
// Fallback:      redirect về /
```

### Màu sắc Tailwind (bắt buộc thêm vào tailwind.config.js)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary:    '#61892F',
        'primary-light': '#86C232',
        background: '#222629',
        surface:    '#474B4F',
        muted:      '#6B6E70',
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
      }
    }
  }
}
```

### Chi tiết từng trang

#### LandingPage
```
- GET /api/templates?limit=8 (8 sản phẩm đầu)
- GET /api/categories
- Hero: tiêu đề + 2 nút CTA
- Stats bar: nền surface
- Grid: 2 cột mobile / 4 cột desktop
- Nút "Xem thêm" → /san-pham
- Scroll reveal animation
```

#### ProductsPage (/san-pham)
```
- GET /api/templates (tất cả)
- GET /api/categories (tabs filter)
- Filter tabs scroll ngang
- Grid: 2 cột mobile / 3 cột tablet / 4 cột desktop
- Card VIP: border primary-light
- Giá giảm: gạch ngang + giá mới primary-light
- Empty state nếu danh mục trống
```

#### ProductDetailPage (/san-pham/:slug)
```
- GET /api/templates/:slug
- Layout: ảnh trên (mobile) / ảnh trái 50% (desktop)
- Nút "Dùng miễn phí": check login → check subscription → vào app
- Nút "Mua ngay": check login → /checkout/:id
- Giá giảm hiển thị nếu có promotion
```

#### CheckoutPage (/checkout/:id)
```
- GET /api/templates/:id (thông tin sản phẩm)
- Chọn gói: 1month / 3months / 1year
- Gói selected: border primary-light, bg rgba(134,194,50,0.1)
- Badge tiết kiệm: bg primary-light, text đen
- KHÔNG có ô nhập mã giảm giá
- Nút "Thanh toán":
  → POST /api/checkout/create
  → Nhận qr_code → render QR bằng qrcode.js
  → Bắt đầu polling GET /api/checkout/:order_code/status mỗi 3s
  → status='paid' → redirect /thanh-toan-thanh-cong
  → Timeout 10 phút → hiện thông báo thử lại
- Spinner polling: màu primary-light
- Countdown hiển thị MM:SS
```

#### PaymentSuccessPage (/thanh-toan-thanh-cong)
```
- Lấy thông tin từ query params hoặc state
- Icon check scale animation
- Card tóm tắt: bg surface, border primary-light
- Ngày hết hạn: màu primary-light
- Nút "Vào dùng ngay" → redirect app_url
- Nút "Về trang chủ" (ghost)
```

#### AccountPage (/tai-khoan)
```
- GET /api/account/subscriptions
- GET /api/account/orders
- Badge trạng thái:
  active:   bg primary-light/20, text primary-light
  expiring: bg warning/20, text warning (#F39C12)
  grace:    bg danger/20, text danger (#E74C3C)
  locked:   bg danger/30, text danger
- Nút "Gia hạn" → /checkout/:template_id
- Lịch sử: sort paid_at DESC
- Nút đăng xuất → supabase.auth.signOut() → redirect /
```

#### LoginPage (/login)
```
- supabase.auth.signInWithPassword()
- Đăng nhập Google: supabase.auth.signInWithOAuth({ provider: 'google' })
- Cloudflare Turnstile widget
- Error: toast "Email hoặc mật khẩu không đúng"
- Success → check subscription → redirect về trang trước hoặc /
- useEffect để redirect nếu đã đăng nhập
```

#### RegisterPage (/register)
```
- supabase.auth.signUp()
- Cloudflare Turnstile widget
- Sau khi đăng ký → tạo profile → redirect /
```

#### ForgotPasswordPage (/quen-mat-khau)
```
- POST /api/auth/forgot-password { email, turnstile_token }
- Cloudflare Turnstile widget
- Success → redirect /quen-mat-khau/otp (truyền email qua state)
```

#### OTPPage (/quen-mat-khau/otp)
```
- 6 ô input riêng biệt, auto-focus ô tiếp theo
- Đếm ngược 60s, nút "Gửi lại" disable trong 60s
- POST /api/auth/verify-otp { email, otp, new_password }
- Error states: đỏ ô + thông báo còn X lần
- Success → toast "Đổi mật khẩu thành công" → redirect /login
```

#### Admin Dashboard (/admin)
```
- Sidebar desktop / bottom tabs mobile
- GET /api/admin/stats
- 4 metric cards: user, template, doanh thu, đơn hàng
- Danh sách đơn hàng gần nhất
- Bảo vệ: kiểm tra is_admin, redirect / nếu không phải admin
```

---

## PHẦN 4 — HƯỚNG DẪN CHO AI CODE

### Thứ tự implement:

**Bước 1 — Setup project**
```
- Tạo 2 thư mục: server/ và client/
- server: npm init + cài express, @supabase/supabase-js,
          cors, dotenv, express-validator, express-rate-limit
- client: npm create vite@latest -- --template react
          + cài tailwindcss, react-router-dom,
          react-query, react-hot-toast, @supabase/supabase-js,
          qrcode, vite-plugin-pwa

⚠️ WINDOWS: Đặt project ở C:\Projects\eztemplate\
   KHÔNG đặt trong thư mục có tiếng Việt/Trung/ký tự đặc biệt
```

**Bước 2 — Database**
```
- Chạy schema.sql trên Supabase SQL Editor
- Seed categories: Free (is_free=true), Trả phí (is_free=false)
- Kiểm tra RLS đã bật cho tất cả bảng
```

**Bước 3 — Backend**
```
- lib/supabase.js (anon + admin client)
- middleware/auth.js → adminAuth.js → turnstile.js → rateLimit.js
- server.js (Express + CORS + routes)
- Implement theo thứ tự:
  templates → categories → auth (OTP) →
  checkout → webhook → subscriptions → account → admin
```

**Bước 4 — Frontend**
```
- tailwind.config.js (custom colors bắt buộc)
- lib/supabase.js + lib/api.js
- App.jsx routing đầy đủ
- hooks/useAuth.jsx (AuthProvider)
- Layout components (Navbar, BottomNav)
- Implement theo thứ tự:
  LandingPage → ProductsPage → ProductDetailPage →
  LoginPage → RegisterPage → ForgotPasswordPage → OTPPage →
  CheckoutPage → PaymentSuccessPage →
  AccountPage → AdminDashboard
```

**Bước 5 — PWA**
```
- vite.config.js: thêm vite-plugin-pwa
- manifest: name "EZTemplate", theme_color "#222629"
- Icons: 192x192 và 512x512
⚠️ Nếu lỗi JSON parse → comment out PWA, implement sau cùng
```

### Điểm dễ sai — nhắc AI đặc biệt:

```
⚠️ 1.  Token: dùng supabase.auth.getSession() KHÔNG localStorage key cứng
⚠️ 2.  API URL: dùng import.meta.env.VITE_API_URL KHÔNG hardcode '/api'
⚠️ 3.  VITE_API_URL: phải có https:// VÀ /api ở cuối
        Đúng: https://xxx.railway.app/api
        Sai:  xxx.railway.app | https://xxx.railway.app
⚠️ 4.  discounted_price: KHÔNG lưu DB, tính động trong service
⚠️ 5.  subscription status: KHÔNG lưu DB, tính động bằng getSubscriptionStatus()
⚠️ 6.  user_id: lấy từ JWT (req.user), KHÔNG từ request body
⚠️ 7.  CORS: đọc từ env ALLOWED_ORIGINS, KHÔNG hardcode domain
⚠️ 8.  Supabase: chỉ 1 createClient() duy nhất trong lib/supabase.js
⚠️ 9.  File có JSX: phải đặt đuôi .jsx (không phải .js)
⚠️ 10. tailwind.config.js: phải có custom colors trước khi dùng
        bg-primary, bg-surface, bg-background, text-primary-light...
⚠️ 11. Guard/redirect: dùng useEffect, KHÔNG dùng if() trực tiếp trong render
        Sai:  if (user) navigate('/dashboard')  ← trong render
        Đúng: useEffect(() => { if (user) navigate('/dashboard') }, [user])
⚠️ 12. QueryClientProvider: phải wrap toàn bộ app trong main.jsx
⚠️ 13. Postinstall: KHÔNG dùng chmod (không chạy trên Windows)
        Dùng: "node -e \"try{require('fs').chmodSync('node_modules/.bin/vite','755')}catch(e){}\""
⚠️ 14. Railway Root Directory: set /server
        Vercel Root Directory: set client
⚠️ 15. vite-plugin-pwa: hay lỗi JSON parse trên Windows
        → Comment out, implement PWA sau cùng
⚠️ 16. Đường dẫn project: KHÔNG có ký tự đặc biệt/tiếng Trung
        Đúng: C:\Projects\eztemplate\
        Sai:  C:\Users\PC\文件\eztemplate\
⚠️ 17. Windows CLI: KHÔNG có rm -rf → dùng rmdir /s /q node_modules
⚠️ 18. PayOS webhook: bắt buộc verify HMAC checksum, luôn trả 200 (idempotent)
⚠️ 19. OTP: hủy mã cũ trước khi tạo mã mới, đánh dấu is_used sau khi dùng
⚠️ 20. Export: kiểm tra nhất quán default vs named export
        Sai: export default function Foo() {} → import { Foo } from '...'
        Đúng: export default → import Foo, export const → import { Foo }

```

---

## PHẦN 5 — CHECKLIST VERIFY (Bước 6)

```
AUTH
□ Đăng ký email → tạo profile tự động
□ Đăng nhập Google → tạo profile nếu chưa có
□ Quên mật khẩu → nhận OTP qua email
□ OTP sai 5 lần → bị hủy, phải gửi lại
□ OTP hết 3 phút → báo hết hạn
□ Turnstile hiện trên login/register/quen-mat-khau

TEMPLATE & CHECKOUT
□ Landing page hiện 8 template đầu, 2 cột mobile / 4 cột desktop
□ Filter danh mục hoạt động đúng
□ Giá giảm hiện gạch ngang + giá mới khi có promotion
□ Checkout: chọn gói → tính đúng tổng tiền
□ Checkout: KHÔNG có ô nhập mã giảm giá
□ QR hiện ngay sau khi bấm "Thanh toán" (không redirect)
□ Polling 3 giây → tự chuyển màn thành công sau khi trả tiền
□ Timeout 10 phút → hiện thông báo thử lại

SUBSCRIPTION
□ Template free → đăng ký là dùng được, không qua checkout
□ Template trả phí chưa mua → redirect /checkout
□ Còn ≤ 7 ngày → banner vàng trên đầu app
□ Hết hạn (grace) → trang chặn đỏ
□ Khóa hoàn toàn → redirect /checkout
□ Data vẫn giữ khi hết hạn

ADMIN
□ Thêm template → hiện ngay trên trang sản phẩm
□ Ẩn template → biến mất khỏi danh sách public
□ Tạo promotion → giá tự động giảm toàn site
□ Hết thời gian promotion → giá tự động về gốc
□ Ban user → user bị đăng xuất, không login được
□ Xóa danh mục còn sản phẩm → báo lỗi

SECURITY
□ Copy link app sang trình duyệt khác → redirect /login
□ Đã login nhưng chưa mua → redirect /checkout
□ User A không thấy data User B (test RLS)
□ Webhook fake (sai chữ ký) → bị bỏ qua
```

---

## PHẦN 6 — CHECKLIST TRƯỚC KHI DEPLOY (Bước 7)

```
Chuẩn bị code:
□ tailwind.config.js có đủ custom colors (primary, surface, background...)
□ client/package.json có postinstall dùng Node.js (không chmod)
□ api.js dùng import.meta.env.VITE_API_URL (không hardcode)
□ api.js lấy token từ supabase.auth.getSession()
□ server.js đọc CORS từ env ALLOWED_ORIGINS
□ Chỉ 1 createClient() trong lib/supabase.js
□ .gitignore: node_modules/, .env, client/.env, server/.env, dist/

Railway (Backend):
□ Root Directory = /server
□ Env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
            PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY
            RESEND_API_KEY, CLOUDFLARE_TURNSTILE_SECRET
            PORT=3001, ALLOWED_ORIGINS=http://localhost:5173 (tạm)
□ Deploy thành công → copy URL Railway

Vercel (Frontend):
□ Root Directory = client
□ Framework Preset = Vite
□ Env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
            VITE_API_URL=https://xxx.railway.app/api ← có https:// VÀ /api
            VITE_CLOUDFLARE_TURNSTILE_SITE_KEY
□ Deploy thành công → copy URL Vercel

Sau khi có cả 2 URL:
□ Cập nhật ALLOWED_ORIGINS trên Railway: http://localhost:5173,https://xxx.vercel.app
□ Cập nhật PayOS webhook URL: https://xxx.railway.app/api/webhook/payos
□ Redeploy Railway
□ Test lại toàn bộ checklist Phần 5 trên production
```