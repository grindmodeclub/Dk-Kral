import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';
import { supabase, PriceListItem } from '../lib/supabase';
import { Language } from '../App';

const translations = {
  heroTitle: {
    cs: 'Ceník',
    en: 'Pricing',
  },
  sectionTitle: {
    cs: 'Přehled cen',
    en: 'Price Overview',
  },
  sectionSubtitle: {
    cs: 'Všechny výkony zahrnují materiály nejvyšší kvality',
    en: 'All procedures include highest quality materials',
  },
  disclaimer: {
    cs: 'Finální cena bude stanovena po vstupní konzultaci a závisí na rozsahu ošetření. Přijímáme platby v hotovosti i kartou.',
    en: 'Final price will be determined after initial consultation and depends on the scope of treatment. We accept cash and card payments.',
  },
  coveredByInsurance: {
    cs: 'Hrazeno ZP',
    en: 'Covered by insurance',
  },
  categories: {
    'Stomatologické výkony': { en: 'Dental Procedures' },
    'Protetika': { en: 'Prosthetics' },
    'Chirurgie': { en: 'Surgery' },
    'Dentální Hygiena': { en: 'Dental Hygiene' },
    'Bělení zubů': { en: 'Teeth Whitening' },
  } as Record<string, { en: string }>,
  services: {
    'Návrh terapie před přijetím do pravidelné péče': { en: 'Treatment plan before accepting into regular care' },
    'Základní OPG a RTG': { en: 'Basic OPG and X-ray' },
    'Lokální anestezie': { en: 'Local anesthesia' },
    'Kompletní endodontické pře/ošetření': { en: 'Complete endodontic pre/treatment' },
    'Fotokompozitní výplň (dospělý + dítě)': { en: 'Composite filling (adult + child)' },
    'Fotokompozitní výplň dospělý pacient': { en: 'Composite filling - adult patient' },
    'Fotokompozitní výplň dětský pacient': { en: 'Composite filling - child patient' },
    'Kompletní endodontické ošetření': { en: 'Complete endodontic treatment' },
    'Kofferdam': { en: 'Rubber dam' },
    'Fazeta celokeramická': { en: 'All-ceramic veneer' },
    'Celokeramická korunka/overlay': { en: 'All-ceramic crown/overlay' },
    'Korunka na implantát': { en: 'Crown on implant' },
    'Jednoduchá extrakce': { en: 'Simple extraction' },
    'Chirurgie malého rozsahu': { en: 'Minor surgery' },
    'Zubní implantát': { en: 'Dental implant' },
    'Vstupní ošetření dentální hygienistkou - dospělý': { en: 'Initial dental hygiene treatment - adult' },
    'Vstupní ošetření dentální hygienistkou - dítě do 15 let': { en: 'Initial dental hygiene treatment - child under 15' },
    'Vstupní ošetření dentální hygienistkou - dospělý pacient': { en: 'Initial dental hygiene treatment - adult' },
    'Vstupní ošetření dentální hygienistkou - dětský pacient do 15 let': { en: 'Initial dental hygiene treatment - child under 15' },
    'Opakované ošetření (RECALL) 30/45 min': { en: 'Follow-up treatment (RECALL) 30/45 min' },
    'Opakované ošetření dentální hygienistkou 30 minut (RECALL)': { en: 'Follow-up dental hygiene 30 min (RECALL)' },
    'Opakované ošetření dentální hygienistkou 45 minut (RECALL)': { en: 'Follow-up dental hygiene 45 min (RECALL)' },
    'Ošetření pod dásní': { en: 'Scaling a root planing' },
    'Bělení zubů - Kombinované': { en: 'Teeth Whitening - Combined' },
    'Bělení zubů - Ordinační': { en: 'Teeth Whitening - In-office' },
    'Bělení zubů - Domácí': { en: 'Teeth Whitening - Home' },
    'Kombinované bělení': { en: 'Combined whitening' },
    'Ordinační bělení': { en: 'In-office whitening' },
    'Domácí bělení (nosiče + gely)': { en: 'Home whitening (trays + gels)' },
  } as Record<string, { en: string }>,
};

const CATEGORY_SORT_ORDER: Record<string, number> = {
  'Stomatologické výkony': 1,
  'Protetika': 2,
  'Chirurgie': 3,
  'Dentální Hygiena': 4,
};

