/**
 * EducationalContentLink.tsx
 *
 * Atom component for linking to educational resources
 * Story 2.7 - FR26 Clinical Reasoning Transparency
 *
 * Displays a link to educational content (article, video, diagram) from Strapi or external sources.
 * Opens content in modal or new tab depending on source.
 */

import React from 'react';
import { Button, Tooltip } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { EducationalResource } from '@types';
import './EducationalContentLink.css';

export interface EducationalContentLinkProps {
	/** Educational resource to link to */
	resource: EducationalResource;
	/** Callback when link is clicked */
	onClick?: (resource: EducationalResource) => void;
	/** Display as button or text link */
	variant?: 'button' | 'text';
	/** Button size (only for button variant) */
	size?: 'small' | 'middle' | 'large';
	/** Custom class name */
	className?: string;
}

/**
 * EducationalContentLink - Link to educational resources
 *
 * Features:
 * - Icon based on resource type (article, video, diagram)
 * - Tooltip with resource description
 * - Opens Strapi content in modal, external links in new tab
 * - Button or text link variants
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```tsx
 * <EducationalContentLink
 *   resource={{
 *     id: '1',
 *     title: 'Understanding Forward Head Posture',
 *     url: '/educational/fhp',
 *     type: 'article',
 *     source: 'strapi',
 *     description: 'Learn about causes and solutions'
 *   }}
 *   onClick={handleResourceClick}
 * />
 * ```
 */
export const EducationalContentLink: React.FC<EducationalContentLinkProps> = ({
	resource,
	onClick,
	variant = 'button',
	size = 'small',
	className = '',
}) => {
	// Select icon based on resource type
	const getIcon = () => {
		switch (resource.type) {
			case 'article':
				return <UntitledIcon name="fileText" size={16} />;
			case 'video':
				return <UntitledIcon name="playCircle" size={16} />;
			case 'diagram':
				return <UntitledIcon name="eye" size={16} />;
			default:
				return <UntitledIcon name="paperclip" size={16} />;
		}
	};

	// Handle click
	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();

		if (onClick) {
			onClick(resource);
		} else {
			// Default behavior: open external links in new tab
			if (resource.source === 'external') {
				window.open(resource.url, '_blank', 'noopener,noreferrer');
			}
		}
	};

	// Format duration for videos
	const formatDuration = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	// Build tooltip content
	const tooltipContent = (
		<div className="educational-content-link__tooltip">
			<div className="educational-content-link__tooltip-title">
				{resource.title}
			</div>
			{resource.description && (
				<div className="educational-content-link__tooltip-description">
					{resource.description}
				</div>
			)}
			{resource.type === 'video' && resource.duration && (
				<div className="educational-content-link__tooltip-duration">
					Duration: {formatDuration(resource.duration)}
				</div>
			)}
			<div className="educational-content-link__tooltip-type">
				{resource.type === 'article' && 'Article'}
				{resource.type === 'video' && 'Video'}
				{resource.type === 'diagram' && 'Diagram'}
			</div>
		</div>
	);

	// Button variant
	if (variant === 'button') {
		return (
			<Tooltip title={tooltipContent} placement="top">
				<Button
					type="link"
					size={size}
					icon={getIcon()}
					onClick={handleClick}
					className={`educational-content-link educational-content-link--button ${className}`}
					aria-label={`Learn more: ${resource.title}`}>
					{resource.title}
				</Button>
			</Tooltip>
		);
	}

	// Text link variant
	return (
		<Tooltip title={tooltipContent} placement="top">
			<a
				href={resource.url}
				onClick={handleClick}
				className={`educational-content-link educational-content-link--text ${className}`}
				target={resource.source === 'external' ? '_blank' : undefined}
				rel={resource.source === 'external' ? 'noopener noreferrer' : undefined}
				aria-label={`Learn more: ${resource.title}`}>
				{getIcon()}
				<span className="educational-content-link__title">
					{resource.title}
				</span>
			</a>
		</Tooltip>
	);
};
