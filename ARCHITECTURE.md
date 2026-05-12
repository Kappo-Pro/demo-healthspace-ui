# VitalFlow UI - Comprehensive Architecture Analysis

## Project Overview

**VitalFlow** is a healthcare web application built with React 18 and TypeScript that provides AI-assisted physical therapy assessments and patient management. The system supports:

- **Clinical Assessments**: Range of Motion (ROM) analysis, posture evaluation, pain assessment
- **AI Features**: Pose estimation, performance metrics, recommendations
- **Patient Management**: Multi-role triage system (new, reviewed, pending review, out of parameters, escalation required, follow-up required)
- **Coaching Tools**: ROM, Rehab, and Performance coaching interfaces
- **Admin Dashboard**: Patient monitoring, organizational reporting, SDK API key management
- **Advanced Posture Analytics**: 3D posture scanning with clinical outcomes tracking

**Current Version**: 2.0.0  
**Repository**: VitalFlow-UI (Production Frontend)

---

## Core Technologies Stack

### Frontend Framework & Language

- **React**: 18.3.1 - UI component library
- **TypeScript**: 5.4.5 - Static typing for JavaScript
- **React Router**: 6.23.1 - Client-side routing
- **React Redux**: 8.1.3 - State management

### UI & Styling

- **Ant Design**: 5.27.5 - Enterprise component library
- **Tailwind CSS**: Utility-first CSS framework
- **Styled Components**: 6.1.11 - CSS-in-JS for scoped styles
- **CSS Custom Properties**: Design system tokens (primary approach)

### State Management

- **Redux Toolkit**: 1.9.7 - Redux with simplified API
- **RTK Query**: Built into Redux Toolkit - Server state caching

### Build & Tooling

- **CRACO**: Create React App Configuration Override
- **ESBuild**: Fast TypeScript/JavaScript transpiler
- **Webpack**: 5.91.0 - Module bundler with custom splits
- **Babel**: JavaScript compiler
- **Storybook**: 9.x - Component development environment

### Testing

- **Playwright**: 1.56.0 - E2E testing framework (supports Chromium, Firefox, WebKit, Mobile)
- **Jest**: Testing framework (configured via CRACO)
- **Testing Library**: DOM, React, user-event for unit/integration testing
- **Axe Core**: Accessibility testing for Playwright

### ML/AI Libraries

- **TensorFlow.js**: 4.22.0 - ML framework
  - TensorFlow Pose Detection: 2.1.3
  - TensorFlow KNN Classifier: 1.2.6
  - TensorFlow Handpose: 0.1.0
- **MediaPipe**: 0.5+ - Holistic pose estimation
  - Holistic: 0.5.1635989137
  - Pose: 0.5.1635988162
  - Vision Tasks: 0.10.20
- **Fingerpose**: Hand gesture detection

### Backend Integration

- **Axios**: 1.7.2 - HTTP client with interceptors
- **Strapi**: Headless CMS integration (custom implementation in `src/Strapi.ts`)
- **OpenTelemetry**: Observability and tracing

### Internationalization & Accessibility

- **i18next**: 23.11.5 - Translation management
- **React i18next**: 14.1.2 - React bindings for i18next
- **dompurify**: 3.3.0 - HTML sanitization
- **ARIA live regions**: Screen reader support

### Other Key Libraries

- **React Beautiful DnD**: 13.1.1 - Drag and drop
- **React Big Calendar**: 1.19.4 - Calendar components
- **React Joyride**: 2.9.3 - User onboarding tours
- **React Speech Recognition**: 3.10.0 - Voice input
- **Framer Motion**: 12.23.24 - Animation library
- **Recharts**: 3.3.0 - Data visualization
- **Canvas Confetti**: 1.9.3 - Celebration effects

---

## Architecture Patterns

### 1. Component Structure (Atomic Design)

Strict implementation of Atomic Design methodology with TypeScript path aliases:

