import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { TabBadge } from './index';

const meta: Meta<typeof TabBadge> = {
  title: 'Atoms/TabBadge',
  component: TabBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays a colored dot badge on tab labels to indicate unsaved changes state. Orange for unsaved changes, green for recently saved (within 3 seconds), or no badge for clean state.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['unsaved', 'saved', 'none'],
      description: 'Current status of the tab (determines badge color and visibility)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TabBadge>;

/**
 * Unsaved changes - orange dot badge
 */
export const Unsaved: Story = {
  args: {
    status: 'unsaved',
  },
  parameters: {
    docs: {
      description: {
        story: 'Orange dot badge indicating unsaved changes exist in the tab. ARIA label: "Unsaved changes".',
      },
    },
  },
};

/**
 * Recently saved - green dot badge
 */
export const Saved: Story = {
  args: {
    status: 'saved',
  },
  parameters: {
    docs: {
      description: {
        story: 'Green dot badge indicating tab was recently saved (within 3 seconds). ARIA label: "Recently saved".',
      },
    },
  },
};

/**
 * No badge - clean state
 */
export const None: Story = {
  args: {
    status: 'none',
  },
  parameters: {
    docs: {
      description: {
        story: 'No badge displayed. Tab has no unsaved changes and is in clean state.',
      },
    },
  },
};

/**
 * Interactive playground - test all states
 */
export const Playground: Story = {
  args: {
    status: 'unsaved',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the controls below to switch between all three badge states: unsaved (orange), saved (green), or none.',
      },
    },
  },
};

/**
 * Usage example with tab label
 */
export const WithTabLabel: Story = {
  args: {
    status: 'unsaved',
  },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-sm)' }}>
      <span>General Settings</span>
      <TabBadge {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how TabBadge appears next to a tab label in real usage.',
      },
    },
  },
};
