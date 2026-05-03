-- Migration: Thêm bảng purchases cho mô hình One-time Purchase
-- Chạy trong Supabase SQL Editor

-- 1. Tạo bảng purchases
CREATE TABLE IF NOT EXISTS purchases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id  UUID NOT NULL REFERENCES templates(id),
  order_id     UUID NOT NULL REFERENCES orders(id),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, template_id)
);

-- 2. Bật RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- 3. Policy: user chỉ thấy purchase của chính mình
CREATE POLICY "purchases_self" ON purchases
  USING (user_id = auth.uid());

-- 4. Index để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_template_id ON purchases(template_id);

-- 5. Sửa orders.plan constraint để chấp nhận 'lifetime'
--    (các đơn cũ vẫn hợp lệ, đơn mới sẽ dùng 'lifetime')
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_plan_check;
ALTER TABLE orders ADD CONSTRAINT orders_plan_check
  CHECK (plan IN ('1month', '3months', '1year', 'lifetime'));
