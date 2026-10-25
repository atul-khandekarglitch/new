import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  'https://demo-induscycle.supabase.co';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key';

export const isSupabaseConfigured = () => {
  return (
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
    !supabaseUrl.includes('your_supabase_project_url') &&
    !supabaseUrl.includes('demo-induscycle')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Server-side client using Service Role Key (NEVER expose to frontend)
 */
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey.includes('your_server_side_service_role_key')) {
    return null;
  }
  return createClient(supabaseUrl, serviceKey);
};
