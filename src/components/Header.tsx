import { useState } from 'react';
import { Home, Sparkles, Activity, Banknote, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../App';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  pages: string[];
}

const translations = {
  menu: {
    home: { cs: 'Domů', en: 'Home' },
    services: { cs: 'Služby', en: 'Services' },
    pricing: { cs: 'Ceník', en: 'Pricing' },
    process: { cs: 'Průběh', en: 'Treatment Process' },
    contact: { cs: 'Kontakt a ordinační hodiny', en: 'Contact and Office Hours' },
    language: { cs: 'Jazyk', en: 'Language' },
  },
};

const pageConfig = {
  home: { icon: Home, label: { cs: 'Domů', en: 'Home' } },
  services: { icon: Sparkles, label: { cs: 'Služby', en: 'Services' } },
  pricing: { icon: Banknote, label: { cs: 'Ceník', en: 'Pricing' } },
  process: { icon: Activity, label: { cs: 'Průběh', en: 'Process' } },
  contact: { icon: Phone, label: { cs: 'Kontakt', en: 'Contact' } },
};

const Header = ({ onNavigate, currentPage, language, onLanguageChange, pages }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: translations.menu.home },
    { id: 'services', label: translations.menu.services },
    { id: 'pricing', label: translations.menu.pricing },
    { id: 'process', label: translations.menu.process },
    { id: 'contact', label: translations.menu.contact },
  ];

  const handleNavigate = (pageId: string) => {
    onNavigate(pageId);
    setIsMenuOpen(false);
  };

  const currentIndex = pages.indexOf(currentPage);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gold/10">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div
              className="cursor-pointer flex-shrink-0"
              onClick={() => handleNavigate('home')}
            >
              <img
                src="/logo_dk_kral_gold.png"
                alt="DK KRÁL - Zubař Hradec Králové"
                className="h-10 w-auto"
              />
            </div>

            <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
              {pages.map((page, index) => {
                const isActive = page === currentPage;
                const config = pageConfig[page as keyof typeof pageConfig];
                const Icon = config?.icon;
                const isPassed = index < currentIndex;

                if (!config || !Icon) return null;

                return (
                  <motion.button
                    key={page}
                    onClick={() => handleNavigate(page)}
                    className={`flex flex-col items-center gap-1 group cursor-pointer ${
                      isActive ? 'block' : 'hidden md:flex'
                    }`}
                    animate={{
                      scale: isActive ? 1.15 : 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <motion.div
                      className={`relative p-2 rounded-full transition-all ${
                        isActive
                          ? 'bg-gold text-white shadow-lg'
                          : isPassed
                          ? 'bg-gold/20 text-gold'
                          : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                      }`}
                      animate={
                        isActive
                          ? {
                              scale: [1, 1.05, 1],
                              opacity: [1, 0.9, 1],
                            }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Icon size={isActive ? 20 : 18} strokeWidth={2.5} />
                    </motion.div>

                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-semibold text-gold whitespace-nowrap"
                      >
                        {config.label[language]}
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-dark hover:text-gold transition-colors flex-shrink-0 relative w-10 h-10"
              aria-label="Toggle menu"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-5 relative flex flex-col justify-center">
                  <motion.span
                    className="absolute h-0.5 w-6 bg-current rounded-full"
                    animate={{
                      rotate: isMenuOpen ? 45 : 0,
                      y: isMenuOpen ? 0 : -8,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  />
                  <motion.span
                    className="absolute h-0.5 w-6 bg-current rounded-full"
                    animate={{
                      opacity: isMenuOpen ? 0 : 1,
                      x: isMenuOpen ? -20 : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  />
                  <motion.span
                    className="absolute h-0.5 w-6 bg-current rounded-full"
                    animate={{
                      rotate: isMenuOpen ? -45 : 0,
                      y: isMenuOpen ? 0 : 8,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  />
                </div>
              </div>
            </button>
          </div>

          <div className="flex gap-1 max-w-md mx-auto mt-4">
            {pages.map((page, index) => {
              const isPassed = index < currentIndex;
              const isActive = page === currentPage;
              const isNext = index === currentIndex + 1;

              return (
                <button
                  key={page}
                  onClick={() => handleNavigate(page)}
                  className="flex-1 py-3 px-1 cursor-pointer group"
                  aria-label={`Navigate to ${page}`}
                >
                  <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden group-hover:bg-gray-300 transition-colors relative">
                    <motion.div
                      className="h-full bg-gold"
                      initial={{ width: isPassed ? '100%' : '0%' }}
                      animate={{
                        width: isPassed || isActive ? '100%' : '0%',
                      }}
                      transition={{
                        duration: 0.3,
                        ease: 'easeInOut',
                      }}
                    />
                    {isNext && (
                      <motion.div
                        className="absolute inset-0 h-full bg-gold/30"
                        animate={{
                          width: ['0%', '50%', '0%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-[130px] z-[55] bg-black/20"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[130px] left-0 right-0 z-[60] bg-white/85 backdrop-blur-lg border-b border-gold/10 shadow-xl"
            >
            <nav className="container mx-auto px-6 py-8">
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.id)}
                      className={`text-xl font-medium transition-colors w-full text-left py-2 ${
                        currentPage === item.id
                          ? 'text-gold'
                          : 'text-dark hover:text-gold'
                      }`}
                    >
                      {item.label[language]}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-gold/20">
                <p className="text-sm text-dark/60 mb-3">
                  {translations.menu.language[language]}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => onLanguageChange('cs')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      language === 'cs'
                        ? 'bg-gold text-white shadow-md'
                        : 'bg-gray-100 text-dark hover:bg-gray-200'
                    }`}
                  >
                    Čeština
                  </button>
                  <button
                    onClick={() => onLanguageChange('en')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      language === 'en'
                        ? 'bg-gold text-white shadow-md'
                        : 'bg-gray-100 text-dark hover:bg-gray-200'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </nav>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
