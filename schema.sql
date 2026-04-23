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
