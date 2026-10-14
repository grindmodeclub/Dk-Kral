import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import NavigationArrows from './components/NavigationArrows';
import Home from './pages/Home';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import Process from './pages/Process';
import Contact from './pages/Contact';
import { useSwipe, useKeyboardNavigation } from './hooks/useSwipe';

// Administrácia sa načítava samostatne, verejné stránky ju nepotrebujú
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

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

/** „/sluzby/“, „/sluzby.html“ a „/index.html“ → kanonický tvar bez lomky na konci. */
const normalizePath = (path: string) => {
  const clean = path.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/+$/, '');
  return clean || '/';
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

const currentPath = (initialPath?: string) =>
  initialPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/');

function MainSite({ initialPath }: { initialPath?: string }) {
  const getInitialPageIndex = () => {
    const pageId = PATH_TO_PAGE[normalizePath(currentPath(initialPath))];
    if (!pageId) return 0;
    return Math.max(0, pages.indexOf(pageId));
  };

  const [currentPageIndex, setCurrentPageIndex] = useState(getInitialPageIndex);
  const [language, setLanguage] = useState<Language>('cs');
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const previousPageIndex = useRef(currentPageIndex);
  const isFirstRender = useRef(true);
  const currentPage = pages[currentPageIndex];

  useEffect(() => {
    const newPath = PAGE_PATHS[currentPage] || '/';
    if (window.location.pathname !== newPath) {
      // Pri prvom načítaní len zjednotíme URL (napr. lomka na konci), do histórie nič nepridávame
      if (isFirstRender.current) {
        window.history.replaceState(null, '', newPath + window.location.search + window.location.hash);
      } else {
        window.history.pushState(null, '', newPath);
      }
    }
    isFirstRender.current = false;
  }, [currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      const path = normalizePath(window.location.pathname);
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

      <main
        className="w-full h-screen"
        {...swipeHandlers}
      >
        {/* initial={false}: prvá (prerenderovaná) stránka je hneď na mieste, swipe medzi stránkami ostáva animovaný */}
        <AnimatePresence mode="wait" custom={direction} initial={false}>
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
      </main>
    </div>
  );
}

const isAdminPath = (path: string) => path === '/admin' || path.startsWith('/admin/');

function App({ initialPath }: { initialPath?: string }) {
  const [isAdmin, setIsAdmin] = useState(() => isAdminPath(currentPath(initialPath)));

  useEffect(() => {
    const handlePopState = () => {
      setIsAdmin(isAdminPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isAdmin) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <AdminApp />
      </Suspense>
    );
  }

  return <MainSite initialPath={initialPath} />;
}

export default App;
