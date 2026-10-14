// Prerender po `vite build`: každá verejná URL dostane vlastný HTML súbor s plným textom, <title>, description,
// canonical, JSON-LD a dátami zo Supabase. Generuje aj admin.html (noindex), 404.html, sitemap.xml a llms.txt.
// Pri chybe (Supabase nedostupný, chýbajúci H1, duplicitný title…) build zlyhá a Netlify nechá predchádzajúci deploy.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const DIST = path.resolve('dist');
const SERVER_ENTRY = path.resolve('dist-server/entry-server.js');

const {
  render, fetchSiteData, buildFaq, formatPrice,
  BUSINESS, ADDRESS_LINE, ROUTES, SITE_URL, pageUrl, openingHoursSentence,
} = await import(pathToFileURL(SERVER_ENTRY).href);

// Šablónu si odložíme, lebo dist/index.html sa prepíše prerenderovanou homepage (skript je tak opakovateľný)
const TEMPLATE = path.resolve('dist-server/template.html');
const built = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
if (built.includes('<!--app-head-->')) fs.writeFileSync(TEMPLATE, built);
const template = fs.readFileSync(TEMPLATE, 'utf8');
if (!template.includes('<!--app-head-->') || !template.includes('<div id="root"></div>')) {
  throw new Error('index.html nemá značky <!--app-head--> / <div id="root"></div>');
}

const data = await fetchSiteData();
console.log(`[prerender] Supabase: ${data.team.length} členů týmu, ${data.featuredServices.length} služeb, ${data.priceList.length} položek ceníku, ${data.holidays.length} změn hodin`);
if (!data.priceList.length) throw new Error('Ceník ze Supabase je prázdný – prerender by publikoval stránku bez cen');

// JSON do <script> bezpečne (žiadne </script>)
const LT = String.fromCharCode(92) + 'u003c';
const serialize = (value) => JSON.stringify(value).replace(/</g, LT);

const outFile = (routePath) => (routePath === '/' ? 'index.html' : `${routePath.slice(1)}.html`);

const titles = new Set();
const report = [];

