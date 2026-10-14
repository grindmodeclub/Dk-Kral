import { MouseEvent } from 'react';
import { BUSINESS, ROUTES } from '../lib/business';
import { Language } from '../App';

interface SiteFooterProps {
  language: Language;
  onNavigate?: (pageId: string) => void;
}

// Pätička s NAP údajmi na každej stránke. Odkazy sú skutočné <a href>, aby ich crawlery videli;
// v prehliadači idú cez rovnakú navigáciu (swipe animácia) ako menu.
const SiteFooter = ({ language, onNavigate }: SiteFooterProps) => {
  const handleClick = (pageId: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(pageId);
  };

  return (
    <footer className="bg-dark px-6 lg:px-12 py-12 relative">
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <address className="not-italic text-white/80 mb-4 leading-relaxed">
          <strong className="text-white">{BUSINESS.name}</strong><br />
          {language === 'cs' ? 'Zubař Hradec Králové' : 'Dentist in Hradec Králové'}<br />
          {BUSINESS.street}, {BUSINESS.postalCode} {BUSINESS.city}<br />
          <a href={`tel:${BUSINESS.phone}`} className="text-gold hover:text-gold/80 transition-colors">{BUSINESS.phoneDisplay}</a>
          {' | '}
          <a href={`mailto:${BUSINESS.email}`} className="text-gold hover:text-gold/80 transition-colors">{BUSINESS.email}</a>
        </address>
        <a
          href={BUSINESS.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-gold hover:text-gold/80 transition-colors underline"
        >
          {language === 'cs' ? 'Zobrazit na Google Maps' : 'View on Google Maps'}
        </a>
        <nav aria-label={language === 'cs' ? 'Stránky webu' : 'Site pages'} className="mt-6">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {ROUTES.map((route) => (
              <li key={route.id}>
                <a href={route.path} onClick={handleClick(route.id)} className="text-white/70 hover:text-gold transition-colors">
                  {route.name[language]}
                </a>
              </li>
            ))}
            <li>
              <a href="/cookies.html" className="text-white/70 hover:text-gold transition-colors">
                {language === 'cs' ? 'Cookies' : 'Cookies'}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default SiteFooter;
