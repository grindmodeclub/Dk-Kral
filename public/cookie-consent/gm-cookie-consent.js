/*!
 * gm-cookie-consent v1.0.0
 * Cookie consent banner for SK / CZ websites, built to satisfy:
 *  - SK: § 109 ods. 8 zákona č. 452/2021 Z. z. + Stanovisko RÚ/ÚOOÚ SR (accept all / reject all in first layer,
 *        per-category choice, no pre-ticked boxes, no cookie wall, close = necessary only, easy withdrawal)
 *  - CZ: § 89 odst. 3 zákona č. 127/2005 Sb. + ÚOOÚ ČR Q&A (reject on first layer with equal prominence,
 *        12 months validity, do not re-ask within 6 months after refusal, proof of consent, Czech language)
 *  - EDPB Guidelines 05/2020 on consent, Google Consent Mode v2 (ad_storage, analytics_storage, ad_user_data, ad_personalization)
 * No dependencies. Works with plain HTML, Vite/React, Next.js (load in <head> before any tag manager).
 *
 * Usage (in <head>, BEFORE gtag / GTM / pixels):
 *   <link rel="stylesheet" href="/cookie-consent/gm-cookie-consent.css">
 *   <script>window.GMCookieConsentConfig = { lang: 'sk', policyUrl: '/cookies', categories: ['analytics','marketing','functional'] };</script>
 *   <script src="/cookie-consent/gm-cookie-consent.js"></script>
 *   <script type="text/plain" data-cc="analytics" async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
 *   <script type="text/plain" data-cc="analytics">gtag('js', new Date()); gtag('config', 'G-XXXX');</script>
 *   <iframe data-cc-src="https://www.google.com/maps/embed?..." data-cc="functional" ...></iframe>
 *   <a href="#" data-cc="show-settings">Nastavenia cookies</a>
 *
 * API: window.GMCookieConsent.{ show, showSettings, hide, acceptAll, rejectAll, accept(categories[]), get, allowed(cat), on(fn), off(fn), apply, reset, texts }
 * Event: window 'gm-cc:change' (detail = consent record)
 */
