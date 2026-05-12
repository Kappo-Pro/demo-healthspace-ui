import { router } from '@routers/routers';
import { lazyLoad } from '@utils/lazyLoad';
import { Route, Routes, Navigate } from 'react-router-dom';

const Patient = lazyLoad(() => import('./Patient'));

/**
 * Private Router
 * In the demo version, this defaults to the Patient experience.
 */
function Private() {
  return (
    <Routes>
      <Route
        path="/login/callback"
        element={<Navigate to={router.DASHBOARD} replace />}
      />
      {/* Default to Patient routes for the portfolio demo */}
      <Route path="*" element={<Patient />} />
    </Routes>
  );
}

export default Private;
