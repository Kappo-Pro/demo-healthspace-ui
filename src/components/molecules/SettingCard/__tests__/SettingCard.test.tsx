/**
 * SettingCard Unit Tests
 *
 * Epic 1 - Story 1.4: Test Suite for SettingCard Molecule Component
 *
 * Coverage Target: 80%
 *
 * Test Strategy:
 * 1. Test rendering with all prop variations
 * 2. Test badge rendering (Super Admin, Beta, New)
 * 3. Test loading state
 * 4. Test error/success states
 * 5. Test help link rendering
 * 6. Test ARIA attributes
 * 7. Test accessibility features
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingCard } from '../index';

// ============================================================================
// BASIC RENDERING TESTS
// ============================================================================

describe('SettingCard - Basic Rendering', () => {
  it('should render label and children', () => {
    render(
      <SettingCard label="Test Setting">
        <input type="text" placeholder="Test input" />
      </SettingCard>
    );

    expect(screen.getByText('Test Setting')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <SettingCard label="Test Setting" description="This is a test description">
        <div>Content</div>
      </SettingCard>
    );

    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    const { container } = render(
      <SettingCard label="Test Setting">
        <div>Content</div>
      </SettingCard>
    );

    // Description paragraph should not exist
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SettingCard label="Test Setting" className="custom-class">
        <div>Content</div>
      </SettingCard>
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });
});

// ============================================================================
// BADGE TESTS
// ============================================================================

describe('SettingCard - Badge Rendering', () => {
  it('should render Super Admin badge with purple color', () => {
    render(
      <SettingCard label="Test Setting" badge="Super Admin">
        <div>Content</div>
      </SettingCard>
    );

    const badge = screen.getByText('Super Admin');
    expect(badge).toBeInTheDocument();

    // Check badge color (Ant Design applies color via className)
    const badgeElement = badge.closest('.ant-badge');
    expect(badgeElement).toBeInTheDocument();
  });

  it('should render Beta badge with blue color', () => {
    render(
      <SettingCard label="Test Setting" badge="Beta">
        <div>Content</div>
      </SettingCard>
    );

    const badge = screen.getByText('Beta');
    expect(badge).toBeInTheDocument();
  });

  it('should render New badge with green color', () => {
    render(
      <SettingCard label="Test Setting" badge="New">
        <div>Content</div>
      </SettingCard>
    );

    const badge = screen.getByText('New');
    expect(badge).toBeInTheDocument();
  });

  it('should not render badge when not provided', () => {
    const { container } = render(
      <SettingCard label="Test Setting">
        <div>Content</div>
      </SettingCard>
    );

    const badge = container.querySelector('.ant-badge');
    expect(badge).not.toBeInTheDocument();
  });
});

// ============================================================================
// LOADING STATE TESTS
// ============================================================================

describe('SettingCard - Loading State', () => {
  it('should render spinner when loading is true', () => {
    render(
      <SettingCard label="Test Setting" loading={true}>
        <div>Content</div>
      </SettingCard>
    );

    // Ant Design Spin component has class ant-spin
    const spinner = document.querySelector('.ant-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should not render children when loading', () => {
    render(
      <SettingCard label="Test Setting" loading={true}>
        <div data-testid="child-content">Content</div>
      </SettingCard>
    );

    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('should render children when loading is false', () => {
    render(
      <SettingCard label="Test Setting" loading={false}>
        <div data-testid="child-content">Content</div>
      </SettingCard>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render children by default (loading not specified)', () => {
    render(
      <SettingCard label="Test Setting">
        <div data-testid="child-content">Content</div>
      </SettingCard>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});

// ============================================================================
// ERROR & SUCCESS STATE TESTS
// ============================================================================

describe('SettingCard - Error State', () => {
  it('should render error alert when error prop is provided', () => {
    render(
      <SettingCard label="Test Setting" error="Something went wrong">
        <div>Content</div>
      </SettingCard>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Check for error icon (Ant Design Alert with type="error")
    const alert = document.querySelector('.ant-alert-error');
    expect(alert).toBeInTheDocument();
  });

  it('should not render error alert when error is not provided', () => {
    render(
      <SettingCard label="Test Setting">
        <div>Content</div>
      </SettingCard>
    );

    const alert = document.querySelector('.ant-alert-error');
    expect(alert).not.toBeInTheDocument();
  });
});

describe('SettingCard - Success State', () => {
  it('should render success alert when success is true', () => {
    render(
      <SettingCard label="Test Setting" success={true}>
        <div>Content</div>
      </SettingCard>
    );

    expect(screen.getByText('Saved successfully')).toBeInTheDocument();

    // Check for success icon (Ant Design Alert with type="success")
    const alert = document.querySelector('.ant-alert-success');
    expect(alert).toBeInTheDocument();
  });

  it('should not render success alert when success is false', () => {
    render(
      <SettingCard label="Test Setting" success={false}>
        <div>Content</div>
      </SettingCard>
    );

    const alert = document.querySelector('.ant-alert-success');
    expect(alert).not.toBeInTheDocument();
  });

  it('should not render success alert when error is present', () => {
    render(
      <SettingCard label="Test Setting" success={true} error="Error message">
        <div>Content</div>
      </SettingCard>
    );

    // Error takes precedence
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Saved successfully')).not.toBeInTheDocument();
  });
});

// ============================================================================
// HELP LINK TESTS
// ============================================================================

describe('SettingCard - Help Link', () => {
  it('should render help link with default text', () => {
    render(
      <SettingCard
        label="Test Setting"
        description="Description text"
        helpLink="https://example.com/help"
      >
        <div>Content</div>
      </SettingCard>
    );

    const link = screen.getByText('Learn more');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/help');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render help link with custom text', () => {
    render(
      <SettingCard
        label="Test Setting"
        description="Description text"
        helpLink="https://example.com/help"
        helpLinkText="View documentation"
      >
        <div>Content</div>
      </SettingCard>
    );

    const link = screen.getByText('View documentation');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/help');
  });

  it('should not render help link when helpLink is not provided', () => {
    render(
      <SettingCard label="Test Setting" description="Description text">
        <div>Content</div>
      </SettingCard>
    );

    const link = screen.queryByText('Learn more');
    expect(link).not.toBeInTheDocument();
  });

  it('should render help link without description', () => {
    render(
      <SettingCard label="Test Setting" helpLink="https://example.com/help">
        <div>Content</div>
      </SettingCard>
    );

    const link = screen.getByText('Learn more');
    expect(link).toBeInTheDocument();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('SettingCard - Accessibility', () => {
  it('should have proper ARIA role', () => {
    const { container } = render(
      <SettingCard label="Test Setting">
        <div>Content</div>
      </SettingCard>
    );

    const card = container.querySelector('[role="region"]');
    expect(card).toBeInTheDocument();
  });

  it('should have aria-labelledby pointing to label', () => {
    const { container } = render(
      <SettingCard label="Test Setting">
        <div>Content</div>
      </SettingCard>
    );

    const card = container.querySelector('[role="region"]');
    const labelledBy = card?.getAttribute('aria-labelledby');

    expect(labelledBy).toBeTruthy();

    // Verify the ID exists in the document
    if (!labelledBy) {
      throw new Error('aria-labelledby attribute is missing');
    }
    const label = document.getElementById(labelledBy);
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Test Setting');
  });

  it('should have aria-describedby when description exists', () => {
    const { container } = render(
      <SettingCard label="Test Setting" description="This is a description">
        <div>Content</div>
      </SettingCard>
    );

    const card = container.querySelector('[role="region"]');
    const describedBy = card?.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();

    // Verify the ID exists in the document
    if (!describedBy) {
      throw new Error('aria-describedby attribute is missing');
    }
    const description = document.getElementById(describedBy);
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('This is a description');
  });

  it('should not have aria-describedby when description is missing', () => {
    const { container } = render(
      <SettingCard label="Test Setting">
        <div>Content</div>
      </SettingCard>
    );

    const card = container.querySelector('[role="region"]');
    const describedBy = card?.getAttribute('aria-describedby');

    expect(describedBy).toBeFalsy();
  });

  it('should have aria-live="polite" for status messages', () => {
    const { container } = render(
      <SettingCard label="Test Setting" error="Error message">
        <div>Content</div>
      </SettingCard>
    );

    const statusContainer = container.querySelector('[aria-live="polite"]');
    expect(statusContainer).toBeInTheDocument();
    expect(statusContainer).toHaveAttribute('aria-atomic', 'true');
  });

  it('should generate unique IDs for multiple cards', () => {
    const { container } = render(
      <>
        <SettingCard label="First Setting" description="First description">
          <div>Content 1</div>
        </SettingCard>
        <SettingCard label="Second Setting" description="Second description">
          <div>Content 2</div>
        </SettingCard>
      </>
    );

    const cards = container.querySelectorAll('[role="region"]');
    expect(cards.length).toBe(2);

    const firstLabelledBy = cards[0].getAttribute('aria-labelledby');
    const secondLabelledBy = cards[1].getAttribute('aria-labelledby');

    // IDs should be different
    expect(firstLabelledBy).not.toBe(secondLabelledBy);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('SettingCard - Integration', () => {
  it('should render all props together correctly', () => {
    render(
      <SettingCard
        label="API Key Setting"
        description="Configure your API key"
        helpLink="https://example.com/help"
        helpLinkText="API Documentation"
        badge="Super Admin"
        error="Invalid API key format"
        className="custom-setting-card"
      >
        <input type="text" placeholder="Enter API key" />
      </SettingCard>
    );

    // Check all elements are rendered
    expect(screen.getByText('API Key Setting')).toBeInTheDocument();
    expect(screen.getByText('Configure your API key')).toBeInTheDocument();
    expect(screen.getByText('API Documentation')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('Invalid API key format')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter API key')).toBeInTheDocument();
  });

  it('should prioritize error over success', () => {
    render(
      <SettingCard
        label="Test Setting"
        error="Error message"
        success={true}
      >
        <div>Content</div>
      </SettingCard>
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Saved successfully')).not.toBeInTheDocument();
  });

  it('should hide children when loading', () => {
    render(
      <SettingCard label="Test Setting" loading={true}>
        <input data-testid="child-input" type="text" />
      </SettingCard>
    );

    expect(screen.queryByTestId('child-input')).not.toBeInTheDocument();
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });
});
