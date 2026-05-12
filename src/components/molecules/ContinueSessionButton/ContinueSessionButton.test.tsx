/**
 * ContinueSessionButton Component Tests
 *
 * Tests for the ContinueSessionButton molecule component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContinueSessionButton } from './ContinueSessionButton';
import type { ContinueSessionButtonProps } from './types';

describe('ContinueSessionButton', () => {
  const defaultProps: ContinueSessionButtonProps = {
    programName: 'Lower Back Program',
    programId: '123',
    sessionId: '456',
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ContinueSessionButton {...defaultProps} />);
      const button = screen.getByTestId('continue-session-button');
      expect(button).toBeInTheDocument();
    });

    it('should display program name in button text', () => {
      render(<ContinueSessionButton {...defaultProps} />);
      expect(screen.getByText(/Continue Lower Back Program/i)).toBeInTheDocument();
    });

    it('should display PlayCircleOutlined icon', () => {
      const { container } = render(<ContinueSessionButton {...defaultProps} />);
      const icon = container.querySelector('.anticon-play-circle');
      expect(icon).toBeInTheDocument();
    });

    it('should have primary type and large size', () => {
      render(<ContinueSessionButton {...defaultProps} />);
      const button = screen.getByTestId('continue-session-button');
      expect(button).toHaveClass('ant-btn-primary');
      expect(button).toHaveClass('ant-btn-lg');
    });

    it('should have correct CSS class', () => {
      render(<ContinueSessionButton {...defaultProps} />);
      const button = screen.getByTestId('continue-session-button');
      expect(button).toHaveClass('continue-session-button');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label with program name', () => {
      render(<ContinueSessionButton {...defaultProps} />);
      const button = screen.getByTestId('continue-session-button');
      expect(button).toHaveAttribute('aria-label', 'Continue Lower Back Program session');
    });

    it('should be keyboard accessible', () => {
      const onClick = jest.fn();
      render(<ContinueSessionButton {...defaultProps} onClick={onClick} />);
      const button = screen.getByTestId('continue-session-button');

      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      // Note: Ant Design Button handles Enter key internally
    });
  });

  describe('Interaction', () => {
    it('should call onClick handler when clicked', () => {
      const onClick = jest.fn();
      render(<ContinueSessionButton {...defaultProps} onClick={onClick} />);
      const button = screen.getByTestId('continue-session-button');

      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should work without onClick handler', () => {
      render(<ContinueSessionButton {...defaultProps} />);
      const button = screen.getByTestId('continue-session-button');

      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe('Text Truncation', () => {
    it('should truncate long program names', () => {
      const longProps: ContinueSessionButtonProps = {
        ...defaultProps,
        programName: 'This is a very long program name that exceeds thirty characters',
      };

      render(<ContinueSessionButton {...longProps} />);
      expect(screen.getByText(/Continue This is a very long program\.\.\.$/i)).toBeInTheDocument();
    });

    it('should not truncate short program names', () => {
      const shortProps: ContinueSessionButtonProps = {
        ...defaultProps,
        programName: 'Short Name',
      };

      render(<ContinueSessionButton {...shortProps} />);
      expect(screen.getByText('Continue Short Name')).toBeInTheDocument();
    });

    it('should preserve full name in aria-label even when truncated', () => {
      const longProps: ContinueSessionButtonProps = {
        ...defaultProps,
        programName: 'This is a very long program name that exceeds thirty characters',
      };

      render(<ContinueSessionButton {...longProps} />);
      const button = screen.getByTestId('continue-session-button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Continue This is a very long program name that exceeds thirty characters session'
      );
    });
  });

  describe('Props Validation', () => {
    it('should accept all required props', () => {
      const props: ContinueSessionButtonProps = {
        programName: 'Test Program',
        programId: 'prog-123',
        sessionId: 'sess-456',
      };

      render(<ContinueSessionButton {...props} />);
      expect(screen.getByTestId('continue-session-button')).toBeInTheDocument();
    });

    it('should accept optional onClick prop', () => {
      const onClick = jest.fn();
      const props: ContinueSessionButtonProps = {
        programName: 'Test Program',
        programId: 'prog-123',
        sessionId: 'sess-456',
        onClick,
      };

      render(<ContinueSessionButton {...props} />);
      expect(screen.getByTestId('continue-session-button')).toBeInTheDocument();
    });
  });
});
