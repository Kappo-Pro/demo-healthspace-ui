/**
 * AntDesignTab - Comprehensive Ant Design Component Showcase
 *
 * Interactive showcase of 40+ Ant Design components organized by official categories.
 * Features:
 * - 6 main categories with 40+ components
 * - Live component previews with interactive props
 * - Size, type, and state controls
 * - Theme integration
 * - Search and filter functionality
 * - Links to official documentation
 *
 * @module DesignSystem/AntDesignTab
 */

import React, { useState, useMemo } from 'react';
import {
  Card,
  Collapse,
  Input,
  Space,
  Typography,
  Tabs,
  Row,
  Col,
  Button,
  Select,
  Radio,
  Switch,
  Checkbox,
  DatePicker,
  TimePicker,
  Upload,
  Slider,
  Rate,
  ColorPicker,
  Table,
  List,
  Tree,
  Tooltip,
  Popover,
  Tag,
  Badge,
  Avatar,
  Alert,
  message,
  Modal,
  notification,
  Progress,
  Spin,
  Divider,
  Menu,
  Dropdown,
  Pagination,
  Steps,
  Breadcrumb,
  Form,
  Empty} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { Theme } from '../types';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import './ComponentsTab.css'; // Reuse existing styles

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { TextArea, Password } = Input;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Component category
 */
type AntdCategory = 'general' | 'navigation' | 'dataEntry' | 'dataDisplay' | 'feedback' | 'layout';

/**
 * Component size options
 */
type ComponentSize = 'small' | 'middle' | 'large';

/**
 * Component example definition
 */
interface ComponentExample {
  label: string;
  component: React.ReactNode;
}

/**
 * Component definition
 */
interface AntdComponent {
  id: string;
  name: string;
  category: AntdCategory;
  description: string;
  docsUrl: string;
  examples: ComponentExample[];
}

/**
 * Props for AntDesignTab
 */
