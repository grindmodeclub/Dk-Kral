import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, ChevronDown, CalendarOff, Clock } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';
import FloatingCrowns from '../components/FloatingCrowns';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';
import { supabase, PlannedHoliday } from '../lib/supabase';
import { Language } from '../App';

const translations = {
  heroTitle: {
    cs: 'Kontakt',
    en: 'Contact',
  },
  heroSubtitle: {
    cs: 'Ordinační hodiny',
    en: 'Opening Hours',
  },
  sectionTitle: {
    cs: 'Kde nás najdete v Hradci Králové',
    en: 'Where to Find Us in Hradec Králové',
  },
  address: {
    cs: 'Adresa:',
    en: 'Address:',
  },
  phone: {
    cs: 'Telefon',
    en: 'Phone',
  },
  email: {
    cs: 'Email',
    en: 'Email',
  },
  openingHoursTitle: {
    cs: 'Ordinační hodiny',
    en: 'Opening Hours',
  },
  scheduleChanges: {
    cs: 'Změny v ordinačních hodinách',
    en: 'Schedule Changes',
  },
  emergencyNote: {
    cs: 'V případě že se nedovoláte, prosím napište SMS.',
    en: 'In case of emergencies, please send us SMS.',
  },
  closed: {
    cs: 'Zavřeno',
    en: 'Closed',
  },
  days: {
    monday: { cs: 'Pondělí', en: 'Monday' },
    tuesday: { cs: 'Úterý', en: 'Tuesday' },
    wednesday: { cs: 'Středa', en: 'Wednesday' },
    thursday: { cs: 'Čtvrtek', en: 'Thursday' },
    friday: { cs: 'Pátek', en: 'Friday' },
    weekend: { cs: 'Sobota, Neděle', en: 'Saturday, Sunday' },
  },
};

interface ContactProps {
  language: Language;
}

