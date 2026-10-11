// Drop-in replacement for <iframe> that embeds third-party content (Google Maps, YouTube, Mapy.cz …).
// First render is ALWAYS the placeholder (identical on server, in prerendered HTML and on the client), consent is read
// only after mount, so there are no hydration mismatches. Texts come from the site language (lang prop, <html lang>, or kit).
import React, { useEffect, useState } from 'react';

type Lang = 'sk' | 'cs' | 'pl' | 'en';
type Props = React.IframeHTMLAttributes<HTMLIFrameElement> & { category?: string; lang?: Lang };

const TEXTS: Record<Lang, { text: string; button: string; settings: string }> = {
  sk: { text: 'Tento obsah ({provider}) sa načíta až po vašom súhlase s funkčnými cookies tretích strán.', button: 'Povoliť a zobraziť', settings: 'Nastavenia cookies' },
  cs: { text: 'Tento obsah ({provider}) se načte až po vašem souhlasu s funkčními cookies třetích stran.', button: 'Povolit a zobrazit', settings: 'Nastavení cookies' },
  pl: { text: 'Ta treść ({provider}) załaduje się po wyrażeniu zgody na funkcjonalne pliki cookie.', button: 'Zezwól i pokaż', settings: 'Ustawienia cookie' },
  en: { text: 'This content ({provider}) loads only after you allow functional third-party cookies.', button: 'Allow and show', settings: 'Cookie settings' },
};

const providerOf = (src = '') =>
  /youtube|youtu\.be/.test(src) ? 'YouTube' : /google\.com\/maps|maps\.google/.test(src) ? 'Google Maps' : /mapy\.cz/.test(src) ? 'Mapy.cz' : /facebook|instagram/.test(src) ? 'Meta' : /vimeo/.test(src) ? 'Vimeo' : (src.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'third party');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = (): any => (typeof window !== 'undefined' ? (window as any).GMCookieConsent : undefined);

export function ConsentIframe({ category = 'functional', lang, src, className, style, title, ...rest }: Props) {
  const [allowed, setAllowed] = useState(false); // never read consent during render
  const [language, setLanguage] = useState<Lang>(lang || 'sk');

  useEffect(() => {
    const htmlLang = (document.documentElement.lang || '').slice(0, 2).toLowerCase().replace('cz', 'cs') as Lang;
    setLanguage(lang || (api() && api().lang) || (TEXTS[htmlLang] ? htmlLang : 'sk'));
    const sync = () => setAllowed(!!(api() && api().allowed(category)));
    sync();
    window.addEventListener('gm-cc:change', sync);
    return () => window.removeEventListener('gm-cc:change', sync);
  }, [category, lang]);

  if (allowed) return <iframe src={src} className={className} style={style} title={title} {...rest} />;
  const t = TEXTS[language] || TEXTS.sk;
  return (
    <div className={'gm-cc-placeholder ' + (className || '')} style={style} role="group" aria-label={title || providerOf(src)}>
      <p>{t.text.replace('{provider}', providerOf(src))}</p>
      <div className="gm-cc-placeholder-actions">
        <button type="button" className="gm-cc-btn gm-cc-btn--primary" onClick={() => api() && api().accept([category])}>{t.button}</button>
        <button type="button" className="gm-cc-btn gm-cc-btn--link" onClick={() => api() && api().showSettings()}>{t.settings}</button>
      </div>
    </div>
  );
}
export default ConsentIframe;
