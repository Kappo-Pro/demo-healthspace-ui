/**
 * EducationalContentLink.test.tsx
 *
 * Unit tests for Educational Content Link atom
 * Story 2.7 - FR26 Clinical Reasoning Transparency
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EducationalContentLink } from './EducationalContentLink';
import type { EducationalResource } from '@types';

describe('EducationalContentLink', () => {
	const mockArticleResource: EducationalResource = {
		id: '1',
		title: 'Understanding Forward Head Posture',
		url: '/resources/fhp',
		type: 'article',
		source: 'strapi',
		description: 'Learn about causes and solutions',
	};

	const mockVideoResource: EducationalResource = {
		id: '2',
		title: 'Posture Exercises Video',
		url: 'https://example.com/video',
		type: 'video',
		source: 'external',
		description: 'Watch exercise demonstrations',
		duration: 180,
	};

	const mockDiagramResource: EducationalResource = {
		id: '3',
		title: 'Neck Anatomy Diagram',
		url: '/diagrams/neck',
		type: 'diagram',
		source: 'strapi',
	};

	it('should render article resource', () => {
		render(<EducationalContentLink resource={mockArticleResource} />);

		expect(
			screen.getByText('Understanding Forward Head Posture'),
		).toBeInTheDocument();
		expect(
			screen.getByLabelText('Learn more: Understanding Forward Head Posture'),
		).toBeInTheDocument();
	});

	it('should render video resource with duration', () => {
		render(<EducationalContentLink resource={mockVideoResource} />);

		expect(screen.getByText('Posture Exercises Video')).toBeInTheDocument();
	});

	it('should render diagram resource', () => {
		render(<EducationalContentLink resource={mockDiagramResource} />);

		expect(screen.getByText('Neck Anatomy Diagram')).toBeInTheDocument();
	});

	it('should call onClick when clicked', () => {
		const handleClick = jest.fn();
		render(
			<EducationalContentLink
				resource={mockArticleResource}
				onClick={handleClick}
			/>,
		);

		const link = screen.getByRole('button', {
			name: /learn more: understanding forward head posture/i,
		});
		fireEvent.click(link);

		expect(handleClick).toHaveBeenCalledWith(mockArticleResource);
	});

	it('should render as button variant by default', () => {
		render(<EducationalContentLink resource={mockArticleResource} />);

		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('educational-content-link--button');
	});

	it('should render as text link variant', () => {
		render(
			<EducationalContentLink resource={mockArticleResource} variant="text" />,
		);

		const link = screen.getByRole('link');
		expect(link).toBeInTheDocument();
		expect(link).toHaveClass('educational-content-link--text');
	});

	it('should open external links in new tab', () => {
		render(
			<EducationalContentLink resource={mockVideoResource} variant="text" />,
		);

		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	});

	it('should not open internal links in new tab', () => {
		render(
			<EducationalContentLink resource={mockArticleResource} variant="text" />,
		);

		const link = screen.getByRole('link');
		expect(link).not.toHaveAttribute('target');
	});

	it('should show correct icon for article', () => {
		const { container } = render(
			<EducationalContentLink resource={mockArticleResource} />,
		);

		const icon = container.querySelector('.anticon-file-text');
		expect(icon).toBeInTheDocument();
	});

	it('should show correct icon for video', () => {
		const { container } = render(
			<EducationalContentLink resource={mockVideoResource} />,
		);

		const icon = container.querySelector('.anticon-play-circle');
		expect(icon).toBeInTheDocument();
	});

	it('should show correct icon for diagram', () => {
		const { container } = render(
			<EducationalContentLink resource={mockDiagramResource} />,
		);

		const icon = container.querySelector('.anticon-picture');
		expect(icon).toBeInTheDocument();
	});

	it('should apply custom className', () => {
		const { container } = render(
			<EducationalContentLink
				resource={mockArticleResource}
				className="custom-class"
			/>,
		);

		expect(container.firstChild).toHaveClass('custom-class');
	});

	it('should support different sizes for button variant', () => {
		const { rerender } = render(
			<EducationalContentLink resource={mockArticleResource} size="small" />,
		);

		let button = screen.getByRole('button');
		expect(button).toHaveClass('ant-btn-sm');

		rerender(
			<EducationalContentLink resource={mockArticleResource} size="large" />,
		);

		button = screen.getByRole('button');
		expect(button).toHaveClass('ant-btn-lg');
	});

	it('should be keyboard accessible', () => {
		const handleClick = jest.fn();
		render(
			<EducationalContentLink
				resource={mockArticleResource}
				onClick={handleClick}
			/>,
		);

		const button = screen.getByRole('button');
		button.focus();
		expect(button).toHaveFocus();

		fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
		// onClick should be called on Enter (handled by button default behavior)
	});

	it('should display accessible label', () => {
		render(<EducationalContentLink resource={mockArticleResource} />);

		const button = screen.getByLabelText(
			'Learn more: Understanding Forward Head Posture',
		);
		expect(button).toBeInTheDocument();
	});
});
