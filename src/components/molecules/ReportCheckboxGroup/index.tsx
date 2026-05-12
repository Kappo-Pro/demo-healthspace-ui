import React from 'react';
import { Checkbox } from 'antd';

export interface ReportCheckboxItem {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface ReportCheckboxSectionProps {
  title?: string;
  icon?: React.ReactNode;
  items: ReportCheckboxItem[];
  showDivider?: boolean;
  className?: string;
}

export const ReportCheckboxGroup: React.FC<ReportCheckboxSectionProps> = ({
  title,
  icon,
  items,
  showDivider = true,
  className,
}) => {
  return (
    <>
      {title && (
        <div className="create-report-item-content">
          <span className="create-report-icon-span-css fontStyles">
            {icon}
            <strong style={{ fontWeight: 'var(--font-weight-semibold)', marginLeft: icon ? '8px' : 0 }}>
              {title}
            </strong>
          </span>
        </div>
      )}
      {items.map((item) => (
        <div key={item.id} className={`create-report-content-icon-div ${className || ''}`}>
          <Checkbox
            id={item.id}
            checked={item.checked}
            onChange={(e) => item.onChange(e.target.checked)}
          >
            <span className="create-report-icon-styling fontStyles">
              {item.label}
            </span>
          </Checkbox>
        </div>
      ))}
      {showDivider && <hr />}
    </>
  );
};

export default ReportCheckboxGroup;
