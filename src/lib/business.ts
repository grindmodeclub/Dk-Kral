// Jediný zdroj NAP údajov (názov, adresa, telefón). Používa ich pätička, Kontakt, JSON-LD aj llms.txt,
// aby boli všade úplne rovnaké.
import type { Language } from '../App';

export const SITE_URL = 'https://dkkral.cz';

export const BUSINESS = {
  name: 'DK KRÁL – Dentální hygiena a Implantologie',
  shortName: 'DK KRÁL',
  legalName: 'DK KRÁL, s.r.o.',
  phone: '+420770600076',
  phoneDisplay: '+420 770 600 076',
  email: 'recepce@dkkral.cz',
  street: 'Resslova 745/5',
  postalCode: '500 02',
  city: 'Hradec Králové',
  region: 'Královéhradecký kraj',
  country: 'CZ',
  ico: '143 45 111',
  geo: { latitude: 50.216445, longitude: 15.8247235 },
  mapsUrl: 'https://maps.google.com/?cid=15951681850103427233',
  // Profily tej istej firmy (rovnaké IČO), aby ich vyhľadávače spojili do jednej entity
  profiles: [
    'https://maps.google.com/?cid=15951681850103427233',
    'https://www.firmy.cz/detail/13562163-dk-kral-hradec-kralove.html',
    'https://mapy.com/cs/?source=firm&id=13562163',
  ],
  logo: `${SITE_URL}/img/logo-dk-kral.png`,
  image: `${SITE_URL}/img/og-dk-kral-zubar-hradec-kralove.jpg`,
} as const;

export const ADDRESS_LINE = `${BUSINESS.street}, ${BUSINESS.postalCode} ${BUSINESS.city}`;

type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAY_NAMES: Record<Day, Record<Language, string>> = {
  Monday: { cs: 'Pondělí', en: 'Monday' },
  Tuesday: { cs: 'Úterý', en: 'Tuesday' },
  Wednesday: { cs: 'Středa', en: 'Wednesday' },
  Thursday: { cs: 'Čtvrtek', en: 'Thursday' },
  Friday: { cs: 'Pátek', en: 'Friday' },
  Saturday: { cs: 'Sobota', en: 'Saturday' },
  Sunday: { cs: 'Neděle', en: 'Sunday' },
};

// Ordinačné hodiny (zhodné s doterajším webom)
export const OPENING_HOURS: { days: Day[]; opens: string; closes: string }[] = [
  { days: ['Monday', 'Tuesday', 'Wednesday'], opens: '07:30', closes: '15:30' },
  { days: ['Thursday'], opens: '07:30', closes: '14:00' },
  { days: ['Friday'], opens: '07:30', closes: '11:30' },
];

const short = (time: string) => time.replace(/^0/, '');

/** Riadky pre tabuľku hodín: Po, Út, St, Čt, Pá, víkend. */
export const openingHoursRows = (language: Language) => {
  const rows = (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as Day[]).map((day) => {
    const slot = OPENING_HOURS.find((s) => s.days.includes(day));
    return {
      day: DAY_NAMES[day][language],
      hours: slot ? `${short(slot.opens)}–${short(slot.closes)}` : null,
    };
  });
  rows.push({ day: language === 'cs' ? 'Sobota, Neděle' : 'Saturday, Sunday', hours: null });
  return rows;
};

/** Hodiny jednou vetou, napr. „Po–St 7:30–15:30, Čt 7:30–14:00, Pá 7:30–11:30“. */
export const openingHoursSentence = (language: Language) =>
  language === 'cs'
    ? 'Po–St 7:30–15:30, Čt 7:30–14:00, Pá 7:30–11:30, víkend zavřeno'
    : 'Mon–Wed 7:30–15:30, Thu 7:30–14:00, Fri 7:30–11:30, closed at weekends';

export type PageId = 'home' | 'services' | 'pricing' | 'process' | 'contact';

export const ROUTES: { id: PageId; path: string; name: Record<Language, string> }[] = [
  { id: 'home', path: '/', name: { cs: 'Domů', en: 'Home' } },
  { id: 'services', path: '/sluzby', name: { cs: 'Služby', en: 'Services' } },
  { id: 'pricing', path: '/cenik', name: { cs: 'Ceník', en: 'Pricing' } },
  { id: 'process', path: '/prubeh', name: { cs: 'Průběh léčby', en: 'Treatment Process' } },
  { id: 'contact', path: '/kontakt', name: { cs: 'Kontakt', en: 'Contact' } },
];

export const pageUrl = (path: string) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`);
