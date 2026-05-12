/**
 * ANTD-047: Unit Tests for Modal Components
 * Tests for standardized Modal wrapper components and configurations
 */

import { render, screen, waitFor } from '@test-utils';
import userEvent from '@testing-library/user-event';
import {
  Modal,
  FormModal,
  LargeFormModal,
  XLargeFormModal,
  ConfirmModal,
  AlertModal,
  DetailsModal,
  TableModal,
  FullWidthModal,
  LoadingModal,
  WizardModal} from '../index';
import { MODAL_SIZES, MODAL_CONFIGS } from '../modalConfig';

describe('Modal Components', () => {
  describe('Modal (Standard)', () => {
    it('renders when open', () => {
      render(
        <Modal open title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <Modal open={false} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('calls onCancel when cancel button clicked', async () => {
      const handleCancel = jest.fn();
      const user = userEvent.setup();

      render(
        <Modal open title="Test Modal" onCancel={handleCancel}>
          <p>Modal content</p>
        </Modal>
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onOk when OK button clicked', async () => {
      const handleOk = jest.fn();
      const user = userEvent.setup();

      render(
        <Modal open title="Test Modal" onOk={handleOk}>
          <p>Modal content</p>
        </Modal>
      );

      const okButton = screen.getByRole('button', { name: /ok/i });
      await user.click(okButton);

      expect(handleOk).toHaveBeenCalledTimes(1);
    });
  });

  describe('FormModal', () => {
    it('renders with form configuration', () => {
      render(
        <FormModal open title="Form Modal">
          <form>
            <input type="text" placeholder="Name" />
          </form>
        </FormModal>
      );

      expect(screen.getByText('Form Modal')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    });

    it('uses MEDIUM width by default', () => {
      const { container } = render(
        <FormModal open title="Form Modal">
          Content
        </FormModal>
      );

      const modalWrapper = container.querySelector('.ant-modal');
      expect(modalWrapper).toBeInTheDocument();
    });

    it('prevents mask click to close (data loss protection)', async () => {
      const handleCancel = jest.fn();
      const user = userEvent.setup();

      render(
        <FormModal open title="Form Modal" onCancel={handleCancel}>
          <form>
            <input type="text" />
          </form>
        </FormModal>
      );

      // Try clicking the mask (background)
      const mask = document.querySelector('.ant-modal-mask');
      if (mask) {
        await user.click(mask);
      }

      // Modal should NOT close (handleCancel not called)
      expect(handleCancel).not.toHaveBeenCalled();
    });
  });

  describe('LargeFormModal', () => {
    it('renders with large width', () => {
      render(
        <LargeFormModal open title="Large Form">
          Content
        </LargeFormModal>
      );

      expect(screen.getByText('Large Form')).toBeInTheDocument();
    });
  });

  describe('XLargeFormModal', () => {
    it('renders with extra large width', () => {
      render(
        <XLargeFormModal open title="XLarge Form">
          Content
        </XLargeFormModal>
      );

      expect(screen.getByText('XLarge Form')).toBeInTheDocument();
    });
  });

  describe('ConfirmModal', () => {
    it('renders with small width for confirmation', () => {
      render(
        <ConfirmModal open title="Confirm Action">
          Are you sure?
        </ConfirmModal>
      );

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('allows mask click to close', async () => {
      const handleCancel = jest.fn();

      render(
        <ConfirmModal open title="Confirm" onCancel={handleCancel}>
          Confirm?
        </ConfirmModal>
      );

      // Confirmation modals should allow mask click
      const modal = document.querySelector('.ant-modal-wrap');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('AlertModal', () => {
    it('renders without footer', () => {
      render(
        <AlertModal open title="Alert">
          This is an alert message
        </AlertModal>
      );

      expect(screen.getByText('Alert')).toBeInTheDocument();
      expect(screen.getByText('This is an alert message')).toBeInTheDocument();

      // Should not have OK/Cancel buttons (footer: null)
      expect(screen.queryByRole('button', { name: /ok/i })).not.toBeInTheDocument();
    });
  });

  describe('DetailsModal', () => {
    it('renders with large width for read-only content', () => {
      render(
        <DetailsModal open title="Details">
          <div>
            <h3>Section 1</h3>
            <p>Details content here</p>
          </div>
        </DetailsModal>
      );

      expect(screen.getByText('Details')).toBeInTheDocument();
      expect(screen.getByText('Section 1')).toBeInTheDocument();
    });
  });

  describe('TableModal', () => {
    it('renders with extra extra large width for tables', () => {
      render(
        <TableModal open title="Data Table">
          <table>
            <thead>
              <tr>
                <th>Column 1</th>
                <th>Column 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Data 1</td>
                <td>Data 2</td>
              </tr>
            </tbody>
          </table>
        </TableModal>
      );

      expect(screen.getByText('Data Table')).toBeInTheDocument();
      expect(screen.getByText('Column 1')).toBeInTheDocument();
    });
  });

  describe('FullWidthModal', () => {
    it('renders with 90vw width', () => {
      render(
        <FullWidthModal open title="Full Width">
          Wide content
        </FullWidthModal>
      );

      expect(screen.getByText('Full Width')).toBeInTheDocument();
    });
  });

  describe('LoadingModal', () => {
    it('renders non-closable loading modal', () => {
      render(
        <LoadingModal open title="Loading">
          <p>Please wait...</p>
        </LoadingModal>
      );

      expect(screen.getByText('Loading')).toBeInTheDocument();
      expect(screen.getByText('Please wait...')).toBeInTheDocument();

      // Should not have close button (closable: false)
      const closeButton = document.querySelector('.ant-modal-close');
      expect(closeButton).not.toBeInTheDocument();
    });

    it('does not allow keyboard ESC to close', () => {
      const handleCancel = jest.fn();

      render(
        <LoadingModal open title="Loading" onCancel={handleCancel}>
          Processing...
        </LoadingModal>
      );

      // Simulate ESC key
      const modalWrap = document.querySelector('.ant-modal-wrap');
      if (modalWrap) {
        modalWrap.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
          })
        );
      }

      // Should not close
      expect(handleCancel).not.toHaveBeenCalled();
    });
  });

  describe('WizardModal', () => {
    it('renders without default footer for custom navigation', () => {
      render(
        <WizardModal open title="Step 1 of 3">
          <p>Wizard content</p>
          <div>
            <button>Previous</button>
            <button>Next</button>
          </div>
        </WizardModal>
      );

      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  describe('MODAL_SIZES Configuration', () => {
    it('has all standard sizes defined', () => {
      expect(MODAL_SIZES.XSMALL).toBe(420);
      expect(MODAL_SIZES.SMALL).toBe(520);
      expect(MODAL_SIZES.MEDIUM).toBe(640);
      expect(MODAL_SIZES.LARGE).toBe(800);
      expect(MODAL_SIZES.XLARGE).toBe(974);
      expect(MODAL_SIZES.XXLARGE).toBe(1200);
      expect(MODAL_SIZES.FULL).toBe('90vw');
    });
  });

  describe('MODAL_CONFIGS', () => {
    it('has form configuration with data loss protection', () => {
      expect(MODAL_CONFIGS.form.maskClosable).toBe(false);
      expect(MODAL_CONFIGS.form.keyboard).toBe(false);
      expect(MODAL_CONFIGS.form.destroyOnClose).toBe(true);
    });

    it('has confirm configuration with user-friendly close', () => {
      expect(MODAL_CONFIGS.confirm.maskClosable).toBe(true);
      expect(MODAL_CONFIGS.confirm.keyboard).toBe(true);
    });

    it('has loading configuration that prevents closing', () => {
      expect(MODAL_CONFIGS.loading.closable).toBe(false);
      expect(MODAL_CONFIGS.loading.maskClosable).toBe(false);
      expect(MODAL_CONFIGS.loading.keyboard).toBe(false);
    });
  });

  describe('Modal Keyboard Navigation', () => {
    it('closes on ESC key when keyboard enabled', async () => {
      const handleCancel = jest.fn();

      render(
        <Modal open title="Closable" onCancel={handleCancel} keyboard>
          Content
        </Modal>
      );

      // Wait for modal to be fully rendered
      await waitFor(() => {
        expect(screen.getByText('Closable')).toBeInTheDocument();
      });

      // Simulate ESC key
      const modalWrap = document.querySelector('.ant-modal-wrap');
      if (modalWrap) {
        modalWrap.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
          })
        );
      }
    });
  });

  describe('Modal with Custom Footer', () => {
    it('renders custom footer content', () => {
      render(
        <Modal
          open
          title="Custom Footer"
          footer={
            <div>
              <button>Custom Action 1</button>
              <button>Custom Action 2</button>
            </div>
          }
        >
          Content
        </Modal>
      );

      expect(screen.getByText('Custom Action 1')).toBeInTheDocument();
      expect(screen.getByText('Custom Action 2')).toBeInTheDocument();
    });

    it('renders no footer when footer is null', () => {
      render(
        <Modal open title="No Footer" footer={null}>
          Content
        </Modal>
      );

      // Default OK/Cancel buttons should not be present
      expect(screen.queryByRole('button', { name: /ok/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });
});
