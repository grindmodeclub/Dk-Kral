import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthProvider } from '../../contexts/AuthContext';
import { setOnDatabaseWrite } from '../../lib/supabase';
import { scheduleRebuild, flushRebuild } from './rebuild';
import Admin from './Admin';

// Vstup do administrácie (samostatný chunk). Nikdy sa neindexuje.
export default function AdminApp() {
  // Každé uloženie v administrácii naplánuje prebudovanie webu
  useEffect(() => {
    setOnDatabaseWrite(scheduleRebuild);
    const onHide = () => document.visibilityState === 'hidden' && flushRebuild();
    document.addEventListener('visibilitychange', onHide);
    return () => {
      setOnDatabaseWrite(null);
      document.removeEventListener('visibilitychange', onHide);
      flushRebuild();
    };
  }, []);

  return (
    <AuthProvider>
      <Helmet>
        <title>Administrace | DK KRÁL</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Admin />
    </AuthProvider>
  );
}
