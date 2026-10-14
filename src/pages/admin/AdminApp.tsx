import { Helmet } from 'react-helmet-async';
import { AuthProvider } from '../../contexts/AuthContext';
import Admin from './Admin';

// Vstup do administrácie (samostatný chunk). Nikdy sa neindexuje.
export default function AdminApp() {
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