const fallbackPricingData = [
  {
    category: 'Stomatologické výkony',
    items: [
      { name: 'Návrh terapie před přijetím do pravidelné péče', price: '2000 Kč' },
      { name: 'Základní OPG a RTG', price: 'Hrazeno ZP' },
      { name: 'Lokální anestezie', price: 'Hrazeno ZP' },
      { name: 'Kompletní endodontické pře/ošetření', price: '5160-14620,-' },
      { name: 'Fotokompozitní výplň (dospělý + dítě)', price: '2580-7740,- / Hrazeno ZP' },
    ],
  },
  {
    category: 'Dentální Hygiena',
    items: [
      { name: 'Vstupní ošetření dentální hygienistkou - dospělý', price: '2280,-' },
      { name: 'Vstupní ošetření dentální hygienistkou - dítě do 15 let', price: '1140,-' },
      { name: 'Opakované ošetření (RECALL) 30/45 min', price: '1140,- / 1710,-' },
      { name: 'Ošetření pod dásní', price: '3420,-/čelist' },
      { name: 'Bělení zubů - Kombinované', price: '6745,-' },
      { name: 'Bělení zubů - Ordinační', price: '3580,-' },
      { name: 'Bělení zubů - Domácí', price: '7315,-' },
    ],
  },
  {
    category: 'Protetika',
    items: [
      { name: 'Fazeta celokeramická', price: 'Od 14 000,-' },
      { name: 'Celokeramická korunka/overlay', price: 'Od 13 200,-' },
      { name: 'Korunka na implantát', price: 'Od 15 400,-' },
    ],
  },
  {
    category: 'Chirurgie',
    items: [
      { name: 'Jednoduchá extrakce', price: 'Hrazeno ZP' },
      { name: 'Chirurgie malého rozsahu', price: 'od 1400,-' },
      { name: 'Zubní implantát', price: 'Od 16 000,-' },
    ],
  },
];

interface PricingProps {
  language: Language;
  targetSectionId?: string | null;
  onClearTargetSection?: () => void;
}