```
src/components/
├── atoms/           - Basic UI elements (88+ components)
│   ├── Badge/
│   ├── Button/
│   ├── Modal/
│   ├── Loading/
│   ├── CommandPalette/
│   └── ... (basic reusable components)
├── molecules/       - Composite components (20+ directories)
│   ├── FormComponents/
│   ├── WeeklyCalendar/
│   ├── SearchBar/
│   ├── ROMTrendChart/
│   └── ... (compound components)
├── organisms/       - Feature-level components (15+ directories)
│   ├── OAdminTriageDashboard/
│   ├── ProgramFlow/
│   ├── RehabFlow/
│   ├── OPostureDetailView/
│   └── ... (complex feature components)
├── pages/           - Route-mapped page components
│   ├── PatientDashboard.tsx
│   ├── AdminUnassignedPatients.tsx
│   └── ... (full page components)
└── templates/       - Page layouts (sparse usage)
```

**Path Aliases for Components**:

```typescript
@atoms/*      → src/components/atoms/*
@molecules/*  → src/components/molecules/*
@organisms/*  → src/components/organisms/*
@pages/*      → src/components/pages/*
@templates/*  → src/components/templates/*
```

### 2. State Management (Redux Toolkit)

**Centralized store** in `src/stores/index.ts` with **feature-based organization**:

#### Clinical Assessments

- `rom` - Range of Motion assessments
- `rehab` - Rehabilitation programs
- `performance` - Performance metrics
- `painAssessment` - Pain evaluation
- `functionalGoals` - Treatment goals

#### Coaching Tools

- `coachRom`, `coachRehab`, `coachPerformance`

#### Patient Management (Triage)

- `newPatients`, `pendingReview`, `reviewed`
- `outOfParams`, `escalationRequired`, `followUpRequired`
- `adminDashboardPatient` - Admin dashboard state

#### Posture Analysis

- `postures` - Basic posture data
- `postureAnalysis` - Detailed analysis
- `postureAnalytics` - Advanced metrics (Story 1.3)
  - `postureAnalyticsAdminDashboard` (Story 3.1)
  - `postureAnalyticsSelectedSession` (Story 3.2)
  - `bulkOperations` (Story 3.3)
  - `clinicalOutcomes` (Story 3.5)
  - `organizationalMetrics` (Story 3.6)
  - `exerciseTracking` (Story 3.7)
  - `consultation` (Story 4.1)

#### Shared Services

- `user` - Current user authentication
- `userManagement` - User administration
- `adminManagement` - Admin-specific data
- `settings` - Application settings
- `patientDetail` - Detailed patient information
- `voiceAssistant` - Voice features state
- `onBoard` - Onboarding flow
- `consentForms` - Consent tracking

#### Content Management

- `reports` - Report generation
- `myLibrary` - Document library
- `survey` - Survey management

#### Activity & Communication

- `activityStream` - Activity tracking
- `contacts` - Contact management

#### Dashboard & SDK

- `dashboard` - Dashboard metrics
- `dashboardPreferences` (EPIC-027-S1)
- `sdkAPIKeys` - SDK key management

#### RTK Query APIs

- `settingsApi`, `surveyApi`, `userManagementApi`
- `contactsApi`, `reportsApi`, `programsApi`
- `rehabApi`, `romApi`, `recommendationsApi`, `preferenceApi`

**Typed Redux Hooks** (Always use):

```typescript
import { useTypedDispatch, useTypedSelector } from '@stores/index';
```

### 3. Routing System

**Multi-role routing** in `src/routers/`:

- **Private.tsx** - Wrapper for authenticated routes with `react-auth-kit`
- **Admin.tsx** - Admin-specific routes (patient management)
- **Patient.tsx** - Patient-facing routes (dashboard, assessments)
- **SuperAdmin.tsx** - Super admin routes
- **Public.tsx** - Unauthenticated routes (login, callback)
- **SDK.tsx** - SDK routes (no auth required)

**Route Constants** (Always use, never hardcode paths):

