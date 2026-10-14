// JSON-LD (schema.org). Všetko ide do jedného @graph na stránku, Dentist má stabilné @id,
// takže služby, FAQ a breadcrumb sa naň odkazujú a NAP je vždy z BUSINESS.
import { BUSINESS, OPENING_HOURS, SITE_URL, ROUTES, pageUrl, PageId } from './business';
import type { FeaturedService, PriceListItem, TeamMember } from './supabase';
import type { FaqItem } from '../content/faq';
import { formatPrice, groupPriceList } from './siteData';

const DENTIST_ID = `${SITE_URL}/#dentist`;
const WEBSITE_ID = `${SITE_URL}/#website`;

type Json = Record<string, unknown>;

export const SERVICE_CATALOG = [
  { name: 'Záchovná stomatologie – fotokompozitní výplně', category: 'Stomatologické výkony' },
  { name: 'Endodoncie – ošetření kořenových kanálků', category: 'Stomatologické výkony' },
  { name: 'Celokeramické fazety', category: 'Protetika' },
  { name: 'Celokeramické korunky a overlaye', category: 'Protetika' },
  { name: 'Extrakce zubů a chirurgické zákroky', category: 'Chirurgie' },
  { name: 'Zubní implantáty', category: 'Chirurgie' },
  { name: 'Dentální hygiena metodou GBT', category: 'Dentální hygiena' },
  { name: 'Ošetření pod dásní', category: 'Dentální hygiena' },
  { name: 'Bělení zubů', category: 'Dentální hygiena' },
];

export const dentistNode = (team: TeamMember[] = []): Json => ({
  '@type': 'Dentist',
  '@id': DENTIST_ID,
  name: BUSINESS.name,
  legalName: BUSINESS.legalName,
  alternateName: ['DK KRÁL', 'DK Král', 'DK Král - Dentální hygiena', 'Zubař Hradec Králové DK KRÁL'],
  identifier: { '@type': 'PropertyValue', propertyID: 'IČO', value: BUSINESS.ico.replace(/\s/g, '') },
  description:
    'Soukromá zubní ordinace v centru Hradce Králové: dentální hygiena metodou GBT, zubní implantáty, bělení zubů, endodoncie, fazety a korunky.',
  url: `${SITE_URL}/`,
  logo: BUSINESS.logo,
  image: BUSINESS.image,
  telephone: BUSINESS.phone,
  email: BUSINESS.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.street,
    addressLocality: BUSINESS.city,
    addressRegion: BUSINESS.region,
    postalCode: BUSINESS.postalCode,
    addressCountry: BUSINESS.country,
  },
  geo: { '@type': 'GeoCoordinates', ...BUSINESS.geo },
  hasMap: BUSINESS.mapsUrl,
  openingHoursSpecification: OPENING_HOURS.map((s) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: s.days,
    opens: s.opens,
    closes: s.closes,
  })),
  priceRange: '$$',
  currenciesAccepted: 'CZK',
  paymentAccepted: 'Cash, Credit Card',
  areaServed: { '@type': 'City', name: 'Hradec Králové' },
  medicalSpecialty: 'Dentistry',
  availableService: SERVICE_CATALOG.map((s) => ({ '@type': 'MedicalProcedure', name: s.name })),
  ...(team.length
    ? {
        employee: team.map((m) => ({
          '@type': 'Person',
          name: m.full_name,
          ...(m.role ? { honorificPrefix: m.role } : {}),
        })),
      }
    : {}),
  sameAs: [...BUSINESS.profiles],
});

export const websiteNode = (): Json => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: 'DK KRÁL – Zubař Hradec Králové',
  inLanguage: 'cs-CZ',
  publisher: { '@id': DENTIST_ID },
});

export const webPageNode = (pageId: PageId, title: string, description: string): Json => {
  const route = ROUTES.find((r) => r.id === pageId)!;
  return {
    '@type': pageId === 'contact' ? 'ContactPage' : 'WebPage',
    '@id': `${pageUrl(route.path)}#webpage`,
    url: pageUrl(route.path),
    name: title,
    description,
    inLanguage: 'cs-CZ',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': DENTIST_ID },
    ...(pageId !== 'home' ? { breadcrumb: { '@id': `${pageUrl(route.path)}#breadcrumb` } } : {}),
  };
};

export const breadcrumbNode = (pageId: PageId): Json | null => {
  if (pageId === 'home') return null;
  const route = ROUTES.find((r) => r.id === pageId)!;
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl(route.path)}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Domů', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: route.name.cs, item: pageUrl(route.path) },
    ],
  };
};

export const faqNode = (items: FaqItem[]): Json => ({
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/#faq`,
  mainEntity: items.map((i) => ({
    '@type': 'Question',
    name: i.q,
    acceptedAnswer: { '@type': 'Answer', text: i.a },
  })),
});

/** Služby s popisom a cenou z databázy (featured_services) + celý katalóg výkonov. */
export const servicesNode = (featured: FeaturedService[]): Json => ({
  '@type': 'OfferCatalog',
  '@id': `${SITE_URL}/sluzby#services`,
  name: 'Stomatologické služby DK KRÁL v Hradci Králové',
  itemListElement: [
    ...featured.map((s) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: s.title_cs,
        description: s.description_cs,
        serviceType: s.title_cs,
        provider: { '@id': DENTIST_ID },
        areaServed: { '@type': 'City', name: 'Hradec Králové' },
      },
      ...(s.price_string ? { description: `Cena: ${formatPrice(s.price_string)}` } : {}),
    })),
    ...SERVICE_CATALOG.filter((c) => !featured.some((f) => c.name.toLowerCase().includes(f.title_cs.toLowerCase()))).map((c) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: c.name,
        serviceType: c.category,
        provider: { '@id': DENTIST_ID },
        areaServed: { '@type': 'City', name: 'Hradec Králové' },
      },
    })),
  ],
});

export const priceListNode = (priceList: PriceListItem[]): Json => ({
  '@type': 'OfferCatalog',
  '@id': `${SITE_URL}/cenik#cenik`,
  name: 'Ceník zubní ordinace DK KRÁL – Hradec Králové',
  url: `${SITE_URL}/cenik`,
  itemListElement: groupPriceList(priceList).map((group) => ({
    '@type': 'OfferCatalog',
    name: group.category,
    itemListElement: group.items.map((item) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: item.name, provider: { '@id': DENTIST_ID } },
      description: `Cena: ${formatPrice(item.price)}`,
    })),
  })),
});

export const graph = (...nodes: (Json | null)[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
});
