import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Sparkles, Crown, Scissors, ChevronDown } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';
import HeroImage, { heroSrcSet, HERO_SIZES } from '../components/HeroImage';
import SiteFooter from '../components/SiteFooter';
import { useSiteData, fetchFeaturedServices } from '../lib/siteData';
import { FeaturedService } from '../lib/supabase';
import { BUSINESS, ADDRESS_LINE, SITE_URL } from '../lib/business';
import { graph, dentistNode, websiteNode, webPageNode, breadcrumbNode, servicesNode } from '../lib/schema';
import { Language } from '../App';

const translations = {
  heroTitle: {
    cs: 'Naše služby',
    en: 'Our Services',
  },
  heroSubtitle: {
    cs: 'Zubař Hradec Králové – stomatologie, implantáty a dentální hygiena',
    en: 'Dentist in Hradec Králové – dentistry, implants and dental hygiene',
  },
  featuredTitle: {
    cs: 'Nejžádanější ošetření',
    en: 'Most Requested Treatments',
  },
  sectionTitle: {
    cs: 'Naše stomatologické služby',
    en: 'Our Dental Services',
  },
  categories: {
    dental: {
      cs: 'Stomatologické výkony',
      en: 'Dental Procedures',
      services: {
        cs: ['Záchovná stomatologie – výplně', 'Endodoncie'],
        en: ['Restorative dentistry - fillings', 'Endodontics'],
      },
    },
    prosthetics: {
      cs: 'Protetika',
      en: 'Prosthetics',
      services: {
        cs: ['Fazety', 'Korunky'],
        en: ['Veneers', 'Crowns'],
      },
    },
    surgery: {
      cs: 'Chirurgie',
      en: 'Surgery',
      services: {
        cs: ['Extrakce', 'Chirurgické zákroky', 'Implantáty'],
        en: ['Extractions', 'Surgical procedures', 'Implants'],
      },
    },
    hygiene: {
      cs: 'Dentální Hygiena',
      en: 'Dental Hygiene',
      services: {
        cs: ['Ošetření dle protokolu GBT', 'Bělení zubů', 'Ošetření pod dásní'],
        en: ['GBT protocol treatment', 'Teeth whitening', 'Scaling and root planing'],
      },
    },
  },
};

interface ServicesProps {
  language: Language;
  onNavigate?: (pageId: string, sectionId?: string) => void;
}

