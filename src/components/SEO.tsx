import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://dkkral.cz';
const DEFAULT_OG_IMAGE = 'https://dkkral.cz/hero-reception.jpg';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  structuredData?: object | object[];
  canonicalUrl?: string;
}

const SEO = ({ title, description, keywords, ogImage, structuredData, canonicalUrl }: SEOProps) => {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const cleanPath = path.replace(/\/+$/, '');
  const canonical = canonicalUrl || `${BASE_URL}${cleanPath || ''}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  const schemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="cs_CZ" />
      <meta property="og:site_name" content="DK KRÁL" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
