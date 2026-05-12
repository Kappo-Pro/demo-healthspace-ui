import { BrowserRouter, useLocation } from 'react-router-dom';
import { lazyLoad } from '@utils/lazyLoad';
import { AuthProvider, UseAuth } from '@contexts/AuthContext';

const Public = lazyLoad(() => import('@routers/Public'));
const Private = lazyLoad(() => import('@routers/Private'));

/**
 * VitalFlow Main Router
 * Handles top-level routing and optional authentication for the demo.
 */
function Routers() {
  const location = useLocation();
  const { isAuthenticated } = UseAuth();

  // For the portfolio demo, we allow access to the dashboard by default
  // but keep the Private/Public separation for architecture demonstration.
  const isPublicRoute = location.pathname === '/login' || location.pathname === '/signup';

  if (isPublicRoute) {
    return <Public />;
  }

  // In a real app, this would be: return isAuthenticated ? <Private /> : <Public />;
  // For the demo, we default to Private (the Dashboard) to show off the app.
  return <Private />;
}

function Index() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routers />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default Index;