const Services = ({ language, onNavigate }: ServicesProps) => {
  const initial = useSiteData();
  const [featuredServices, setFeaturedServices] = useState<FeaturedService[]>(initial?.featuredServices ?? []);

  useEffect(() => {
    fetchFeaturedServices().then(setFeaturedServices).catch(() => {});
  }, []);

  const servicesData = [
    {
      category: translations.categories.dental[language],
      categoryCs: translations.categories.dental.cs,
      icon: Stethoscope,
      services: translations.categories.dental.services[language],
    },
    {
      category: translations.categories.prosthetics[language],
      categoryCs: translations.categories.prosthetics.cs,
      icon: Crown,
      services: translations.categories.prosthetics.services[language],
    },
    {
      category: translations.categories.surgery[language],
      categoryCs: translations.categories.surgery.cs,
      icon: Scissors,
      services: translations.categories.surgery.services[language],
    },
    {
      category: translations.categories.hygiene[language],
      categoryCs: translations.categories.hygiene.cs,
      icon: Sparkles,
      services: translations.categories.hygiene.services[language],
    },
  ];

  const handleCategoryClick = (categoryCs: string) => {
    const categoryId = `category-${categoryCs.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')}`;
    onNavigate?.('pricing', categoryId);
  };

  const seoContent = {
    title: {
      cs: 'Zubní služby Hradec Králové | Implantáty, Dentální hygiena, Bělení | DK KRÁL',
      en: 'Dental Services Hradec Králové | Implants, Hygiene, Whitening | DK KRÁL',
    },
    description: {
      cs: 'Služby zubaře DK KRÁL v Hradci Králové: dentální hygiena GBT, zubní implantáty, bělení zubů, endodoncie, fazety a korunky, extrakce. Resslova 745/5, tel. +420 770 600 076.',
      en: 'Dental clinic DK KRÁL offers: GBT dental hygiene, implants, teeth whitening, endodontics, veneers and crowns. Painless treatment, centre of Hradec Králové.',
    },
    keywords: {
      cs: 'dentální hygiena Hradec Králové, implantáty HK, bělení zubů Hradec Králové, GBT hygiena HK, endodoncie Hradec Králové, kořenové kanálky HK, fazety zubů HK, keramické korunky HK, protetika Hradec Králové, chirurgie zubů HK, extrakce zubu HK, záchovná stomatologie HK, fotokompozitní výplně HK',
      en: 'dental hygiene Hradec Králové, implants HK, teeth whitening Hradec Králové, GBT hygiene, endodontics HK, veneers HK, ceramic crowns HK',
    },
  };

  const structuredData = graph(
    dentistNode(initial?.team),
    websiteNode(),
    webPageNode('services', seoContent.title.cs, seoContent.description.cs),
    breadcrumbNode('services'),
    servicesNode(featuredServices)
  );

  return (
    <div className="h-screen overflow-y-auto relative">
      <SEO
        title={seoContent.title[language]}
        description={seoContent.description[language]}
        keywords={seoContent.keywords[language]}
        canonicalUrl={`${SITE_URL}/sluzby`}
        language={language}
        structuredData={structuredData}
        preloadImage={{ srcSet: heroSrcSet('ordinace-zubni-kreslo'), sizes: HERO_SIZES }}
      />
      <BackgroundParticles />

      <section className="min-h-screen relative pt-48 flex flex-col">
        <div className="absolute inset-0 z-0">
          <HeroImage
            name="ordinace-zubni-kreslo"
            alt="Zubní křeslo v ordinaci DK KRÁL v Hradci Králové"
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
          <div className="flex flex-col gap-4 items-center w-full max-w-2xl mx-auto">
            <div
              onClick={() => {
                const contentSection = document.getElementById('services-content');
                if (contentSection) {
                  contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="relative w-full px-8 md:px-16 py-8 md:py-12 bg-white/70 rounded-3xl shadow-xl cursor-pointer hover:bg-white/80 transition-all"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-dark text-center">
                {translations.heroTitle[language]}
              </h1>
              <p className="text-lg md:text-2xl font-light text-dark/80 text-center mt-4">
                {translations.heroSubtitle[language]}
              </p>
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
              const contentSection = document.getElementById('services-content');
              if (contentSection) {
                contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="cursor-pointer hover:scale-110 transition-transform bg-transparent border-none p-4 pointer-events-auto"
            aria-label="Scroll to services content"
          >
            <div className="bg-white/50 rounded-full p-2">
              <ChevronDown className="text-gold" size={32} />
            </div>
          </motion.button>
        </div>
      </section>

      <section id="services-content" className="min-h-screen bg-white px-6 lg:px-12 pt-16 pb-40 relative" style={{ scrollMarginTop: '120px' }}>
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                {translations.sectionTitle[language]}
              </h2>
              <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
              <p className="text-base md:text-lg text-dark/70 max-w-3xl mx-auto">
                {language === 'cs' ? (
                  <>
                    DK KRÁL je soukromá zubní ordinace v centru Hradce Králové. Jako zubař v Hradci Králové pečujeme o celý
                    chrup: od výplní a ošetření kořenových kanálků přes celokeramické fazety a korunky až po extrakce a zubní
                    implantáty. Dentální hygienistky pracují metodou GBT (Guided Biofilm Therapy) a nabízíme i bělení zubů.
                    Ordinace sídlí na adrese {ADDRESS_LINE}, objednat se můžete na{' '}
                    <a href={`tel:${BUSINESS.phone}`} className="text-gold hover:underline">{BUSINESS.phoneDisplay}</a>.
                  </>
                ) : (
                  <>
                    DK KRÁL is a private dental clinic in the centre of Hradec Králové. We take care of your whole smile: from
                    fillings and root canal treatment through all-ceramic veneers and crowns to extractions and dental implants.
                    Our dental hygienists use the GBT (Guided Biofilm Therapy) method and we also offer teeth whitening.
                    The clinic is located at {ADDRESS_LINE}, book on{' '}
                    <a href={`tel:${BUSINESS.phone}`} className="text-gold hover:underline">{BUSINESS.phoneDisplay}</a>.
                  </>
                )}
              </p>
            </div>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-8">
            {servicesData.map((category, index) => {
              const Icon = category.icon;

              return (
                <Reveal
                  key={category.category}
                  delay={0.1 + index * 0.08}
                  className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm"
                >
                  <div
                    onClick={() => handleCategoryClick(category.categoryCs)}
                    className="group p-8 bg-gray-50 rounded-xl border border-gray-200 hover:border-gold hover:bg-gold/5 transition-all duration-300 hover:shadow-xl cursor-pointer h-full"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-gold/10 rounded-lg group-hover:bg-gold group-hover:text-white transition-all duration-300">
                        <Icon className="w-6 h-6 text-gold group-hover:text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-dark">
                        {category.category}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {category.services.map((service) => (
                        <li key={service} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0" />
                          <span className="text-dark/70">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {featuredServices.length > 0 && (
            <div className="mt-20">
              <Reveal>
                <h2 className="text-3xl md:text-4xl font-bold text-dark mb-10 text-center">
                  {translations.featuredTitle[language]}
                </h2>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredServices.map((service, index) => (
                  <Reveal key={service.id} delay={0.1 + index * 0.08}>
                    <article className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gold hover:shadow-md transition-all h-full">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-xl font-semibold text-dark">
                          {language === 'cs' ? service.title_cs : service.title_en}
                        </h3>
                        {service.price_string && (
                          <span className="text-sm font-bold whitespace-nowrap px-3 py-1 bg-gold/10 rounded-full" style={{ color: '#B99355' }}>
                            {service.price_string}
                          </span>
                        )}
                      </div>
                      <p className="text-dark/70">
                        {language === 'cs' ? service.description_cs : service.description_en}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <SiteFooter language={language} onNavigate={onNavigate} />
    </div>
  );
};

export default Services;
