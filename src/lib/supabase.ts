import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isServer = typeof window === 'undefined';

// Zavolá sa po každom úspešnom zápise do databázy (insert/update/delete).
// Administrácia ním spúšťa prebudovanie webu, aby prerenderované HTML malo nové dáta.
let onDatabaseWrite: (() => void) | null = null;
export const setOnDatabaseWrite = (callback: (() => void) | null) => {
  onDatabaseWrite = callback;
};

const fetchWithWriteHook: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  const method = (init?.method ?? 'GET').toUpperCase();
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (onDatabaseWrite && response.ok && !['GET', 'HEAD'].includes(method) && url.includes('/rest/v1/')) {
    onDatabaseWrite();
  }
  return response;
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !isServer,
    autoRefreshToken: !isServer,
    detectSessionInUrl: !isServer,
  },
  global: { fetch: fetchWithWriteHook },
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
