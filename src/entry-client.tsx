import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { SiteDataProvider } from './lib/siteData';
import './index.css';

const container = document.getElementById('root')!;

const app = (
  <StrictMode>
    <HelmetProvider>
      <SiteDataProvider value={window.__DK_DATA__ ?? null}>
        <App />
      </SiteDataProvider>
    </HelmetProvider>
  </StrictMode>
);

// Prerenderované stránky sa len hydratujú, administrácia (prázdny #root) sa renderuje normálne
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
