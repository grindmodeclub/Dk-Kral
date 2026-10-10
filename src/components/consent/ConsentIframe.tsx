// Drop-in replacement for <iframe> embedding third-party content (Google Maps, YouTube, Mapy.cz …).
// Shows a placeholder until the visitor allows the cookie category, then renders the real iframe with identical props.
import React from 'react';
import { useCookieConsent } from './useCookieConsent';

type Props = React.IframeHTMLAttributes<HTMLIFrameElement> & { category?: string };

const providerOf = (src = '') =>
  /youtube|youtu\.be/.test(src) ? 'YouTube' : /google\.com\/maps|maps\.google/.test(src) ? 'Google Maps' : /mapy\.cz/.test(src) ? 'Mapy.cz' : /facebook|instagram/.test(src) ? 'Meta' : /vimeo/.test(src) ? 'Vimeo' : (src.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'third party');

export function ConsentIframe({ category = 'functional', src, className, style, title, ...rest }: Props) {
  const { allowed, accept, showSettings, ready } = useCookieConsent();
  const t: Record<string, string> = (ready && (window.GMCookieConsent as any).texts) || {};
  if (allowed(category)) return <iframe src={src} className={className} style={style} title={title} {...rest} />;
  const text = (t.embedText || 'This content ({provider}) loads only after you allow functional third-party cookies.').replace('{provider}', providerOf(src));
  return (
    <div className={'gm-cc-placeholder ' + (className || '')} style={style} role="group" aria-label={title || providerOf(src)}>
      <p>{text}</p>
      <div className="gm-cc-placeholder-actions">
        <button type="button" className="gm-cc-btn gm-cc-btn--primary" onClick={() => accept([category])}>{t.embedButton || 'Allow and show'}</button>
        <button type="button" className="gm-cc-btn gm-cc-btn--link" onClick={showSettings}>{t.embedSettings || 'Cookie settings'}</button>
      </div>
    </div>
  );
}
export default ConsentIframe;
