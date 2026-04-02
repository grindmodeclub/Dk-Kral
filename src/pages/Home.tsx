import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Award, Heart, Shield, User } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';
import SwipeHint from '../components/SwipeHint';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';
import { supabase, TeamMember } from '../lib/supabase';
import { Language } from '../App';

const translations = {
  heroTitle: {
    cs: 'Stomatologie',
    en: 'Dental Care',
  },
  heroSubtitle: {
    cs: 'v Hradci Králové',
    en: 'in Hradec Kralove',
  },
  aboutTitle: {
    cs: 'Špičková péče o váš úsměv',
    en: 'Premium Care for Your Smile',
  },
  aboutDescription: {
    cs: 'Naše klinika v srdci Hradce Králové kombinuje nejmodernější technologie s individuálním přístupem. Zaměřujeme se na bezbolestné ošetření, estetickou dokonalost a dlouhodobé zdraví vašich zubů.',
    en: 'Our clinic in the heart of Hradec Kralove combines cutting-edge technology with personalized care. We focus on painless treatment, aesthetic perfection, and long-term dental health.',
  },
  features: {
    expertise: { cs: 'Odbornost', en: 'Expertise' },
    personalApproach: { cs: 'Osobní přístup', en: 'Personal Approach' },
    safety: { cs: 'Bezpečnost', en: 'Safety' },
  },
  teamTitle: {
    cs: 'Náš tým',
    en: 'Our Team',
  },
  teamSubtitle: {
    cs: 'Zkušení odborníci s vášní pro stomatologii',
    en: 'Experienced professionals passionate about dentistry',
  },
};

interface HomeProps {
  language: Language;
  onNavigateNext?: () => void;
}