- Defined in `src/routers/routers.ts`
- Examples: `router.USERPATIENTVIEW`, `router.NEW_PATIENTS`, `router.OMNIROM`
- Pattern: Dynamic user routes use `:userId` parameter

### 4. Styling System (Three-Layer Architecture)

#### Layer 1: Design System Tokens (Primary)

```
src/styles/
├── design-system.css          (Master entry point - loads first)
├── tokens/
│   ├── primitives.css         (Raw values: colors, spacing, fonts)
│   ├── colors.css             (Figma-extracted color palette)
│   ├── semantic.css           (Purpose-based tokens: text-primary, bg-surface, etc.)
│   ├── layout.css             (AppLayout system tokens)
│   └── polish.css             (Visual polish tokens)
├── themes/
│   ├── default.css            (Purple light theme)
│   ├── light.css              (Light variant)
│   ├── dark.css               (True dark mode)
│   └── vibrant.css            (Harley Davidson theme)
├── antd-theme.ts              (Ant Design theme config - generates from CSS vars)
├── animations.css             (Micro-interactions)
├── fonts.css                  (Font declarations)
├── utilities.css              (Helper classes)
├── focus-visible.css          (WCAG 2.4.7 focus styles)
├── mobile-touch.css           (Touch target optimization)
└── visually-hidden.css        (Screen reader elements)
```

**CSS Custom Properties** (Design tokens):

- Used throughout: `var(--color-primary)`, `var(--spacing-lg)`, etc.
- Theme-aware: Automatically switch with dark mode
- ESLint enforced: Custom rules prevent hardcoded colors/spacing/typography

#### Layer 2: Tailwind CSS (Secondary)

```javascript
// tailwind/tailwind.config.js
// Extends design system theme, all tokens reference CSS custom properties
// Supports automatic theme switching via CSS variables
```

#### Layer 3: Component-Specific Styles

- **Ant Design overrides**: `src/styles/antd-theme.ts` (11KB, generates from CSS vars)
- **App-specific CSS**: `src/Changes.css` (loads after design system)
- **Styled Components**: For scoped component styles
- **Inline styles**: Minimal usage, only when necessary

**Load Order** (Critical for precedence):

1. Design System CSS (`@styles/design-system.css`) - **First**
2. Ant Design theme config
3. App-specific overrides (`Changes.css`)
4. Tailwind utilities

**ESLint Design System Enforcement**:

- `vitalflow/no-hardcoded-colors` (ERROR) - Enforce design tokens for colors
- `vitalflow/no-hardcoded-spacing` (ERROR) - Enforce spacing tokens
- `vitalflow/no-hardcoded-typography` (ERROR) - Enforce typography tokens
- `vitalflow/prefer-semantic-tokens` (WARN) - Encourage semantic over primitive tokens

### 5. Navigation System (October 2025)

**Modern AppLayout System**:

- Centralized type-safe navigation configurations
- Automatic badge integration from Redux state
- Keyboard shortcuts support

**Configuration Files**:

- `src/config/navigation/admin.tsx` - Admin navigation
- `src/config/navigation/superAdmin.tsx` - Super Admin navigation
- `src/config/navigation/user.tsx` - Patient navigation

**Badge Integration Hook**:

- `useNavigationWithBadges` in `AppLayoutWrapper.tsx`
- Auto-counts from Redux state:
  - `all-patients`: `state.adminDashboardPatient.registeredCount`
  - `new-patients`: `state.adminDashboardPatient.statsCount.newUsers`
  - `unassigned`: `state.adminDashboardPatient.unAssignedCount`
  - `escalation-required`: `state.adminDashboardPatient.escalationCount`

### 6. Command Palette System (October 2025)

**Global command interface** accessible via Cmd+K / Ctrl+K:

- Type-safe, role-based command orchestration
- 5-mode state machine: idle, userSearch, userContext, drawerExpanded, programContext
- 30+ grouped routes across 6 categories
- Full arrow key navigation
- Recent users tracking (localStorage, max 5)
- Fuzzy search matching

