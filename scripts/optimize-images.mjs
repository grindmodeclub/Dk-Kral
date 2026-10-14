// Jednorazová konverzia zdrojových fotiek do WebP v správnych rozmeroch.
// Použitie: npm run images  (zdroje v scripts/image-sources/, výstup do public/img/)
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'scripts/image-sources';
const OUT = 'public/img';
fs.mkdirSync(OUT, { recursive: true });

// Hero fotky: celoobrazovkové pozadie, srcset 768/1280/1920
const heroes = {
  'ordinace-dk-kral.jpg': 'ordinace-dk-kral',
  'ordinace-zubni-kreslo.jpg': 'ordinace-zubni-kreslo',
  'zubni-mikroskop.jpg': 'zubni-mikroskop',
  'rtg-snimek-prubeh-lecby.jpg': 'rtg-snimek-prubeh-lecby',
};
const HERO_WIDTHS = [768, 1280, 1920];

for (const [src, name] of Object.entries(heroes)) {
  for (const w of HERO_WIDTHS) {
    await sharp(path.join(SRC, src))
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(path.join(OUT, `${name}-${w}.webp`));
  }
}

// Open Graph obrázok 1200x630 (JPG kvôli kompatibilite sociálnych sietí)
await sharp(path.join(SRC, 'ordinace-dk-kral.jpg'))
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(path.join(OUT, 'og-dk-kral-zubar-hradec-kralove.jpg'));

// Logo: malé WebP do hlavičky (zobrazené vo výške 40 px, 3x), PNG originál pre JSON-LD
await sharp(path.join(SRC, 'logo-dk-kral.png')).resize({ height: 120 }).webp({ quality: 90 }).toFile(path.join(OUT, 'logo-dk-kral.webp'));
fs.copyFileSync(path.join(SRC, 'logo-dk-kral.png'), path.join(OUT, 'logo-dk-kral.png'));

// Korunka (dekorácia na Kontakte, max. 240 px) a favicony
await sharp(path.join(SRC, 'korunka.png')).webp({ quality: 85 }).toFile(path.join(OUT, 'korunka.webp'));
await sharp(path.join(SRC, 'korunka.png')).resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/favicon-48.png');
await sharp(path.join(SRC, 'korunka.png')).resize(180, 180, { fit: 'contain', background: '#ffffff' }).png().toFile('public/apple-touch-icon.png');

// Ikona swipe (zobrazená max. 150 px)
await sharp(path.join(SRC, 'swipe.png')).resize(300, 300).webp({ quality: 85 }).toFile(path.join(OUT, 'swipe.webp'));

for (const f of fs.readdirSync(OUT)) console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024) + ' KB');
