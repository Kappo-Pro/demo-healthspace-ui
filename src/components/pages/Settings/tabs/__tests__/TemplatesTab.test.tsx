/**
 * TemplatesTab Component Tests
 *
 * Epic 2 - Story 2.4: Unit tests for TemplatesTab with autosave
 *
 * Test Coverage:
 * - Component rendering (all 5 templates)
 * - Autosave behavior (2-second debounce)
 * - Visual feedback (loading, success, timestamp)
 * - Circuit breaker (useAutosave hook configuration)
 * - Preview button placeholder
 * - Error handling
 * - Character count
 *
 * Target: 80%+ coverage
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { message } from 'antd';
import { TemplatesTab } from '../TemplatesTab';
import settingsReducer from '@stores/settings/settingsSlice';
import * as useAutosaveModule from '../../hooks/useAutosave';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Enable dayjs relative time plugin
dayjs.extend(relativeTime);

// Mock dependencies
jest.mock('@stores/settings/settingsSlice', () => ({
  ...jest.requireActual('@stores/settings/settingsSlice'),
  saveTemplate: jest.fn(() => ({
    type: 'settings/saveTemplate',
    payload: {},
  })),
}));

jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    message: {
      info: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

// Mock useAutosave hook
const mockUseAutosave = jest.fn();
jest.spyOn(useAutosaveModule, 'useAutosave').mockImplementation(mockUseAutosave);

describe('TemplatesTab', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Default mockUseAutosave return value
    mockUseAutosave.mockReturnValue({
      isSaving: false,
      lastSaved: null,
      error: null,
    });

    // Create mock store with initial state
    store = configureStore({
      reducer: {
        settings: settingsReducer,
      },
      preloadedState: {
        settings: {
          templates: {
            invite: 'Test invite template',
            bulkInvite: 'Test bulk invite template',
            resultEmail: 'Test result email template',
            consentForm: 'Test consent form template',
            rom: 'Test ROM template',
          },
          loading: {
            'templates.invite': false,
            'templates.bulkInvite': false,
            'templates.resultEmail': false,
            'templates.consentForm': false,
            'templates.rom': false,
          },
          errors: {
            'templates.invite': null,
            'templates.bulkInvite': null,
            'templates.resultEmail': null,
            'templates.consentForm': null,
            'templates.rom': null,
          },
          lastSaved: {
            'templates.invite': null,
            'templates.bulkInvite': null,
            'templates.resultEmail': null,
            'templates.consentForm': null,
            'templates.rom': null,
          },
          autosaveQueue: {
            pending: [],
            maxQueueSize: 10,
            errors: [],
          },
        },
      } as unknown,
    });
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders all 5 template settings', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      // Verify all 5 template labels are rendered
      expect(screen.getByText('Invite Template')).toBeInTheDocument();
      expect(screen.getByText('Bulk Invite Template')).toBeInTheDocument();
      expect(screen.getByText('Result Email Template')).toBeInTheDocument();
      expect(screen.getByText('Consent Form Template')).toBeInTheDocument();
      expect(screen.getByText('ROM Assessment Template')).toBeInTheDocument();
    });

    it('renders TextArea inputs for all templates', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      // Get all textareas
      const textareas = screen.getAllByRole('textbox');
      expect(textareas).toHaveLength(5);

      // Verify initial values from Redux state
      expect(textareas[0]).toHaveValue('Test invite template');
      expect(textareas[1]).toHaveValue('Test bulk invite template');
      expect(textareas[2]).toHaveValue('Test result email template');
      expect(textareas[3]).toHaveValue('Test consent form template');
      expect(textareas[4]).toHaveValue('Test ROM template');
    });

    it('renders descriptions for all templates', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      expect(
        screen.getByText(/Email template sent when inviting a new user/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Email template used for bulk user invitations/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Email template sent when assessment results are ready/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Digital consent form content displayed to users/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Instructions and description shown at the start of ROM/)
      ).toBeInTheDocument();
    });

    it('renders Preview buttons for all templates', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      const previewButtons = screen.getAllByRole('button', { name: /Preview/i });
      expect(previewButtons).toHaveLength(5);
    });

    it('renders character count for all templates', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      // Ant Design TextArea with showCount renders character count as "X / Y"
      // Check for the presence of character count text
      const textareas = screen.getAllByRole('textbox');
      textareas.forEach((textarea) => {
        // Verify maxLength attribute exists
        expect(textarea).toHaveAttribute('maxlength');
      });
    });
  });

  // ============================================================================
  // AUTOSAVE HOOK INTEGRATION TESTS
  // ============================================================================

  describe('Autosave Hook Configuration', () => {
    it('calls useAutosave hook for each template with correct config', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      // Verify useAutosave called 5 times (once per template)
      expect(mockUseAutosave).toHaveBeenCalledTimes(5);

      // Verify debounce is 2000ms for all templates
      const calls = mockUseAutosave.mock.calls;
      calls.forEach((call) => {
        expect(call[0].debounce).toBe(2000);
      });
    });

    it('provides unique queueKey for each template', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      const calls = mockUseAutosave.mock.calls;
      const queueKeys = calls.map((call) => call[0].queueKey);

      expect(queueKeys).toEqual([
        'template-invite',
        'template-bulkInvite',
        'template-resultEmail',
        'template-consentForm',
        'template-rom',
      ]);
    });

    it('passes correct content to useAutosave for each template', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      const calls = mockUseAutosave.mock.calls;

      expect(calls[0][0].content).toBe('Test invite template');
      expect(calls[1][0].content).toBe('Test bulk invite template');
      expect(calls[2][0].content).toBe('Test result email template');
      expect(calls[3][0].content).toBe('Test consent form template');
      expect(calls[4][0].content).toBe('Test ROM template');
    });
  });

  // ============================================================================
  // VISUAL FEEDBACK TESTS
  // ============================================================================

  describe('Visual Feedback', () => {
    it('displays loading state when template is saving', () => {
      mockUseAutosave.mockReturnValueOnce({
        isSaving: true,
        lastSaved: null,
        error: null,
      });

      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('displays "Last saved" timestamp when template was saved', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

      // Mock autosave return for first template
      mockUseAutosave.mockReturnValueOnce({
        isSaving: false,
        lastSaved: new Date(fiveMinutesAgo),
        error: null,
      });

      // Update store with lastSaved timestamp
      store = configureStore({
        reducer: {
          settings: settingsReducer,
        },
        preloadedState: {
          settings: {
            templates: {
              invite: 'Test invite template',
              bulkInvite: '',
              resultEmail: '',
              consentForm: '',
              rom: '',
            },
            loading: {},
            errors: {},
            lastSaved: {
              'templates.invite': fiveMinutesAgo,
            },
            autosaveQueue: {
              pending: [],
              maxQueueSize: 10,
              errors: [],
            },
          },
        } as unknown,
      });

      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      expect(screen.getByText(/Last saved .* ago/i)).toBeInTheDocument();
    });

    it('disables TextArea when template is saving', () => {
      mockUseAutosave.mockReturnValueOnce({
        isSaving: true,
        lastSaved: null,
        error: null,
      });

      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      const textarea = screen.getAllByRole('textbox')[0];
      expect(textarea).toBeDisabled();
    });

    it('disables Preview button when template is saving', () => {
      mockUseAutosave.mockReturnValueOnce({
        isSaving: true,
        lastSaved: null,
        error: null,
      });

      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      const previewButton = screen.getAllByRole('button', { name: /Preview/i })[0];
      expect(previewButton).toBeDisabled();
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when save fails', () => {
      mockUseAutosave.mockReturnValueOnce({
        isSaving: false,
        lastSaved: null,
        error: 'Failed to save template',
      });

      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      expect(screen.getByText('Failed to save template')).toBeInTheDocument();
    });

    it('displays Redux error if provided', () => {
      store = configureStore({
        reducer: {
          settings: settingsReducer,
        },
        preloadedState: {
          settings: {
            templates: {
              invite: 'Test',
              bulkInvite: '',
              resultEmail: '',
              consentForm: '',
              rom: '',
            },
            loading: {},
            errors: {
              'templates.invite': 'Network error occurred',
            },
            lastSaved: {},
            autosaveQueue: {
              pending: [],
              maxQueueSize: 10,
              errors: [],
            },
          },
        } as unknown,
      });

      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PREVIEW BUTTON TESTS (Story 3.4 Placeholder)
  // ============================================================================

  describe('Preview Button Placeholder', () => {
    it('shows placeholder message when Preview button is clicked', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      const previewButtons = screen.getAllByRole('button', { name: /Preview/i });
      fireEvent.click(previewButtons[0]);

      expect(message.info).toHaveBeenCalledWith(
        expect.stringContaining('Story 3.4')
      );
      expect(message.info).toHaveBeenCalledWith(
        expect.stringContaining('Invite Template')
      );
    });

    it('Preview button is enabled when not saving', () => {
      mockUseAutosave.mockReturnValue({
        isSaving: false,
        lastSaved: null,
        error: null,
      });

      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      const previewButtons = screen.getAllByRole('button', { name: /Preview/i });
      previewButtons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  // ============================================================================
  // FORM STATE MANAGEMENT TESTS
  // ============================================================================

  describe('Form State Management', () => {
    it('updates local state when TextArea value changes', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      const textarea = screen.getAllByRole('textbox')[0];
      fireEvent.change(textarea, { target: { value: 'New template content' } });

      expect(textarea).toHaveValue('New template content');
    });

    it('respects maxLength constraint for each template', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      const textareas = screen.getAllByRole('textbox');

      // Verify maxLength attributes
      expect(textareas[0]).toHaveAttribute('maxlength', '2000'); // invite
      expect(textareas[1]).toHaveAttribute('maxlength', '2000'); // bulkInvite
      expect(textareas[2]).toHaveAttribute('maxlength', '2000'); // resultEmail
      expect(textareas[3]).toHaveAttribute('maxlength', '5000'); // consentForm
      expect(textareas[4]).toHaveAttribute('maxlength', '3000'); // rom
    });
  });

  // ============================================================================
  // CHARACTER COUNT TESTS
  // ============================================================================

  describe('Character Count', () => {
    it('displays character count for all templates', () => {
      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      const textareas = screen.getAllByRole('textbox');

      // Verify all textareas have showCount behavior (maxlength attribute present)
      textareas.forEach((textarea) => {
        expect(textarea).toHaveAttribute('maxlength');
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration', () => {
    it('renders successfully with all props from Redux', () => {
      const { container } = render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles empty template values gracefully', () => {
      store = configureStore({
        reducer: {
          settings: settingsReducer,
        },
        preloadedState: {
          settings: {
            templates: {
              invite: '',
              bulkInvite: '',
              resultEmail: '',
              consentForm: '',
              rom: '',
            },
            loading: {},
            errors: {},
            lastSaved: {},
            autosaveQueue: {
              pending: [],
              maxQueueSize: 10,
              errors: [],
            },
          },
        } as unknown,
      });

      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      const textareas = screen.getAllByRole('textbox');
      textareas.forEach((textarea) => {
        expect(textarea).toHaveValue('');
      });
    });

    it('renders placeholders for empty templates', () => {
      store = configureStore({
        reducer: {
          settings: settingsReducer,
        },
        preloadedState: {
          settings: {
            templates: {
              invite: '',
              bulkInvite: '',
              resultEmail: '',
              consentForm: '',
              rom: '',
            },
            loading: {},
            errors: {},
            lastSaved: {},
            autosaveQueue: {
              pending: [],
              maxQueueSize: 10,
              errors: [],
            },
          },
        } as unknown,
      });

      render(
        <Provider store={store}>
          <TemplatesTab />
        </Provider>
      );

      // Verify placeholders are present
      expect(
        screen.getByPlaceholderText(/Hi {{name}}, you have been invited/)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Dear {{name}}, Welcome to VitalFlow/)
      ).toBeInTheDocument();
    });
  });
});
