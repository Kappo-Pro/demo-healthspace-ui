import React from 'react';
import { Button } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import './LastScanInfo.css';

export interface LastScanInfoProps {
  lastScanDate: string; // ISO format
  nextScanDate: string; // ISO format
  onScheduleClick?: () => void;
}

const LastScanInfo: React.FC<LastScanInfoProps> = ({
  lastScanDate,
  nextScanDate,
  onScheduleClick,
}) => {
  const { t } = useTranslation();
  const formattedLastScan = format(new Date(lastScanDate), 'MMMM d, yyyy');
  const nextScanRelative = formatDistanceToNow(new Date(nextScanDate), {
    addSuffix: true,
  });

  return (
    <div className="last-scan-info">
      <div className="last-scan-info__row">
        <UntitledIcon name="calendar" size={16} className="last-scan-info__icon" />
        <span className="last-scan-info__label">{t('Patient.data.postures.lastScan')}</span>
        <span className="last-scan-info__value">{formattedLastScan}</span>
      </div>
      <div className="last-scan-info__row">
        <UntitledIcon name="clock" size={16} className="last-scan-info__icon" />
        <span className="last-scan-info__label">{t('Patient.data.postures.nextScan')}</span>
        <span className="last-scan-info__value">{nextScanRelative}</span>
      </div>
      {onScheduleClick && (
        <Button
          type="primary"
          size="large"
          onClick={onScheduleClick}
          className="last-scan-info__cta"
        >
          Schedule Next Scan
        </Button>
      )}
    </div>
  );
};

export default LastScanInfo;
