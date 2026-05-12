/**
 * DraggableProgramCard
 *
 * Draggable card component for program library items
 * Uses @dnd-kit for drag-and-drop functionality
 *
 * Features:
 * - Visual drag feedback
 * - Program metadata display
 * - Accessibility support
 */

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, Typography, Tag, Space } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import './styles.css';

const { Text } = Typography;

export interface Program {
  id: string;
  name: string;
  description?: string;
  category?: string;
  exerciseCount?: number;
  estimatedDuration?: number;
}

interface DraggableProgramCardProps {
  program: Program;
}

export default function DraggableProgramCard({ program }: DraggableProgramCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `program-${program.id}`,
    data: {
      type: 'PROGRAM',
      program,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`draggable-program-card ${isDragging ? 'dragging' : ''}`}
      size="small"
      hoverable
      {...listeners}
      {...attributes}
    >
      <div className="draggable-program-card__content">
        <div className="draggable-program-card__header">
          <UntitledIcon name="drag" size={16} className="draggable-program-card__drag-icon" />
          <Text strong>{program.name}</Text>
        </div>

        {program.description && (
          <Text type="secondary" className="draggable-program-card__description">
            {program.description}
          </Text>
        )}

        <Space size="small" className="draggable-program-card__meta">
          {program.exerciseCount && (
            <span>
              <UntitledIcon name="lightning" size={14} /> {program.exerciseCount} exercises
            </span>
          )}
          {program.estimatedDuration && (
            <span>
              <UntitledIcon name="clock" size={14} /> {program.estimatedDuration} min
            </span>
          )}
        </Space>

        {program.category && (
          <Tag className="draggable-program-card__category">
            {program.category}
          </Tag>
        )}
      </div>
    </Card>
  );
}
