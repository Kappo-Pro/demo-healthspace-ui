/**
 * ComponentsTab - VitalFlow Component Showcase
 *
 * Interactive showcase of VitalFlow's custom components organized by Atomic Design levels.
 * Features:
 * - Auto-discovered component catalog
 * - Live component previews
 * - Theme variation comparison
 * - Props documentation
 * - Code examples with syntax highlighting
 * - Storybook integration
 *
 * @module DesignSystem/ComponentsTab
 */

import React, { useState, useMemo } from 'react';
import {
  Card,
  Collapse,
  Input,
  Space,
  Tag,
  Typography,
  Table,
  Tabs,
  Switch,
  Row,
  Col,
  Button,
  Empty} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { Theme } from '../types';
import type { ColumnsType } from 'antd/es/table';
import './ComponentsTab.css';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Atomic Design level
 */
type AtomicLevel = 'atoms' | 'molecules' | 'organisms';

/**
 * Component property definition
 */
interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

/**
 * Component showcase definition
 */
interface ComponentShowcase {
  id: string;
  name: string;
  level: AtomicLevel;
  description: string;
  filePath: string;
  storybookUrl?: string;
  tags: string[];
  props?: ComponentProp[];
  exampleCode: string;
  isHeavy?: boolean; // For complex components (show screenshot only)
  screenshotUrl?: string;
}

/**
 * Props for ComponentsTab
 */
export interface ComponentsTabProps {
  currentTheme: Theme;
  showThemeVariations?: boolean;
}

// ============================================================================
// COMPONENT CATALOG
// ============================================================================

/**
 * Curated component catalog
 * Organized by Atomic Design level with representative samples
 */
