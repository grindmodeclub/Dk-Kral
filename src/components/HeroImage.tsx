// Celoobrazovkový hero obrázok (WebP, srcset). Je to LCP prvok stránky, preto sa nenačítava lazy.
export const HERO_SIZES = '100vw';
const WIDTHS = [768, 1280, 1920];

export const heroSrcSet = (name: string) => WIDTHS.map((w) => `/img/${name}-${w}.webp ${w}w`).join(', ');

interface HeroImageProps {
  name: string;
  alt: string;
  className?: string;
}

const HeroImage = ({ name, alt, className }: HeroImageProps) => (
  <img
    src={`/img/${name}-1280.webp`}
    srcSet={heroSrcSet(name)}
    sizes={HERO_SIZES}
    alt={alt}
    width={1920}
    height={1280}
    decoding="async"
    {...({ fetchpriority: 'high' } as Record<string, string>)}
    className={className}
  />
);

export default HeroImage;
