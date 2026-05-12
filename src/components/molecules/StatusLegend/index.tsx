/**
 * StatusLegend
 *
 * Legend explaining status color coding
 *
 * Features:
 * - All status types with examples
 * - Color-coded indicators
 * - Collapsible/expandable
 * - Accessibility labels
 */

import React from 'react';
import { Card, Space, Typography, Collapse } from 'antd';
import StatusBadge from '@atoms/StatusBadge';
import { ScheduledActivityStatus } from '@services/mockSchedulingApi';
import { UntitledIcon } from '@atoms/Icon';
import './styles.css';

const {Text, _Title } = Typography;
const { Panel } = Collapse;

export interface StatusLegendProps {
  defaultOpen?: boolean;
  compact?: boolean;
}

const STATUS_DESCRIPTIONS: Array<{
  status: ScheduledActivityStatus;
  title: string;
  description: string;
}> = [
  {
    status: ScheduledActivityStatus.PENDING,
    title: 'Pending',
    description: 'Scheduled for the future',
  },
  {
    status: ScheduledActivityStatus.DUE,
    title: 'Due',
    description: 'Scheduled for today',
  },
  {
    status: ScheduledActivityStatus.OVERDUE,
    title: 'Overdue',
    description: 'Past due date and not completed',
  },
  {
    status: ScheduledActivityStatus.COMPLETED,
    title: 'Completed',
    description: 'Successfully finished',
  },
  {
    status: ScheduledActivityStatus.CANCELLED,
    title: 'Cancelled',
    description: 'Cancelled by user or therapist',
  },
  {
    status: ScheduledActivityStatus.SKIPPED,
    title: 'Skipped',
    description: 'Intentionally skipped',
  },
];

export default function StatusLegend({ defaultOpen = false, compact = false }: StatusLegendProps) {
  if (compact) {
    return (
      <Card size="small" className="status-legend status-legend--compact">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text strong>
            <UntitledIcon name="infoCircle" /> Status Guide
          </Text>
          <Space size="small" wrap>
            {STATUS_DESCRIPTIONS.map(({ status }) => (
              <StatusBadge key={status} status={status} size="small" />
            ))}
          </Space>
        </Space>
      </Card>
    );
  }

  return (
    <Collapse
      defaultActiveKey={defaultOpen ? ['legend'] : []}
      className="status-legend"
      ghost
    >
      <Panel
        header={
          <Text strong>
            <UntitledIcon name="infoCircle" /> Activity Status Legend
          </Text>
        }
        key="legend"
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {STATUS_DESCRIPTIONS.map(({ status, title, description }) => (
            <div key={status} className="status-legend__item">
              <StatusBadge status={status} />
              <div className="status-legend__item-text">
                <Text strong>{title}</Text>
                <Text type="secondary" className="status-legend__item-description">
                  {description}
                </Text>
              </div>
            </div>
          ))}
        </Space>
      </Panel>
    </Collapse>
  );
}
