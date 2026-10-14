import { Helmet } from 'react-helmet-async';
import { BUSINESS } from '../lib/business';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords?: string;
  ogImage?: string;
  structuredData?: object;
  language?: string;
  /** Hero obrázok aktuálnej stránky – preload kvôli LCP. */
  preloadImage?: { srcSet: string; sizes: string };
}

const SEO = ({ title, description, canonicalUrl, keywords, ogImage, structuredData, language = 'cs', preloadImage }: SEOProps) => {
  const image = ogImage || BUSINESS.image;

  return (
    <Helmet>
      <html lang={language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={language === 'en' ? 'en_GB' : 'cs_CZ'} />
      <meta property="og:site_name" content="DK KRÁL" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {preloadImage && (
        <link
          rel="preload"
          as="image"
          {...({ imagesrcset: preloadImage.srcSet, imagesizes: preloadImage.sizes, fetchpriority: 'high' } as Record<string, string>)}
        />
      )}

      {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
    </Helmet>
  );
};

export default SEO;
