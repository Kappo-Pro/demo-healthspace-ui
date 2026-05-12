/**
 * ContentLibraryTab Component
 *
 * Epic 3 - Story 3.3: Refactor ContentLibraryTab with Nested Tabs
 *
 * Features:
 * - 3 nested sub-tabs: Pre-existing Conditions, Functional Goals, Plans
 * - Manual save pattern per sub-tab
 * - CRUD operations for each content type
 * - Uses SettingCard molecule for consistent UI
 * - Unsaved changes detection per sub-tab
 */

import React, { useState } from 'react';
import { Tabs } from 'antd';
import { PlansSubTab } from './ContentLibrary/PlansSubTab';
import { FunctionalGoalsSubTab } from './ContentLibrary/FunctionalGoalsSubTab';
import { ConditionsSubTab } from './ContentLibrary/ConditionsSubTab';

const { TabPane } = Tabs;

/**
 * ContentLibraryTab component for managing content library settings
 *
 * Allows admins to manage:
 * - Pre-existing Conditions (medical conditions library)
 * - Functional Goals (rehabilitation goals)
 * - Plans (pricing plans, service packages)
 *
 * Each sub-tab has independent CRUD operations and save logic
 */
export const ContentLibraryTab: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('conditions');

  return (
    <div>
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        type="card"
        tabPosition="top"
      >
        <TabPane tab="Pre-existing Conditions" key="conditions">
          <ConditionsSubTab />
        </TabPane>

        <TabPane tab="Functional Goals" key="goals">
          <FunctionalGoalsSubTab />
        </TabPane>

        <TabPane tab="Plans" key="plans">
          <PlansSubTab />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ContentLibraryTab;
