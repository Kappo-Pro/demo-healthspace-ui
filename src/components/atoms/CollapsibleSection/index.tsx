/**
 * CollapsibleSection Atom Component
 *
 * A reusable collapsible section component with:
 * - Smooth expand/collapse animations (300ms)
 * - Full keyboard navigation (Enter/Space to toggle, Esc to collapse)
 * - Complete ARIA attributes for accessibility
 * - Chevron icon rotation indicator
 *
 * @example
 * ```tsx
 * const { t } = useTranslation();
 * <CollapsibleSection title={t('Patient.data.newDashboard.myPrograms')} defaultExpanded={true}>
 *   <ProgramList programs={programs} />
 * </CollapsibleSection>
 * ```
 */

import React, { useState, useCallback, useRef } from 'react';
import { UntitledIcon } from '@atoms/Icon';
import { useCollapsibleState } from '@hooks/useCollapsibleState';
import './styles.css';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CollapsibleSectionProps {
	/** Section title displayed in the header */
	title: string;
	/** Content to show/hide when toggled */
	children: React.ReactNode;
	/** Whether section is expanded by default */
	defaultExpanded?: boolean;
	/** Optional ID for ARIA attributes and persistence */
	sectionId?: string;
	/** Optional className for custom styling */
	className?: string;
	/** Optional callback when section is toggled */
	onToggle?: (isExpanded: boolean) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CollapsibleSection Component
 *
 * Provides expand/collapse functionality with smooth animations and full keyboard support.
 *
 * **Keyboard Navigation:**
 * - `Enter` or `Space`: Toggle expand/collapse
 * - `Escape`: Collapse section (when expanded)
 * - `Tab`: Move focus to/from header
 *
 * **Accessibility:**
 * - Proper ARIA attributes (aria-expanded, aria-controls, aria-hidden)
 * - Keyboard accessible with visible focus indicators
 * - Screen reader announcements for state changes
 * - role="region" for content area
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
	title,
	children,
	defaultExpanded = true,
	sectionId,
	className = '',
	onToggle,
}) => {
	// Use persisted state when sectionId is provided, otherwise use local useState
	const persistedState = sectionId
		? // eslint-disable-next-line react-hooks/rules-of-hooks
			useCollapsibleState({ sectionId, defaultExpanded })
		: undefined;

	const localState = !sectionId
		? // eslint-disable-next-line react-hooks/rules-of-hooks
			useState(defaultExpanded)
		: undefined;

	const isExpanded = sectionId
		? persistedState?.[0] ?? defaultExpanded
		: localState?.[0] ?? defaultExpanded;
	// setIsExpanded is only used for non-persisted state
	const setIsExpanded = sectionId
		? (_value: boolean) => {} // Not used when persisted
		: localState?.[1] ?? (() => {});

	const headerRef = useRef<HTMLButtonElement>(null);

	// Generate unique content ID for ARIA relationship
	const contentId =
		sectionId || `section-${title.replace(/\s+/g, '-').toLowerCase()}`;
	const headerId = `${contentId}-header`;

	/**
	 * Toggle expand/collapse state
	 * Uses persisted toggle when sectionId is provided, otherwise updates local state
	 */
	const toggleExpanded = useCallback(() => {
		if (sectionId && persistedState) {
			// Use persisted toggle function
			persistedState[1]();
			onToggle?.(!isExpanded);
		} else {
			// Use local state
			setIsExpanded(prev => {
				const newState = !prev;
				onToggle?.(newState);
				return newState;
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionId, persistedState, isExpanded, onToggle]);

	/**
	 * Handle keyboard events
	 * - Enter/Space: Toggle
	 * - Escape: Collapse
	 */
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			// Enter or Space to toggle
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				toggleExpanded();
			}
			// Escape to collapse (only when expanded)
			if (event.key === 'Escape' && isExpanded) {
				event.preventDefault();
				if (sectionId && persistedState) {
					// If currently expanded, toggle will collapse it
					persistedState[1]();
				} else {
					setIsExpanded(false);
				}
				onToggle?.(false);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isExpanded, toggleExpanded, onToggle, sectionId, persistedState],
	);

	return (
		<div className={`collapsible-section ${className}`.trim()}>
			{/* Header Button */}
			<button
				ref={headerRef}
				id={headerId}
				className="collapsible-section-header"
				onClick={toggleExpanded}
				onKeyDown={handleKeyDown}
				aria-expanded={isExpanded}
				aria-controls={contentId}
				type="button">
				<h3 className="collapsible-section-title">{title}</h3>
				<UntitledIcon
					name="chevronDown"
					size={16}
					className={`collapsible-section-icon ${isExpanded ? 'expanded' : ''}`}
					aria-hidden="true"
				/>
			</button>

			{/* Content Area */}
			<div
				id={contentId}
				className={`collapsible-section-content ${isExpanded ? 'expanded' : 'collapsed'}`}
				role="region"
				aria-labelledby={headerId}
				aria-hidden={!isExpanded}>
				{children}
			</div>
		</div>
	);
};

export default CollapsibleSection;