**Key Components**:

- `src/components/atoms/CommandPalette/CommandPalette.tsx` (416 lines)
- `src/components/atoms/CommandPalette/reducer.ts` (State machine)
- `src/components/atoms/CommandPalette/types.ts` (Type definitions)
- `src/components/pages/UserDetailsModal/index.tsx` (User management)

---

## Configuration Files

### Build Configuration

```javascript
// craco.config.js - CRACO (Create React App Configuration Override)
// Plugins: ESBuild (transpilation), Alias (path resolution)
// Webpack: Custom plugins for MediaPipe assets, TensorFlow WASM files
// Dev Server: CORS headers for MediaPipe, WASM content-type handler
```

### TypeScript Configuration

```json
// tsconfig.json
// Strict mode enabled
// Target: ES2022 (modern browsers)
// Module: CommonJS
// jsx: "react-jsx" (automatic JSX transform)
// 48 path aliases configured
```

### ESLint Configuration

```javascript
// .eslintrc.cjs
// Strict rules:
//   - No hardcoded colors/spacing/typography (custom vitalflow rules)
//   - No console.log (allow warn/error/info)
//   - No any type (fixToUnknown: true)
//   - No waitForTimeout (deterministic waits required)
//   - Translation keys must be string literals (no dynamic keys)
```

### Playwright Configuration

```typescript
// playwright.config.ts
// Environment map: local (http://localhost:3000), develop, staging
// Projects: Chromium, Firefox, WebKit, Mobile Chrome/Safari, SDK
// Timeouts: 60s per test, 15s actions, 30s navigation, 10s assertions
// Reporters: HTML, JUnit, List
// CI optimizations: Serialized workers, 2 retries
```

### Tailwind Configuration

```javascript
// tailwind/tailwind.config.js
// Extends design system theme (CSS custom property references)
// Content: src/**/*.{js,ts,jsx,tsx}
```

---

## Development Workflow

### Key npm Scripts

**Development**:

- `npm start` - Start dev server (CRACO)
- `npm run build` - Production build (max_old_space_size=4096)
- `npm run serve` - Serve production build locally

**Linting**:

- `npm run lint` - ESLint check (max-warnings: 0)
- `npm run lint-fix` - Auto-fix ESLint issues
- `npm run lint:tokens` - Design system token enforcement
- `npm run lint:tokens:fix` - Fix token violations

**Testing**:

- `npm test` - Jest tests
- `npm run test:e2e` - All Playwright E2E tests
- `npm run test:e2e:ui` - Playwright UI mode
- `npm run test:e2e:debug` - Playwright debug mode
- `npm run test:e2e:accessibility` - Accessibility tests
- `npm run test:a11y` - AXE accessibility audit
- `npm run test:a11y:ci` - CI accessibility pipeline

**Storybook**:

- `npm run storybook` - Dev server (port 6006)
- `npm run build-storybook` - Static build

**Analysis**:

- `npm run analyze:bundle` - Bundle size report
- `npm run analyze:patterns` - Optimization opportunities
- `npm run analyze:components` - Component usage analysis
- `npm run analyze:translations` - Translation coverage

**i18n (Internationalization)**:

- `npm run i18n:add` - Add translation keys (interactive)
- `npm run i18n:unused` - Find unused keys
- `npm run i18n:extract` - Find hardcoded strings
- `npm run i18n:validate` - Validate consistency
- `npm run i18n:cleanup` - Preview unused key cleanup (dry-run)
- `npm run i18n:cleanup:confirm` - Apply cleanup (requires confirmation)

**Token & Component Migration**:

- `npm run migrate-tokens` - Migrate to design system tokens
- `npm run migrate:components` - Migrate to standard components
- `npm run migrate:date` - Migrate from moment.js to date-fns

### Development Commands Used Frequently

1. **Start development server**: `npm start`
2. **Run linting**: `npm run lint` or `npm run lint-fix`
3. **Run E2E tests**: `npm run test:e2e`
4. **Start Storybook**: `npm run storybook`
5. **Build production**: `npm run build`

