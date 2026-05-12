/**
 * CustomizableDashboard Template Component
 * EPIC-026-S2: Wraps dashboard sections with DragDropContext and Droppable
 *
 * This template component provides the drag-and-drop container for dashboard sections.
 * It accepts an array of sections and an optional onDragEnd callback for reordering logic.
 *
 * Features:
 * - DragDropContext wrapper for all sections
 * - Droppable component with droppableId="dashboard"
 * - Support for loading states
 * - Visual feedback during drag operations (isDraggingOver)
 *
 * @example
 * ```tsx
 * <CustomizableDashboard
 *   sections={dashboardSections}
 *   onDragEnd={(result) => handleReorder(result)}
 * />
 * ```
 */

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Spin } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { DashboardSection } from '../../../types/dashboard';
import './CustomizableDashboard.css';

/**
 * Props for CustomizableDashboard component
 */
export interface CustomizableDashboardProps {
	/** Array of dashboard sections to render */
	sections: DashboardSection[];
	/** Callback fired when drag operation completes */
	onDragEnd?: (result: DropResult) => void;
	/** Loading state for dashboard */
	loading?: boolean;
	/** Custom className for styling */
	className?: string;
}

/**
 * CustomizableDashboard Component
 *
 * Provides drag-and-drop functionality for dashboard sections using react-beautiful-dnd.
 * Sections are filtered by visibility and sorted by order before rendering.
 */
export const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({
	sections,
	onDragEnd,
	loading = false,
	className = '',
}) => {
	/**
	 * Handle drag end event
	 * Passes result to optional onDragEnd callback if provided
	 */
	const handleDragEnd = (result: DropResult) => {
		if (onDragEnd) {
			onDragEnd(result);
		}
	};

	// Loading state
	if (loading) {
		return (
			<div className="customizable-dashboard-loading">
				<Spin size="large" tip="Loading dashboard..." />
			</div>
		);
	}

	// Filter visible sections and sort by order
	const visibleSections = sections
		.filter(section => section.visibility)
		.sort((a, b) => a.order - b.order);

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Droppable droppableId="dashboard">
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className={`customizable-dashboard ${
							snapshot.isDraggingOver ? 'dragging-over' : ''
						} ${className}`}>
						{/* EPIC-026-S3: Wrap each section in Draggable component */}
						{visibleSections.map((section, index) => (
							<Draggable
								key={section.id}
								draggableId={section.id}
								index={index}>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										className={`dashboard-section ${
											snapshot.isDragging ? 'dragging' : ''
										}`}>
										{/* Drag handle - only visible on hover (desktop only) */}
										<div
											{...provided.dragHandleProps}
											className="drag-handle"
											aria-label={`Drag to reorder ${section.label}`}
											role="button"
											tabIndex={0}>
											<UntitledIcon name="holder" size={16} />
										</div>

										{/* Section content */}
										<div className="section-content">
											{section.component}
										</div>
									</div>
								)}
							</Draggable>
						))}

						{/* Placeholder for drop indicator (provided by react-beautiful-dnd) */}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
};

export default CustomizableDashboard;
