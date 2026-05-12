/**
 * ProgramLibrarySidebar
 *
 * Sidebar drawer with draggable program cards
 *
 * Features:
 * - Search/filter programs
 * - Category tabs
 * - Draggable program cards
 * - Empty states
 * - Loading states
 */

import React, { useState, useMemo } from 'react';
import { Drawer, Input, Tabs, Empty, Spin, Typography, Space } from 'antd';
import DraggableProgramCard, {
  type Program} from '@molecules/DraggableProgramCard';
import { useTypedSelector } from '@stores/index';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { UntitledIcon } from '@atoms/Icon';
import './styles.css';

const { Title, Text } = Typography;

interface ProgramLibrarySidebarProps {
  visible: boolean;
  onClose: () => void;
  programs?: Program[]; // Optional: override Redux programs (useful for demos)
}

export default function ProgramLibrarySidebar({
  visible,
  onClose,
  programs: programsProp,
}: ProgramLibrarySidebarProps) {
  const { t } = useTypedTranslation();
  const [search, setSearch] = useState('');

  // Get programs from Redux or props (props take precedence for demo mode)
  const reduxPrograms = useTypedSelector(state => state.myLibrary?.programs || []);
  const programs = programsProp || reduxPrograms;
  const loading = useTypedSelector(state => state.myLibrary?.loading || false);

  // Filter programs by search
  const filteredPrograms = useMemo(() => {
    if (!search.trim()) return programs;
    const searchLower = search.toLowerCase();
    return programs.filter(
      p =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
    );
  }, [programs, search]);

  // Group programs by category
  const groupedPrograms = useMemo(() => {
    const groups: Record<string, Program[]> = {};

    filteredPrograms.forEach(program => {
      const category = program.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(program);
    });

    return groups;
  }, [filteredPrograms]);

  const categories = Object.keys(groupedPrograms).sort();

  // Create tabs for categories
  const tabItems = useMemo(() => {
    // All programs tab
    const allTab = {
      key: 'all',
      label: (
        <span>
          <UntitledIcon name="lightning" /> All ({filteredPrograms.length})
        </span>
      ),
      children: (
        <div className="program-library__list">
          {filteredPrograms.length > 0 ? (
            filteredPrograms.map(program => (
              <DraggableProgramCard key={program.id} program={program} />
            ))
          ) : (
            <Empty
              description={t('program.library.noProgramsFound')}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      ),
    };

    // Category tabs
    const categoryTabs = categories.map(category => ({
      key: category,
      label: `${category} (${groupedPrograms[category].length})`,
      children: (
        <div className="program-library__list">
          {groupedPrograms[category].map(program => (
            <DraggableProgramCard key={program.id} program={program} />
          ))}
        </div>
      ),
    }));

    return [allTab, ...categoryTabs];
  }, [filteredPrograms, groupedPrograms, categories, t]);

  return (
    <Drawer
      title={
        <Space direction="vertical" size={0}>
          <Title level={4} style={{ margin: 0 }}>
            Program Library
          </Title>
          <Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
            Drag programs onto the calendar to schedule
          </Text>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={420}
      className="program-library-sidebar"
    >
      <div className="program-library-sidebar__content">
        {/* Search */}
        <Input
          prefix={<UntitledIcon name="search" />}
          placeholder={t('program.library.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          size="large"
          className="program-library-sidebar__search"
        />

        {/* Loading state */}
        {loading ? (
          <div className="program-library-sidebar__loading">
            <Spin size="large" tip="Loading programs..." />
          </div>
        ) : (
          <>
            {/* Tabs */}
            {programs.length > 0 ? (
              <Tabs
                defaultActiveKey="all"
                items={tabItems}
                className="program-library-sidebar__tabs"
              />
            ) : (
              <Empty
                description={t('program.library.noProgramsAvailable')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: 'var(--spacing-8)' }}
              />
            )}
          </>
        )}

        {/* Hint */}
        <div className="program-library-sidebar__hint">
          <UntitledIcon name="infoCircle" />
          <Text type="secondary">
            Drag programs onto calendar dates to schedule them for patients
          </Text>
        </div>
      </div>
    </Drawer>
  );
}
