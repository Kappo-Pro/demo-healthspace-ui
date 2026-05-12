import React from 'react';
import { Switch } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTheme } from '../../../providers/ThemeProvider';
import styles from './AThemeToggle.module.css';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'default');
  };

  return (
    <div className={styles.themeToggle}>
      <UntitledIcon name="sun" size={16} className={styles.icon} />
      <Switch
        checked={isDark}
        onChange={handleToggle}
        checkedChildren={<UntitledIcon name="moon" size={14} />}
        unCheckedChildren={<UntitledIcon name="sun" size={14} />}
      />
      <UntitledIcon name="moon" size={16} className={styles.icon} />
    </div>
  );
};
