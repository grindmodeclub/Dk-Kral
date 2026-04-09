import { motion } from 'framer-motion';
import { ClipboardList, Search, Stethoscope, Shield, ChevronDown } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';
import SEO from '../components/SEO';
import { Language } from '../App';

const translations = {
  heroTitle: {
    cs: 'Průběh léčby',
    en: 'Treatment Process',
  },
  sectionTitle: {
    cs: 'Vaše cesta ke zdravému úsměvu',
    en: 'Your Path to a Healthy Smile',
  },
  sectionSubtitle: {
    cs: 'Čtyři kroky k dokonalému výsledku',
    en: 'Four steps to perfect results',
  },
  step: {
    cs: 'KROK',
    en: 'STEP',
  },
  steps: {
    examination: {
      title: { cs: 'Vstupní prohlídka', en: 'Initial Examination' },
      description: {
        cs: 'Komplexní vyšetření dutiny ústní včetně RTG diagnostiky.',
        en: 'Comprehensive oral cavity examination including X-ray diagnostics.',
      },
    },
    plan: {
      title: { cs: 'Návrh terapie', en: 'Treatment Plan' },
      description: {
        cs: 'Na základě vyšetření pro vás sestavíme plán léčby.',
        en: 'Based on the examination, we will create a treatment plan for you.',
      },
    },
    treatment: {
      title: { cs: 'Léčba', en: 'Treatment' },
      description: {
        cs: 'Bezbolestné a šetrné ošetření s využitím nejmodernějších technologií.',
        en: 'Painless and gentle treatment using the latest technologies.',
      },
    },
    prevention: {
      title: { cs: 'Prevence', en: 'Prevention' },
      description: {
        cs: 'Pravidelná dentální hygiena a kontroly pro dlouhodobé zdraví zubů.',
        en: 'Regular dental hygiene and check-ups for long-term dental health.',
      },
    },
  },
};

interface ProcessProps {
  language: Language;
}

const Process = ({ language }: ProcessProps) => {
  const steps = [
    {
      icon: Search,
      number: '1',
      title: translations.steps.examination.title[language],
      description: translations.steps.examination.description[language],
    },
    {
      icon: ClipboardList,
      number: '2',
      title: translations.steps.plan.title[language],
      description: translations.steps.plan.description[language],
    },
    {
      icon: Stethoscope,
      number: '3',
      title: translations.steps.treatment.title[language],
      description: translations.steps.treatment.description[language],
    },
    {
      icon: Shield,
      number: '4',
      title: translations.steps.prevention.title[language],
      description: translations.steps.prevention.description[language],
    },
  ];

  const seoContent = {
    title: {
      cs: 'Průběh léčby u zubaře Hradec Králové | Jak ošetření probíhá | DK KRÁL',
      en: 'Dental Treatment Process Hradec Králové | How It Works | DK KRÁL',
    },
    description: {
      cs: 'Jak probíhá ošetření u zubaře DK KRÁL v Hradci Králové? Vstupní prohlídka, RTG, návrh terapie, bezbolestná léčba a pravidelná dentální hygiena pro zdravý chrup.',
      en: 'How does dental treatment at DK KRÁL in Hradec Králové work? Initial X-ray examination, treatment plan, painless care and regular hygiene for long-term dental health.',
    },
    keywords: {
      cs: 'průběh léčby zubař Hradec Králové, vstupní prohlídka zubař HK, návrh terapie zubař, bezbolestné ošetření zubů HK, prevence zubního kazu HK, jak probíhá implantát HK, přijetí do péče zubař Hradec Králové',
      en: 'dental treatment process Hradec Králové, initial dental examination HK, painless dental treatment HK',
    },
  };

  return (
    <div className="h-screen overflow-y-auto relative scroll-smooth">
      <SEO
        title={seoContent.title[language]}
        description={seoContent.description[language]}
        keywords={seoContent.keywords[language]}
        canonicalUrl="https://dkkral.cz/prubeh"
      />
      <BackgroundParticles />

      <section className="min-h-screen relative pt-48 flex flex-col">
        <div className="absolute inset-0 z-0">
          <img
            src="/prubeh_lecby.jpg"
            alt="Dental treatment process"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white/60" />
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
                const contentSection = document.getElementById('process-content');
                if (contentSection) {
                  contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
              const contentSection = document.getElementById('process-content');
              if (contentSection) {
                contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="cursor-pointer hover:scale-110 transition-transform bg-transparent border-none p-4 pointer-events-auto"
            aria-label="Scroll to process content"
          >
            <div className="bg-white/50 rounded-full p-2">
              <ChevronDown className="text-gold" size={32} />
            </div>
          </motion.button>
        </div>
      </section>

      <section id="process-content" className="bg-white px-6 lg:px-12 py-20 pb-32" style={{ scrollMarginTop: '120px' }}>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
              {translations.sectionTitle[language]}
            </h2>
            <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
            <p className="text-lg text-dark/70 max-w-2xl mx-auto">
              {translations.sectionSubtitle[language]}
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gold/30 -translate-x-1/2" />

            <div className="hidden lg:block space-y-24">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="relative"
                >
                  <div className="flex items-center justify-center absolute left-1/2 top-0 -translate-x-1/2 z-20">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1 + 0.15,
                        ease: "easeOut"
                      }}
                      className="bg-gold rounded-full p-6 flex items-center justify-center w-20 h-20 shadow-xl"
                    >
                      <step.icon className="text-white" size={32} />
                    </motion.div>
                  </div>

                  <div className="flex justify-center">
                    <div className={`w-full max-w-md ${index % 2 === 0 ? 'mr-auto pr-16' : 'ml-auto pl-16'}`}>
                      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-gold hover:shadow-xl transition-all duration-300">
                        <div className="text-gold text-sm font-semibold mb-2 tracking-wider text-center">
                          {translations.step[language]} {step.number}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-dark mb-4 text-center">
                          {step.title}
                        </h3>
                        <p className="text-base text-dark/70 leading-relaxed text-center">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:hidden space-y-6 max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                    ease: "easeOut"
                  }}
                >
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-gold hover:shadow-lg transition-all duration-300">
                    <div className="p-6 flex items-start gap-4">
                      <div className="bg-gold rounded-full p-4 flex items-center justify-center flex-shrink-0">
                        <step.icon className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="text-gold text-xs font-semibold mb-1 tracking-wider">
                          {translations.step[language]} {step.number}
                        </div>
                        <h3 className="text-xl font-bold text-dark mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-dark/70 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Process;
