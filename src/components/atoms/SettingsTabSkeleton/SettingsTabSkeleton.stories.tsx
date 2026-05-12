import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SettingsTabSkeleton } from './index';

const meta: Meta<typeof SettingsTabSkeleton> = {
  title: 'Atoms/SettingsTabSkeleton',
  component: SettingsTabSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Loading skeleton displayed while Settings tabs are lazy loading. Matches the typical layout of Settings tab content to reduce layout shift. Used as Suspense fallback for lazy-loaded tab components.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsTabSkeleton>;

/**
 * Default loading state
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default skeleton state with animated placeholders. Shows header section (2 rows), form input area, and content section (3 rows).',
      },
    },
  },
};

/**
 * Usage example with Suspense
 */
export const WithSuspense: Story = {
  render: () => (
    <div>
      <h3 style={{ marginBottom: 16 }}>Loading Settings Tab...</h3>
      <SettingsTabSkeleton />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates how SettingsTabSkeleton is used as a Suspense fallback while tab components lazy load.',
      },
      source: {
        code: `
import { Suspense, lazy } from 'react';
import { SettingsTabSkeleton } from '@atoms/SettingsTabSkeleton';

const LazyGeneralTab = lazy(() => import('./tabs/GeneralTab'));

function SettingsPage() {
  return (
    <Suspense fallback={<SettingsTabSkeleton />}>
      <LazyGeneralTab />
    </Suspense>
  );
}`,
      },
    },
  },
};

/**
 * Multiple skeletons (for tabs)
 */
export const MultipleSkeletons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h4 style={{ marginBottom: 8 }}>General Tab Loading</h4>
        <SettingsTabSkeleton />
      </div>
      <div>
        <h4 style={{ marginBottom: 8 }}>Integrations Tab Loading</h4>
        <SettingsTabSkeleton />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows how multiple skeleton placeholders look when multiple tabs are loading simultaneously.',
      },
    },
  },
};