---

## Project Dependencies Summary

### Key Production Dependencies

- **React ecosystem**: react@18.3.1, react-dom@18.3.1, react-router-dom@6.23.1
- **State management**: @reduxjs/toolkit@1.9.7, react-redux@8.1.3
- **Component library**: antd@5.27.5, @ant-design/charts@1.4.3
- **ML/AI**: @tensorflow/tfjs@4.22.0, @mediapipe/holistic@0.5.x
- **Styling**: styled-components@6.1.11, tailwindcss (implicit via Tailwind)
- **i18n**: i18next@23.11.5, react-i18next@14.1.2
- **Utilities**: lodash@4.17.21, date-fns@2.30.0, axios@1.7.2

### Key Dev Dependencies

- **Build**: @craco/craco@7.1.0, webpack@5.91.0, craco-esbuild@0.6.1
- **Testing**: @playwright/test@1.56.0, jest, @testing-library/react@16.3.0
- **Dev tools**: storybook@9.1.10, typescript@5.4.5, eslint
- **Performance**: @webpack-bundle-analyzer, lighthouse

---

## Path Aliases Reference

```typescript
// Component Aliases
@atoms/*              → src/components/atoms/*
@molecules/*          → src/components/molecules/*
@organisms/*          → src/components/organisms/*
@pages/*              → src/components/pages/*
@templates/*          → src/components/templates/*

// Feature Aliases
@stores/*             → src/stores/*
@services/*           → src/services/*
@hooks/*              → src/hooks/*
@contexts/*           → src/contexts/*
@utils/*              → src/utils/*
@routers/*            → src/routers/*
@constants/*          → src/constants/*
@config/*             → src/config/*
@providers/*          → src/providers/*
@styles/*             → src/styles/*

// Specialized Aliases
@strapi               → src/Strapi.ts
@vitalflow-icons/*    → src/icons/*
@controller/*         → src/poseestimator/controller/*
@rom/*                → src/poseestimator/rom/*
@rehab/*              → src/poseestimator/rehab/*
@performance/*        → src/poseestimator/performance/*
@assets               → src/poseestimator/assets/*
@screens/*            → src/screens/*
@common/*             → src/common/*
@test-utils/*         → src/test-utils/*
@types/*              → src/types/*
@sdk/*                → src/sdk/*
@demo/*               → src/demo/*
```

---

## Important Standards & Patterns

### Component Development

1. **Always create Storybook stories** for new atoms/molecules
2. **Use TypeScript interfaces** for all component props
3. **Prefer function components** with hooks over class components
4. **Export from index.tsx** in component folders
5. **Use path aliases** - never use relative paths like `../../components`

### State Management

1. **Use typed Redux hooks**: `useTypedSelector`, `useTypedDispatch`
2. **Create async thunks** for API calls in slice files
3. **Normalize state shape** - avoid deeply nested objects
4. **Use Redux Toolkit's `createSlice`** for all new slices

### Routing

1. **Import route constants** from `@routers/routers` - never hardcode paths
2. **Use `Private` wrapper** for authenticated routes
3. **Pass `userId` in route params** where needed (`:userId` pattern)

### Styling

1. **Use CSS custom properties** from design system for colors/spacing
2. **Prefer Tailwind utilities** over custom CSS classes
3. **Theme-aware components**: Use `useTheme()` hook for dark mode
4. **Responsive design**: Use Ant Design breakpoints and Tailwind responsive prefixes

### API Integration

1. **Use Strapi client** (`@strapi`) for CMS content
2. **Configure axios** in `@utils/Api` with auth interceptors
3. **Handle loading/error states** in Redux slices

### Translations (i18next)

1. **Always use hooks**: `useTypedTranslation()` or `useTranslation()`
2. **Use nested keys**: `Admin.data.menu.home.home`
3. **Runtime validation**: Type checking in development (zero production overhead)
4. **Never use dynamic keys**: Translation keys must be string literals

