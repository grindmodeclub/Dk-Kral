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

  const dentistSchema = {
    "@context": "https://schema.org",
    "@type": ["Dentist", "LocalBusiness", "MedicalBusiness"],
    "name": "DK KRÁL – Dentální hygiena a Implantologie",
    "alternateName": ["DK Král", "DK KRAL", "Zubař Hradec Králové DK Král"],
    "image": [
      "https://dkkral.cz/hero-reception.jpg",
      "https://dkkral.cz/logo_dk_kral_gold.png"
    ],
    "@id": "https://dkkral.cz",
    "url": "https://dkkral.cz",
    "telephone": "+420770600076",
    "email": "recepce@dkkral.cz",
    "description": "Soukromá zubní klinika v centru Hradce Králové. Specializujeme se na dentální hygienu (GBT protokol), implantáty, bělení zubů, endodoncii a komplexní stomatologickou péči. MDDr. Ondřej Král.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Resslova 745/5",
      "addressLocality": "Hradec Králové",
      "addressRegion": "Královéhradecký kraj",
      "postalCode": "500 02",
      "addressCountry": "CZ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 50.216445,
      "longitude": 15.8247235
    },
    "hasMap": "https://maps.google.com/?cid=DK+Kr%C3%A1l+Dent%C3%A1ln%C3%AD+hygiena",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday"],
        "opens": "07:30",
        "closes": "15:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Thursday",
        "opens": "07:30",
        "closes": "14:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Friday",
        "opens": "07:30",
        "closes": "11:30"
      }
    ],
    "priceRange": "$$",
    "currenciesAccepted": "CZK",
    "paymentAccepted": "Cash, Credit Card",
    "areaServed": [
      { "@type": "City", "name": "Hradec Králové" },
      { "@type": "City", "name": "Pardubice" },
      { "@type": "City", "name": "Třebechovice pod Orebem" },
      { "@type": "City", "name": "Nový Bydžov" }
    ],
    "medicalSpecialty": [
      "Dentistry",
      "Oral Surgery",
      "Dental Hygiene",
      "Implantology"
    ],
    "availableService": [
      { "@type": "MedicalProcedure", "name": "Dentální hygiena GBT", "url": "https://dkkral.cz/sluzby" },
      { "@type": "MedicalProcedure", "name": "Zubní implantáty", "url": "https://dkkral.cz/sluzby" },
      { "@type": "MedicalProcedure", "name": "Bělení zubů", "url": "https://dkkral.cz/sluzby" },
      { "@type": "MedicalProcedure", "name": "Endodoncie – kořenové kanálky", "url": "https://dkkral.cz/sluzby" },
      { "@type": "MedicalProcedure", "name": "Keramické fazety a korunky", "url": "https://dkkral.cz/sluzby" },
      { "@type": "MedicalProcedure", "name": "Fotokompozitní výplně", "url": "https://dkkral.cz/sluzby" }
    ],
    "sameAs": [
      "https://dkkral.cz"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Kde se nachází zubař DK KRÁL v Hradci Králové?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Zubní ordinace DK KRÁL se nachází na adrese Resslova 745/5, 500 02 Hradec Králové. Ordinace je snadno dostupná z centra města."
        }
      },
      {
        "@type": "Question",
        "name": "Jaké jsou ordinační hodiny zubaře DK KRÁL?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ordinační hodiny: Pondělí–Středa 7:30–15:30, Čtvrtek 7:30–14:00, Pátek 7:30–11:30. Víkendy zavřeno."
        }
      },
      {
        "@type": "Question",
        "name": "Přijímá DK KRÁL nové pacienty?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ano, DK KRÁL přijímá nové pacienty, zejména na dentální hygienu. Pro objednání zavolejte na +420 770 600 076 nebo napište na recepce@dkkral.cz."
        }
      },
      {
        "@type": "Question",
        "name": "Kolik stojí dentální hygiena v DK KRÁL?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vstupní ošetření dentální hygienistkou pro dospělé stojí 2 280 Kč, pro děti do 15 let 1 140 Kč. Opakované ošetření (RECALL) od 1 140 Kč."
        }
      },
      {
        "@type": "Question",
        "name": "Nabízí DK KRÁL zubní implantáty?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ano, DK KRÁL nabízí kompletní implantologickou péči. Cena zubního implantátu začíná od 16 000 Kč, korunka na implantát od 15 400 Kč."
        }
      },
      {
        "@type": "Question",
        "name": "Jak probíhá bělení zubů v DK KRÁL?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nabízíme ordinační bělení (3 580 Kč), domácí bělení s nosiči a gely (7 315 Kč) a kombinované bělení (6 745 Kč). Výsledky jsou viditelné ihned po první proceduře."
        }
      }
    ]
  };

  const seoContent = {
    title: {
      cs: 'Zubař Hradec Králové | DK KRÁL – Implantáty, Dentální hygiena, Bělení',
      en: 'Dentist Hradec Králové | DK KRÁL – Implants, Dental Hygiene, Whitening',
    },
    description: {
      cs: 'Soukromá zubní ordinace DK KRÁL v centru Hradce Králové. Implantáty od 16 000 Kč, bělení zubů, dentální hygiena GBT. MDDr. Ondřej Král – objednejte se: +420 770 600 076.',
      en: 'Private dental clinic DK KRÁL in the centre of Hradec Králové. Implants from 16 000 CZK, teeth whitening, GBT dental hygiene. MDDr. Ondřej Král – book: +420 770 600 076.',
    },
    keywords: {
      cs: 'zubař Hradec Králové, zubar Hradec Kralove, zubař HK, zubní ordinace Hradec Králové, dentální hygiena Hradec Králové, implantáty Hradec Králové, bělení zubů Hradec Králové, DK KRÁL, MDDr. Ondřej Král, soukromý zubař HK, záchovná stomatologie, endodoncie HK, keramické korunky HK, fazety HK, GBT hygiena',
      en: 'dentist Hradec Králové, dental hygiene Hradec Králové, implants Hradec Králové, teeth whitening Hradec Králové, DK KRÁL, MDDr. Ondřej Král, private dentist HK',
    },
  };

  return (
    <div className="h-screen overflow-y-auto relative">
      <SEO
        title={seoContent.title[language]}
        description={seoContent.description[language]}
        keywords={seoContent.keywords[language]}
        canonicalUrl="https://dkkral.cz"
        ogImage="https://dkkral.cz/hero-reception.jpg"
        structuredData={[dentistSchema, faqSchema]}
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
