/**
 * useUnsavedChanges Hook
 *
 * Epic 1 - Story 1.5: Custom hook for blocking navigation with unsaved changes
 *
 * Features:
 * - Handles browser beforeunload event (refresh/close tab)
 * - Compatible with React Router v6 BrowserRouter
 *
 * Note: useBlocker from react-router-dom requires createBrowserRouter (data router).
 * This app uses BrowserRouter, so we only implement beforeunload protection.
 * For full navigation blocking, the app would need to migrate to createBrowserRouter.
 */

import { useEffect } from 'react';

export interface UseUnsavedChangesOptions {
  /** Whether there are unsaved changes */
  hasChanges: boolean;
  /** Custom message to display (optional) */
  message?: string;
}

const DEFAULT_MESSAGE =
  'You have unsaved changes. Are you sure you want to leave this page?';

/**
 * Custom hook to block navigation when there are unsaved changes
 *
 * Currently blocks:
 * - Browser navigation (using beforeunload event - refresh/close tab)
 *
 * Future enhancement: Add React Router navigation blocking when migrating to createBrowserRouter
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * function SettingsForm() {
 *   const [formData, setFormData] = useState(initialData);
 *   const [isDirty, setIsDirty] = useState(false);
 *
 *   useUnsavedChanges({
 *     hasChanges: isDirty,
 *     message: 'Your settings have not been saved. Leave anyway?',
 *   });
 *
 *   return <Form onChange={() => setIsDirty(true)} />;
 * }
 * ```
 */
export function useUnsavedChanges({
  hasChanges,
  message = DEFAULT_MESSAGE,
}: UseUnsavedChangesOptions): void {
  /**
   * Note: useBlocker requires createBrowserRouter (React Router v6.4+ data router)
   * This app currently uses BrowserRouter, so useBlocker is not available.
   *
   * To enable in-app navigation blocking:
   * 1. Migrate from BrowserRouter to createBrowserRouter in src/routers/index.tsx
   * 2. Uncomment the useBlocker implementation below
   */

  // TODO: Uncomment when migrating to createBrowserRouter
  // const blocker = useBlocker(hasChanges);
  // useEffect(() => {
  //   if (blocker.state === 'blocked') {
  //     Modal.confirm({
  //       title: 'Unsaved Changes',
  //       content: message,
  //       okText: 'Stay on Page',
  //       cancelText: 'Leave Page',
  //       okButtonProps: { type: 'primary' },
  //       cancelButtonProps: { danger: true },
  //       onOk: () => blocker.reset(),
  //       onCancel: () => blocker.proceed(),
  //     });
  //   }
  // }, [blocker, message]);

  /**
   * Handle browser beforeunload event (refresh/close tab)
   * Only active when hasChanges=true
   */
  useEffect(() => {
    if (!hasChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Standard way to trigger browser confirmation dialog
      e.preventDefault();

      // Chrome requires returnValue to be set
      e.returnValue = message;

      // Some browsers use the return value
      return message;
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup: remove event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges, message]);
}

export default useUnsavedChanges;
