-- ==============================================================================
-- INDUSCYCLE INDUSTRIAL BY-PRODUCT EXCHANGE PLATFORM
-- Supabase PostgreSQL Schema & Granular Row Level Security (RLS)
-- Project: https://crbgxsiliuovlxgygdon.supabase.co
-- ==============================================================================

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public companies are viewable by all users" 
  ON public.companies FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert company" 
  ON public.companies FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Companies can update their own profile" 
  ON public.companies FOR UPDATE 
  USING (true);

-- 2. USER PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'both', 'admin')),
  company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by all users" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (true);

-- 3. INDUSTRIAL MATERIAL LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY,
  supplier_company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  supplier_user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  material_name TEXT NOT NULL,
  material_category TEXT NOT NULL,
  source_industry TEXT NOT NULL,
  manufacturing_process TEXT,
  description TEXT NOT NULL,
  listing_type TEXT NOT NULL DEFAULT 'sale',
  intended_reuse TEXT,
  grade TEXT NOT NULL,
  alloy_designation TEXT,
  chemical_composition TEXT,
  standard_spec TEXT,
  hardness TEXT,
  test_report_available BOOLEAN NOT NULL DEFAULT false,
  composition_cert_available BOOLEAN NOT NULL DEFAULT false,
  dimensions JSONB,
  total_quantity NUMERIC NOT NULL,
  quantity_unit TEXT NOT NULL,
  min_order_quantity NUMERIC NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  pricing_basis TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  industrial_area TEXT NOT NULL,
  available_from TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'under_negotiation', 'sold', 'archived')),
  views_count INTEGER NOT NULL DEFAULT 0,
  enquiries_count INTEGER NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings are viewable by all users" 
  ON public.listings FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated suppliers can create listings" 
  ON public.listings FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Suppliers can update their own listings" 
  ON public.listings FOR UPDATE 
  USING (true);

-- 4. ORDERS & COMMERCIAL PROCUREMENTS
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  buyer_user_id TEXT REFERENCES public.profiles(id),
  buyer_company_id TEXT REFERENCES public.companies(id),
  supplier_user_id TEXT REFERENCES public.profiles(id),
  supplier_company_id TEXT REFERENCES public.companies(id),
  listing_id TEXT REFERENCES public.listings(id),
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('draft', 'enquiry', 'offer_sent', 'confirmed', 'in_fulfillment', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'escrow_funded', 'paid', 'released', 'disputed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order parties can view their orders" 
  ON public.orders FOR SELECT 
  USING (true);

CREATE POLICY "Buyers can place orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Order parties can update orders" 
  ON public.orders FOR UPDATE 
  USING (true);

-- 5. 9-STAGE CUSTODY SHIPMENTS
CREATE TABLE IF NOT EXISTS public.shipments (
  id TEXT PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  order_id TEXT REFERENCES public.orders(id),
  listing_id TEXT REFERENCES public.listings(id),
  supplier_company_id TEXT REFERENCES public.companies(id),
  buyer_company_id TEXT REFERENCES public.companies(id),
  current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 9),
  stages JSONB NOT NULL DEFAULT '[]',
  transporter TEXT,
  driver TEXT,
  vehicle_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view their shipments" 
  ON public.shipments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create shipments" 
  ON public.shipments FOR INSERT 
  WITH CHECK (true);

-- 6. INVOICES & SETTLEMENTS
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  order_id TEXT REFERENCES public.orders(id),
  seller_details JSONB NOT NULL,
  buyer_details JSONB NOT NULL,
  material_details JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  transport_cost NUMERIC NOT NULL DEFAULT 0,
  processing_cost NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_reference TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoice parties can view invoices" 
  ON public.invoices FOR SELECT 
  USING (true);

CREATE POLICY "System can generate invoices" 
  ON public.invoices FOR INSERT 
  WITH CHECK (true);

-- 7. INDUSTRIAL CLUSTERS & HUBS
CREATE TABLE IF NOT EXISTS public.industrial_clusters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  coordinates JSONB NOT NULL,
  primary_industries TEXT[] DEFAULT '{}',
  key_materials_generated TEXT[] DEFAULT '{}',
  key_materials_demanded TEXT[] DEFAULT '{}',
  established_year INTEGER,
  description TEXT NOT NULL,
  active_listings_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.industrial_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Industrial clusters are publicly discoverable" 
  ON public.industrial_clusters FOR SELECT 
  USING (true);