export interface AntDesignTabProps {
  currentTheme: Theme;
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

/**
 * Sample table data
 */
const sampleTableData = [
  { key: '1', name: 'John Doe', age: 32, address: 'New York' },
  { key: '2', name: 'Jane Smith', age: 28, address: 'London' },
  { key: '3', name: 'Bob Johnson', age: 45, address: 'Sydney' },
];

const tableColumns: ColumnsType<{ key: string; name: string; age: number; address: string }> = [
  { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: 'Age', dataIndex: 'age', key: 'age', sorter: (a, b) => a.age - b.age },
  { title: 'Address', dataIndex: 'address', key: 'address' },
];

/**
 * Sample list data
 */
const sampleListData = [
  'Assessment completed',
  'New patient assigned',
  'Report generated',
  'Session scheduled',
];

/**
 * Sample tree data
 */
const treeData: DataNode[] = [
  {
    title: 'Patients',
    key: '0-0',
    children: [
      { title: 'Active', key: '0-0-0' },
      { title: 'Inactive', key: '0-0-1' },
    ],
  },
  {
    title: 'Programs',
    key: '0-1',
    children: [
      { title: 'Rehabilitation', key: '0-1-0' },
      { title: 'Assessment', key: '0-1-1' },
    ],
  },
];

/**
 * Menu items
 */
const menuItems = [
  {
    key: 'home',
    icon: <UntitledIcon name="home" size={16} />,
    label: 'Home',
  },
  {
    key: 'settings',
    icon: <UntitledIcon name="settings" size={16} />,
    label: 'Settings',
    children: [
      { key: 'profile', label: 'Profile' },
      { key: 'preferences', label: 'Preferences' },
    ],
  },
];

// ============================================================================
// COMPONENT SHOWCASE CARD
// ============================================================================

/**
 * Individual component showcase card
 */
const ComponentShowcaseCard: React.FC<{
  component: AntdComponent;
  size: ComponentSize;
  disabled: boolean;
  loading: boolean;
}> = ({ component }) => {
  return (
    <Card
      className="component-showcase-card"
      title={
        <Space>
          <Text strong>{component.name}</Text>
          <a
            href={component.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <UntitledIcon name="global" size={14} style={{ marginRight: 4 }} /> Docs
          </a>
        </Space>
      }
      size="small"
    >
      <Paragraph type="secondary" style={{ marginBottom: 16, fontSize: 13 }}>
        {component.description}
      </Paragraph>

      <div className="antd-examples-grid">
        <Row gutter={[16, 16]}>
          {component.examples.map((example, index) => (
            <Col xs={24} sm={12} md={12} lg={8} key={index}>
              <div className="antd-example-box">
                <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                  {example.label}
                </Text>
                <div className="antd-example-preview">{example.component}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </Card>
  );
};

// ============================================================================
// COMPONENT CATALOG
// ============================================================================

/**
 * Generate component catalog with live examples
 */
const generateComponentCatalog = (
  size: ComponentSize,
  disabled: boolean,
  loading: boolean
): AntdComponent[] => [
  // ========== GENERAL (4) ==========
  {
    id: 'button',
    name: 'Button',
    category: 'general',
    description: 'Primary interactive element with multiple variants and states',
    docsUrl: 'https://ant.design/components/button',
    examples: [
      {
        label: 'Primary',
        component: <Button type="primary" size={size} disabled={disabled} loading={loading}>Primary</Button>,
      },
      {
        label: 'Default',
        component: <Button size={size} disabled={disabled} loading={loading}>Default</Button>,
      },
      {
        label: 'Dashed',
        component: <Button type="dashed" size={size} disabled={disabled} loading={loading}>Dashed</Button>,
      },
      {
        label: 'Text',
        component: <Button type="text" size={size} disabled={disabled} loading={loading}>Text</Button>,
      },
      {
        label: 'Link',
        component: <Button type="link" size={size} disabled={disabled}>Link</Button>,
      },
      {
        label: 'Icon',
        component: <Button type="primary" icon={<UntitledIcon name="plus" size={16} />} size={size} disabled={disabled} />,
      },
    ],
  },
  {
    id: 'icon',
    name: 'Icon',
    category: 'general',
    description: 'Semantic vector graphics from Ant Design icon library',
    docsUrl: 'https://ant.design/components/icon',
    examples: [
      { label: 'User', component: <UntitledIcon name="user" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} /> },
      { label: 'Home', component: <UntitledIcon name="home" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} /> },
      { label: 'Settings', component: <UntitledIcon name="settings" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} /> },
      { label: 'Check', component: <UntitledIcon name="checkCircle" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} style={{ color: 'var(--color-success)' }} /> },
      { label: 'Warning', component: <UntitledIcon name="warning" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} style={{ color: 'var(--color-warning)' }} /> },
      { label: 'Error', component: <UntitledIcon name="closeCircle" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} style={{ color: 'var(--color-error)' }} /> },
    ],
  },
  {
    id: 'typography',
    name: 'Typography',
    category: 'general',
    description: 'Text and heading components with semantic hierarchy',
    docsUrl: 'https://ant.design/components/typography',
    examples: [
      { label: 'Title', component: <Title level={4} style={{ margin: 0 }}>Heading 4</Title> },
      { label: 'Text', component: <Text>Default text</Text> },
      { label: 'Secondary', component: <Text type="secondary">Secondary text</Text> },
      { label: 'Success', component: <Text type="success">Success text</Text> },
      { label: 'Warning', component: <Text type="warning">Warning text</Text> },
      { label: 'Danger', component: <Text type="danger">Danger text</Text> },
    ],
  },
  {
    id: 'layout',
    name: 'Layout',
    category: 'general',
    description: 'Page structure components (Header, Sider, Content, Footer)',
    docsUrl: 'https://ant.design/components/layout',
    examples: [
      { label: 'Grid System', component: <Row gutter={8}><Col span={12}><div style={{ background: 'var(--color-primary)', height: 32, borderRadius: 4 }} /></Col><Col span={12}><div style={{ background: 'var(--color-success)', height: 32, borderRadius: 4 }} /></Col></Row> },
    ],
  },

  // ========== NAVIGATION (5) ==========
  {
    id: 'menu',
    name: 'Menu',
    category: 'navigation',
    description: 'Navigation menu with nested items and icons',
    docsUrl: 'https://ant.design/components/menu',
    examples: [
      { label: 'Horizontal', component: <Menu mode="horizontal" items={menuItems} style={{ border: 'none' }} /> },
    ],
  },
  {
    id: 'dropdown',
    name: 'Dropdown',
    category: 'navigation',
    description: 'Dropdown menu triggered by hover or click',
    docsUrl: 'https://ant.design/components/dropdown',
    examples: [
      {
        label: 'Basic',
        component: (
          <Dropdown menu={{ items: [{ key: '1', label: 'Option 1' }, { key: '2', label: 'Option 2' }] }}>
            <Button size={size}>
              Actions <UntitledIcon name="chevronDown" size={14} />
            </Button>
          </Dropdown>
        ),
      },
    ],
  },
  {
    id: 'pagination',
    name: 'Pagination',
    category: 'navigation',
    description: 'Pagination component for large datasets',
    docsUrl: 'https://ant.design/components/pagination',
    examples: [
      { label: 'Basic', component: <Pagination size={size} total={50} defaultCurrent={1} /> },
      { label: 'Simple', component: <Pagination size={size} simple total={50} defaultCurrent={1} /> },
    ],
  },
  {
    id: 'steps',
    name: 'Steps',
    category: 'navigation',
    description: 'Step-by-step navigation for wizards',
    docsUrl: 'https://ant.design/components/steps',
    examples: [
      {
        label: 'Horizontal',
        component: (
          <Steps
            size={size}
            current={1}
            items={[
              { title: 'Step 1' },
              { title: 'Step 2' },
              { title: 'Step 3' },
            ]}
          />
        ),
      },
    ],
  },
  {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    category: 'navigation',
    description: 'Navigation breadcrumb trail',
    docsUrl: 'https://ant.design/components/breadcrumb',
    examples: [
      {
        label: 'Basic',
        component: (
          <Breadcrumb
            items={[
              { title: <UntitledIcon name="home" size={14} /> },
              { title: 'Patients' },
              { title: 'Details' },
            ]}
          />
        ),
      },
    ],
  },

  // ========== DATA ENTRY (12) ==========
  {
    id: 'form',
    name: 'Form',
    category: 'dataEntry',
    description: 'Form container with validation and layout',
    docsUrl: 'https://ant.design/components/form',
    examples: [
      {
        label: 'Basic',
        component: (
          <Form layout="vertical" size={size}>
            <Form.Item label="Name" name="name" rules={[{ required: true }]}>
              <Input placeholder="Enter name" />
            </Form.Item>
          </Form>
        ),
      },
    ],
  },
  {
    id: 'input',
    name: 'Input',
    category: 'dataEntry',
    description: 'Text input with prefix/suffix and variants',
    docsUrl: 'https://ant.design/components/input',
    examples: [
      { label: 'Basic', component: <Input size={size} placeholder="Basic input" disabled={disabled} /> },
      { label: 'Password', component: <Password size={size} placeholder="Password" disabled={disabled} /> },
      { label: 'TextArea', component: <TextArea size={size} placeholder="Text area" rows={2} disabled={disabled} /> },
      { label: 'Search', component: <Input.Search size={size} placeholder="Search" disabled={disabled} /> },
      { label: 'Prefix', component: <Input size={size} prefix={<UntitledIcon name="user" size={16} />} placeholder="With prefix" disabled={disabled} /> },
    ],
  },
  {
    id: 'select',
    name: 'Select',
    category: 'dataEntry',
    description: 'Dropdown select with search and multi-select',
    docsUrl: 'https://ant.design/components/select',
    examples: [
      {
        label: 'Basic',
        component: (
          <Select size={size} placeholder="Select option" style={{ width: '100%' }} disabled={disabled}>
            <Option value="1">Option 1</Option>
            <Option value="2">Option 2</Option>
            <Option value="3">Option 3</Option>
          </Select>
        ),
      },
      {
        label: 'Multiple',
        component: (
          <Select size={size} mode="multiple" placeholder="Select multiple" style={{ width: '100%' }} disabled={disabled}>
            <Option value="1">Tag 1</Option>
            <Option value="2">Tag 2</Option>
            <Option value="3">Tag 3</Option>
          </Select>
        ),
      },
    ],
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'dataEntry',
    description: 'Checkbox for binary or multiple choices',
    docsUrl: 'https://ant.design/components/checkbox',
    examples: [
      { label: 'Basic', component: <Checkbox disabled={disabled}>Checkbox</Checkbox> },
      {
        label: 'Group',
        component: (
          <Checkbox.Group disabled={disabled}>
            <Checkbox value="1">Option 1</Checkbox>
            <Checkbox value="2">Option 2</Checkbox>
          </Checkbox.Group>
        ),
      },
    ],
  },
  {
    id: 'radio',
    name: 'Radio',
    category: 'dataEntry',
    description: 'Radio button for single selection',
    docsUrl: 'https://ant.design/components/radio',
    examples: [
      {
        label: 'Group',
        component: (
          <Radio.Group disabled={disabled} defaultValue="1">
            <Radio value="1">Option 1</Radio>
            <Radio value="2">Option 2</Radio>
          </Radio.Group>
        ),
      },
      {
        label: 'Button',
        component: (
          <Radio.Group disabled={disabled} defaultValue="1" size={size}>
            <Radio.Button value="1">Small</Radio.Button>
            <Radio.Button value="2">Medium</Radio.Button>
            <Radio.Button value="3">Large</Radio.Button>
          </Radio.Group>
        ),
      },
    ],
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'dataEntry',
    description: 'Toggle switch for binary states',
    docsUrl: 'https://ant.design/components/switch',
    examples: [
      { label: 'Basic', component: <Switch size={size} disabled={disabled} /> },
      { label: 'With Text', component: <Switch size={size} checkedChildren="On" unCheckedChildren="Off" disabled={disabled} /> },
      { label: 'Loading', component: <Switch size={size} loading={loading} /> },
    ],
  },
  {
    id: 'datepicker',
    name: 'DatePicker',
    category: 'dataEntry',
    description: 'Date and range picker with calendar',
    docsUrl: 'https://ant.design/components/date-picker',
    examples: [
      { label: 'Date', component: <DatePicker size={size} disabled={disabled} style={{ width: '100%' }} /> },
      { label: 'Range', component: <DatePicker.RangePicker size={size} disabled={disabled} style={{ width: '100%' }} /> },
    ],
  },
  {
    id: 'timepicker',
    name: 'TimePicker',
    category: 'dataEntry',
    description: 'Time selection component',
    docsUrl: 'https://ant.design/components/time-picker',
    examples: [
      { label: 'Basic', component: <TimePicker size={size} disabled={disabled} style={{ width: '100%' }} /> },
    ],
  },
  {
    id: 'upload',
    name: 'Upload',
    category: 'dataEntry',
    description: 'File upload with drag and drop',
    docsUrl: 'https://ant.design/components/upload',
    examples: [
      {
        label: 'Button',
        component: (
          <Upload disabled={disabled}>
            <Button icon={<UntitledIcon name="upload" size={16} />} size={size}>Upload</Button>
          </Upload>
        ),
      },
    ],
  },
  {
    id: 'slider',
    name: 'Slider',
    category: 'dataEntry',
    description: 'Slider for numeric range input',
    docsUrl: 'https://ant.design/components/slider',
    examples: [
      { label: 'Basic', component: <Slider defaultValue={30} disabled={disabled} /> },
      { label: 'Range', component: <Slider range defaultValue={[20, 50]} disabled={disabled} /> },
    ],
  },
  {
    id: 'rate',
    name: 'Rate',
    category: 'dataEntry',
    description: 'Star rating component',
    docsUrl: 'https://ant.design/components/rate',
    examples: [
      { label: 'Basic', component: <Rate defaultValue={3} disabled={disabled} /> },
      { label: 'Half', component: <Rate allowHalf defaultValue={2.5} disabled={disabled} /> },
    ],
  },
  {
    id: 'colorpicker',
    name: 'ColorPicker',
    category: 'dataEntry',
    description: 'Color selection component',
    docsUrl: 'https://ant.design/components/color-picker',
    examples: [
      { label: 'Basic', component: <ColorPicker defaultValue="var(--color-primary)" disabled={disabled} /> },
    ],
  },

  // ========== DATA DISPLAY (10) ==========
  {
    id: 'table',
    name: 'Table',
    category: 'dataDisplay',
    description: 'Data table with sorting, filtering, and pagination',
    docsUrl: 'https://ant.design/components/table',
    examples: [
      {
        label: 'Basic',
        component: <Table size={size} columns={tableColumns} dataSource={sampleTableData} pagination={false} />,
      },
    ],
  },
  {
    id: 'card',
    name: 'Card',
    category: 'dataDisplay',
    description: 'Content container with optional header and footer',
    docsUrl: 'https://ant.design/components/card',
    examples: [
      {
        label: 'Basic',
        component: (
          <Card title="Card Title" size={size} style={{ width: '100%' }}>
            <p>Card content</p>
          </Card>
        ),
      },
      {
        label: 'Actions',
        component: (
          <Card
            size={size}
            actions={[
              <UntitledIcon key="edit" name="edit" size={16} />,
              <UntitledIcon key="delete" name="delete" size={16} />,
            ]}
            style={{ width: '100%' }}
          >
            <Card.Meta title="Card with actions" description="Interactive card" />
          </Card>
        ),
      },
    ],
  },
  {
    id: 'list',
    name: 'List',
    category: 'dataDisplay',
    description: 'Simple list for displaying sequential data',
    docsUrl: 'https://ant.design/components/list',
    examples: [
      {
        label: 'Basic',
        component: (
          <List
            size={size}
            dataSource={sampleListData}
            renderItem={(item) => <List.Item>{item}</List.Item>}
            bordered
          />
        ),
      },
    ],
  },
  {
    id: 'tree',
    name: 'Tree',
    category: 'dataDisplay',
    description: 'Hierarchical tree structure',
    docsUrl: 'https://ant.design/components/tree',
    examples: [
      { label: 'Basic', component: <Tree treeData={treeData} defaultExpandAll /> },
    ],
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'dataDisplay',
    description: 'Hover tooltip for additional context',
    docsUrl: 'https://ant.design/components/tooltip',
    examples: [
      {
        label: 'Basic',
        component: (
          <Tooltip title="Tooltip text">
            <Button size={size}>Hover me</Button>
          </Tooltip>
        ),
      },
    ],
  },
  {
    id: 'popover',
    name: 'Popover',
    category: 'dataDisplay',
    description: 'Click popover with rich content',
    docsUrl: 'https://ant.design/components/popover',
    examples: [
      {
        label: 'Basic',
        component: (
          <Popover content="Popover content" title="Title">
            <Button size={size}>Click me</Button>
          </Popover>
        ),
      },
    ],
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'dataDisplay',
    description: 'Tab navigation for content organization',
    docsUrl: 'https://ant.design/components/tabs',
    examples: [
      {
        label: 'Basic',
        component: (
          <Tabs
            size={size}
            items={[
              { key: '1', label: 'Tab 1', children: 'Content 1' },
              { key: '2', label: 'Tab 2', children: 'Content 2' },
            ]}
          />
        ),
      },
    ],
  },
  {
    id: 'tag',
    name: 'Tag',
    category: 'dataDisplay',
    description: 'Small labels for categorization',
    docsUrl: 'https://ant.design/components/tag',
    examples: [
      { label: 'Default', component: <Tag>Tag</Tag> },
      { label: 'Success', component: <Tag color="success">Success</Tag> },
      { label: 'Warning', component: <Tag color="warning">Warning</Tag> },
      { label: 'Error', component: <Tag color="error">Error</Tag> },
      { label: 'Processing', component: <Tag color="processing">Processing</Tag> },
      { label: 'Closable', component: <Tag closable>Closable</Tag> },
    ],
  },
  {
    id: 'badge',
    name: 'Badge',
    category: 'dataDisplay',
    description: 'Notification badge for status indicators',
    docsUrl: 'https://ant.design/components/badge',
    examples: [
      { label: 'Dot', component: <Badge dot><UntitledIcon name="bell" size={20} /></Badge> },
      { label: 'Count', component: <Badge count={5}><UntitledIcon name="bell" size={20} /></Badge> },
      { label: 'Status', component: <Badge status="success" text="Success" /> },
    ],
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'dataDisplay',
    description: 'User avatar with icon or image',
    docsUrl: 'https://ant.design/components/avatar',
    examples: [
      { label: 'Icon', component: <Avatar icon={<UntitledIcon name="user" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />} size={size === 'small' ? 32 : size === 'large' ? 64 : 40} /> },
      { label: 'Text', component: <Avatar size={size === 'small' ? 32 : size === 'large' ? 64 : 40}>JD</Avatar> },
      { label: 'Group', component: <Avatar.Group><Avatar icon={<UntitledIcon name="user" size={16} />} /><Avatar>JD</Avatar><Avatar icon={<UntitledIcon name="user" size={16} />} /></Avatar.Group> },
    ],
  },

  // ========== FEEDBACK (6) ==========
  {
    id: 'alert',
    name: 'Alert',
    category: 'feedback',
    description: 'Alert message for user feedback',
    docsUrl: 'https://ant.design/components/alert',
    examples: [
      { label: 'Success', component: <Alert message="Success message" type="success" showIcon /> },
      { label: 'Info', component: <Alert message="Info message" type="info" showIcon /> },
      { label: 'Warning', component: <Alert message="Warning message" type="warning" showIcon /> },
      { label: 'Error', component: <Alert message="Error message" type="error" showIcon /> },
      { label: 'Closable', component: <Alert message="Closable" type="info" closable /> },
    ],
  },
  {
    id: 'message',
    name: 'Message',
    category: 'feedback',
    description: 'Global message notification',
    docsUrl: 'https://ant.design/components/message',
    examples: [
      {
        label: 'Trigger',
        component: (
          <Space>
            <Button size={size} onClick={() => message.success('Success!')}>Success</Button>
            <Button size={size} onClick={() => message.info('Info!')}>Info</Button>
            <Button size={size} onClick={() => message.warning('Warning!')}>Warning</Button>
            <Button size={size} onClick={() => message.error('Error!')}>Error</Button>
          </Space>
        ),
      },
    ],
  },
  {
    id: 'modal',
    name: 'Modal',
    category: 'feedback',
    description: 'Dialog box for user interaction',
    docsUrl: 'https://ant.design/components/modal',
    examples: [
      {
        label: 'Trigger',
        component: (
          <Button
            size={size}
            onClick={() => {
              Modal.info({
                title: 'Modal Title',
                content: 'Modal content',
              });
            }}
          >
            Open Modal
          </Button>
        ),
      },
      {
        label: 'Confirm',
        component: (
          <Button
            size={size}
            onClick={() => {
              Modal.confirm({
                title: 'Confirm',
                content: 'Are you sure?',
              });
            }}
          >
            Confirm
          </Button>
        ),
      },
    ],
  },
  {
    id: 'notification',
    name: 'Notification',
    category: 'feedback',
    description: 'Global notification panel',
    docsUrl: 'https://ant.design/components/notification',
    examples: [
      {
        label: 'Trigger',
        component: (
          <Space>
            <Button
              size={size}
              onClick={() =>
                notification.success({
                  message: 'Success',
                  description: 'Operation completed successfully',
                })
              }
            >
              Success
            </Button>
            <Button
              size={size}
              onClick={() =>
                notification.error({
                  message: 'Error',
                  description: 'Operation failed',
                })
              }
            >
              Error
            </Button>
          </Space>
        ),
      },
    ],
  },
  {
    id: 'progress',
    name: 'Progress',
    category: 'feedback',
    description: 'Progress indicator for long operations',
    docsUrl: 'https://ant.design/components/progress',
    examples: [
      { label: 'Line', component: <Progress percent={70} size={size} /> },
      { label: 'Circle', component: <Progress type="circle" percent={75} size={size === 'small' ? 60 : size === 'large' ? 100 : 80} /> },
      { label: 'Dashboard', component: <Progress type="dashboard" percent={75} size={size === 'small' ? 60 : size === 'large' ? 100 : 80} /> },
    ],
  },
  {
    id: 'spin',
    name: 'Spin',
    category: 'feedback',
    description: 'Loading spinner',
    docsUrl: 'https://ant.design/components/spin',
    examples: [
      { label: 'Small', component: <Spin size="small" /> },
      { label: 'Default', component: <Spin /> },
      { label: 'Large', component: <Spin size="large" /> },
      { label: 'With Content', component: <Spin spinning={loading}><div style={{ padding: 20, background: 'var(--color-gray-50)', borderRadius: 4 }}>Content</div></Spin> },
    ],
  },

  // ========== LAYOUT (3) ==========
  {
    id: 'grid',
    name: 'Grid',
    category: 'layout',
    description: 'Responsive grid layout system',
    docsUrl: 'https://ant.design/components/grid',
    examples: [
      {
        label: '12 Columns',
        component: (
          <Row gutter={[8, 8]}>
            {[...Array(12)].map((_, i) => (
              <Col span={2} key={i}>
                <div style={{ background: 'var(--color-primary)', height: 32, borderRadius: 4 }} />
              </Col>
            ))}
          </Row>
        ),
      },
    ],
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'layout',
    description: 'Visual separator for content sections',
    docsUrl: 'https://ant.design/components/divider',
    examples: [
      { label: 'Horizontal', component: <Divider>Text</Divider> },
      { label: 'Dashed', component: <Divider dashed /> },
    ],
  },
  {
    id: 'space',
    name: 'Space',
    category: 'layout',
    description: 'Automatic spacing between elements',
    docsUrl: 'https://ant.design/components/space',
    examples: [
      {
        label: 'Horizontal',
        component: (
          <Space>
            <Button size={size}>Button 1</Button>
            <Button size={size}>Button 2</Button>
            <Button size={size}>Button 3</Button>
          </Space>
        ),
      },
    ],
  },
];

