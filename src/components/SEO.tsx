import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://dkkral.cz';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  structuredData?: object;
}

const SEO = ({ title, description, keywords, structuredData }: SEOProps) => {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const cleanPath = path.replace(/\/+$/, '');
  const canonicalUrl = `${BASE_URL}${cleanPath}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