const Home = ({ language, onNavigateNext }: HomeProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order');

    if (data) {
      setTeamMembers(data);
    }
    setLoadingTeam(false);
  };

  const features = [
    { icon: Award, title: translations.features.expertise[language] },
    { icon: Heart, title: translations.features.personalApproach[language] },
    { icon: Shield, title: translations.features.safety[language] },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "name": "DK KRÁL",
    "image": "https://dkkral.cz/logo.png",
    "@id": "https://dkkral.cz",
    "url": "https://dkkral.cz",
    "telephone": "+420770600076",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Resslova 745/5",
      "addressLocality": "Hradec Králové",
      "postalCode": "500 02",
      "addressCountry": "CZ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 50.216445,
      "longitude": 15.8247235
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "07:30",
        "closes": "16:00"
      }
    ],
    "priceRange": "$$"
  };

  const seoContent = {
    title: {
      cs: 'Zubař Hradec Králové | DK KRÁL - Dentální hygiena a Implantáty',
      en: 'Dentist Hradec Králové | DK KRÁL - Dental Hygiene & Implants',
    },
    description: {
      cs: 'Hledáte špičkového zubaře v Hradci Králové? DK KRÁL nabízí komplexní péči: implantáty, bělení zubů a dentální hygienu. Objednejte se online.',
      en: 'Looking for a top dentist in Hradec Králové? DK KRÁL offers comprehensive care: implants, teeth whitening, and dental hygiene. Book online.',
    },
    keywords: {
      cs: 'zubař Hradec Králové, zubní klinika HK, dentální hygiena, implantáty, bělení zubů, MDDr. Ondřej Král',
      en: 'dentist Hradec Králové, dental clinic HK, dental hygiene, implants, teeth whitening, MDDr. Ondřej Král',
    },
  };

  return (
    <div className="h-screen overflow-y-auto relative">
      <SEO
        title={seoContent.title[language]}
        description={seoContent.description[language]}
        keywords={seoContent.keywords[language]}
        structuredData={structuredData}
      />
      <BackgroundParticles />

      <section className="min-h-screen relative pt-48 flex flex-col">
        <div className="absolute inset-0 z-0">
          <img
            src="/dsc_4546_–_kopia_(1).jpg"
            alt="Dental clinic"
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-white/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/50" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center px-6 relative z-10 mt-8"
        >
          <div className="inline-block relative">
            <div
              onClick={() => {
                const aboutSection = document.getElementById('about-section');
                if (aboutSection) {
                  aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="relative px-8 md:px-16 py-8 md:py-12 bg-white/70 rounded-3xl shadow-xl cursor-pointer hover:bg-white/80 transition-all"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                {translations.heroTitle[language]}
              </h1>
              <h2 className="text-3xl md:text-4xl font-light text-dark/80">
                {translations.heroSubtitle[language]}
              </h2>
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 z-20"
              style={{ top: 'calc(100% + 2rem)' }}
            >
              <SwipeHint />
            </div>
          </div>
        </motion.div>

        <div className="absolute left-0 right-0 flex justify-center z-50 pointer-events-none" style={{ bottom: 'max(6rem, env(safe-area-inset-bottom, 2rem) + 2rem)' }}>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              y: [0, 10, 0]
            }}
            transition={{
              opacity: { duration: 0.8, ease: "easeOut" },
              y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const aboutSection = document.getElementById('about-section');
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="cursor-pointer hover:scale-110 transition-transform bg-transparent border-none p-4 pointer-events-auto"
            aria-label="Scroll to about section"
          >
            <div className="bg-white/50 rounded-full p-2">
              <ChevronDown className="text-gold" size={32} />
            </div>
          </motion.button>
        </div>
      </section>

      <section id="about-section" className="bg-white px-6 lg:px-12 py-16 relative" style={{ scrollMarginTop: '120px' }}>
        <div className="max-w-4xl mx-auto relative z-10">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4 text-center">
              {translations.aboutTitle[language]}
            </h2>
            <p className="text-base md:text-lg text-dark/60 mb-8 text-center max-w-2xl mx-auto">
              {translations.aboutDescription[language]}
            </p>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Reveal key={feature.title} delay={0.1 + index * 0.1}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="group inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-br from-white to-gray-50 rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:border-gold transition-all duration-300"
                  >
                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-gold transition-all duration-300 group-hover:scale-110" strokeWidth={1.5} />
                    <span className="text-base md:text-lg font-semibold text-dark whitespace-nowrap">
                      {feature.title}
                    </span>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {!loadingTeam && teamMembers.length > 0 && (
        <section id="team-section" className="bg-gradient-to-b from-gray-50 to-white px-6 lg:px-12 py-16 pb-24 relative" style={{ scrollMarginTop: '120px' }}>
          <div className="max-w-6xl w-full mx-auto relative z-10">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4 text-center">
                {translations.teamTitle[language]}
              </h2>
              <p className="text-base md:text-lg text-dark/60 mb-12 text-center">
                {translations.teamSubtitle[language]}
              </p>
            </Reveal>

            <div className="flex flex-wrap justify-center gap-8">
              {teamMembers.map((member, index) => (
                <Reveal
                  key={member.id}
                  delay={0.1 + index * 0.1}
                  className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm"
                >
                  <div className="group h-full">
                    <div className="relative overflow-hidden rounded-lg mb-6 aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transition-all duration-300 group-hover:shadow-lg">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-24 h-24 text-gray-400 transition-all duration-300 group-hover:text-gold group-hover:scale-110" strokeWidth={1} />
                      )}
                    </div>
                    <h3 className="text-2xl font-semibold text-dark mb-2 text-center">
                      {member.full_name}
                    </h3>
                    {member.role && <p className="text-gold text-center font-medium">{member.role}</p>}
                  </div>
                </Reveal>
              ))}
            </div>

            {onNavigateNext && (
              <div className="flex justify-center mt-12 mb-8">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    x: [0, 10, 0]
                  }}
                  transition={{
                    opacity: { duration: 0.8, ease: "easeOut" },
                    x: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigateNext();
                  }}
                  className="cursor-pointer hover:scale-110 transition-transform bg-transparent border-none p-4"
                  aria-label="Go to services"
                >
                  <div className="bg-white/90 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow">
                    <ChevronRight className="text-gold" size={32} strokeWidth={2} />
                  </div>
                </motion.button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
