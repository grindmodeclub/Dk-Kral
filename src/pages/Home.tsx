import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Award, Heart, Shield, User, CalendarOff } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';
import SwipeHint from '../components/SwipeHint';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';
import HeroImage, { heroSrcSet, HERO_SIZES } from '../components/HeroImage';
import SiteFooter from '../components/SiteFooter';
import { TeamMember, PlannedHoliday, FeaturedService, PriceListItem } from '../lib/supabase';
import {
  useSiteData,
  fetchTeam,
  fetchActiveHolidays,
  fetchFeaturedServices,
  fetchPriceList,
  formatDateRange,
} from '../lib/siteData';
import { BUSINESS, ADDRESS_LINE, openingHoursRows, SITE_URL } from '../lib/business';
import { graph, dentistNode, websiteNode, webPageNode, faqNode } from '../lib/schema';
import { buildFaq } from '../content/faq';
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
  onNavigate?: (pageId: string, sectionId?: string) => void;
}

const Home = ({ language, onNavigateNext, onNavigate }: HomeProps) => {
  const initial = useSiteData();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initial?.team ?? []);
  const [loadingTeam, setLoadingTeam] = useState(!initial);
  const [activeHolidays, setActiveHolidays] = useState<PlannedHoliday[]>(initial?.holidays ?? []);
  const [featuredServices, setFeaturedServices] = useState<FeaturedService[]>(initial?.featuredServices ?? []);
  const [priceList, setPriceList] = useState<PriceListItem[]>(initial?.priceList ?? []);

  useEffect(() => {
    fetchTeam().then(setTeamMembers).catch(() => {}).finally(() => setLoadingTeam(false));
    fetchActiveHolidays().then(setActiveHolidays).catch(() => {});
    fetchFeaturedServices().then(setFeaturedServices).catch(() => {});
    fetchPriceList().then(setPriceList).catch(() => {});
  }, []);

  const features = [
    { icon: Award, title: translations.features.expertise[language] },
    { icon: Heart, title: translations.features.personalApproach[language] },
    { icon: Shield, title: translations.features.safety[language] },
  ];

  const seoContent = {
    title: {
      cs: 'Zubař Hradec Králové | DK KRÁL – Implantáty, Dentální hygiena, Bělení',
      en: 'Dentist Hradec Králové | DK KRÁL – Implants, Dental Hygiene, Whitening',
    },
    description: {
      cs: 'Zubař v Hradci Králové – soukromá zubní ordinace DK KRÁL, Resslova 745/5. Dentální hygiena GBT, implantáty, bělení zubů, fazety a korunky. Objednání: +420 770 600 076.',
      en: 'Dentist in Hradec Králové – private dental clinic DK KRÁL, Resslova 745/5. GBT dental hygiene, implants, teeth whitening, veneers and crowns. Booking: +420 770 600 076.',
    },
    keywords: {
      cs: 'zubař Hradec Králové, zubar Hradec Kralove, zubař HK, zubní ordinace Hradec Králové, dentální hygiena Hradec Králové, implantáty Hradec Králové, bělení zubů Hradec Králové, DK KRÁL, MDDr. Ondřej Král, soukromý zubař HK, záchovná stomatologie, endodoncie HK, keramické korunky HK, fazety HK, GBT hygiena',
      en: 'dentist Hradec Králové, dental hygiene Hradec Králové, implants Hradec Králové, teeth whitening Hradec Králové, DK KRÁL, MDDr. Ondřej Král, private dentist HK',
    },
  };

  const faqItems = buildFaq(language, priceList);

  const structuredData = graph(
    dentistNode(teamMembers),
    websiteNode(),
    webPageNode('home', seoContent.title.cs, seoContent.description.cs),
    faqNode(buildFaq('cs', priceList))
  );

  return (
    <div className="h-screen overflow-y-auto relative">
      <SEO
        title={seoContent.title[language]}
        description={seoContent.description[language]}
        keywords={seoContent.keywords[language]}
        canonicalUrl={`${SITE_URL}/`}
        language={language}
        structuredData={structuredData}
        preloadImage={{ srcSet: heroSrcSet('ordinace-dk-kral'), sizes: HERO_SIZES }}
      />
      <BackgroundParticles />

      <section className="min-h-screen relative pt-48 flex flex-col">
        <div className="absolute inset-0 z-0">
          <HeroImage
            name="ordinace-dk-kral"
            alt="Moderní ošetřovna zubní ordinace DK KRÁL v Hradci Králové"
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
            <p className="text-base md:text-lg text-dark/60 mb-4 text-center max-w-2xl mx-auto">
              {translations.aboutDescription[language]}
            </p>
            <p className="text-base md:text-lg text-dark/60 mb-8 text-center max-w-2xl mx-auto">
              {language === 'cs' ? (
                <>
                  Jako zubař v Hradci Králové nabízíme záchovnou stomatologii, endodoncii, fazety a korunky, chirurgii
                  včetně zubních implantátů a dentální hygienu metodou GBT s bělením zubů. Najdete nás na adrese {ADDRESS_LINE},
                  objednat se můžete na <a href={`tel:${BUSINESS.phone}`} className="text-gold hover:underline">{BUSINESS.phoneDisplay}</a>.
                </>
              ) : (
                <>
                  As a dentist in Hradec Králové we provide restorative dentistry, endodontics, veneers and crowns, surgery
                  including dental implants and GBT dental hygiene with teeth whitening. Find us at {ADDRESS_LINE},
                  book on <a href={`tel:${BUSINESS.phone}`} className="text-gold hover:underline">{BUSINESS.phoneDisplay}</a>.
                </>
              )}
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
                          alt={`${member.role ? member.role + ' ' : ''}${member.full_name} – tým zubní ordinace DK KRÁL, Hradec Králové`}
                          loading="lazy"
                          decoding="async"
                          width={384}
                          height={512}
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
                              <span className="font-semibold">{formatDateRange(holiday.start_date, holiday.end_date, language)}</span>
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
                    {openingHoursRows(language).map((row, i, rows) => (
                      <tr key={row.day} className="hover:bg-gray-50">
                        <td className={`px-6 py-3 text-dark/80 ${i < rows.length - 1 ? 'border-b border-gray-100' : ''}`}>{row.day}</td>
                        <td className={`px-6 py-3 text-right font-medium ${row.hours ? 'text-dark' : 'text-dark/50'} ${i < rows.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          {row.hours ?? (language === 'cs' ? 'Zavřeno' : 'Closed')}
                        </td>
                      </tr>
                    ))}
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

      <SiteFooter language={language} onNavigate={onNavigate} />
    </div>
  );
};

export default Home;
