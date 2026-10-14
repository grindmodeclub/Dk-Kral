// Vstup pre prerender pri builde (vite build --ssr). Spúšťa ho scripts/prerender.mjs.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';
import App from './App';
import { SiteData, SiteDataProvider } from './lib/siteData';

export function render(url: string, data: SiteData) {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <SiteDataProvider value={data}>
          <App initialPath={url} />
        </SiteDataProvider>
      </HelmetProvider>
    </StrictMode>
  );
  return { html, helmet: helmetContext.helmet! };
}

export { fetchSiteData, formatPrice, groupPriceList } from './lib/siteData';
export { BUSINESS, ADDRESS_LINE, ROUTES, SITE_URL, pageUrl, openingHoursSentence } from './lib/business';
export { buildFaq } from './content/faq';
