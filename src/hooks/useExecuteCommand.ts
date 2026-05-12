/**
 * useExecuteCommand Hook
 * Story 2.5: Custom hook to get a memoized command execution function
 */

import { useCallback } from 'react';
import { useCommandRegistry } from './useCommandRegistry';

/**
 * Hook to get a memoized command execution function.
 * Handles errors gracefully and logs to console.
 *
 * @returns Function to execute commands by ID
 *
 * @example
 * ```tsx
 * function CommandButton({ commandId }) {
 *   const executeCommand = useExecuteCommand();
 *
 *   const handleClick = async () => {
 *     await executeCommand(commandId);
 *   };
 *
 *   return <button onClick={handleClick}>Execute Command</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Execute with inline async handler
 * function QuickAction() {
 *   const executeCommand = useExecuteCommand();
 *
 *   return (
 *     <button onClick={() => executeCommand('quick-action-id')}>
 *       Quick Action
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Execute multiple commands
 * function BulkActions({ commandIds }) {
 *   const executeCommand = useExecuteCommand();
 *
 *   const handleBulkExecution = async () => {
 *     for (const id of commandIds) {
 *       await executeCommand(id);
 *     }
 *   };
 *
 *   return <button onClick={handleBulkExecution}>Execute All</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom error handling
 * function RobustExecutor({ commandId }) {
 *   const executeCommand = useExecuteCommand();
 *   const [error, setError] = useState(null);
 *
 *   const handleClick = async () => {
 *     setError(null);
 *     try {
 *       await executeCommand(commandId);
 *     } catch (err) {
 *       setError('Command failed, please try again');
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleClick}>Execute</button>
 *       {error && <div className="error">{error}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export const useExecuteCommand = (): ((commandId: string) => Promise<void>) => {
  const registry = useCommandRegistry();

  return useCallback(
    async (commandId: string) => {
      await registry.execute(commandId);
      // Note: Errors are re-thrown to allow caller to handle them
      // Callers should wrap in try/catch for custom error handling
    },
    [registry]
  );
};
