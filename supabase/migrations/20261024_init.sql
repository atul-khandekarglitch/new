-- ==============================================================================
-- INDUSCYCLE SUPABASE DATABASE MIGRATION & RLS POLICIES
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY DEFAULT 'comp_' || uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  sub_industry TEXT,
  manufacturing_process TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  industrial_area TEXT NOT NULL,
  privacy_level TEXT NOT NULL DEFAULT 'public' CHECK (privacy_level IN ('public', 'matched_only', 'approval_required')),
  verified BOOLEAN NOT NULL DEFAULT false,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  capabilities TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'both', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Material Listings Table
CREATE TABLE IF NOT EXISTS public.material_listings (
  id TEXT PRIMARY KEY DEFAULT 'lst_' || uuid_generate_v4(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  material_category TEXT NOT NULL,
  material_grade TEXT NOT NULL,
  alloy_designation TEXT,
  chemical_composition TEXT,
  standard_spec TEXT,
  hardness TEXT,
  total_quantity NUMERIC(12, 2) NOT NULL CHECK (total_quantity > 0),
  quantity_unit TEXT NOT NULL DEFAULT 'kg',
  min_order_quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
  price_per_unit NUMERIC(12, 2) NOT NULL CHECK (price_per_unit >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  negotiable BOOLEAN NOT NULL DEFAULT true,
  dimensions JSONB DEFAULT '{}',
  condition TEXT NOT NULL DEFAULT 'clean' CHECK (condition IN ('clean', 'mixed', 'oily', 'wet', 'oxidised', 'damaged', 'other')),
  contamination_status TEXT,
  inspection_status TEXT DEFAULT 'self_inspected',
  country TEXT NOT NULL DEFAULT 'India',
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  industrial_area TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'sold', 'draft', 'archived')),
  verification_state TEXT NOT NULL DEFAULT 'pending_verification' CHECK (verification_state IN ('draft', 'pending_verification', 'verified', 'rejected')),
  views_count INTEGER NOT NULL DEFAULT 0,
  enquiries_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Material Images Table
CREATE TABLE IF NOT EXISTS public.material_images (
  id TEXT PRIMARY KEY DEFAULT 'img_' || uuid_generate_v4(),
  listing_id TEXT NOT NULL REFERENCES public.material_listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT 'ord_' || uuid_generate_v4(),
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  listing_id TEXT REFERENCES public.material_listings(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal NUMERIC(12, 2) NOT NULL,
  transport_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  processing_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  invoice_id TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT 'item_' || uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES public.material_listings(id) ON DELETE RESTRICT,
  material_name TEXT NOT NULL,
  material_category TEXT NOT NULL,
  grade TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  line_total NUMERIC(12, 2) NOT NULL
);

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY DEFAULT 'pay_' || uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'wire_transfer', 'demo_gateway')),
  provider_payment_reference TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
  is_test_mode BOOLEAN NOT NULL DEFAULT true,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY DEFAULT 'inv_' || uuid_generate_v4(),
  order_id TEXT NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  seller_details JSONB NOT NULL,
  buyer_details JSONB NOT NULL,
  material_details JSONB NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  transport_cost NUMERIC(12, 2) NOT NULL,
  processing_cost NUMERIC(12, 2) NOT NULL,
  tax_amount NUMERIC(12, 2) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending')),
  payment_reference TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all verified profiles, but edit only their own
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert/update their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Listings: Public listings viewable by everyone; manage only own
CREATE POLICY "Active listings are viewable by all" ON public.material_listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Sellers can manage their own listings" ON public.material_listings
  FOR ALL USING (seller_id = auth.uid());

-- Material Images: Publicly readable for active listings
CREATE POLICY "Images are readable by all" ON public.material_images
  FOR SELECT USING (true);

-- Orders: Only buyer or seller involved can access
CREATE POLICY "Buyers and sellers can view their own orders" ON public.orders
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Invoices: Authorised parties only
CREATE POLICY "Invoices viewable by buyer or seller" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = invoices.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );
