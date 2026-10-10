// React hook around window.GMCookieConsent (gm-cookie-consent.js must be loaded in index.html <head>).
import { useCallback, useEffect, useState } from 'react';

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing' | 'functional';
export interface ConsentRecord { v: number; id: string; ts: number; all: boolean; c: Record<ConsentCategory, boolean> }
interface GMCookieConsentApi {
  get(): ConsentRecord | null; allowed(cat: string): boolean; show(): void; showSettings(): void; hideSettings(): void;
  acceptAll(): void; rejectAll(): void; accept(cats: string[]): void; withdraw(cats?: string[]): void; reset(): void; apply(): void;
  on(fn: (c: ConsentRecord) => void): () => void; texts: Record<string, any>; lang: string;
}
declare global { interface Window { GMCookieConsent?: GMCookieConsentApi; GMCookieConsentConfig?: Record<string, unknown> } }

const api = () => (typeof window !== 'undefined' ? window.GMCookieConsent : undefined);

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentRecord | null>(() => (api() ? api()!.get() : null));
  useEffect(() => {
    const onChange = (e: Event) => { const d = (e as CustomEvent<ConsentRecord>).detail; setConsent(d ? { ...d } : api() ? api()!.get() : null); };
    window.addEventListener('gm-cc:change', onChange);
    if (api()) setConsent(api()!.get());
    return () => window.removeEventListener('gm-cc:change', onChange);
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allowed = useCallback((cat: string) => (api() ? api()!.allowed(cat) : cat === 'necessary'), [consent]);
  const showSettings = useCallback(() => api()?.showSettings(), []);
  const accept = useCallback((cats: string[]) => api()?.accept(cats), []);
  const acceptAll = useCallback(() => api()?.acceptAll(), []);
  const rejectAll = useCallback(() => api()?.rejectAll(), []);
  return { consent, allowed, showSettings, accept, acceptAll, rejectAll, ready: !!api() };
}
export default useCookieConsent;
