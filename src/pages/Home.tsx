import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Award, Heart, Shield, User, CalendarOff } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';
import SwipeHint from '../components/SwipeHint';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';
import { supabase, TeamMember, PlannedHoliday, FeaturedService } from '../lib/supabase';
import { Language } from '../App';

const translations = {
  heroTitle: {
    cs: 'Zubař Hradec Králové – DK KRÁL',
    en: 'Dentist Hradec Králové – DK KRÁL',
  },
  heroSubtitle: {
    cs: 'Stomatologie v Hradci Králové',
    en: 'Dental Care in Hradec Králové',
  },
  aboutTitle: {
    cs: 'Naše stomatologické služby',
    en: 'Our Dental Services',
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
    cs: 'Náš tým specialistů',
    en: 'Our Team of Specialists',
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
  const [activeHolidays, setActiveHolidays] = useState<PlannedHoliday[]>([]);
  const [featuredServices, setFeaturedServices] = useState<FeaturedService[]>([]);

  useEffect(() => {
    fetchTeamMembers();
    fetchActiveHolidays();
    fetchFeaturedServices();
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

  const fetchActiveHolidays = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('planned_holidays')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', today)
      .order('start_date');

    if (data) {
      setActiveHolidays(data);
    }
  };

  const fetchFeaturedServices = async () => {
    const { data } = await supabase
      .from('featured_services')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (data) {
      setFeaturedServices(data);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const formatOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'numeric', year: 'numeric' };
    const locale = language === 'cs' ? 'cs-CZ' : 'en-GB';
    if (startDate === endDate) return start.toLocaleDateString(locale, formatOptions);
    return `${start.toLocaleDateString(locale, formatOptions)} – ${end.toLocaleDateString(locale, formatOptions)}`;
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

  const faqItems = language === 'cs' ? [
    { q: 'Kde se nachází zubař DK KRÁL v Hradci Králové?', a: 'Zubní ordinace DK KRÁL se nachází na adrese Resslova 745/5, 500 02 Hradec Králové. Ordinace je snadno dostupná z centra města.' },
    { q: 'Jaké jsou ordinační hodiny zubaře DK KRÁL?', a: 'Ordinační hodiny: Pondělí–Středa 7:30–15:30, Čtvrtek 7:30–14:00, Pátek 7:30–11:30. Víkendy zavřeno.' },
    { q: 'Přijímá DK KRÁL nové pacienty?', a: 'Ano, DK KRÁL přijímá nové pacienty, zejména na dentální hygienu. Pro objednání zavolejte na +420 770 600 076 nebo napište na recepce@dkkral.cz.' },
    { q: 'Kolik stojí dentální hygiena v DK KRÁL?', a: 'Vstupní ošetření dentální hygienistkou pro dospělé stojí 2 280 Kč, pro děti do 15 let 1 140 Kč. Opakované ošetření (RECALL) od 1 140 Kč.' },
    { q: 'Nabízí DK KRÁL zubní implantáty?', a: 'Ano, DK KRÁL nabízí kompletní implantologickou péči. Cena zubního implantátu začíná od 16 000 Kč, korunka na implantát od 15 400 Kč.' },
    { q: 'Jak probíhá bělení zubů v DK KRÁL?', a: 'Nabízíme ordinační bělení (3 580 Kč), domácí bělení s nosiči a gely (7 315 Kč) a kombinované bělení (6 745 Kč). Výsledky jsou viditelné ihned po první proceduře.' },
  ] : [
    { q: 'Where is DK KRÁL dental clinic in Hradec Králové?', a: 'DK KRÁL dental clinic is located at Resslova 745/5, 500 02 Hradec Králové. The office is easily accessible from the city centre.' },
    { q: 'What are the opening hours of DK KRÁL?', a: 'Opening hours: Monday–Wednesday 7:30–15:30, Thursday 7:30–14:00, Friday 7:30–11:30. Weekends closed.' },
    { q: 'Does DK KRÁL accept new patients?', a: 'Yes, DK KRÁL accepts new patients, especially for dental hygiene. Call +420 770 600 076 or email recepce@dkkral.cz to book.' },
    { q: 'How much does dental hygiene cost at DK KRÁL?', a: 'Initial dental hygiene for adults costs 2 280 CZK, for children under 15 it is 1 140 CZK. Follow-up (RECALL) from 1 140 CZK.' },
    { q: 'Does DK KRÁL offer dental implants?', a: 'Yes, DK KRÁL provides complete implant care. Dental implant starts from 16 000 CZK, crown on implant from 15 400 CZK.' },
    { q: 'How does teeth whitening work at DK KRÁL?', a: 'We offer in-office whitening (3 580 CZK), home whitening with trays and gels (7 315 CZK), and combined whitening (6 745 CZK). Results are visible immediately.' },
  ];

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
            alt="Zubní ordinace DK KRÁL v Hradci Králové - moderní recepce"
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
              <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">
                {translations.heroTitle[language]}
              </h1>
              <p className="text-3xl md:text-4xl font-light text-dark/80">
                {translations.heroSubtitle[language]}
              </p>
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
                          alt={`${member.full_name} - Zubař DK KRÁL Hradec Králové`}
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

      {activeHolidays.length > 0 && (
        <section className="bg-white px-6 lg:px-12 py-8 relative">
          <div className="max-w-4xl mx-auto relative z-10">
            <Reveal>
              <div className="bg-gradient-to-r from-gold/5 to-gold/10 rounded-xl border-2 border-gold/30 p-6 shadow-md overflow-hidden">
                <div className="flex items-start gap-4 w-full overflow-hidden">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gold/20 rounded-full">
                      <CalendarOff className="text-gold" size={20} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 max-w-full">
                    <h4 className="text-xl font-bold text-dark mb-3">
                      {language === 'cs' ? 'Změny v ordinačních hodinách' : 'Schedule Changes'}
                    </h4>
                    <div className="space-y-3 w-full overflow-hidden">
                      {activeHolidays.map((holiday) => (
                        <div key={holiday.id} className="flex items-start gap-3 text-dark/80 w-full">
                          <div className="w-2 h-2 bg-gold rounded-full flex-shrink-0 mt-2" />
                          <div className="flex-1 min-w-0 max-w-full">
                            <p className="text-base break-words max-w-full">
                              <span className="font-semibold">{formatDateRange(holiday.start_date, holiday.end_date)}</span>
                              <span className="mx-2">|</span>
                              <span>{language === 'en' && holiday.description_en ? holiday.description_en : holiday.description}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-dark/60 italic">
                      {language === 'cs' ? 'V případě akutních problémů kontaktujte pohotovost.' : 'In case of emergencies, please contact emergency services.'}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="bg-white px-6 lg:px-12 py-16 relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <Reveal>
            <article>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6 text-center">
                {language === 'cs' ? 'Přehled služeb a cen' : 'Services & Pricing Overview'}
              </h2>
              <p className="text-base md:text-lg text-dark/60 mb-8 text-center max-w-3xl mx-auto">
                {language === 'cs'
                  ? 'Soukromá zubní klinika v centru Hradce Králové. Specializujeme se na dentální hygienu (GBT protokol), implantáty, bělení zubů, endodoncii a komplexní stomatologickou péči.'
                  : 'Private dental clinic in the centre of Hradec Králové. We specialize in dental hygiene (GBT protocol), implants, teeth whitening, endodontics, and comprehensive dental care.'}
              </p>

              {featuredServices.length > 0 && (
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {featuredServices.map((service) => (
                    <div key={service.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gold hover:shadow-md transition-all">
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
                    </div>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto mb-12">
                <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-gray-200">
                  <caption className="text-lg font-semibold text-dark mb-4">
                    {language === 'cs' ? 'Ordinační hodiny' : 'Opening Hours'}
                  </caption>
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-6 py-3 text-dark font-semibold border-b border-gray-200">
                        {language === 'cs' ? 'Den' : 'Day'}
                      </th>
                      <th className="text-right px-6 py-3 text-dark font-semibold border-b border-gray-200">
                        {language === 'cs' ? 'Hodiny' : 'Hours'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-dark/80 border-b border-gray-100">{language === 'cs' ? 'Pondělí' : 'Monday'}</td>
                      <td className="px-6 py-3 text-right font-medium text-dark border-b border-gray-100">7:30–15:30</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-dark/80 border-b border-gray-100">{language === 'cs' ? 'Úterý' : 'Tuesday'}</td>
                      <td className="px-6 py-3 text-right font-medium text-dark border-b border-gray-100">7:30–15:30</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-dark/80 border-b border-gray-100">{language === 'cs' ? 'Středa' : 'Wednesday'}</td>
                      <td className="px-6 py-3 text-right font-medium text-dark border-b border-gray-100">7:30–15:30</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-dark/80 border-b border-gray-100">{language === 'cs' ? 'Čtvrtek' : 'Thursday'}</td>
                      <td className="px-6 py-3 text-right font-medium text-dark border-b border-gray-100">7:30–14:00</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-dark/80 border-b border-gray-100">{language === 'cs' ? 'Pátek' : 'Friday'}</td>
                      <td className="px-6 py-3 text-right font-medium text-dark border-b border-gray-100">7:30–11:30</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-dark/80">{language === 'cs' ? 'Sobota, Neděle' : 'Saturday, Sunday'}</td>
                      <td className="px-6 py-3 text-right font-medium text-dark/50">{language === 'cs' ? 'Zavřeno' : 'Closed'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-gray-50 px-6 lg:px-12 py-16 relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-8 text-center">
              {language === 'cs' ? 'Časté dotazy' : 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <details key={index} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <summary className="px-6 py-4 cursor-pointer text-lg font-medium text-dark hover:text-gold transition-colors list-none flex items-center justify-between">
                    <span>{item.q}</span>
                    <ChevronDown className="w-5 h-5 text-gold transition-transform group-open:rotate-180 flex-shrink-0 ml-4" />
                  </summary>
                  <div className="px-6 pb-4 text-dark/70 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-dark px-6 lg:px-12 py-12 relative">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <address className="not-italic text-white/80 mb-4 leading-relaxed">
            <strong className="text-white">DK KRÁL – Dentální hygiena a Implantologie</strong><br />
            Resslova 745/5, 500 02 Hradec Králové<br />
            <a href="tel:+420770600076" className="text-gold hover:text-gold/80 transition-colors">+420 770 600 076</a>
            {' | '}
            <a href="mailto:recepce@dkkral.cz" className="text-gold hover:text-gold/80 transition-colors">recepce@dkkral.cz</a>
          </address>
          <a
            href="https://maps.google.com/?cid=15951681850103427233"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-gold hover:text-gold/80 transition-colors underline"
          >
            {language === 'cs' ? 'Zobrazit na Google Maps' : 'View on Google Maps'}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