for (const route of ROUTES) {
  const { html, helmet } = render(route.path, data);
  const head = [helmet.title, helmet.meta, helmet.link, helmet.script].map((h) => h.toString()).join('\n    ');

  const page = template
    .replace(/<html[^>]*>/, `<html ${helmet.htmlAttributes.toString() || 'lang="cs"'}>`)
    .replace('<!--app-head-->', head)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>\n    <script>window.__DK_DATA__=${serialize(data)}</script>`);

  // kontroly – radšej zhodiť build než publikovať zlé SEO
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  const title = (page.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1];
  const canonical = (page.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/) || [])[1];
  const jsonLd = (page.match(/application\/ld\+json/g) || []).length;
  const textLength = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length;
  const problems = [];
  if (h1Count !== 1) problems.push(`H1: ${h1Count}`);
  if (!title || titles.has(title)) problems.push(`title chýba alebo je duplicitný: ${title}`);
  if (canonical !== pageUrl(route.path)) problems.push(`canonical ${canonical} ≠ ${pageUrl(route.path)}`);
  if (jsonLd < 1) problems.push('chýba JSON-LD');
  if (textLength < 500) problems.push(`málo textu (${textLength} znakov)`);
  if (problems.length) throw new Error(`[prerender] ${route.path}: ${problems.join('; ')}`);
  titles.add(title);

  fs.writeFileSync(path.join(DIST, outFile(route.path)), page);
  report.push({ url: route.path, file: outFile(route.path), title, text: textLength, kb: Math.round(page.length / 1024) });
}
console.table(report);

// Administrácia: bez prerenderu, noindex
const adminHead = `<title>Administrace | DK KRÁL</title>\n    <meta name="robots" content="noindex, nofollow" />`;
fs.writeFileSync(path.join(DIST, 'admin.html'), template.replace('<!--app-head-->', adminHead));

// 404: statická stránka bez JS (Netlify ju vráti so statusom 404)
const navLinks = ROUTES.map((r) => `<li><a href="${r.path}">${r.name.cs}</a></li>`).join('');
fs.writeFileSync(
  path.join(DIST, '404.html'),
  `<!doctype html>
<html lang="cs">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Stránka nenalezena | DK KRÁL – Zubař Hradec Králové</title>
<meta name="robots" content="noindex, follow" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
<style>
  body{margin:0;font-family:Montserrat,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#343434;background:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px}
  img{height:56px;width:auto;margin-bottom:24px}h1{font-size:28px;margin:0 0 12px}p{color:#666;margin:0 0 24px}
  ul{list-style:none;padding:0;margin:0 0 24px;display:flex;flex-wrap:wrap;gap:12px 20px;justify-content:center}
  a{color:#B99355;font-weight:600;text-decoration:none}a:hover{text-decoration:underline}
  address{font-style:normal;color:#666;font-size:14px;line-height:1.6}
</style>
</head>
<body>
<main>
  <a href="/"><img src="/img/logo-dk-kral.webp" alt="DK KRÁL – zubař Hradec Králové" width="159" height="120" /></a>
  <h1>Stránka nenalezena</h1>
  <p>Omlouváme se, tato stránka neexistuje nebo byla přesunuta.</p>
  <ul>${navLinks}</ul>
  <address><strong>${BUSINESS.name}</strong><br />${ADDRESS_LINE}<br /><a href="tel:${BUSINESS.phone}">${BUSINESS.phoneDisplay}</a> · <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a></address>
</main>
</body>
</html>
`
);

// sitemap.xml – lastmod = dátum posledného commitu (dátum nasadenia obsahu)
let lastmod;
try {
  lastmod = execSync('git log -1 --format=%cs', { encoding: 'utf8' }).trim();
} catch {
  lastmod = new Date().toISOString().slice(0, 10);
}
const priority = { home: '1.0', services: '0.9', pricing: '0.9', contact: '0.9', process: '0.7' };
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map((r) => `  <url>
    <loc>${pageUrl(r.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority[r.id]}</priority>
  </url>`).join('\n')}
</urlset>
`
);

// llms.txt – stručný popis pre AI vyhľadávače (zo rovnakých dát ako web)
const faq = buildFaq('cs', data.priceList);
const pageDescriptions = {
  home: 'úvod, tým, přehled služeb, ordinační hodiny a časté dotazy',
  services: 'přehled stomatologických služeb',
  pricing: 'kompletní ceník výkonů',
  process: 'jak probíhá ošetření krok za krokem',
  contact: 'adresa, mapa, telefon, e-mail a ordinační hodiny',
};
const llms = `# DK KRÁL – Zubař Hradec Králové

> Soukromá zubní ordinace DK KRÁL (${BUSINESS.name}) v centru Hradce Králové na adrese ${ADDRESS_LINE}. Nabízí záchovnou stomatologii a endodoncii, protetiku (celokeramické fazety a korunky), chirurgii včetně zubních implantátů a dentální hygienu metodou GBT s bělením zubů. Přijímá nové pacienty, zejména na dentální hygienu.

## Kontakt

- Název: ${BUSINESS.name}
- Adresa: ${ADDRESS_LINE}, Česká republika
- Telefon: ${BUSINESS.phoneDisplay} (pokud se nedovoláte, pošlete SMS)
- E-mail: ${BUSINESS.email}
- Ordinační hodiny: ${openingHoursSentence('cs')}
- IČO: ${BUSINESS.ico}
- Mapa: ${BUSINESS.mapsUrl}
- Web: ${SITE_URL}/

## Služby

${data.featuredServices.map((s) => `- ${s.title_cs}${s.price_string ? ` (${formatPrice(s.price_string)})` : ''}: ${s.description_cs}`).join('\n')}
- Záchovná stomatologie: fotokompozitní výplně
- Endodoncie: ošetření kořenových kanálků
- Chirurgie: extrakce a chirurgické zákroky malého rozsahu

## Tým

${data.team.map((m) => `- ${m.role ? `${m.role} ` : ''}${m.full_name}`).join('\n')}

## Stránky

${ROUTES.map((r) => `- [${r.name.cs}](${pageUrl(r.path)}): ${pageDescriptions[r.id]}`).join('\n')}

## Časté dotazy

${faq.map((i) => `- ${i.q} ${i.a}`).join('\n')}
`;
fs.writeFileSync(path.join(DIST, 'llms.txt'), llms);

console.log('[prerender] hotovo: 5 stránek, admin.html, 404.html, sitemap.xml, llms.txt');