const Contact = ({ language }: ContactProps) => {
  const [activeHolidays, setActiveHolidays] = useState<PlannedHoliday[]>([]);

  useEffect(() => {
    fetchActiveHolidays();
  }, []);

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

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    const locale = language === 'cs' ? 'cs-CZ' : 'en-GB';

    if (startDate === endDate) {
      return start.toLocaleDateString(locale, formatOptions);
    }

    return `${start.toLocaleDateString(locale, formatOptions)} - ${end.toLocaleDateString(locale, formatOptions)}`;
  };

  const getHolidayDescription = (holiday: PlannedHoliday) => {
    if (language === 'en' && holiday.description_en) {
      return holiday.description_en;
    }
    return holiday.description;
  };

  const openingHours = [
    { day: translations.days.monday[language], hours: '7:30-15:30' },
    { day: translations.days.tuesday[language], hours: '7:30-15:30' },
    { day: translations.days.wednesday[language], hours: '7:30-15:30' },
    { day: translations.days.thursday[language], hours: '7:30-14:00' },
    { day: translations.days.friday[language], hours: '7:30-11:30' },
    { day: translations.days.weekend[language], hours: translations.closed[language] },
  ];

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "name": "DK KRÁL – Dentální hygiena a Implantologie",
    "@id": "https://dkkral.cz",
    "url": "https://dkkral.cz/kontakt",
    "telephone": "+420770600076",
    "email": "recepce@dkkral.cz",
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
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+420770600076",
      "contactType": "reservations",
      "availableLanguage": ["Czech", "English"]
    }
  };

  const seoContent = {
    title: {
      cs: 'Kontakt – Zubař Hradec Králové | Ordinační hodiny | DK KRÁL',
      en: 'Contact – Dentist Hradec Králové | Opening Hours | DK KRÁL',
    },
    description: {
      cs: 'Zubní ordinace DK KRÁL: Resslova 745/5, Hradec Králové. Tel: +420 770 600 076. Ordinační hodiny Po–Pá 7:30–15:30. Přijímáme nové pacienty na dentální hygienu.',
      en: 'Dental clinic DK KRÁL: Resslova 745/5, Hradec Králové. Tel: +420 770 600 076. Opening hours Mon–Fri 7:30–15:30. Accepting new patients for dental hygiene.',
    },
    keywords: {
      cs: 'kontakt zubař Hradec Králové, zubní ordinace Resslova HK, objednání zubař HK, ordinační hodiny DK KRÁL, telefon zubař Hradec Králové, adresa zubaře HK, jak se objednat k zubaři Hradec Králové',
      en: 'contact dentist Hradec Králové, dental office opening hours HK, book dentist appointment HK',
    },
  };

  return (
    <div className="h-screen overflow-y-auto relative">
      <SEO
        title={seoContent.title[language]}
        description={seoContent.description[language]}
        keywords={seoContent.keywords[language]}
        canonicalUrl="https://dkkral.cz/kontakt"
        structuredData={contactSchema}
      />
      <BackgroundParticles />

      <section className="min-h-screen relative pt-48 flex flex-col">
        <FloatingCrowns />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center px-6 relative z-10 mt-8"
        >
          <div className="flex flex-col gap-4 items-center w-full max-w-2xl mx-auto">
            <div
              onClick={() => {
                const contentSection = document.getElementById('contact-content');
                if (contentSection) {
                  contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="relative w-full px-8 md:px-16 py-8 md:py-12 bg-white/95 border-2 border-gold/20 rounded-3xl shadow-xl cursor-pointer hover:bg-white hover:border-gold/40 hover:shadow-2xl transition-all"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-dark text-center">
                {translations.heroTitle[language]}
              </h1>
            </div>
            <div
              onClick={() => {
                const hoursSection = document.getElementById('opening-hours');
                if (hoursSection) {
                  hoursSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="relative w-full px-8 md:px-16 py-8 md:py-12 bg-white/95 border-2 border-gold/20 rounded-3xl shadow-xl cursor-pointer hover:bg-white hover:border-gold/40 hover:shadow-2xl transition-all"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-dark text-center">
                {translations.heroSubtitle[language]}
              </h2>
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
              const contentSection = document.getElementById('contact-content');
              if (contentSection) {
                contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="cursor-pointer hover:scale-110 transition-transform bg-transparent border-none p-4 pointer-events-auto"
            aria-label="Scroll to contact content"
          >
            <div className="bg-white/90 border-2 border-gold/20 rounded-full p-2 shadow-lg">
              <ChevronDown className="text-gold" size={32} />
            </div>
          </motion.button>
        </div>
      </section>

      <section id="contact-content" className="min-h-screen bg-white px-6 lg:px-12 py-20" style={{ scrollMarginTop: '120px' }}>
        <div className="max-w-6xl mx-auto relative z-10">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
              {translations.sectionTitle[language]}
            </h2>
            <div className="w-24 h-0.5 bg-gold mx-auto" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold">
                <path d="M16 2C11.03 2 7 6.03 7 11C7 17.25 16 30 16 30C16 30 25 17.25 25 11C25 6.03 20.97 2 16 2ZM16 14.5C14.07 14.5 12.5 12.93 12.5 11C12.5 9.07 14.07 7.5 16 7.5C17.93 7.5 19.5 9.07 19.5 11C19.5 12.93 17.93 14.5 16 14.5Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-dark mb-2">{translations.address[language]}</h3>
              <address className="not-italic">
                <a
                  href="https://maps.google.com/?cid=15951681850103427233"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-gold transition-colors"
                >
                  <p className="text-lg text-dark/80 hover:text-gold transition-colors">Resslova 745/5</p>
                  <p className="text-lg text-dark/80 hover:text-gold transition-colors">Hradec Králové</p>
                  <p className="text-lg text-dark/80 hover:text-gold transition-colors">500 02</p>
                </a>
              </address>
              <p className="text-base text-dark/60 mt-2">IČO: 143 45 111</p>
            </div>
          </div>

          <a
            href="https://www.google.com/maps/place/DK+Kr%C3%A1l+-+Dent%C3%A1ln%C3%AD+hygiena/@50.2162561,15.8247741,77m/data=!3m1!1e3!4m15!1m8!3m7!1s0x470c2b26172ee531:0x815dfec9ae6f5708!2sResslova+745%2F5,+500+02+Hradec+Kr%C3%A1lov%C3%A9+2!3b1!8m2!3d50.2164465!4d15.8247182!16s%2Fg%2F11s47cw1y7!3m5!1s0x470c2be7b3a969b3:0xdd5fc2208575f0a1!8m2!3d50.216445!4d15.8247235!16s%2Fg%2F11l6xb5yx8?hl=cs&entry=ttu"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden shadow-lg border border-gray-200 hover:border-gold hover:shadow-xl transition-all cursor-pointer"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2545.3267789757415!2d15.832092576741437!3d50.208246571256186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470c2b5d3e0a8d25%3A0x8f4b7e3c9d5a2b1c!2sResslova%20745%2F5%2C%20500%2002%20Hradec%20Kr%C3%A1lov%C3%A9!5e0!3m2!1scs!2scz!4v1736362890123!5m2!1scs!2scz"
              width="100%"
              height="400"
              style={{ border: 0, filter: 'grayscale(20%)', pointerEvents: 'none' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa ordinace DK KRAL"
            />
          </a>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Reveal delay={0.2}>
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-gold hover:shadow-lg transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
              <Phone className="text-gold" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-dark mb-3">
              {translations.phone[language]}
            </h3>
            <a
              href="tel:+420770600076"
              className="block text-lg text-dark/70 hover:text-gold transition-colors"
            >
              +420 770 600 076
            </a>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-gold hover:shadow-lg transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
              <Mail className="text-gold" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-dark mb-3">
              {translations.email[language]}
            </h3>
            <a
              href="mailto:recepce@dkkral.cz"
              className="block text-lg text-dark/70 hover:text-gold transition-colors"
            >
              recepce@dkkral.cz
            </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.4}>
          <div
            id="opening-hours"
            style={{ scrollMarginTop: '120px' }}
            className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg"
          >
          {activeHolidays.length > 0 && (
            <div className="bg-gradient-to-r from-gold/5 to-gold/10 rounded-xl border-2 border-gold/30 p-6 shadow-md mb-8 overflow-hidden">
              <div className="flex items-start gap-4 w-full overflow-hidden">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gold/20 rounded-full">
                    <CalendarOff className="text-gold" size={20} />
                  </div>
                </div>
                <div className="flex-1 min-w-0 max-w-full">
                  <h4 className="text-xl font-bold text-dark mb-3 break-words">
                    {translations.scheduleChanges[language]}
                  </h4>
                  <div className="space-y-3 w-full overflow-hidden">
                    {activeHolidays.map((holiday) => (
                      <div
                        key={holiday.id}
                        className="flex items-start gap-3 text-dark/80 w-full"
                      >
                        <div className="w-2 h-2 bg-gold rounded-full flex-shrink-0 mt-2" />
                        <div className="flex-1 min-w-0 max-w-full">
                          <p className="text-base break-words max-w-full">
                            <span className="font-semibold">{formatDateRange(holiday.start_date, holiday.end_date)}</span>
                            <span className="mx-2">|</span>
                            <span>{getHolidayDescription(holiday)}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-dark/60 italic break-words max-w-full w-full">
                    {translations.emergencyNote[language]}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gold/10 rounded-full">
              <Clock className="text-gold" size={24} />
            </div>
            <h3 className="text-2xl font-semibold text-dark">
              {translations.openingHoursTitle[language]}
            </h3>
          </div>
          <div className="grid md:grid-cols-2 md:grid-flow-col md:grid-rows-3 gap-4">
            {openingHours.map((item) => (
              <div
                key={item.day}
                className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg hover:bg-gold/10 hover:border-gold/30 border border-transparent transition-all duration-300 cursor-default"
              >
                <span className="text-lg text-dark/80">{item.day}</span>
                <span className={`text-lg font-semibold ${item.hours === translations.closed[language] ? 'text-dark/50' : 'text-dark'}`}>
                  {item.hours}
                </span>
              </div>
            ))}
          </div>
          </div>
        </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Contact;
