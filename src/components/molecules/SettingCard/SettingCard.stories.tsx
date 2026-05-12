import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Input, Switch, Select } from 'antd';
import { SettingCard } from './index';

const meta: Meta<typeof SettingCard> = {
  title: 'Molecules/SettingCard',
  component: SettingCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A reusable settings card component that provides consistent layout, accessibility, and state management for settings UI. Supports loading states, error/success messages, badges, and help links.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The main label/title for the setting',
    },
    description: {
      control: 'text',
      description: 'Optional description text explaining the setting',
    },
    helpLink: {
      control: 'text',
      description: 'Optional URL for help documentation',
    },
    helpLinkText: {
      control: 'text',
      description: 'Text to display for the help link',
    },
    badge: {
      control: 'select',
      options: ['Super Admin', 'Beta', 'New', undefined],
      description: 'Optional badge to display next to the label',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the setting is currently loading',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    success: {
      control: 'boolean',
      description: 'Whether to show success message',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class name',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingCard>;

/**
 * Default SettingCard with a simple input field
 */
export const Default: Story = {
  args: {
    label: 'API Key',
    description: 'Enter your OpenAI API key to enable AI-powered features in the application.',
    children: (
      <Input.Password
        placeholder="sk-..."
        style={{ maxWidth: 400 }}
      />
    ),
  },
};

/**
 * SettingCard with a Beta badge
 */
export const WithBadge: Story = {
  args: {
    label: 'Voice Assistant',
    description: 'Enable voice commands for hands-free operation during patient assessments.',
    badge: 'Beta',
    children: (
      <Switch defaultChecked />
    ),
  },
};

/**
 * SettingCard in loading state
 */
export const Loading: Story = {
  args: {
    label: 'Email Templates',
    description: 'Loading template data...',
    loading: true,
    children: null,
  },
};

/**
 * SettingCard with error message
 */
export const WithError: Story = {
  args: {
    label: 'API Key',
    description: 'Enter your OpenAI API key to enable AI-powered features.',
    error: 'Failed to save API key. Please check your connection and try again.',
    children: (
      <Input.Password
        placeholder="sk-..."
        status="error"
        style={{ maxWidth: 400 }}
      />
    ),
  },
};

/**
 * SettingCard with success message
 */
export const Success: Story = {
  args: {
    label: 'Theme Settings',
    description: 'Choose your preferred theme for the application interface.',
    success: true,
    children: (
      <Select
        defaultValue="light"
        style={{ width: 200 }}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'auto', label: 'Auto' },
        ]}
      />
    ),
  },
};

/**
 * SettingCard with help link
 */
export const WithHelpLink: Story = {
  args: {
    label: 'Bandwidth Mode',
    description: 'Adjust video quality based on your network connection.',
    helpLink: 'https://docs.example.com/bandwidth-settings',
    helpLinkText: 'View bandwidth guide',
    children: (
      <Select
        defaultValue="high"
        style={{ width: 200 }}
        options={[
          { value: 'high', label: 'High Quality' },
          { value: 'low', label: 'Low Bandwidth' },
        ]}
      />
    ),
  },
};

/**
 * SettingCard with Super Admin badge (restricted access)
 */
export const SuperAdminOnly: Story = {
  args: {
    label: 'Invite Code',
    description: 'Configure the global invite code for new user registration.',
    badge: 'Super Admin',
    children: (
      <Input
        placeholder="INVITE-CODE-2025"
        style={{ maxWidth: 400 }}
      />
    ),
  },
};

/**
 * SettingCard with New badge
 */
export const WithNewBadge: Story = {
  args: {
    label: 'Auto-save Queue',
    description: 'Automatically save changes in the background without manual confirmation.',
    badge: 'New',
    children: (
      <Switch defaultChecked />
    ),
  },
};

/**
 * Interactive playground - combine all props
 */
export const Playground: Story = {
  args: {
    label: 'Custom Setting',
    description: 'Use the controls below to customize this setting card.',
    helpLink: 'https://docs.example.com',
    helpLinkText: 'Learn more',
    badge: undefined,
    loading: false,
    error: '',
    success: false,
    children: (
      <Input placeholder="Enter value..." style={{ maxWidth: 400 }} />
    ),
  },
};
