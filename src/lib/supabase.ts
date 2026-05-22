import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isServer = typeof window === 'undefined';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !isServer,
    autoRefreshToken: !isServer,
    detectSessionInUrl: !isServer,
  },
});

export type PlannedHoliday = {
  id: string;
  start_date: string;
  end_date: string;
  description: string;
  description_en: string | null;
  is_active: boolean;
  created_at: string;
};

export type PriceListItem = {
  id: string;
  category: string;
  service_name: string;
  price_string: string;
  display_order: number;
  created_at: string;
};

export type TeamMember = {
  id: string;
  full_name: string;
  role: string;
  photo_url: string | null;
  display_order: number;
  created_at: string;
};

export type FeaturedService = {
  id: string;
  title_cs: string;
  title_en: string;
  description_cs: string;
  description_en: string;
  price_string: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
};
