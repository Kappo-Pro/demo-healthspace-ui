import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Button } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import {
  Tooltip,
  HelpTooltip,
  IconButtonTooltip,
  ErrorTooltip,
  WarningTooltip,
  SuccessTooltip,
  InfoTooltip} from './index';
import { TOOLTIP_CONFIGS } from './tooltipConfig';

const meta: Meta<typeof Tooltip> = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Standardized Tooltip components with pre-configured behaviors and styling.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// Standard Tooltip
export const Default: Story = {
  render: () => (
    <Tooltip title="This is a tooltip">
      <Button>Hover me</Button>
    </Tooltip>
  ),
};

export const WithLongText: Story = {
  render: () => (
    <Tooltip title="This is a longer tooltip with more information that might wrap to multiple lines.">
      <Button>Hover for long text</Button>
    </Tooltip>
  ),
};

export const DifferentPlacements: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
      <Tooltip title="Top tooltip" placement="top">
        <Button>Top</Button>
      </Tooltip>
      <Tooltip title="Right tooltip" placement="right">
        <Button>Right</Button>
      </Tooltip>
      <Tooltip title="Bottom tooltip" placement="bottom">
        <Button>Bottom</Button>
      </Tooltip>
      <Tooltip title="Left tooltip" placement="left">
        <Button>Left</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips can be placed on any side of the target element.',
      },
    },
  },
};

// Trigger Types
export const ClickTrigger: Story = {
  render: () => (
    <Tooltip title="Click tooltip" trigger="click">
      <Button>Click me</Button>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltip appears on click instead of hover.',
      },
    },
  },
};

export const FocusTrigger: Story = {
  render: () => (
    <Tooltip title="Focus tooltip" trigger="focus">
      <Button>Focus me (Tab key)</Button>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltip appears when element receives focus.',
      },
    },
  },
};

// Icon Button Tooltip
export const IconButtons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
      <IconButtonTooltip title="Edit">
        <Button icon={<UntitledIcon name="edit" size={16} />} />
      </IconButtonTooltip>
      <IconButtonTooltip title="Delete">
        <Button danger icon={<UntitledIcon name="delete" size={16} />} />
      </IconButtonTooltip>
      <IconButtonTooltip title="More info">
        <Button icon={<UntitledIcon name="infoCircle" size={16} />} />
      </IconButtonTooltip>
      <IconButtonTooltip title="Help">
        <Button icon={<UntitledIcon name="questionCircle" size={16} />} />
      </IconButtonTooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'IconButtonTooltip has faster mouseEnterDelay (0.2s) for immediate feedback on icon buttons.',
      },
    },
  },
};

// Help Tooltip
export const Help: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
      <span>Patient Name</span>
      <HelpTooltip title="Enter the patient's full legal name as it appears on their ID.">
        <UntitledIcon name="questionCircle" size={16} style={{ color: '#1890ff', cursor: 'help' }} />
      </HelpTooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'HelpTooltip for contextual help text next to form labels.',
      },
    },
  },
};

export const MultipleHelpTooltips: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <strong>Email Address</strong>
        <HelpTooltip title="We'll use this email for account notifications and password resets.">
          <UntitledIcon name="questionCircle" size={16} style={{ color: '#1890ff', cursor: 'help' }} />
        </HelpTooltip>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <strong>Phone Number</strong>
        <HelpTooltip title="Include country code. Format: +1 (555) 123-4567">
          <UntitledIcon name="questionCircle" size={16} style={{ color: '#1890ff', cursor: 'help' }} />
        </HelpTooltip>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <strong>Date of Birth</strong>
        <HelpTooltip title="Must be 18 years or older to create an account.">
          <UntitledIcon name="questionCircle" size={16} style={{ color: '#1890ff', cursor: 'help' }} />
        </HelpTooltip>
      </div>
    </div>
  ),
};

// Styled Tooltips
export const Error: Story = {
  render: () => (
    <ErrorTooltip title="This field is required">
      <Button danger>Invalid Field</Button>
    </ErrorTooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ErrorTooltip with red styling for error messages.',
      },
    },
  },
};

export const Warning: Story = {
  render: () => (
    <WarningTooltip title="This action cannot be undone">
      <Button>
        <UntitledIcon name="exclamationCircle" size={16} /> Proceed with caution
      </Button>
    </WarningTooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'WarningTooltip with orange styling for warnings.',
      },
    },
  },
};

export const Success: Story = {
  render: () => (
    <SuccessTooltip title="All validations passed">
      <Button type="primary">
        <UntitledIcon name="checkCircle" size={16} /> Valid
      </Button>
    </SuccessTooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'SuccessTooltip with green styling for success messages.',
      },
    },
  },
};

export const Info: Story = {
  render: () => (
    <InfoTooltip title="Additional information available">
      <Button>
        <UntitledIcon name="infoCircle" size={16} /> Learn more
      </Button>
    </InfoTooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'InfoTooltip with blue styling for informational messages.',
      },
    },
  },
};

