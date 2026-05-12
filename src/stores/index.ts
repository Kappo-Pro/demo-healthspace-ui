import {
  AnyAction,
  configureStore,
  ThunkAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// REDUCERS - Clinical Assessments
import functionalGoals from '@stores/clinical/functionalGoals';
import painAssessmentInfoConfig from '@stores/clinical/painAssessment';
import performance from '@stores/clinical/performance';
import rehab from '@stores/clinical/rehab';
import rom from '@stores/clinical/rom';

// Scan Operations
import scan from '@stores/scan';

// Posture Analysis
import PostureAnalysis from '@stores/posture/postureAnalysis';
import postures from '@stores/posture/postures';

// Shared Services
import settings from '@stores/settings/settingsSlice';
import onBoard from '@stores/shared/onBoard';
import user from '@stores/shared/user';
import patientDetail from '@stores/shared/patientDetail';

// Content Management
import reports from '@stores/content/report/reports';
import survey from '@stores/content/survey';

// Dashboard
import dashboard from '@stores/dashboard';

// RTK Query APIs
import { recommendationsApi } from '@services/api/recommendationsApi';
import { rehabApi } from '@stores/clinical/rehab/rehabApi';
import { romApi } from '@stores/clinical/rom/romApi';
import { reportsApi } from '@stores/content/report/reportsApi';
import { surveyApi } from '@stores/content/survey/surveyApi';
import { programsApi } from '@stores/shared/patientDetail/programsApi';
import { settingsApi } from '@services/api/settingsApi';

const stores = configureStore({
  reducer: {
    // Clinical Assessments
    rom,
    rehab,
    performance,
    painAssessment: painAssessmentInfoConfig.reducer,
    functionalGoals,

    // Scan Operations
    scan,

    // Posture Analysis
    postures,
    postureAnalysis: PostureAnalysis,

    // Shared Services
    user,
    settings,
    patientDetail,
    onBoard,

    // Content Management
    reports,
    survey,

    // Dashboard
    dashboard,

    // RTK Query APIs
    [settingsApi.reducerPath]: settingsApi.reducer,
    [surveyApi.reducerPath]: surveyApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [programsApi.reducerPath]: programsApi.reducer,
    [rehabApi.reducerPath]: rehabApi.reducer,
    [romApi.reducerPath]: romApi.reducer,
    [recommendationsApi.reducerPath]: recommendationsApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      settingsApi.middleware,
      surveyApi.middleware,
      reportsApi.middleware,
      programsApi.middleware,
      rehabApi.middleware,
      romApi.middleware,
      recommendationsApi.middleware,
    ),
  devTools: {
    name: 'VitalFlow Portfolio UI',
  },
});

setupListeners(stores.dispatch);

export default stores;

export type AppDispatch = typeof stores.dispatch;
export type ReduxState = ReturnType<typeof stores.getState>;
export type RootState = ReduxState;
export type TypedDispatch = ThunkDispatch<ReduxState, unknown, AnyAction>;
export type TypedThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  ReduxState,
  unknown,
  AnyAction
>;
export const useTypedDispatch = () => useDispatch<TypedDispatch>();
export const useTypedSelector: TypedUseSelectorHook<ReduxState> = useSelector;
