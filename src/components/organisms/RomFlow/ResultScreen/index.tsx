import { Button, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { UntitledIcon } from '@atoms/Icon';
import './style.css';

const { Title } = Typography;

interface ResultScreenProps {
  screenshot: string;
  aspectRatio?: string;
  onRetry?: () => void;
  onSubmit?: () => void;
  isSaving?: boolean;
  showButtons?: boolean;
}

export const ResultScreen = ({
  screenshot,
  aspectRatio: _aspectRatio = '16/9',
  onRetry,
  onSubmit,
  isSaving = false,
  showButtons = false,
}: ResultScreenProps) => {
  const { t } = useTranslation();

  if (!screenshot) return null;

  return (
    <div className="result-screen">
      {/* Full-screen screenshot background */}
      <img
        className="result-screen-background"
        src={screenshot ?? ''}
        alt="screenshot"
      />

      {/* Dark overlay with blur */}
      <div className="result-screen-overlay" />

      {/* Centered content */}
      {showButtons && (
        <Flex
          vertical
          justify="center"
          align="center"
          gap={24}
          className="result-screen-content"
        >
          <Title level={1} className="result-screen-title">
            {t('Patient.data.vitalscan-rom.scanFinished')}
          </Title>

          <Flex gap="middle" align="center">
            <Button
              onClick={onRetry}
              size="large"
              icon={<UntitledIcon name="refreshCcw01" size={16} />}
            >
              {t('Patient.data.vitalscan-rom.tryAgain')}
            </Button>
            <Button
              onClick={onSubmit}
              type="primary"
              size="large"
              disabled={isSaving}
              loading={isSaving}
              icon={!isSaving && <UntitledIcon name="checkCircle" size={20} color="var(--color-white)" />}
            >
              {t('Patient.data.vitalscan-rom.submitAndContinue')}
            </Button>
          </Flex>
        </Flex>
      )}
    </div>
  );
};