export const AllStyledTooltips: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
      <ErrorTooltip title="Error message">
        <Button danger>Error</Button>
      </ErrorTooltip>
      <WarningTooltip title="Warning message">
        <Button>Warning</Button>
      </WarningTooltip>
      <SuccessTooltip title="Success message">
        <Button type="primary">Success</Button>
      </SuccessTooltip>
      <InfoTooltip title="Info message">
        <Button type="default">Info</Button>
      </InfoTooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All styled tooltip variants for different message types.',
      },
    },
  },
};

// Delay Configurations
export const InstantTooltip: Story = {
  render: () => (
    <Tooltip
      title="Instant tooltip"
      mouseEnterDelay={0.1}
      mouseLeaveDelay={0.1}
    >
      <Button>Instant (0.1s)</Button>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltip with minimal delay for immediate feedback.',
      },
    },
  },
};

export const DefaultDelay: Story = {
  render: () => (
    <Tooltip
      title="Default tooltip"
      mouseEnterDelay={0.5}
      mouseLeaveDelay={0.1}
    >
      <Button>Default (0.5s)</Button>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Standard delay (0.5s enter, 0.1s leave).',
      },
    },
  },
};

export const DelayedTooltip: Story = {
  render: () => (
    <Tooltip
      title="Delayed tooltip"
      mouseEnterDelay={1.0}
      mouseLeaveDelay={0.1}
    >
      <Button>Delayed (1.0s)</Button>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltip with longer delay for non-critical information.',
      },
    },
  },
};

// Configuration Showcase
export const AllConfigurations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <div>
        <strong>Default Config (0.5s delay):</strong>
        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <Tooltip {...TOOLTIP_CONFIGS.default} title="Default tooltip">
            <Button>Hover me</Button>
          </Tooltip>
        </div>
      </div>

      <div>
        <strong>Icon Button Config (0.2s delay):</strong>
        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <Tooltip {...TOOLTIP_CONFIGS.iconButton} title="Quick tooltip">
            <Button icon={<UntitledIcon name="edit" size={16} />} />
          </Tooltip>
        </div>
      </div>

      <div>
        <strong>Help Config (0.3s delay):</strong>
        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <Tooltip {...TOOLTIP_CONFIGS.help} title="Help information">
            <UntitledIcon name="questionCircle" size={16} style={{ fontSize: 'var(--font-size-sm)', cursor: 'help' }} />
          </Tooltip>
        </div>
      </div>

      <div>
        <strong>Instant Config (0.1s delay):</strong>
        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <Tooltip {...TOOLTIP_CONFIGS.instant} title="Instant feedback">
            <Button>Instant</Button>
          </Tooltip>
        </div>
      </div>

      <div>
        <strong>Delayed Config (1.0s delay):</strong>
        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <Tooltip {...TOOLTIP_CONFIGS.delayed} title="Non-critical info">
            <Button>Delayed</Button>
          </Tooltip>
        </div>
      </div>

      <div>
        <strong>Click Config:</strong>
        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <Tooltip {...TOOLTIP_CONFIGS.click} title="Click to show">
            <Button>Click me</Button>
          </Tooltip>
        </div>
      </div>

      <div>
        <strong>Focus Config:</strong>
        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <Tooltip {...TOOLTIP_CONFIGS.focus} title="Focus to show">
            <Button>Tab to focus</Button>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available TOOLTIP_CONFIGS presets with their different behaviors.',
      },
    },
  },
};

// Real-world Examples
export const FormWithTooltips: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
          <label htmlFor="email"><strong>Email Address</strong></label>
          <HelpTooltip title="We'll never share your email with anyone else.">
            <UntitledIcon name="questionCircle" size={16} style={{ color: '#1890ff', cursor: 'help' }} />
          </HelpTooltip>
        </div>
        <input
          id="email"
          type="email"
          placeholder="Enter email"
          style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: '4px', border: '1px solid #d9d9d9' }}
        />
      </div>

      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
          <label htmlFor="password"><strong>Password</strong></label>
          <HelpTooltip title="Must be at least 8 characters with uppercase, lowercase, and numbers.">
            <UntitledIcon name="questionCircle" size={16} style={{ color: '#1890ff', cursor: 'help' }} />
          </HelpTooltip>
        </div>
        <input
          id="password"
          type="password"
          placeholder="Enter password"
          style={{ width: '100%', padding: 'var(--spacing-2)', borderRadius: '4px', border: '1px solid #d9d9d9' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
        <Button type="primary">Submit</Button>
        <IconButtonTooltip title="Reset form">
          <Button icon={<UntitledIcon name="delete" size={16} />} />
        </IconButtonTooltip>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example of tooltips in a form with help icons and action buttons.',
      },
    },
  },
};
