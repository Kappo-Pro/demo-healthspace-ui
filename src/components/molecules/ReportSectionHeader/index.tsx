import React from 'react';
import { Typography } from 'antd';

const { Paragraph } = Typography;

export interface ReportSectionHeaderProps {
  title: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ReportSectionHeader: React.FC<ReportSectionHeaderProps> = ({
  title,
  className,
  style,
}) => {
  return (
    <Paragraph
      className={className}
      style={{
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-semibold)',
        marginBottom: 'var(--spacing-4)',
        ...style,
      }}
    >
      {title}
    </Paragraph>
  );
};

export default ReportSectionHeader;