const Pricing = ({ language, targetSectionId, onClearTargetSection }: PricingProps) => {
  const [pricingData, setPricingData] = useState<{ category: string; items: { name: string; price: string }[] }[]>(fallbackPricingData);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPricing();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (targetSectionId && !loading) {
      const scrollToTarget = (attempts = 0) => {
        const element = document.getElementById(targetSectionId);
        const container = scrollContainerRef.current;
        if (element && container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 180;
          container.scrollTo({ top: scrollTop, behavior: 'smooth' });
          setTimeout(() => {
            onClearTargetSection?.();
          }, 1000);
        } else if (attempts < 10) {
          setTimeout(() => scrollToTarget(attempts + 1), 200);
        }
      };

      setTimeout(() => scrollToTarget(), 600);
    }
  }, [targetSectionId, loading, onClearTargetSection]);

  const fetchPricing = async () => {
    try {
      const { data } = await supabase
        .from('price_list')
        .select('*')
        .order('display_order');

      if (data && data.length > 0) {
        const grouped = data.reduce((acc, item: PriceListItem) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push({
            name: item.service_name,
            price: item.price_string,
          });
          return acc;
        }, {} as Record<string, { name: string; price: string }[]>);

        const formattedData = Object.entries(grouped).map(([category, items]) => ({
          category,
          items: items as { name: string; price: string }[],
        }));

        const sortedData = formattedData.sort((a, b) => {
          const orderA = CATEGORY_SORT_ORDER[a.category] || 999;
          const orderB = CATEGORY_SORT_ORDER[b.category] || 999;
          return orderA - orderB;
        });

        setPricingData(sortedData);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const translateCategory = (category: string): string => {
    if (language === 'cs') return category;
    return translations.categories[category]?.en || category;
  };

  const translateService = (service: string): string => {
    if (language === 'cs') return service;
    return translations.services[service]?.en || service;
  };

  const translatePrice = (price: string): string => {
    if (language === 'cs') return price;
    if (price === 'Hrazeno ZP') return translations.coveredByInsurance.en;
    return price;
  };

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Ceník zubní ordinace DK KRÁL – Hradec Králové",
    "url": "https://dkkral.cz/cenik",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Dentální hygiena dospělý – 2 280 Kč" },
      { "@type": "ListItem", "position": 2, "name": "Dentální hygiena dítě do 15 let – 1 140 Kč" },
      { "@type": "ListItem", "position": 3, "name": "Bělení zubů kombinované – 6 745 Kč" },
      { "@type": "ListItem", "position": 4, "name": "Bělení zubů ordinační – 3 580 Kč" },
      { "@type": "ListItem", "position": 5, "name": "Zubní implantát – od 16 000 Kč" },
      { "@type": "ListItem", "position": 6, "name": "Keramická korunka – od 13 200 Kč" },
      { "@type": "ListItem", "position": 7, "name": "Fazeta celokeramická – od 14 000 Kč" },
      { "@type": "ListItem", "position": 8, "name": "Endodoncie – 5 160–14 620 Kč" }
    ]
  };

  const seoContent = {
    title: {
      cs: 'Ceník zubaře Hradec Králové | Transparentní ceny | DK KRÁL',
      en: 'Dentist Price List Hradec Králové | Transparent Pricing | DK KRÁL',
    },
    description: {
      cs: 'Ceník DK KRÁL: dentální hygiena od 1 140 Kč, implantát od 16 000 Kč, bělení zubů od 3 580 Kč, výplň od 2 580 Kč. Transparentní ceny bez překvapení v centru Hradce Králové.',
      en: 'DK KRÁL price list: dental hygiene from 1 140 CZK, implant from 16 000 CZK, teeth whitening from 3 580 CZK. Transparent pricing in Hradec Králové.',
    },
    keywords: {
      cs: 'ceník zubaře Hradec Králové, cena dentální hygiena HK, cena implantát HK, cena bělení zubů HK, ceník zubního ošetření, kolik stojí zubař Hradec Králové, cena endodoncie HK, cena keramická korunka HK, fazety cena HK',
      en: 'dentist price list Hradec Králové, dental hygiene cost HK, implant cost HK, teeth whitening price HK',
    },
  };

  return (
    <div ref={scrollContainerRef} className="h-screen overflow-y-auto relative">
      <SEO
        title={seoContent.title[language]}
        description={seoContent.description[language]}
        keywords={seoContent.keywords[language]}
        canonicalUrl="https://dkkral.cz/cenik"
        structuredData={pricingSchema}
      />
      <BackgroundParticles />

      <section className="min-h-screen relative pt-48 flex flex-col">
        <div className="absolute inset-0 z-0">
          <img
            src="/dsc_4507.jpg"
            alt="Dental pricing"
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-white/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/50" />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center px-6 relative z-10 mt-8"
        >
          <div className="inline-block relative">
            <div
              onClick={() => {
                if (typeof window === 'undefined') return;
                const contentSection = document.getElementById('pricing-content');
                const container = scrollContainerRef.current;
                if (contentSection && container) {
                  const containerRect = container.getBoundingClientRect();
                  const elementRect = contentSection.getBoundingClientRect();
                  const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 120;
                  container.scrollTo({ top: scrollTop, behavior: 'smooth' });
                }
              }}
              className="relative px-8 md:px-16 py-8 md:py-12 bg-white/70 rounded-3xl shadow-xl cursor-pointer hover:bg-white/80 transition-all"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-dark">
                {translations.heroTitle[language]}
              </h1>
            </div>
          </div>
        </motion.div>

        <div className="absolute left-0 right-0 flex justify-center z-50 pointer-events-none" style={{ bottom: 'max(6rem, env(safe-area-inset-bottom, 2rem) + 2rem)' }}>
          <motion.button
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (typeof window === 'undefined') return;
              const contentSection = document.getElementById('pricing-content');
              const container = scrollContainerRef.current;
              if (contentSection && container) {
                const containerRect = container.getBoundingClientRect();
                const elementRect = contentSection.getBoundingClientRect();
                const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 120;
                container.scrollTo({ top: scrollTop, behavior: 'smooth' });
              }
            }}
            className="cursor-pointer hover:scale-110 transition-transform bg-transparent border-none p-4 pointer-events-auto"
            aria-label="Scroll to pricing content"
          >
            <div className="bg-white/50 rounded-full p-2">
              <ChevronDown className="text-gold" size={32} />
            </div>
          </motion.button>
        </div>
      </section>

      <section id="pricing-content" className="min-h-screen bg-white px-6 lg:px-12 py-20" style={{ scrollMarginTop: '120px' }}>
        <div className="max-w-5xl mx-auto relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
              {translations.sectionTitle[language]}
            </h2>
            <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
            <p className="text-lg text-dark/70 max-w-2xl mx-auto">
              {translations.sectionSubtitle[language]}
            </p>
          </div>
        </Reveal>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {(pricingData || []).map((category, index) => {
              if (!category || !category.category) return null;
              const categoryId = `category-${category.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')}`;
              return (
              <Reveal key={category.category} delay={0.1 + index * 0.08}>
                <div
                  id={categoryId}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gold hover:shadow-lg transition-all"
                  style={{ scrollMarginTop: '140px' }}
                >
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-dark">
                      {translateCategory(category.category)}
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {(category.items || []).map((item) => {
                      if (!item || !item.name) return null;
                      return (
                      <div
                        key={item.name}
                        className="px-4 py-5 md:px-6 md:py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-6 hover:bg-gold/5 transition-colors"
                      >
                        <span className="text-dark/80 font-medium text-left leading-relaxed md:flex-1">{translateService(item.name)}</span>
                        <span className="font-bold text-lg text-left md:text-right md:min-w-[200px]" style={{ color: '#B99355' }}>
                          {translatePrice(item.price || '')}
                        </span>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
              );
            })}
          </div>
        )}

        <Reveal delay={0.5}>
          <div className="mt-12 p-8 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <p className="text-dark/70 leading-relaxed">
              {translations.disclaimer[language]}
            </p>
          </div>
        </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
