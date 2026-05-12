import { router } from '@routers/routers';
import { lazyLoad } from '@utils/lazyLoad';
import { Route, Routes, Navigate } from 'react-router-dom';

// Non-lazy imports (always needed immediately)
import AppLayoutWrapper from '../components/layouts/AppLayout/AppLayoutWrapper';

// Lazy-loaded page components (code-split for better performance)
const Dashboard = lazyLoad(() => import('@pages/NewPatientOnboardDashboard'));
const Overview = lazyLoad(() => import('@pages/PatientDashboard/SelectedProgram'));
const PostureScan = lazyLoad(() => import('@pages/PostureScan'));
const PostureSummary = lazyLoad(() => import('@pages/AiPosture/AiPostureSummary'));
const RomScan = lazyLoad(() => import('@pages/StartScan'));
const RomSummary = lazyLoad(() => import('@pages/RomSummary'));
const ProgramGenerate = lazyLoad(() => import('@pages/AIAssistantProgram').then(m => ({ default: m.Programs })));
const ProgramSummary = lazyLoad(() => import('@pages/Patient/Conversation/LetsMoveSessions').then(m => ({ default: m.LetsMoveSessions })));
const DesignSystem = lazyLoad(() => import('@pages/DesignSystem'));
const Profile = lazyLoad(() => import('@pages/Profile'));

/**
 * Patient Router
 * Core user experience for the VitalFlow portfolio.
 */
const Patient = () => (
  <Routes>
    <Route element={<AppLayoutWrapper />}>
      {/* Root redirects to Dashboard */}
      <Route path="/" element={<Navigate to={router.DASHBOARD} replace />} />
      
      {/* Main Pages */}
      <Route path={router.DASHBOARD} element={<Dashboard />} />
      <Route path={router.OVERVIEW} element={<Overview />} />
      
      {/* AI Assessments */}
      <Route path={router.POSTURE_SCAN} element={<PostureScan />} />
      <Route path={router.POSTURE_SUMMARY} element={<PostureSummary />} />
      <Route path={router.ROM_SCAN} element={<RomScan />} />
      <Route path={router.ROM_SUMMARY} element={<RomSummary />} />
      
      {/* Programs */}
      <Route path={router.PROGRAM_GENERATE} element={<ProgramGenerate />} />
      <Route path={router.PROGRAM_SUMMARY} element={<ProgramSummary />} />
      
      {/* Settings & System */}
      <Route path={router.DESIGN_SYSTEM} element={<DesignSystem />} />
      <Route path={router.PROFILE} element={<Profile />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to={router.DASHBOARD} replace />} />
    </Route>
  </Routes>
);

export default Patient;
