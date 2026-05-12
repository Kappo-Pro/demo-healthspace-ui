/**
 * ProgramAssignmentDrawer Component
 * Story 5.2: Program assignment management drawer
 *
 * Allows admins to assign/unassign programs to users from the command palette.
 * Features multi-select with category grouping, search with debouncing, and batch save.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Drawer,
  Input,
  Button,
  Checkbox,
  Collapse,
  Statistic,
  Skeleton,
  message,
  Empty} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import { useTypedSelector, useTypedDispatch } from '@stores/index';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import {
  getProgramList,
  updateUserPrograms} from '@stores/shared/patientDetail/program';
import type { IProgramData } from '@types';

const { Panel } = Collapse;

/**
 * Props for ProgramAssignmentDrawer component
 */
export interface ProgramAssignmentDrawerProps {
  /** ID of user whose program assignments are being managed */
  userId: string;
  /** Callback to close drawer */
  onClose: () => void;
  /** Initial assigned program IDs (optional) */
  initialAssignedPrograms?: string[];
}

/**
 * Program enriched with category for grouping
 */
interface ProgramWithCategory extends IProgramData {
  category: string;
}

/**
 * ProgramAssignmentDrawer - Drawer for managing program assignments
 *
 * Displays a searchable list of programs grouped by category with multi-select checkboxes.
 * Changes are tracked locally and persisted on save via batch API call.
 *
 * @example
 * ```typescript
 * <ProgramAssignmentDrawer
 *   userId="user-123"
 *   onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}
 *   initialAssignedPrograms={['prog-1', 'prog-2']}
 * />
 * ```
 */
export const ProgramAssignmentDrawer: React.FC<ProgramAssignmentDrawerProps> = ({
  userId,
  onClose,
  initialAssignedPrograms = [],
}) => {
  const { t } = useTranslation();
  const dispatch = useTypedDispatch();

  // Fetch programs from Redux
  const programsData = useTypedSelector((state) => state.program.program);
  const loading = useTypedSelector((state) => state.program.program.data === null);

  // Local state for search and assignments
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState<Set<string>>(
    new Set(initialAssignedPrograms)
  );
  const [isSaving, setIsSaving] = useState(false);

  // Fetch programs on mount if not already loaded
  useEffect(() => {
    if (!programsData.data || programsData.data.length === 0) {
      dispatch(getProgramList({ userId, limit: 100, page: 1, searchValue: '' }));
    }
  }, [dispatch, userId, programsData.data]);

  // Debounce search (300ms delay)
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  // Add category to programs (use originType or default to "Other")
  const programsWithCategory: ProgramWithCategory[] = useMemo(() => {
    const programs = programsData.data || [];
    return programs.map((program) => ({
      ...program,
      category: program.originType || 'Other',
    }));
  }, [programsData.data]);

  // Filter programs by search query
  const filteredPrograms = useMemo(() => {
    if (!debouncedQuery) return programsWithCategory;

    const query = debouncedQuery.toLowerCase();
    return programsWithCategory.filter((program) =>
      program.name.toLowerCase().includes(query)
    );
  }, [programsWithCategory, debouncedQuery]);

  // Group programs by category
  const programsByCategory = useMemo(() => {
    const grouped = new Map<string, ProgramWithCategory[]>();
    filteredPrograms.forEach((program) => {
      const category = program.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      const categoryArray = grouped.get(category);
      if (categoryArray) {
        categoryArray.push(program);
      }
    });
    return grouped;
  }, [filteredPrograms]);

  /**
   * Handle checkbox toggle
   */
  const handleProgramToggle = (programId: string, checked: boolean) => {
    setSelectedPrograms((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(programId);
      } else {
        next.delete(programId);
      }
      return next;
    });
  };

  /**
   * Select all visible programs
   */
  const handleSelectAll = () => {
    setSelectedPrograms(new Set(filteredPrograms.map((p) => p.id)));
  };

  /**
   * Deselect all programs
   */
  const handleDeselectAll = () => {
    setSelectedPrograms(new Set());
  };

  /**
   * Handle save - persist assignments to backend
   */
  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Get selected program IDs from local state
      const programIds = Array.from(selectedPrograms);

      // Call API via async thunk
      await dispatch(
        updateUserPrograms({ userId, programIds })
      ).unwrap();

      message.success(t('common.commandPalette.drawer.programs.success'));
      onClose();
    } catch (error) {
      message.error(t('common.commandPalette.drawer.programs.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{t('common.commandPalette.drawer.programs.title')}</span>
          <Statistic
            value={selectedPrograms.size}
            suffix={t('common.commandPalette.drawer.programs.selected')}
            valueStyle={{ fontSize: 14, fontWeight: 'normal' }}
          />
        </div>
      }
      placement="right"
      width={480}
      onClose={onClose}
      open={true}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button
              onClick={handleSelectAll}
              size="small"
              style={{ marginRight: 8 }}
              disabled={isSaving || filteredPrograms.length === 0}
            >
              {t('common.commandPalette.drawer.programs.selectAll')}
            </Button>
            <Button
              onClick={handleDeselectAll}
              size="small"
              disabled={isSaving || selectedPrograms.size === 0}
            >
              {t('common.commandPalette.drawer.programs.deselectAll')}
            </Button>
          </div>
          <div>
            <Button onClick={onClose} style={{ marginRight: 8 }} disabled={isSaving}>
              {t('common.commandPalette.drawer.admins.cancel')}
            </Button>
            <Button type="primary" onClick={handleSave} loading={isSaving}>
              {t('common.commandPalette.drawer.programs.saveAssignments')}
            </Button>
          </div>
        </div>
      }
    >
      {/* Search Input */}
      <Input
        placeholder={t('common.commandPalette.search.placeholders.searchPrograms')}
        prefix={<UntitledIcon name="search" />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 16 }}
        aria-label={t('common.commandPalette.ariaLabels.searchPrograms')}
        disabled={isSaving}
      />

      {/* Program List */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : programsByCategory.size === 0 ? (
        <Empty description={t('common.commandPalette.empty.noPrograms')} />
      ) : (
        <Collapse
          defaultActiveKey={Array.from(programsByCategory.keys())}
          style={{ border: 'none' }}
        >
          {Array.from(programsByCategory.entries()).map(([category, categoryPrograms]) => (
            <Panel
              header={`${category} (${categoryPrograms.length})`}
              key={category}
              style={{ marginBottom: 8 }}
            >
              {categoryPrograms.map((program) => (
                <Checkbox
                  key={program.id}
                  checked={selectedPrograms.has(program.id)}
                  onChange={(e) => handleProgramToggle(program.id, e.target.checked)}
                  style={{ display: 'block', marginBottom: 8 }}
                  disabled={isSaving}
                >
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{program.name}</div>
                    {program.durationType && program.duration && (
                      <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>
                        {program.duration} {program.durationType}
                        {program.status && ` • ${program.status}`}
                      </div>
                    )}
                  </div>
                </Checkbox>
              ))}
            </Panel>
          ))}
        </Collapse>
      )}
    </Drawer>
  );
};