(function (w, d) {
  'use strict';
  if (w.GMCookieConsent) return;

  var CATS_ALL = ['necessary', 'analytics', 'marketing', 'functional'];
  var DEFAULTS = {
    lang: 'auto',
    cookieName: 'gm_cc',
    expiryDays: 365,          // consent validity (ÚOOÚ ČR: 12 months is a reasonable default)
    rejectExpiryDays: 180,    // after "reject all" do not ask again for 6 months (ÚOOÚ ČR)
    version: 1,               // bump when categories / purposes change -> everybody is asked again
    policyUrl: '/cookies',
    privacyUrl: null,
    siteName: null,
    categories: ['analytics', 'marketing', 'functional'],
    cookieTables: null,       // override per-category cookie lists: { analytics: [{name, provider, purpose, expiry}] }
    google: { consentMode: true, adsDataRedaction: true, urlPassthrough: false },
    legacy: null,             // { localStorageKey: 'cookieConsent', eventName: 'cookie-consent-updated', map: {...} } mirrors choice for older site code
    logEndpoint: null,        // POST JSON consent records here for proof of consent (optional)
    clearCookiesOnReject: true,
    reloadOnWithdraw: true,   // reload page when a previously granted category is withdrawn (stops running scripts)
    showOnLoad: true,
    floatingButton: true,
    autoBlock: true,          // intercept scripts/iframes/pixels inserted via DOM APIs (React, GTM snippets) before consent     // small fixed button (bottom-left) that reopens settings once a choice was made = withdrawal as easy as consent
    zIndex: 2147483000,
    texts: null,
    debug: false
  };

  var DEFAULT_TABLES = {
    sk: {
      necessary: [{ name: 'gm_cc', provider: 'táto stránka', purpose: 'Uloženie vašej voľby cookies', expiry: '12 mesiacov' }],
      analytics: [
        { name: '_ga', provider: 'Google Analytics', purpose: 'Rozlíšenie návštevníkov (anonymné ID)', expiry: '2 roky' },
        { name: '_ga_*', provider: 'Google Analytics', purpose: 'Udržanie stavu relácie', expiry: '2 roky' }
      ],
      marketing: [
        { name: '_gcl_au', provider: 'Google Ads', purpose: 'Meranie účinnosti reklamy (konverzie)', expiry: '90 dní' },
        { name: 'IDE', provider: 'Google (DoubleClick)', purpose: 'Personalizovaná reklama a remarketing', expiry: '1 rok' },
        { name: '_fbp', provider: 'Meta (Facebook)', purpose: 'Meranie a cielenie reklamy', expiry: '90 dní' }
      ],
      functional: [
        { name: 'NID, CONSENT', provider: 'Google Maps', purpose: 'Zobrazenie mapy a jej nastavení', expiry: '6 mesiacov' },
        { name: 'YSC, VISITOR_INFO1_LIVE', provider: 'YouTube', purpose: 'Prehrávanie vložených videí', expiry: 'relácia / 6 mesiacov' }
      ]
    },
    cs: {
      necessary: [{ name: 'gm_cc', provider: 'tento web', purpose: 'Uložení vaší volby cookies', expiry: '12 měsíců' }],
      analytics: [
        { name: '_ga', provider: 'Google Analytics', purpose: 'Rozlišení návštěvníků (anonymní ID)', expiry: '2 roky' },
        { name: '_ga_*', provider: 'Google Analytics', purpose: 'Udržení stavu relace', expiry: '2 roky' }
      ],
      marketing: [
        { name: '_gcl_au', provider: 'Google Ads', purpose: 'Měření účinnosti reklamy (konverze)', expiry: '90 dní' },
        { name: 'IDE', provider: 'Google (DoubleClick)', purpose: 'Personalizovaná reklama a remarketing', expiry: '1 rok' },
        { name: '_fbp', provider: 'Meta (Facebook)', purpose: 'Měření a cílení reklamy', expiry: '90 dní' },
        { name: 'sid, retargeting', provider: 'Seznam Sklik', purpose: 'Měření a cílení reklamy', expiry: '30 dní' }
      ],
      functional: [
        { name: 'NID, CONSENT', provider: 'Google Maps', purpose: 'Zobrazení mapy a jejího nastavení', expiry: '6 měsíců' },
        { name: 'YSC, VISITOR_INFO1_LIVE', provider: 'YouTube', purpose: 'Přehrávání vložených videí', expiry: 'relace / 6 měsíců' }
      ]
    }
  };
  DEFAULT_TABLES.en = DEFAULT_TABLES.sk; DEFAULT_TABLES.pl = DEFAULT_TABLES.sk;

  var TEXTS = {
    sk: {
      title: 'Používame cookies',
      desc: 'Nevyhnutné cookies zabezpečujú základné fungovanie stránky a nevyžadujú súhlas. S vaším súhlasom použijeme aj {cats}. Svoju voľbu môžete kedykoľvek zmeniť alebo odvolať cez odkaz „Nastavenia cookies“ v pätičke stránky. Viac informácií nájdete v {policy}.',
      policyLink: 'Zásadách používania cookies',
      acceptAll: 'Prijať všetko',
      rejectAll: 'Odmietnuť všetko',
      settings: 'Nastavenia',
      save: 'Uložiť vybrané',
      close: 'Zavrieť',
      settingsTitle: 'Nastavenia cookies',
      settingsDesc: 'Vyberte kategórie cookies, ktoré povolíte. Voliteľné kategórie sú predvolene vypnuté. Kliknutím na „Uložiť vybrané“ udelíte súhlas iba pre zapnuté kategórie.',
      alwaysOn: 'Vždy zapnuté',
      showCookies: 'Zobraziť cookies',
      th: ['Názov', 'Poskytovateľ', 'Účel', 'Platnosť'],
      cats: {
        necessary: { name: 'Nevyhnutné cookies', desc: 'Potrebné na základné fungovanie stránky (uloženie vašej voľby cookies, bezpečnosť, odoslanie formulárov). Nedajú sa vypnúť, podľa § 109 ods. 8 zákona č. 452/2021 Z. z. na ne nie je potrebný súhlas.' },
        analytics: { name: 'Analytické cookies', desc: 'Pomáhajú nám pochopiť, ako návštevníci používajú stránku (napr. Google Analytics). Údaje slúžia na štatistiku a zlepšovanie webu.' },
        marketing: { name: 'Marketingové cookies', desc: 'Slúžia na meranie účinnosti reklamy a zobrazovanie relevantnej reklamy (napr. Google Ads, Meta). Môžu byť zdieľané s reklamnými partnermi.' },
        functional: { name: 'Funkčné cookies a obsah tretích strán', desc: 'Umožňujú načítať obsah tretích strán, napr. Google Mapy alebo YouTube videá, ktoré môžu do vášho zariadenia ukladať vlastné cookies.' }
      },
      catShort: { analytics: 'analytické', marketing: 'marketingové', functional: 'funkčné' },
      embedText: 'Tento obsah ({provider}) sa načíta až po vašom súhlase s funkčnými cookies tretích strán.',
      embedButton: 'Povoliť a zobraziť',
      embedSettings: 'Nastavenia cookies',
      footerLink: 'Nastavenia cookies',
      and: 'a',
      cookiesWord: 'cookies'
    },
    cs: {
      title: 'Používáme cookies',
      desc: 'Nezbytné cookies zajišťují základní fungování webu a nevyžadují souhlas. S vaším souhlasem použijeme také {cats}. Svou volbu můžete kdykoli změnit nebo odvolat přes odkaz „Nastavení cookies“ v zápatí stránky. Více informací najdete v {policy}.',
      policyLink: 'Zásadách používání cookies',
      acceptAll: 'Přijmout vše',
      rejectAll: 'Odmítnout vše',
      settings: 'Nastavení',
      save: 'Uložit vybrané',
      close: 'Zavřít',
      settingsTitle: 'Nastavení cookies',
      settingsDesc: 'Vyberte kategorie cookies, které povolíte. Volitelné kategorie jsou ve výchozím stavu vypnuté. Kliknutím na „Uložit vybrané“ udělíte souhlas pouze pro zapnuté kategorie.',
      alwaysOn: 'Vždy zapnuto',
      showCookies: 'Zobrazit cookies',
      th: ['Název', 'Poskytovatel', 'Účel', 'Platnost'],
      cats: {
        necessary: { name: 'Nezbytné cookies', desc: 'Potřebné pro základní fungování webu (uložení vaší volby cookies, bezpečnost, odeslání formulářů). Nelze je vypnout, podle § 89 odst. 3 zákona č. 127/2005 Sb. k nim není potřeba souhlas.' },
        analytics: { name: 'Analytické cookies', desc: 'Pomáhají nám pochopit, jak návštěvníci používají web (např. Google Analytics). Údaje slouží ke statistice a zlepšování webu.' },
        marketing: { name: 'Marketingové cookies', desc: 'Slouží k měření účinnosti reklamy a zobrazování relevantní reklamy (např. Google Ads, Meta, Sklik). Mohou být sdíleny s reklamními partnery.' },
        functional: { name: 'Funkční cookies a obsah třetích stran', desc: 'Umožňují načíst obsah třetích stran, např. Google Mapy nebo YouTube videa, která mohou do vašeho zařízení ukládat vlastní cookies.' }
      },
      catShort: { analytics: 'analytické', marketing: 'marketingové', functional: 'funkční' },
      embedText: 'Tento obsah ({provider}) se načte až po vašem souhlasu s funkčními cookies třetích stran.',
      embedButton: 'Povolit a zobrazit',
      embedSettings: 'Nastavení cookies',
      footerLink: 'Nastavení cookies',
      and: 'a',
      cookiesWord: 'cookies'
    },
    en: {
      title: 'We use cookies',
      desc: 'Necessary cookies keep the site working and need no consent. With your consent we also use {cats}. You can change or withdraw your choice any time via the “Cookie settings” link in the footer. Details in our {policy}.',
      policyLink: 'Cookie Policy', acceptAll: 'Accept all', rejectAll: 'Reject all', settings: 'Settings', save: 'Save selection', close: 'Close',
      settingsTitle: 'Cookie settings', settingsDesc: 'Choose which cookie categories you allow. Optional categories are off by default.',
      alwaysOn: 'Always on', showCookies: 'Show cookies', th: ['Name', 'Provider', 'Purpose', 'Expiry'],
      cats: {
        necessary: { name: 'Necessary cookies', desc: 'Required for the basic operation of the site (storing your cookie choice, security, forms). Cannot be switched off.' },
        analytics: { name: 'Analytics cookies', desc: 'Help us understand how visitors use the site (e.g. Google Analytics).' },
        marketing: { name: 'Marketing cookies', desc: 'Used to measure advertising and show relevant ads (e.g. Google Ads, Meta).' },
        functional: { name: 'Functional cookies and third-party content', desc: 'Allow third-party content such as Google Maps or YouTube videos, which may set their own cookies.' }
      },
      catShort: { analytics: 'analytics', marketing: 'marketing', functional: 'functional' },
      embedText: 'This content ({provider}) loads only after you allow functional third-party cookies.', embedButton: 'Allow and show', embedSettings: 'Cookie settings', footerLink: 'Cookie settings', and: 'and', cookiesWord: 'cookies'
    },
    pl: {
      title: 'Używamy plików cookie',
      desc: 'Niezbędne pliki cookie zapewniają działanie strony i nie wymagają zgody. Za Twoją zgodą użyjemy także {cats}. Wybór możesz zmienić lub wycofać w każdej chwili przez link „Ustawienia cookie” w stopce. Szczegóły w {policy}.',
      policyLink: 'Polityce cookies', acceptAll: 'Zaakceptuj wszystkie', rejectAll: 'Odrzuć wszystkie', settings: 'Ustawienia', save: 'Zapisz wybrane', close: 'Zamknij',
      settingsTitle: 'Ustawienia cookie', settingsDesc: 'Wybierz kategorie, na które wyrażasz zgodę. Opcjonalne kategorie są domyślnie wyłączone.',
      alwaysOn: 'Zawsze włączone', showCookies: 'Pokaż pliki cookie', th: ['Nazwa', 'Dostawca', 'Cel', 'Ważność'],
      cats: {
        necessary: { name: 'Niezbędne', desc: 'Wymagane do działania strony (zapisanie wyboru, bezpieczeństwo, formularze). Nie można ich wyłączyć.' },
        analytics: { name: 'Analityczne', desc: 'Pomagają zrozumieć, jak odwiedzający korzystają ze strony (np. Google Analytics).' },
        marketing: { name: 'Marketingowe', desc: 'Służą do mierzenia reklam i wyświetlania trafnych reklam (np. Google Ads, Meta).' },
        functional: { name: 'Funkcjonalne / treści zewnętrzne', desc: 'Umożliwiają ładowanie treści zewnętrznych, np. Google Maps lub YouTube.' }
      },
      catShort: { analytics: 'analityczne', marketing: 'marketingowe', functional: 'funkcjonalne' },
      embedText: 'Ta treść ({provider}) załaduje się po wyrażeniu zgody na funkcjonalne pliki cookie.', embedButton: 'Zezwól i pokaż', embedSettings: 'Ustawienia cookie', footerLink: 'Ustawienia cookie', and: 'i', cookiesWord: 'pliki cookie'
    }
  };

  // cookies to purge when a category is withdrawn / rejected
  // URL patterns of third-party resources that must not load before consent (auto-blocker)
  var BLOCK = [
    { re: /googletagmanager\.com\/(gtag\/js|gtm\.js)/, cat: 'analytics,marketing' },
    { re: /google-analytics\.com|analytics\.google\.com|static\.hotjar\.com|hotjar\.io|clarity\.ms|smartlook\.com/, cat: 'analytics' },
    { re: /connect\.facebook\.net|facebook\.com\/tr|googleadservices\.com|doubleclick\.net|googlesyndication\.com|analytics\.tiktok\.com|snap\.licdn\.com|c\.seznam\.cz\/js\/rc\.js|c\.imedia\.cz|im9\.cz\/js/, cat: 'marketing' },
    { re: /youtube\.com\/embed|youtube-nocookie\.com\/embed|google\.com\/maps\/embed|maps\.google\.com\/maps|frame\.mapy\.cz|player\.vimeo\.com|instagram\.com\/embed|facebook\.com\/plugins/, cat: 'functional' }
  ];
  var PURGE = {
    analytics: [/^_ga($|_)/, /^_gid$/, /^_gat/, /^_hj/, /^_clck$/, /^_clsk$/, /^CLID$/, /^MUID$/, /^_pk_/, /^sl_/, /^__utm/],
    marketing: [/^_gcl/, /^_fbp$/, /^_fbc$/, /^fr$/, /^IDE$/, /^test_cookie$/, /^_ttp$/, /^_tt_/, /^li_/, /^lidc$/, /^bcookie$/, /^sid$/, /^_hrq/, /^__gads$/, /^__gpi$/],
    functional: [/^NID$/, /^CONSENT$/, /^YSC$/, /^VISITOR_INFO1_LIVE$/, /^PREF$/, /^__Secure-/, /^SOCS$/]
  };

  /* ---------- helpers ---------- */
  function merge(a, b) { var o = {}; for (var k in a) o[k] = a[k]; for (var k2 in b) { if (b[k2] && typeof b[k2] === 'object' && !Array.isArray(b[k2]) && a[k2] && typeof a[k2] === 'object' && !Array.isArray(a[k2])) o[k2] = merge(a[k2], b[k2]); else if (b[k2] !== undefined) o[k2] = b[k2]; } return o; }
  function el(tag, attrs, children) { var e = d.createElement(tag); if (attrs) for (var k in attrs) { if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else if (k === 'on') { for (var ev in attrs[k]) e.addEventListener(ev, attrs[k][ev]); } else e.setAttribute(k, attrs[k]); } (children || []).forEach(function (c) { if (c) e.appendChild(c); }); return e; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uuid() { if (w.crypto && w.crypto.randomUUID) return w.crypto.randomUUID(); var b = new Uint8Array(16); (w.crypto || {}).getRandomValues ? w.crypto.getRandomValues(b) : b.forEach(function (_, i) { b[i] = Math.random() * 256 | 0; }); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128; var h = ''; for (var i = 0; i < 16; i++) h += (b[i] + 256).toString(16).slice(1); return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20); }
  function readCookie(n) { var m = d.cookie.match('(?:^|; )' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : null; }
  function writeCookie(n, v, days) { var e = new Date(Date.now() + days * 864e5).toUTCString(); d.cookie = n + '=' + encodeURIComponent(v) + '; expires=' + e + '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : ''); }
  function deleteCookie(n) { var host = location.hostname, parts = host.split('.'); var domains = ['', host]; for (var i = 1; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.')); domains.forEach(function (dom) { d.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (dom ? '; domain=' + dom : ''); d.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (dom ? '; domain=.' + dom : ''); }); }
  function lsGet(k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { w.localStorage.setItem(k, v); } catch (e) { } }

  /* ---------- state ---------- */
  var cfg = merge(DEFAULTS, w.GMCookieConsentConfig || {});
  var scriptTag = d.currentScript;
  if (scriptTag) { ['lang', 'policyUrl', 'privacyUrl', 'siteName', 'version', 'expiryDays', 'rejectExpiryDays', 'logEndpoint'].forEach(function (k) { var v = scriptTag.getAttribute('data-' + k.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); })); if (v !== null) cfg[k] = (/Days|version/.test(k) ? Number(v) : v); }); var c = scriptTag.getAttribute('data-categories'); if (c) cfg.categories = c.split(',').map(function (s) { return s.trim(); }).filter(Boolean); }
  var lang = cfg.lang === 'auto' ? ((d.documentElement.getAttribute('lang') || 'sk').slice(0, 2).toLowerCase()) : cfg.lang;
  if (lang === 'cz') lang = 'cs';
  if (!TEXTS[lang]) lang = TEXTS.sk ? 'sk' : 'en';
  var T = merge(TEXTS[lang], cfg.texts || {});
  var TABLES = merge(DEFAULT_TABLES[lang] || DEFAULT_TABLES.sk, cfg.cookieTables || {});
  var optional = cfg.categories.filter(function (c) { return c !== 'necessary' && CATS_ALL.indexOf(c) >= 0; });
  var listeners = [];
  var consent = load();
  var ui = { banner: null, modal: null, lastFocus: null };

  function load() {
    var raw = readCookie(cfg.cookieName) || lsGet(cfg.cookieName);
    if (!raw) return null;
    try { var c = JSON.parse(raw); if (!c || c.v !== cfg.version || !c.c) return null; var age = (Date.now() - c.ts) / 864e5; var limit = c.all === false && !hasAnyOptional(c.c) ? cfg.rejectExpiryDays : cfg.expiryDays; if (age > limit) return null; return c; } catch (e) { return null; }
  }
  function hasAnyOptional(c) { return optional.some(function (k) { return !!c[k]; }); }
  function allowed(cat) { if (cat === 'necessary') return true; if (!consent) return false; return String(cat).split(',').some(function (k) { return !!consent.c[k.trim()]; }); }

  /* ---------- Google Consent Mode v2 (runs immediately, before GTM/gtag load) ---------- */
  function gtagConsent(mode, c) {
    if (!cfg.google || !cfg.google.consentMode) return;
    w.dataLayer = w.dataLayer || [];
    if (typeof w.gtag !== 'function') { w.gtag = function () { w.dataLayer.push(arguments); }; }
    var st = function (b) { return b ? 'granted' : 'denied'; };
    var params = { ad_storage: st(c.marketing), ad_user_data: st(c.marketing), ad_personalization: st(c.marketing), analytics_storage: st(c.analytics), functionality_storage: st(c.functional), personalization_storage: st(c.functional), security_storage: 'granted' };
    if (mode === 'default') { params.wait_for_update = 500; if (cfg.google.adsDataRedaction) w.gtag('set', 'ads_data_redaction', true); if (cfg.google.urlPassthrough) w.gtag('set', 'url_passthrough', true); }
    w.gtag('consent', mode, params);
    if (mode === 'update') w.dataLayer.push({ event: 'gm_cc_update', gm_cc: { analytics: !!c.analytics, marketing: !!c.marketing, functional: !!c.functional } });
  }
  gtagConsent('default', { analytics: false, marketing: false, functional: false });
  if (consent) gtagConsent('update', consent.c);


  /* ---------- auto-blocker: third-party scripts / iframes / pixels inserted by JS wait for consent ---------- */
  function blockCatFor(url) { url = String(url || ''); for (var i = 0; i < BLOCK.length; i++) if (BLOCK[i].re.test(url)) return BLOCK[i].cat; return null; }
  function neutralize(node, cat, src) {
    rawSetAttr.call(node, 'data-cc', cat); rawSetAttr.call(node, 'data-cc-src', src); rawSetAttr.call(node, 'data-cc-autoblocked', '1');
    if (node.tagName === 'SCRIPT') { rawSetAttr.call(node, 'type', 'text/plain'); node.removeAttribute('src'); }
    else if (node.tagName === 'IFRAME') { rawSetAttr.call(node, 'src', 'about:blank'); node.classList.add('gm-cc-blocked'); }
    else node.removeAttribute('src');
  }
  function maybeBlock(node) {
    if (!node || node.nodeType !== 1 || !/^(SCRIPT|IFRAME|IMG)$/.test(node.tagName)) return;
    if (node.getAttribute('data-cc-loaded') || node.getAttribute('data-cc-autoblocked') || (node.tagName === 'SCRIPT' && node.getAttribute('type') === 'text/plain')) return;
    var src = node.getAttribute('src'); var cat = src && blockCatFor(src);
    if (cat && !allowed(cat)) neutralize(node, cat, src);
  }
  var rawSetAttr = Element.prototype.setAttribute;
  if (cfg.autoBlock) {
    try {
      ['appendChild', 'insertBefore', 'replaceChild'].forEach(function (m) { var orig = Node.prototype[m]; Node.prototype[m] = function (node) { maybeBlock(node); return orig.apply(this, arguments); }; });
      ['append', 'prepend', 'before', 'after', 'replaceWith'].forEach(function (m) { var orig = Element.prototype[m]; if (!orig) return; Element.prototype[m] = function () { for (var i = 0; i < arguments.length; i++) maybeBlock(arguments[i]); return orig.apply(this, arguments); }; });
      Element.prototype.setAttribute = function (name, value) {
        if (String(name).toLowerCase() === 'src' && /^(SCRIPT|IFRAME|IMG)$/.test(this.tagName) && !this.getAttribute('data-cc-loaded')) { var cat = blockCatFor(value); if (cat && !allowed(cat)) { neutralize(this, cat, String(value)); return; } }
        return rawSetAttr.apply(this, arguments);
      };
      ['HTMLScriptElement', 'HTMLIFrameElement', 'HTMLImageElement'].forEach(function (name) {
        var proto = w[name] && w[name].prototype; var desc = proto && Object.getOwnPropertyDescriptor(proto, 'src'); if (!desc || !desc.set) return;
        Object.defineProperty(proto, 'src', { configurable: true, enumerable: desc.enumerable, get: function () { return this.getAttribute('data-cc-src') || desc.get.call(this); }, set: function (v) { var cat = blockCatFor(v); if (cat && !allowed(cat) && !this.getAttribute('data-cc-loaded')) { neutralize(this, cat, String(v)); return; } desc.set.call(this, v); } });
      });
    } catch (e) { if (cfg.debug) console.warn('[gm-cc] autoBlock unavailable', e); }
  }

  /* ---------- applying consent to the page ---------- */
  function activateScripts() {
    var nodes = d.querySelectorAll('script[type="text/plain"][data-cc]');
    Array.prototype.forEach.call(nodes, function (s) {
      if (s.getAttribute('data-cc-loaded') || !allowed(s.getAttribute('data-cc'))) return;
      s.setAttribute('data-cc-loaded', '1');
      var n = d.createElement('script');
      Array.prototype.forEach.call(s.attributes, function (a) { if (a.name !== 'type' && a.name !== 'data-cc' && a.name !== 'data-cc-loaded') n.setAttribute(a.name, a.value); });
      n.type = 'text/javascript';
      if (s.getAttribute('data-cc-src')) { n.removeAttribute('data-cc-src'); n.removeAttribute('data-cc-autoblocked'); n.setAttribute('src', s.getAttribute('data-cc-src')); }
      else if (!s.src) n.text = s.textContent;
      s.parentNode.insertBefore(n, s.nextSibling);
    });
    var embeds = d.querySelectorAll('[data-cc-src]');
    Array.prototype.forEach.call(embeds, function (e) {
      var cat = e.getAttribute('data-cc') || 'functional';
      if (allowed(cat)) { if (!e.getAttribute('src') || e.getAttribute('src') === 'about:blank') e.setAttribute('src', e.getAttribute('data-cc-src')); e.classList.remove('gm-cc-blocked'); var ph = e.previousElementSibling; if (ph && ph.classList && ph.classList.contains('gm-cc-placeholder')) ph.parentNode.removeChild(ph); }
      else if (e.tagName === 'IFRAME') { if (e.getAttribute('src') && e.getAttribute('src') !== 'about:blank') e.setAttribute('src', 'about:blank'); e.classList.add('gm-cc-blocked'); ensurePlaceholder(e, cat); }
    });
  }
  function ensurePlaceholder(e, cat) {
    var prev = e.previousElementSibling; if (prev && prev.classList && prev.classList.contains('gm-cc-placeholder')) return;
    var src = e.getAttribute('data-cc-src') || '', provider = /youtube|youtu\.be/.test(src) ? 'YouTube' : /google\.com\/maps|maps\.google/.test(src) ? 'Google Maps' : /mapy\.cz/.test(src) ? 'Mapy.cz' : /facebook|instagram/.test(src) ? 'Meta' : (src.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'third party');
    var ph = el('div', { 'class': 'gm-cc-placeholder', role: 'group' }, [
      el('p', { text: T.embedText.replace('{provider}', provider) }),
      el('div', { 'class': 'gm-cc-placeholder-actions' }, [
        el('button', { type: 'button', 'class': 'gm-cc-btn gm-cc-btn--primary', text: T.embedButton, on: { click: function () { api.accept([cat]); } } }),
        el('button', { type: 'button', 'class': 'gm-cc-btn gm-cc-btn--link', text: T.embedSettings, on: { click: function () { api.showSettings(); } } })
      ])
    ]);
    e.parentNode.insertBefore(ph, e);
  }
  function purge(prevC, newC) {
    if (!cfg.clearCookiesOnReject) return false;
    var withdrawn = false;
    optional.forEach(function (k) { if ((!prevC || prevC[k]) && !newC[k]) { withdrawn = withdrawn || !!(prevC && prevC[k]); var all = d.cookie.split(';'); all.forEach(function (ck) { var name = ck.split('=')[0].trim(); if (!name || name === cfg.cookieName) return; (PURGE[k] || []).forEach(function (re) { if (re.test(name)) deleteCookie(name); }); }); } });
    return withdrawn;
  }
  function mirrorLegacy(c) {
    if (!cfg.legacy) return;
    try {
      var map = cfg.legacy.map || {}; var out = {};
      CATS_ALL.forEach(function (k) { out[map[k] || k] = k === 'necessary' ? true : !!c[k]; });
      if (cfg.legacy.extra) for (var x in cfg.legacy.extra) out[x] = cfg.legacy.extra[x];
      var vals = cfg.legacy.values || (cfg.legacy.raw === 'accepted-string' ? ['accepted', 'rejected'] : cfg.legacy.raw === 'granted-string' ? ['granted', 'denied'] : null);
      if (cfg.legacy.localStorageKey) lsSet(cfg.legacy.localStorageKey, vals ? (hasAnyOptional(c) ? vals[0] : vals[1]) : JSON.stringify(out));
      if (cfg.legacy.eventName) w.dispatchEvent(new CustomEvent(cfg.legacy.eventName, { detail: out }));
    } catch (e) { }
  }
  function logConsent(rec, action) {
    try { var log = JSON.parse(lsGet('gm_cc_log') || '[]'); log.push({ ts: rec.ts, id: rec.id, v: rec.v, action: action, c: rec.c }); lsSet('gm_cc_log', JSON.stringify(log.slice(-20))); } catch (e) { }
    if (cfg.logEndpoint && w.fetch) { try { w.fetch(cfg.logEndpoint, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: rec.id, ts: rec.ts, version: rec.v, action: action, choices: rec.c, url: location.href, lang: lang, ua: navigator.userAgent }) }).catch(function () { }); } catch (e) { } }
  }
  function save(choices, action) {
    var prev = consent ? consent.c : null;
    var c = { necessary: true }; optional.forEach(function (k) { c[k] = !!choices[k]; });
    var all = optional.every(function (k) { return c[k]; });
    var rec = { v: cfg.version, id: (consent && consent.id) || uuid(), ts: Date.now(), c: c, all: all };
    consent = rec;
    var days = hasAnyOptional(c) ? cfg.expiryDays : cfg.rejectExpiryDays;
    writeCookie(cfg.cookieName, JSON.stringify(rec), days); lsSet(cfg.cookieName, JSON.stringify(rec));
    gtagConsent('update', c);
    var withdrawn = purge(prev, c);
    mirrorLegacy(c);
    logConsent(rec, action);
    activateScripts();
    hideAll();
    buildFab();
    var ev; try { ev = new CustomEvent('gm-cc:change', { detail: rec }); } catch (e) { ev = d.createEvent('CustomEvent'); ev.initCustomEvent('gm-cc:change', true, true, rec); }
    w.dispatchEvent(ev);
    listeners.forEach(function (fn) { try { fn(rec); } catch (e) { } });
    if (withdrawn && cfg.reloadOnWithdraw) setTimeout(function () { location.reload(); }, 150);
  }

  /* ---------- UI ---------- */
  function catsSentence() { var names = optional.map(function (k) { return (T.catShort && T.catShort[k]) || k; }); if (!names.length) return T.cookiesWord; if (names.length === 1) return names[0] + ' ' + T.cookiesWord; return names.slice(0, -1).join(', ') + ' ' + T.and + ' ' + names[names.length - 1] + ' ' + T.cookiesWord; }
  function descHtml() { var policy = '<a href="' + esc(cfg.policyUrl) + '" class="gm-cc-link">' + esc(T.policyLink) + '</a>'; return esc(T.desc).replace('{cats}', esc(catsSentence())).replace('{policy}', policy).replace(/&lt;a href=&quot;([^&]*)&quot; class=&quot;gm-cc-link&quot;&gt;(.*?)&lt;\/a&gt;/, function (_, h, t) { return '<a href="' + h + '" class="gm-cc-link">' + t + '</a>'; }); }
  function buildBanner() {
    if (ui.banner) return ui.banner;
    var b = el('div', { id: 'gm-cc', 'class': 'gm-cc gm-cc-banner', role: 'region', 'aria-label': T.title, lang: lang, style: 'z-index:' + cfg.zIndex });
    b.appendChild(el('div', { 'class': 'gm-cc-inner' }, [
      el('div', { 'class': 'gm-cc-text' }, [el('h2', { 'class': 'gm-cc-title', text: T.title }), el('p', { 'class': 'gm-cc-desc', html: descHtml() })]),
      el('div', { 'class': 'gm-cc-actions' }, [
        el('button', { type: 'button', 'class': 'gm-cc-btn gm-cc-btn--primary', 'data-cc-action': 'reject', text: T.rejectAll, on: { click: function () { api.rejectAll(); } } }),
        el('button', { type: 'button', 'class': 'gm-cc-btn gm-cc-btn--primary', 'data-cc-action': 'accept', text: T.acceptAll, on: { click: function () { api.acceptAll(); } } }),
        el('button', { type: 'button', 'class': 'gm-cc-btn gm-cc-btn--secondary', 'data-cc-action': 'settings', 'aria-haspopup': 'dialog', text: T.settings, on: { click: function () { api.showSettings(); } } })
      ])
    ]));
    ui.banner = b; return b;
  }
  function row(cat) {
    var isNec = cat === 'necessary', id = 'gm-cc-cat-' + cat, tid = id + '-table';
    var checked = isNec ? true : !!(consent && consent.c[cat]);
    var input = el('input', { type: 'checkbox', id: id, 'class': 'gm-cc-toggle-input', 'data-cat': cat });
    input.checked = checked; if (isNec) { input.disabled = true; input.setAttribute('aria-disabled', 'true'); }
    var table = TABLES[cat] && TABLES[cat].length ? el('table', { 'class': 'gm-cc-table', id: tid, hidden: '' }, [
      el('thead', null, [el('tr', null, T.th.map(function (h) { return el('th', { text: h }); }))]),
      el('tbody', null, TABLES[cat].map(function (r) { return el('tr', null, [el('td', { text: r.name }), el('td', { text: r.provider }), el('td', { text: r.purpose }), el('td', { text: r.expiry })]); }))
    ]) : null;
    var toggleBtn = table ? el('button', { type: 'button', 'class': 'gm-cc-btn gm-cc-btn--link gm-cc-showcookies', 'aria-expanded': 'false', 'aria-controls': tid, text: T.showCookies, on: { click: function () { var open = table.hasAttribute('hidden'); if (open) table.removeAttribute('hidden'); else table.setAttribute('hidden', ''); this.setAttribute('aria-expanded', open ? 'true' : 'false'); } } }) : null;
    return el('div', { 'class': 'gm-cc-cat' + (isNec ? ' gm-cc-cat--necessary' : '') }, [
      el('div', { 'class': 'gm-cc-cat-head' }, [
        el('label', { 'class': 'gm-cc-toggle', 'for': id }, [input, el('span', { 'class': 'gm-cc-toggle-ui', 'aria-hidden': 'true' }), el('span', { 'class': 'gm-cc-cat-name', text: T.cats[cat].name })]),
        isNec ? el('span', { 'class': 'gm-cc-always', text: T.alwaysOn }) : null
      ]),
      el('p', { 'class': 'gm-cc-cat-desc', text: T.cats[cat].desc }),
      toggleBtn, table
    ]);
  }
  function buildModal() {
    if (ui.modal) { ui.modal.parentNode && ui.modal.parentNode.removeChild(ui.modal); ui.modal = null; }
    var m = el('div', { id: 'gm-cc-modal', 'class': 'gm-cc gm-cc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'gm-cc-modal-title', lang: lang, style: 'z-index:' + (cfg.zIndex + 1) });
    var closeBtn = el('button', { type: 'button', 'class': 'gm-cc-close', 'aria-label': T.close, html: '&times;', on: { click: function () { api.hideSettings(); } } });
    var body = el('div', { 'class': 'gm-cc-modal-body' }, ['necessary'].concat(optional).map(row));
    var foot = el('div', { 'class': 'gm-cc-modal-actions' }, [
      el('button', { type: 'button', 'class': 'gm-cc-btn gm-cc-btn--primary', 'data-cc-action': 'reject', text: T.rejectAll, on: { click: function () { api.rejectAll(); } } }),
      el('button', { type: 'button', 'class': 'gm-cc-btn gm-cc-btn--primary', 'data-cc-action': 'save', text: T.save, on: { click: function () { var ch = {}; Array.prototype.forEach.call(m.querySelectorAll('input[data-cat]'), function (i) { ch[i.getAttribute('data-cat')] = i.checked; }); save(ch, 'save'); } } }),
      el('button', { type: 'button', 'class': 'gm-cc-btn gm-cc-btn--primary', 'data-cc-action': 'accept', text: T.acceptAll, on: { click: function () { api.acceptAll(); } } })
    ]);
    m.appendChild(el('div', { 'class': 'gm-cc-modal-backdrop', on: { click: function () { api.hideSettings(); } } }));
    m.appendChild(el('div', { 'class': 'gm-cc-modal-card' }, [
      el('div', { 'class': 'gm-cc-modal-head' }, [el('h2', { id: 'gm-cc-modal-title', 'class': 'gm-cc-title', text: T.settingsTitle }), closeBtn]),
      el('p', { 'class': 'gm-cc-desc', text: T.settingsDesc }),
      cfg.policyUrl ? el('p', { 'class': 'gm-cc-desc gm-cc-policy', html: '<a class="gm-cc-link" href="' + esc(cfg.policyUrl) + '">' + esc(T.policyLink.charAt(0).toUpperCase() + T.policyLink.slice(1)) + '</a>' + (cfg.privacyUrl ? ' · <a class="gm-cc-link" href="' + esc(cfg.privacyUrl) + '">GDPR</a>' : '') }) : null,
      body, foot
    ]));
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') { api.hideSettings(); } if (e.key === 'Tab') trapFocus(e, m); });
    ui.modal = m; return m;
  }
  function trapFocus(e, root) { var f = root.querySelectorAll('button, [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'); if (!f.length) return; var first = f[0], last = f[f.length - 1]; if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); } }
  function buildFab() {
    if (!cfg.floatingButton || !optional.length || d.getElementById('gm-cc-fab')) return;
    if (d.querySelector('[data-cc="show-settings"]:not(#gm-cc-fab)')) return; // site already has its own settings link
    var b = el('button', { id: 'gm-cc-fab', type: 'button', 'class': 'gm-cc gm-cc-fab', 'aria-label': T.footerLink, title: T.footerLink, 'data-cc': 'show-settings', style: 'z-index:' + (cfg.zIndex - 1) });
    b.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z"/><circle cx="8.5" cy="10.5" r="1"/><circle cx="12" cy="15.5" r="1"/><circle cx="15.5" cy="12.5" r="1"/></svg>';
    mount(b);
  }
  function mount(node) { if (!node.parentNode) (d.body || d.documentElement).appendChild(node); }
  function hideAll() { if (ui.banner && ui.banner.parentNode) ui.banner.parentNode.removeChild(ui.banner); if (ui.modal && ui.modal.parentNode) { ui.modal.parentNode.removeChild(ui.modal); d.documentElement.classList.remove('gm-cc-modal-open'); } if (ui.lastFocus && ui.lastFocus.focus) { try { ui.lastFocus.focus(); } catch (e) { } } }

  /* ---------- public API ---------- */
  var api = {
    version: '1.0.0', lang: lang, config: cfg, texts: T,
    get: function () { return consent ? JSON.parse(JSON.stringify(consent)) : null; },
    allowed: allowed,
    show: function () { if (!optional.length) return; mount(buildBanner()); },
    hide: function () { if (ui.banner && ui.banner.parentNode) ui.banner.parentNode.removeChild(ui.banner); },
    showSettings: function () { ui.lastFocus = d.activeElement; var m = buildModal(); mount(m); d.documentElement.classList.add('gm-cc-modal-open'); var first = m.querySelector('.gm-cc-close'); if (first) first.focus(); },
    hideSettings: function () { if (ui.modal && ui.modal.parentNode) { ui.modal.parentNode.removeChild(ui.modal); d.documentElement.classList.remove('gm-cc-modal-open'); } if (!consent) api.show(); if (ui.lastFocus && ui.lastFocus.focus) { try { ui.lastFocus.focus(); } catch (e) { } } },
    acceptAll: function () { var c = {}; optional.forEach(function (k) { c[k] = true; }); save(c, 'accept_all'); },
    rejectAll: function () { save({}, 'reject_all'); },
    accept: function (cats) { var c = consent ? JSON.parse(JSON.stringify(consent.c)) : {}; (cats || []).forEach(function (k) { c[k] = true; }); save(c, 'accept_' + (cats || []).join('_')); },
    withdraw: function (cats) { var c = consent ? JSON.parse(JSON.stringify(consent.c)) : {}; (cats || optional).forEach(function (k) { c[k] = false; }); save(c, 'withdraw'); },
    reset: function () { consent = null; deleteCookie(cfg.cookieName); try { w.localStorage.removeItem(cfg.cookieName); } catch (e) { } gtagConsent('default', {}); api.show(); },
    apply: activateScripts,
    on: function (fn) { if (typeof fn === 'function') listeners.push(fn); return function () { api.off(fn); }; },
    off: function (fn) { listeners = listeners.filter(function (f) { return f !== fn; }); },
    log: function () { try { return JSON.parse(lsGet('gm_cc_log') || '[]'); } catch (e) { return []; } }
  };
  w.GMCookieConsent = api;

  /* ---------- boot ---------- */
  function boot() {
    activateScripts();
    if (!consent && cfg.showOnLoad && optional.length) api.show(); else if (consent) buildFab();
    d.addEventListener('click', function (e) { var t = e.target && e.target.closest ? e.target.closest('[data-cc="show-settings"],[data-cc-show-settings],.gm-cc-open-settings') : null; if (t) { e.preventDefault(); api.showSettings(); } });
    if (w.MutationObserver) { var pending = false; new MutationObserver(function () { if (pending) return; pending = true; setTimeout(function () { pending = false; activateScripts(); }, 50); }).observe(d.documentElement, { childList: true, subtree: true }); }
    if (cfg.debug) console.log('[gm-cc] boot', { lang: lang, consent: consent, optional: optional });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})(window, document);
