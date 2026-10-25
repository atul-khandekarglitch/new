import { supabase, isSupabaseConfigured } from './supabase';
import { Company, User, MaterialListing, Order, Shipment, Invoice, IndustrialCluster } from '@/types';

/**
 * Diagnostic check of Supabase database connectivity and schema tables
 */
export async function verifySupabaseSchema(): Promise<{
  connected: boolean;
  tables: Record<string, boolean>;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      tables: {},
      message: "Supabase credentials are not configured in environment variables.",
    };
  }

  const tableNames = [
    "profiles",
    "companies",
    "listings",
    "orders",
    "shipments",
    "invoices",
    "industrial_clusters",
  ];

  const results: Record<string, boolean> = {};

  try {
    for (const table of tableNames) {
      const { error } = await supabase.from(table).select("*").limit(1);
      // PGRST205 / 42P01 means table does not exist in schema cache
      if (error && (error.code === "PGRST205" || error.code === "42P01" || error.message?.includes("not find the table"))) {
        results[table] = false;
      } else {
        results[table] = !error;
      }
    }

    const availableCount = Object.values(results).filter(Boolean).length;

    return {
      connected: true,
      tables: results,
      message: `Supabase connected successfully. Found ${availableCount}/${tableNames.length} tables in public schema.`,
    };
  } catch (err: any) {
    return {
      connected: false,
      tables: results,
      message: `Supabase connection error: ${err.message}`,
    };
  }
}

/**
 * Safely insert a profile into Supabase if table exists
 */
export async function syncUserToSupabase(user: User, company: Company): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error: compError } = await supabase.from("companies").upsert({
      id: company.id,
      name: company.name,
      industry: company.industry,
      sub_industry: company.subIndustry || null,
      manufacturing_process: company.manufacturingProcess || null,
      city: company.city,
      state: company.state,
      country: company.country,
      industrial_area: company.industrialArea,
      contact_email: company.contactEmail,
      contact_phone: company.contactPhone || null,
      verified: company.verified,
    });

    if (compError) {
      console.warn("Supabase companies table sync notice:", compError.message);
      return false;
    }

    const { error: userError } = await supabase.from("profiles").upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      company_id: company.id,
      avatar: user.avatar || null,
      created_at: user.createdAt,
    });

    if (userError) {
      console.warn("Supabase profiles table sync notice:", userError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("Supabase user sync error:", err);
    return false;
  }
}

/**
 * Safely fetch listings from Supabase if table exists
 */
export async function fetchListingsFromSupabase(): Promise<MaterialListing[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase.from("listings").select("*");
    if (error || !data) {
      return null;
    }
    return data as MaterialListing[];
  } catch {
    return null;
  }
}