const COMPONENT_CATALOG: ComponentShowcase[] = [
  // ========== ATOMS ==========
  {
    id: 'logo',
    name: 'Logo',
    level: 'atoms',
    description: 'VitalFlow logo with automatic theme detection and variant support',
    filePath: 'src/components/atoms/Logo/index.tsx',
    storybookUrl: '/storybook/?path=/story/atoms-logo--default',
    tags: ['branding', 'theme-aware', 'responsive'],
    props: [
      {
        name: 'variant',
        type: "'full' | 'icon' | 'wordmark'",
        required: false,
        defaultValue: "'full'",
        description: 'Logo variant to display',
      },
      {
        name: 'logoStyle',
        type: "'color' | 'mono' | 'outline'",
        required: false,
        defaultValue: "'color'",
        description: 'Visual style of the logo',
      },
      {
        name: 'theme',
        type: "'light' | 'dark'",
        required: false,
        description: 'Override automatic theme detection',
      },
      {
        name: 'width',
        type: 'number',
        required: false,
        description: 'Logo width in pixels',
      },
    ],
    exampleCode: `import { Logo } from '@atoms/Logo';

// Basic usage with auto theme detection
<Logo width={200} />

// Icon variant
<Logo variant="icon" width={64} />

// Custom theme override
<Logo variant="full" theme="dark" width={400} />`,
  },
  {
    id: 'badge',
    name: 'Badge',
    level: 'atoms',
    description: 'Customizable badge component with color variants',
    filePath: 'src/components/atoms/Badge/index.tsx',
    tags: ['status', 'color', 'button'],
    props: [
      {
        name: 'color',
        type: 'BadgeColorKeys',
        required: false,
        defaultValue: "'primary'",
        description: 'Badge color variant',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg' | 'xl' | 'full'",
        required: false,
        defaultValue: "'md'",
        description: 'Badge size',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        defaultValue: 'false',
        description: 'Disabled state',
      },
    ],
    exampleCode: `import Badge from '@atoms/Badge';

<Badge color="primary" size="md">
  5
</Badge>

<Badge color="success" size="lg">
  New
</Badge>`,
  },
  {
    id: 'modal',
    name: 'Modal',
    level: 'atoms',
    description: 'Standardized modal components with multiple variants',
    filePath: 'src/components/atoms/Modal/index.tsx',
    tags: ['overlay', 'dialog', 'form'],
    props: [
      {
        name: 'width',
        type: 'number | string',
        required: false,
        defaultValue: '520',
        description: 'Modal width',
      },
      {
        name: 'centered',
        type: 'boolean',
        required: false,
        defaultValue: 'true',
        description: 'Whether modal is centered',
      },
      {
        name: 'maskClosable',
        type: 'boolean',
        required: false,
        defaultValue: 'true',
        description: 'Whether clicking mask closes modal',
      },
    ],
    exampleCode: `import { Modal, FormModal, ConfirmModal } from '@atoms/Modal';

// Standard modal
<Modal
  title="Confirmation"
  open={isOpen}
  onOk={handleOk}
  onCancel={handleCancel}
>
  <p>Are you sure?</p>
</Modal>

// Form modal
<FormModal
  title="Edit Profile"
  open={isOpen}
  onOk={handleSubmit}
>
  <Form>...</Form>
</FormModal>`,
  },
  {
    id: 'command-palette',
    name: 'CommandPalette',
    level: 'atoms',
    description: 'Global command palette with keyboard shortcuts (Cmd+K)',
    filePath: 'src/components/atoms/CommandPalette/index.tsx',
    storybookUrl: '/storybook/?path=/story/atoms-commandpalette--default',
    tags: ['keyboard', 'navigation', 'search', 'interactive'],
    props: [
      {
        name: 'isVisible',
        type: 'boolean',
        required: true,
        description: 'Whether palette is visible',
      },
      {
        name: 'onClose',
        type: '() => void',
        required: true,
        description: 'Close handler',
      },
    ],
    exampleCode: `import CommandPalette from '@atoms/CommandPalette';

<CommandPalette
  isVisible={isOpen}
  onClose={() => setIsOpen(false)}
/>

// Opens with Cmd+K (Mac) or Ctrl+K (Windows/Linux)`,
  },
  {
    id: 'loading',
    name: 'Loading',
    level: 'atoms',
    description: 'Loading spinner with multiple variants',
    filePath: 'src/components/atoms/Loading/index.tsx',
    tags: ['feedback', 'spinner'],
    exampleCode: `import Loading from '@atoms/Loading';

<Loading />

// With custom message
<Loading message="Loading data..." />`,
  },
  {
    id: 'theme-toggle',
    name: 'ThemeToggle',
    level: 'atoms',
    description: 'Theme switcher button',
    filePath: 'src/components/atoms/ThemeToggle/index.tsx',
    tags: ['theme', 'toggle', 'preferences'],
    exampleCode: `import ThemeToggle from '@atoms/ThemeToggle';

<ThemeToggle />`,
  },

  // ========== MOLECULES ==========
  {
    id: 'weekly-calendar',
    name: 'WeeklyCalendar',
    level: 'molecules',
    description: 'Interactive weekly calendar component',
    filePath: 'src/components/molecules/WeeklyCalendar/index.tsx',
    tags: ['calendar', 'date', 'scheduling'],
    exampleCode: `import WeeklyCalendar from '@molecules/WeeklyCalendar';

<WeeklyCalendar
  onDateSelect={handleDateSelect}
  selectedDate={currentDate}
/>`,
  },
  {
    id: 'video-recorder',
    name: 'VideoRecorder',
    level: 'molecules',
    description: 'Video recording component with MediaRecorder API',
    filePath: 'src/components/molecules/VideoRecorder/index.tsx',
    tags: ['media', 'camera', 'recording'],
    props: [
      {
        name: 'onRecordingComplete',
        type: '(blob: Blob) => void',
        required: true,
        description: 'Callback when recording is complete',
      },
    ],
    exampleCode: `import VideoRecorder from '@molecules/VideoRecorder';

<VideoRecorder
  onRecordingComplete={(blob) => {
    // Handle recorded video
  }}
/>`,
  },
  {
    id: 'search-bar',
    name: 'SearchBar',
    level: 'molecules',
    description: 'Search input with filtering',
    filePath: 'src/components/molecules/SearchBar/index.tsx',
    tags: ['search', 'filter', 'input'],
    exampleCode: `import SearchBar from '@molecules/SearchBar';

<SearchBar
  placeholder="Search patients..."
  onSearch={handleSearch}
/>`,
  },
  {
    id: 'metric-card',
    name: 'MetricCard',
    level: 'atoms',
    description: 'Display metric with trend indicator',
    filePath: 'src/components/atoms/MetricCard/index.tsx',
    tags: ['dashboard', 'metrics', 'analytics'],
    exampleCode: `import MetricCard from '@atoms/MetricCard';
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<MetricCard
  title={t('common.metrics.activePatients')}
  value={42}
  trend={{ direction: 'up', percentage: 12 }}
/>`,
  },

  // ========== ORGANISMS ==========
  {
    id: 'create-program-modal',
    name: 'CreateProgramModal',
    level: 'organisms',
    description: 'Complex modal for creating rehabilitation programs',
    filePath: 'src/components/organisms/CreateProgramModal/index.tsx',
    tags: ['program', 'form', 'multi-step'],
    isHeavy: true,
    screenshotUrl: '/design-system/screenshots/create-program-modal.png',
    exampleCode: `import CreateProgramModal from '@organisms/CreateProgramModal';

<CreateProgramModal
  visible={isOpen}
  onClose={handleClose}
  onSubmit={handleProgramCreate}
/>`,
  },
  {
    id: 'program-flow',
    name: 'ProgramFlow',
    level: 'organisms',
    description: 'Patient program execution flow with video playback',
    filePath: 'src/components/organisms/ProgramFlow/index.tsx',
    tags: ['program', 'video', 'exercise'],
    isHeavy: true,
    screenshotUrl: '/design-system/screenshots/program-flow.png',
    exampleCode: `import ProgramFlow from '@organisms/ProgramFlow';

<ProgramFlow
  programId={programId}
  onComplete={handleComplete}
/>`,
  },
  {
    id: 'rehab-flow',
    name: 'RehabFlow',
    level: 'organisms',
    description: 'Rehabilitation session flow with ROM analysis',
    filePath: 'src/components/organisms/RehabFlow/index.tsx',
    tags: ['rehab', 'assessment', 'video'],
    isHeavy: true,
    screenshotUrl: '/design-system/screenshots/rehab-flow.png',
    exampleCode: `import RehabFlow from '@organisms/RehabFlow';

<RehabFlow
  sessionId={sessionId}
  onComplete={handleComplete}
/>`,
  },
  {
    id: 'video-pose-estimator',
    name: 'VideoPoseEstimator',
    level: 'organisms',
    description: 'AI-powered pose estimation with TensorFlow.js',
    filePath: 'src/components/organisms/VideoPoseEstimator/index.tsx',
    tags: ['ml', 'pose-detection', 'camera'],
    isHeavy: true,
    screenshotUrl: '/design-system/screenshots/pose-estimator.png',
    exampleCode: `import VideoPoseEstimator from '@organisms/VideoPoseEstimator';

<VideoPoseEstimator
  onPoseDetected={handlePose}
  mode="realtime"
/>`,
  },
];

