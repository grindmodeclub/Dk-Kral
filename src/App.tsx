import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import NavigationArrows from './components/NavigationArrows';
import Home from './pages/Home';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import Process from './pages/Process';
import Contact from './pages/Contact';
import Admin from './pages/admin/Admin';
import { useSwipe, useKeyboardNavigation } from './hooks/useSwipe';

const pages = ['home', 'services', 'pricing', 'process', 'contact'];

const PAGE_PATHS: Record<string, string> = {
  home: '/',
  services: '/sluzby',
  pricing: '/cenik',
  process: '/prubeh',
  contact: '/kontakt',
};

const PATH_TO_PAGE: Record<string, string> = {
  '/': 'home',
  '/sluzby': 'services',
  '/cenik': 'pricing',
  '/prubeh': 'process',
  '/kontakt': 'contact',
};

type PageProps = {
  language: Language;
  onNavigateNext?: () => void;
  onNavigate?: (pageId: string, sectionId?: string) => void;
  targetSectionId?: string | null;
  onClearTargetSection?: () => void;
};

const pageComponents: Record<string, React.ComponentType<PageProps>> = {
  home: Home,
  services: Services,
  pricing: Pricing,
  process: Process,
  contact: Contact,
};

export type Language = 'cs' | 'en';

function MainSite() {
  const getInitialPageIndex = () => {
    const path = window.location.pathname;
    const pageId = PATH_TO_PAGE[path] || 'home';
    return Math.max(0, pages.indexOf(pageId));
  };

  const [currentPageIndex, setCurrentPageIndex] = useState(getInitialPageIndex);
  const [language, setLanguage] = useState<Language>('cs');
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const previousPageIndex = useRef(currentPageIndex);
  const currentPage = pages[currentPageIndex];

  useEffect(() => {
    const newPath = PAGE_PATHS[currentPage] || '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  }, [currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const pageId = PATH_TO_PAGE[path] || 'home';
      const index = pages.indexOf(pageId);
      if (index !== -1) {
        previousPageIndex.current = currentPageIndex;
        setCurrentPageIndex(index);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPageIndex]);

  useEffect(() => {
    if (!targetSectionId && currentPageIndex !== previousPageIndex.current) {
      window.scrollTo(0, 0);
    }
  }, [currentPageIndex, targetSectionId]);

  const goToNextPage = () => {
    setCurrentPageIndex((prev) => {
      const next = Math.min(prev + 1, pages.length - 1);
      previousPageIndex.current = prev;
      return next;
    });
  };

  const goToPreviousPage = () => {
    setCurrentPageIndex((prev) => {
      const next = Math.max(prev - 1, 0);
      previousPageIndex.current = prev;
      return next;
    });
  };

  const goToPage = (pageId: string, sectionId?: string) => {
    const index = pages.indexOf(pageId);
    if (index !== -1) {
      previousPageIndex.current = currentPageIndex;
      setTargetSectionId(sectionId ?? null);
      setCurrentPageIndex(index);
    }
  };

  const clearTargetSection = () => {
    setTargetSectionId(null);
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNextPage,
    onSwipeRight: goToPreviousPage,
  });

  useKeyboardNavigation(goToPreviousPage, goToNextPage);

  const CurrentPageComponent = pageComponents[currentPage];

  const direction = currentPageIndex > previousPageIndex.current ? 1 : -1;

  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <Header
        onNavigate={goToPage}
        currentPage={currentPage}
        language={language}
        onLanguageChange={setLanguage}
        pages={pages}
      />

      <NavigationArrows
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
        showPrevious={currentPageIndex > 0}
        showNext={currentPageIndex < pages.length - 1}
      />

      <div
        className="w-full h-screen"
        {...swipeHandlers}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'tween',
              ease: [0.25, 0.1, 0.25, 1],
              duration: 0.45,
            }}
            className="absolute inset-0"
            style={{ willChange: 'transform, opacity' }}
          >
            <CurrentPageComponent
              language={language}
              onNavigateNext={goToNextPage}
              onNavigate={goToPage}
              targetSectionId={targetSectionId}
              onClearTargetSection={clearTargetSection}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRoute = () => {
      setIsAdmin(window.location.pathname === '/admin');
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);

    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  if (isAdmin) {
    return (
      <AuthProvider>
        <Admin />
      </AuthProvider>
    );
  }

  return <MainSite />;
}

export default App;
