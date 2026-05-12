import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { useState } from 'react';
import { Form as AntForm, Input, Button } from 'antd';
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
  WizardModal,
  BottomSheetModal} from './index';
import { MODAL_SIZES } from './modalConfig';

const meta: Meta<typeof Modal> = {
  title: 'Atoms/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Standardized Modal components with pre-configured sizes and behaviors.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Standard Modal
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Modal
        </Button>
        <Modal
          title="Standard Modal"
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <p>This is a standard modal with default configuration.</p>
          <p>Width: 520px (SMALL)</p>
        </Modal>
      </>
    );
  },
};

// Modal Sizes
export const XSmallModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open XSmall Modal (420px)
        </Button>
        <Modal
          title="XSmall Modal"
          open={open}
          width={MODAL_SIZES.XSMALL}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <p>Perfect for confirmations and alerts.</p>
        </Modal>
      </>
    );
  },
};

export const SmallModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Small Modal (520px)
        </Button>
        <Modal
          title="Small Modal"
          open={open}
          width={MODAL_SIZES.SMALL}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <p>Default Ant Design size. Great for simple forms.</p>
        </Modal>
      </>
    );
  },
};

export const MediumModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Medium Modal (640px)
        </Button>
        <Modal
          title="Medium Modal"
          open={open}
          width={MODAL_SIZES.MEDIUM}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <p>Ideal for standard forms with multiple fields.</p>
        </Modal>
      </>
    );
  },
};

export const LargeModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Large Modal (800px)
        </Button>
        <Modal
          title="Large Modal"
          open={open}
          width={MODAL_SIZES.LARGE}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <p>Perfect for detailed forms and content-heavy modals.</p>
        </Modal>
      </>
    );
  },
};

export const XLargeModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open XLarge Modal (974px)
        </Button>
        <Modal
          title="XLarge Modal"
          open={open}
          width={MODAL_SIZES.XLARGE}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <p>Best for complex forms and multi-section wizards.</p>
        </Modal>
      </>
    );
  },
};

export const XXLargeModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open XXLarge Modal (1200px)
        </Button>
        <Modal
          title="XXLarge Modal"
          open={open}
          width={MODAL_SIZES.XXLARGE}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <p>Designed for tables and wide content displays.</p>
        </Modal>
      </>
    );
  },
};

export const FullModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Full Width Modal (90vw)
        </Button>
        <Modal
          title="Full Width Modal"
          open={open}
          width={MODAL_SIZES.FULL}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <p>Maximum width modal that's responsive to viewport.</p>
        </Modal>
      </>
    );
  },
};

// Specialized Variants
export const FormModalStory: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [form] = AntForm.useForm();

    const handleSubmit = (_values: Record<string, unknown>) => {

      setOpen(false);
      form.resetFields();
    };

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Form Modal
        </Button>
        <FormModal
          title="User Information"
          open={open}
          onOk={() => form.submit()}
          onCancel={() => {
            setOpen(false);
            form.resetFields();
          }}
        >
          <AntForm form={form} layout="vertical" onFinish={handleSubmit}>
            <AntForm.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="Enter name" />
            </AntForm.Item>
            <AntForm.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Invalid email' },
              ]}
            >
              <Input placeholder="Enter email" />
            </AntForm.Item>
            <AntForm.Item label="Phone" name="phone">
              <Input placeholder="Enter phone" />
            </AntForm.Item>
          </AntForm>
        </FormModal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'FormModal prevents accidental closure (maskClosable: false, keyboard: false) and destroys on close to reset form state.',
      },
    },
  },
};

export const LargeForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [form] = AntForm.useForm();

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Large Form Modal
        </Button>
        <LargeFormModal
          title="Patient Registration"
          open={open}
          onOk={() => form.submit()}
          onCancel={() => setOpen(false)}
        >
          <AntForm form={form} layout="vertical">
            <AntForm.Item label="First Name" name="firstName">
              <Input />
            </AntForm.Item>
            <AntForm.Item label="Last Name" name="lastName">
              <Input />
            </AntForm.Item>
            <AntForm.Item label="Date of Birth" name="dob">
              <Input />
            </AntForm.Item>
            <AntForm.Item label="Address" name="address">
              <Input.TextArea rows={3} />
            </AntForm.Item>
          </AntForm>
        </LargeFormModal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'LargeFormModal (800px) for detailed forms with multiple sections.',
      },
    },
  },
};

export const XLargeForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open XLarge Form Modal
        </Button>
        <XLargeFormModal
          title="Complex Configuration"
          open={open}
          onCancel={() => setOpen(false)}
        >
          <p>Extra large modal (974px) for complex forms and wizards.</p>
          <p>Provides maximum space for multi-column layouts.</p>
        </XLargeFormModal>
      </>
    );
  },
};

export const Confirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button danger onClick={() => setOpen(true)}>
          Delete Item
        </Button>
        <ConfirmModal
          title="Confirm Delete"
          open={open}
          onOk={() => {
             
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
          okText="Delete"
          okType="danger"
        >
          <p>Are you sure you want to delete this item?</p>
          <p>This action cannot be undone.</p>
        </ConfirmModal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'ConfirmModal (420px) for yes/no confirmations. Small and focused.',
      },
    },
  },
};

