/**
 * OClinicalOutcomesPanel Types
 *
 * Type definitions for the clinical outcomes integration panel (FR17).
 *
 * @module components/organisms/OClinicalOutcomesPanel/types
 */

/**
 * Clinical Outcomes Panel Props
 */
export interface ClinicalOutcomesPanelProps {
	/** Patient ID */
	patientId: string;

	/** Panel visibility */
	visible?: boolean;

	/** Close callback */
	onClose?: () => void;

	/** Additional CSS class name */
	className?: string;
}
