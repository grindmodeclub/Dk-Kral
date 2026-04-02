import { motion } from 'framer-motion';
import { Stethoscope, Sparkles, Crown, Scissors, ChevronDown } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';
import { Language } from '../App';

const translations = {
  heroTitle: {
    cs: 'Naše služby',
    en: 'Our Services',
  },
  sectionTitle: {
    cs: 'Naše služby',
    en: 'Our Services',
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
      cs: 'Stomatologie Hradec Králové | Služby a Zákroky | DK KRÁL',
      en: 'Dentistry Hradec Králové | Services & Procedures | DK KRÁL',
    },
    description: {
      cs: 'Provádíme záchovnou stomatologii, endodoncii, chirurgické zákroky a protetiku. Moderní vybavení a bezbolestný přístup v centru HK.',
      en: 'We provide restorative dentistry, endodontics, surgical procedures, and prosthetics. Modern equipment and painless approach in HK center.',
    },
  };

  return (
    <div className="h-screen overflow-y-auto relative">
      <SEO
        title={seoContent.title[language]}
        description={seoContent.description[language]}
      />
      <BackgroundParticles />

      <section className="min-h-screen relative pt-48 flex flex-col">
        <div className="absolute inset-0 z-0">
          <img
            src="/berrb_erbrebre_(1).jpg"
            alt="Dental services"
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
              <div className="w-24 h-0.5 bg-gold mx-auto" />
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
        </div>
      </section>
    </div>
  );
};

export default Services;