export const Alert: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>
          Show Alert
        </Button>
        <AlertModal
          title="Success"
          open={open}
          onOk={() => setOpen(false)}
          footer={[
            <Button key="ok" type="primary" onClick={() => setOpen(false)}>
              OK
            </Button>,
          ]}
        >
          // TODO: Consider using successfully ?? defaultValue or successfully?.property instead of successfully!
          <p>Your changes have been saved successfully!</p>
        </AlertModal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'AlertModal (420px) for notifications and alerts.',
      },
    },
  },
};

export const Details: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          View Details
        </Button>
        <DetailsModal
          title="Patient Details"
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
        >
          <div style={{ lineHeight: '2' }}>
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Age:</strong> 35</p>
            <p><strong>Diagnosis:</strong> Type 2 Diabetes</p>
            <p><strong>Last Visit:</strong> Oct 10, 2025</p>
            <p><strong>Next Appointment:</strong> Oct 20, 2025</p>
          </div>
        </DetailsModal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'DetailsModal (800px) for displaying read-only detailed information.',
      },
    },
  },
};

export const Table: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          View Table
        </Button>
        <TableModal
          title="Patient List"
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
        >
          <p>TableModal (1200px) provides maximum width for data tables.</p>
          <p>Perfect for displaying tabular data in a modal.</p>
        </TableModal>
      </>
    );
  },
};

export const FullWidth: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Full Width Modal
        </Button>
        <FullWidthModal
          title="Dashboard"
          open={open}
          onCancel={() => setOpen(false)}
        >
          <p>FullWidthModal uses 90vw for maximum responsive width.</p>
          <p>Great for dashboards and complex layouts.</p>
        </FullWidthModal>
      </>
    );
  },
};

export const Loading: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const handleAction = () => {
      setOpen(true);
      // Simulate async operation
      setTimeout(() => setOpen(false), 3000);
    };

    return (
      <>
        <Button type="primary" onClick={handleAction}>
          Start Processing
        </Button>
        <LoadingModal
          title="Processing..."
          open={open}
        >
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p>Please wait while we process your request.</p>
            <p>This may take a few moments.</p>
          </div>
        </LoadingModal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'LoadingModal cannot be dismissed by user (maskClosable: false, no cancel button). Use for non-interruptible processes.',
      },
    },
  },
};

export const Wizard: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);

    const handleNext = () => {
      if (step < 3) setStep(step + 1);
      else {
        setOpen(false);
        setStep(1);
      }
    };

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Start Wizard
        </Button>
        <WizardModal
          title={`Setup Wizard - Step ${step} of 3`}
          open={open}
          onOk={handleNext}
          onCancel={() => {
            setOpen(false);
            setStep(1);
          }}
          okText={step === 3 ? 'Finish' : 'Next'}
        >
          {step === 1 && <p>Step 1: Basic Information</p>}
          {step === 2 && <p>Step 2: Configuration</p>}
          {step === 3 && <p>Step 3: Review & Confirm</p>}
        </WizardModal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'WizardModal (974px) for multi-step flows with form data protection.',
      },
    },
  },
};

// Size Comparison
export const SizeComparison: Story = {
  render: () => {
    const [openSize, setOpenSize] = useState<string | null>(null);

    const sizes = [
      { name: 'XSmall', size: MODAL_SIZES.XSMALL, value: '420px' },
      { name: 'Small', size: MODAL_SIZES.SMALL, value: '520px' },
      { name: 'Medium', size: MODAL_SIZES.MEDIUM, value: '640px' },
      { name: 'Large', size: MODAL_SIZES.LARGE, value: '800px' },
      { name: 'XLarge', size: MODAL_SIZES.XLARGE, value: '974px' },
      { name: 'XXLarge', size: MODAL_SIZES.XXLARGE, value: '1200px' },
    ];

    return (
      <>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          {sizes.map(({ name, value }) => (
            <Button key={name} onClick={() => setOpenSize(name)}>
              {name} ({value})
            </Button>
          ))}
        </div>

        {sizes.map(({ name, size }) => (
          <Modal
            key={name}
            title={`${name} Modal`}
            open={openSize === name}
            width={size}
            onOk={() => setOpenSize(null)}
            onCancel={() => setOpenSize(null)}
          >
            <p>This is a {name} modal.</p>
            <p>Width: {typeof size === 'number' ? `${size}px` : size}</p>
          </Modal>
        ))}
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Compare all available modal sizes side by side.',
      },
    },
  },
};

// Bottom Sheet Modal (Apple-style)
export const BottomSheet: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Open Bottom Sheet Modal
        </Button>
        <BottomSheetModal
          title="Performance"
          open={open}
          onCancel={() => setOpen(false)}
        >
          <div style={{ padding: 'var(--spacing-4) 0' }}>
            <h1 style={{
              fontSize: 'var(--font-size-4xl)',
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--spacing-6)',
              color: 'var(--text-color-root)'
            }}>
              Happily ever faster.
            </h1>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--spacing-4)',
              color: 'var(--text-color-root)'
            }}>
              M5
            </h2>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              maxWidth: '800px'
            }}>
              The 14-inch MacBook Pro with M5 brings serious speed and advanced on-device AI
              to the personal, professional, and creative work you do every day. Effortlessly
              multitask across apps like Asana and Keynote. Breeze through memory-intensive
              projects such as editing high-resolution photos and videos.
            </p>
          </div>
        </BottomSheetModal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Apple-style bottom sheet modal that slides up from the bottom with a glow effect. Max width 1100px, 85vh height, large rounded corners.',
      },
    },
  },
};
