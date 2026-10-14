# DK KRÁL – web zubní ordinace

Web https://dkkral.cz. Hosting Netlify (site `dk-kral`), deploy automaticky z vetvy `main`.

- `npm run dev` – lokálny vývoj
- `npm run build` – build + prerender všetkých verejných stránok (potrebuje `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` v `.env`)
- `npm run images` – optimalizácia obrázkov z `scripts/image-sources` do `public/img`

Obsah (ceník, služby, tým, dovolenky) sa spravuje v `/admin`, po uložení sa web sám prebuduje.
