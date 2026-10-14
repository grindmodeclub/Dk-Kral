// Dáta zo Supabase načítané pri builde (prerender). V prehliadači slúžia ako počiatočný stav,
// komponenty si ich potom normálne obnovia zo Supabase.
import { createContext, ReactNode, useContext } from 'react';
import { supabase, TeamMember, PlannedHoliday, FeaturedService, PriceListItem } from './supabase';
import type { Language } from '../App';

export type SiteData = {
  team: TeamMember[];
  featuredServices: FeaturedService[];
  priceList: PriceListItem[];
  holidays: PlannedHoliday[];
};

declare global {
  interface Window {
    __DK_DATA__?: SiteData;
  }
}

const SiteDataContext = createContext<SiteData | null>(null);

export function SiteDataProvider({ value, children }: { value: SiteData | null; children: ReactNode }) {
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export const useSiteData = () => useContext(SiteDataContext);

const todayIso = () => new Date().toISOString().split('T')[0];

export const fetchTeam = async () => {
  const { data, error } = await supabase.from('team_members').select('*').order('display_order');
  if (error) throw error;
  return (data ?? []) as TeamMember[];
};

export const fetchActiveHolidays = async () => {
  const { data, error } = await supabase
    .from('planned_holidays')
    .select('*')
    .eq('is_active', true)
    .gte('end_date', todayIso())
    .order('start_date');
  if (error) throw error;
  return (data ?? []) as PlannedHoliday[];
};

export const fetchFeaturedServices = async () => {
  const { data, error } = await supabase
    .from('featured_services')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  if (error) throw error;
  return (data ?? []) as FeaturedService[];
};

export const fetchPriceList = async () => {
  const { data, error } = await supabase.from('price_list').select('*').order('display_order');
  if (error) throw error;
  return (data ?? []) as PriceListItem[];
};

/** Všetky verejné dáta naraz (používa prerender pri builde). */
export const fetchSiteData = async (): Promise<SiteData> => {
  const [team, featuredServices, priceList, holidays] = await Promise.all([
    fetchTeam(),
    fetchFeaturedServices(),
    fetchPriceList(),
    fetchActiveHolidays(),
  ]);
  return { team, featuredServices, priceList, holidays };
};

export const PRICE_CATEGORY_ORDER: Record<string, number> = {
  'Stomatologické výkony': 1,
  'Protetika': 2,
  'Chirurgie': 3,
  'Dentální Hygiena': 4,
};

export type PriceGroup = { category: string; items: { name: string; price: string }[] };

export const groupPriceList = (items: PriceListItem[]): PriceGroup[] => {
  const grouped = items.reduce((acc, item) => {
    (acc[item.category] ||= []).push({ name: item.service_name.trim(), price: item.price_string.trim() });
    return acc;
  }, {} as Record<string, { name: string; price: string }[]>);
  return Object.entries(grouped)
    .map(([category, groupItems]) => ({ category, items: groupItems }))
    .sort((a, b) => (PRICE_CATEGORY_ORDER[a.category] || 999) - (PRICE_CATEGORY_ORDER[b.category] || 999));
};

/** Cena z cenníka podľa začiatku názvu služby, napr. „Zubní implantát“. */
export const findPrice = (items: PriceListItem[], namePrefix: string) =>
  items.find((i) => i.service_name.trim().toLowerCase().startsWith(namePrefix.toLowerCase()))?.price_string.trim() ?? null;

/** „2280,-“ → „2 280 Kč“, „Od 16 000,-“ → „od 16 000 Kč“, „3420,-/čelist“ → „3 420 Kč/čelist“. */
export const formatPrice = (raw: string, language: Language = 'cs') => {
  const currency = language === 'cs' ? 'Kč' : 'CZK';
  return raw
    .trim()
    .replace(/^Od /, language === 'cs' ? 'od ' : 'from ')
    .replace(/^od /, language === 'cs' ? 'od ' : 'from ')
    .replace(/(\d)\s(?=\d{3}\b)/g, '$1')
    .replace(/\d{4,}/g, (n) => n.replace(/\B(?=(\d{3})+(?!\d))/g, ' '))
    .replace(/(\d)-(\d)/g, '$1–$2')
    .replace(/\s*(,-|Kč)/g, ` ${currency}`);
};

/** Deterministický formát dátumu (rovnaký na serveri aj v prehliadači, bez Intl rozdielov). */
export const formatDate = (iso: string, language: Language) => {
  const [y, m, d] = iso.split('-').map(Number);
  return language === 'cs' ? `${d}. ${m}. ${y}` : `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
};

export const formatDateRange = (start: string, end: string, language: Language) =>
  start === end ? formatDate(start, language) : `${formatDate(start, language)} – ${formatDate(end, language)}`;
