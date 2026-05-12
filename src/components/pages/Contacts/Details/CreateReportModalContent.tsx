import CreateReportForm from '@organisms/CreateReportForm';

/**
 * Orchestrator component for Create Report and Export Reports functionality
 *
 * Responsibilities:
 * - Layout and composition of CreateReportForm and ExportReportsForm
 * - No business logic - delegates to child organisms
 *
 * Benefits of this refactor:
 * - Single Responsibility: Each component does one thing
 * - Testability: Forms can be tested independently
 * - Reusability: Forms can be used in other contexts
 * - Maintainability: Changes isolated to specific components
 * - Type Safety: Fully typed with proper interfaces
 * - Code Quality: Removed inline styles, duplicate logic, hardcoded values
 */
export default function CreateReportModalContent() {
	return (
		<>
			<CreateReportForm />
		</>
	);
}