// ============================================================================
// CATEGORY INFO
// ============================================================================

const CATEGORY_INFO: Record<AntdCategory, { name: string; description: string; count: number }> = {
  general: {
    name: 'General',
    description: 'Basic UI elements like buttons, icons, and typography',
    count: 4,
  },
  navigation: {
    name: 'Navigation',
    description: 'Navigation components for app structure',
    count: 5,
  },
  dataEntry: {
    name: 'Data Entry',
    description: 'Form inputs and data collection components',
    count: 12,
  },
  dataDisplay: {
    name: 'Data Display',
    description: 'Components for displaying structured data',
    count: 10,
  },
  feedback: {
    name: 'Feedback',
    description: 'User feedback and notification components',
    count: 6,
  },
  layout: {
    name: 'Layout',
    description: 'Page structure and spacing components',
    count: 3,
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AntDesignTab - Main component
 */
export const AntDesignTab: React.FC<AntDesignTabProps> = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<AntdCategory | 'all'>('all');
  const [componentSize, setComponentSize] = useState<ComponentSize>('middle');
  const [disabled, setDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Generate component catalog with current settings
  const componentCatalog = useMemo(
    () => generateComponentCatalog(componentSize, disabled, loading),
    [componentSize, disabled, loading]
  );

  // Filter components
  const filteredComponents = useMemo(() => {
    return componentCatalog.filter((component) => {
      // Filter by category
      if (selectedCategory !== 'all' && component.category !== selectedCategory) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          component.name.toLowerCase().includes(query) ||
          component.description.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [componentCatalog, searchQuery, selectedCategory]);

  // Group by category
  const groupedComponents = useMemo(() => {
    const groups: Record<AntdCategory, AntdComponent[]> = {
      general: [],
      navigation: [],
      dataEntry: [],
      dataDisplay: [],
      feedback: [],
      layout: [],
    };

    filteredComponents.forEach((component) => {
      groups[component.category].push(component);
    });

    return groups;
  }, [filteredComponents]);

  return (
    <div className="components-tab antd-tab">
      {/* Header */}
      <div className="components-tab-header">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>Ant Design Components</Title>
            <Paragraph type="secondary">
              Comprehensive showcase of 40+ Ant Design components organized by official categories.
              All components are theme-aware and responsive.
            </Paragraph>
          </div>

          {/* Search and Filters */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Input
              placeholder="Search components..."
              prefix={<UntitledIcon name="search" size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              size="large"
            />

            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Category</Text>
                  <Select
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">All Categories (40)</Option>
                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                      <Option key={key} value={key}>
                        {info.name} ({info.count})
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Size</Text>
                  <Radio.Group
                    value={componentSize}
                    onChange={(e) => setComponentSize(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="small">Small</Radio.Button>
                    <Radio.Button value="middle">Middle</Radio.Button>
                    <Radio.Button value="large">Large</Radio.Button>
                  </Radio.Group>
                </Space>
              </Col>

              <Col xs={24} sm={24} md={8}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>States</Text>
                  <Space>
                    <Checkbox checked={disabled} onChange={(e) => setDisabled(e.target.checked)}>
                      Disabled
                    </Checkbox>
                    <Checkbox checked={loading} onChange={(e) => setLoading(e.target.checked)}>
                      Loading
                    </Checkbox>
                  </Space>
                </Space>
              </Col>
            </Row>
          </Space>
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
            defaultActiveKey={['general', 'navigation', 'dataEntry', 'dataDisplay', 'feedback', 'layout']}
            className="component-groups-collapse"
          >
            {(Object.entries(groupedComponents) as [AntdCategory, AntdComponent[]][]).map(
              ([category, components]) =>
                components.length > 0 && (
                  <Panel
                    header={
                      <Space>
                        <UntitledIcon name="dashboard" size={16} />
                        <Text strong>{CATEGORY_INFO[category].name}</Text>
                        <Tag>{components.length}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          — {CATEGORY_INFO[category].description}
                        </Text>
                      </Space>
                    }
                    key={category}
                  >
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      {components.map((component) => (
                        <ComponentShowcaseCard
                          key={component.id}
                          component={component}
                          size={componentSize}
                          disabled={disabled}
                          loading={loading}
                        />
                      ))}
                    </Space>
                  </Panel>
                )
            )}
          </Collapse>
        )}
      </div>
    </div>
  );
};

export default AntDesignTab;