### ESLint Enforcement

1. **No hardcoded colors**: Use CSS variables from design system
2. **No console.log**: Use warn/error/info or structured logging
3. **No any types**: Use unknown, then cast as needed
4. **No waitForTimeout**: Use deterministic waits in tests
5. **String literal translation keys**: No dynamic key construction

---

## Testing Strategy

### E2E Testing (Playwright)

- **Test directory**: `e2e/`
- **Multiple environments**: Local, Develop, Staging (via TEST_ENV)
- **Page object model**: Fixtures in `e2e/fixtures/`
- **Phase-based organization**: `phase6-accessibility.spec.ts` pattern
- **Accessibility testing**: `@axe-core/playwright` integration
- **CI optimizations**: Serialized workers, 2 retries

### Unit/Integration Testing

- **Framework**: Jest (via CRACO)
- **Component testing**: `@testing-library/react`
- **User event simulation**: `@testing-library/user-event`

### Accessibility Testing

- **Automated**: Playwright + Axe Core
- **Command**: `npm run test:a11y`
- **CI integration**: `npm run test:a11y:ci`

---

## Build Optimization

### Code Splitting Strategy

- **Webpack splitChunks**: Configured for advanced splitting
- **Vendor bundles**:
  - `vendor-antd` - Ant Design (priority 40)
  - `vendor-tensorflow` - TensorFlow (priority 40)
  - `vendor-mediapipe` - MediaPipe (priority 40)
  - `vendor-react` - React ecosystem (priority 30)
- **maxInitialRequests**: 25
- **maxAsyncRequests**: 30
- **minSize**: 20KB

### Asset Handling

- **MediaPipe files**: Copied to `public/holistic/`
- **TensorFlow WASM**: Copied to `static/js/`
- **Source maps**: Disabled in production (Workbox compatibility)
- **Bundle analyzer**: Optional `npm run analyze:bundle` (ANALYZE=true)

### Memory Configuration

- **Build**: `--max_old_space_size=4096` (4GB allocation)
- **Required for**: Complex ML models and large bundles

---

## Environment Configuration

### Test Environment Setup

- `.env.example` provides template
- Supports: local, develop, staging environments
- Authentication credentials per role (Admin, Patient, SuperAdmin)
- ElevenLabs API for voice features

### Auth Configuration

- **Library**: react-auth-kit@3.1.3
- **Setup**: `e2e/auth.setup.ts` creates storage state
- **Private routes**: Protected by `Private.tsx` wrapper

---

## Documentation Structure

```
docs/
├── design-system-usage.md
├── i18n-cleanup-guide.md
├── i18n-coverage-guide.md
├── accessibility.md
├── DEVELOPMENT_SETUP.md
├── PERSISTENCE.md
├── PRD-POSTURE-SCAN-IMPROVEMENTS.md
└── implementation-reports/
    └── [Epic-specific reports]
```

---

## Key Recent Updates (November 2025)

1. **Typography Improvements**: Inter font readability with optimized letter spacing
2. **User Details Modal**: QR code display with user ID in modal header
3. **Navigation Refactoring**: Removed redundant status dots, applied colors to badges
4. **Theme Persistence**: Resolved theme switching and initialization issues
5. **Layout Alignment**: Header/content container-based padding

---

## Summary

**VitalFlow UI** is a sophisticated healthcare application using:

- **Modern React 18** with TypeScript for type safety
- **Atomic Design** for scalable component architecture
- **Redux Toolkit** for centralized state management
- **Design System** with CSS variables for theme consistency
- **Ant Design 5.x** for polished enterprise components
- **Playwright E2E** for comprehensive testing
- **TensorFlow.js + MediaPipe** for AI/ML features
- **i18next** for internationalization

The architecture prioritizes **component reusability**, **type safety**, **accessibility**, and **maintainability** through strict path aliases, design system enforcement, and well-organized feature-based Redux slices.