// ============================================================================
// COMPONENT CARD
// ============================================================================

/**
 * Individual component card with preview, props, and code
 */
const ComponentCard: React.FC<{
  component: ComponentShowcase;
  currentTheme: Theme;
  showThemeVariations: boolean;
}> = ({ component, currentTheme, showThemeVariations }) => {
  const [activeTab, setActiveTab] = useState<string>('preview');

  // Props table columns
  const propsColumns: ColumnsType<ComponentProp> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <code>{name}</code>,
      width: 150,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <code className="component-prop-type">{type}</code>,
      width: 200,
    },
    {
      title: 'Required',
      dataIndex: 'required',
      key: 'required',
      render: (required: boolean) => (
        <Tag color={required ? 'var(--color-error)' : 'default'}>{required ? 'Yes' : 'No'}</Tag>
      ),
      width: 100,
    },
    {
      title: 'Default',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      render: (value?: string) => (value ? <code>{value}</code> : <Text type="secondary">—</Text>),
      width: 120,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const tabItems = [
    {
      key: 'preview',
      label: 'Preview',
      children: (
        <div className="component-preview-container">
          {component.isHeavy ? (
            <div className="component-screenshot-placeholder">
              <Empty
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">
                      This component is too complex for live preview
                    </Text>
                    <Text type="secondary">See Storybook for interactive demo</Text>
                  </Space>
                }
              />
            </div>
          ) : (
            <div className="component-live-preview" data-theme={currentTheme}>
              <Empty description="Live preview will be implemented in next phase" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Code',
      children: (
        <div className="component-code-example">
          <pre>
            <code>{component.exampleCode}</code>
          </pre>
        </div>
      ),
    },
  ];

  if (component.props && component.props.length > 0) {
    tabItems.push({
      key: 'props',
      label: 'Props',
      children: (
        <div className="component-props-table">
          <Table
            columns={propsColumns}
            dataSource={component.props}
            pagination={false}
            size="small"
            rowKey="name"
          />
        </div>
      ),
    });
  }

  return (
    <Card
      className="component-showcase-card"
      title={
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Space>
            <Text strong style={{ fontSize: 16 }}>
              {component.name}
            </Text>
            <Tag color="var(--color-info)">{component.level}</Tag>
          </Space>
          {component.tags.length > 0 && (
            <Space size={[4, 4]} wrap>
              {component.tags.map((tag) => (
                <Tag key={tag} style={{ fontSize: 11 }}>
                  {tag}
                </Tag>
              ))}
            </Space>
          )}
        </Space>
      }
      extra={
        <Space>
          {component.storybookUrl && (
            <Button
              icon={<UntitledIcon name="fileText" size={16} />}
              size="small"
              href={component.storybookUrl}
              target="_blank"
            >
              Storybook
            </Button>
          )}
          <Button icon={<UntitledIcon name="fileText" size={16} />} size="small">
            Source
          </Button>
        </Space>
      }
    >
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {component.description}
      </Paragraph>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
      />

      {showThemeVariations && !component.isHeavy && (
        <div className="theme-variations-section">
          <Text strong style={{ display: 'block', marginTop: 16, marginBottom: 8 }}>
            Theme Variations
          </Text>
          <Row gutter={[16, 16]}>
            {(['default', 'dark', 'vibrant'] as Theme[]).map((theme) => (
              <Col span={8} key={theme}>
                <div
                  className="theme-variation-preview"
                  data-theme={theme}
                  style={{ padding: 8, border: '1px solid var(--color-gray-200)', borderRadius: 4 }}
                >
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {theme}
                  </Text>
                  <Empty description="Preview" imageStyle={{ height: 40 }} />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// COMPONENTS TAB
// ============================================================================

/**
 * Main ComponentsTab component
 */
export const ComponentsTab: React.FC<ComponentsTabProps> = ({
  currentTheme,
  showThemeVariations = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<AtomicLevel | 'all'>('all');
  const [showVariations, setShowVariations] = useState<boolean>(showThemeVariations);

  // Filter components
  const filteredComponents = useMemo(() => {
    return COMPONENT_CATALOG.filter((component) => {
      // Filter by level
      if (selectedLevel !== 'all' && component.level !== selectedLevel) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          component.name.toLowerCase().includes(query) ||
          component.description.toLowerCase().includes(query) ||
          component.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [searchQuery, selectedLevel]);

  // Group by atomic level
  const groupedComponents = useMemo(() => {
    const groups: Record<AtomicLevel, ComponentShowcase[]> = {
      atoms: [],
      molecules: [],
      organisms: [],
    };

    filteredComponents.forEach((component) => {
      groups[component.level].push(component);
    });

    return groups;
  }, [filteredComponents]);

  // Count components per level
  const counts = useMemo(() => {
    return {
      atoms: groupedComponents.atoms.length,
      molecules: groupedComponents.molecules.length,
      organisms: groupedComponents.organisms.length,
      total: filteredComponents.length,
    };
  }, [groupedComponents, filteredComponents]);

  return (
    <div className="components-tab">
      {/* Header */}
      <div className="components-tab-header">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>Component Showcase</Title>
            <Paragraph type="secondary">
              VitalFlow custom components organized by Atomic Design principles.
              {counts.total} components total.
            </Paragraph>
          </div>

          {/* Filters */}
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Input
                placeholder="Search components by name, description, or tags..."
                prefix={<UntitledIcon name="search" size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                size="large"
              />
            </Col>
            <Col>
              <Space>
                <Text type="secondary">Filter:</Text>
                <Button
                  type={selectedLevel === 'all' ? 'primary' : 'default'}
                  onClick={() => setSelectedLevel('all')}
                  size="small"
                >
                  All ({counts.total})
                </Button>
                <Button
                  type={selectedLevel === 'atoms' ? 'primary' : 'default'}
                  onClick={() => setSelectedLevel('atoms')}
                  size="small"
                >
                  Atoms ({counts.atoms})
                </Button>
                <Button
                  type={selectedLevel === 'molecules' ? 'primary' : 'default'}
                  onClick={() => setSelectedLevel('molecules')}
                  size="small"
                >
                  Molecules ({counts.molecules})
                </Button>
                <Button
                  type={selectedLevel === 'organisms' ? 'primary' : 'default'}
                  onClick={() => setSelectedLevel('organisms')}
                  size="small"
                >
                  Organisms ({counts.organisms})
                </Button>
              </Space>
            </Col>
            <Col>
              <Space>
                <Text type="secondary">Theme Variations:</Text>
                <Switch
                  checked={showVariations}
                  onChange={setShowVariations}
                  checkedChildren="On"
                  unCheckedChildren="Off"
                />
              </Space>
            </Col>
          </Row>
        </Space>
      </div>

      {/* Component Groups */}
      <div className="components-tab-content">
        {filteredComponents.length === 0 ? (
          <Empty
            description={
              <Space direction="vertical">
                <Text>No components match your search</Text>
                <Button onClick={() => setSearchQuery('')}>Clear search</Button>
              </Space>
            }
          />
        ) : (
          <Collapse
            defaultActiveKey={['atoms', 'molecules', 'organisms']}
            className="component-groups-collapse"
          >
            {/* Atoms */}
            {groupedComponents.atoms.length > 0 && (
              <Panel
                header={
                  <Space>
                    <UntitledIcon name="lightning" size={16} />
                    <Text strong>Atoms</Text>
                    <Tag>{groupedComponents.atoms.length}</Tag>
                  </Space>
                }
                key="atoms"
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {groupedComponents.atoms.map((component) => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      currentTheme={currentTheme}
                      showThemeVariations={showVariations}
                    />
                  ))}
                </Space>
              </Panel>
            )}

            {/* Molecules */}
            {groupedComponents.molecules.length > 0 && (
              <Panel
                header={
                  <Space>
                    <UntitledIcon name="code" size={16} />
                    <Text strong>Molecules</Text>
                    <Tag>{groupedComponents.molecules.length}</Tag>
                  </Space>
                }
                key="molecules"
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {groupedComponents.molecules.map((component) => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      currentTheme={currentTheme}
                      showThemeVariations={showVariations}
                    />
                  ))}
                </Space>
              </Panel>
            )}

            {/* Organisms */}
            {groupedComponents.organisms.length > 0 && (
              <Panel
                header={
                  <Space>
                    <UntitledIcon name="fileText" size={16} />
                    <Text strong>Organisms</Text>
                    <Tag>{groupedComponents.organisms.length}</Tag>
                  </Space>
                }
                key="organisms"
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {groupedComponents.organisms.map((component) => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      currentTheme={currentTheme}
                      showThemeVariations={showVariations}
                    />
                  ))}
                </Space>
              </Panel>
            )}
          </Collapse>
        )}
      </div>
    </div>
  );
};

export default ComponentsTab;
