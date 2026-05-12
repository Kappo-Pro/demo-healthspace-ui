/**
 * MLLoadingIndicator Component
 *
 * Loading indicator shown while ML/AI libraries are being loaded dynamically.
 * Provides user feedback during the 2-3 second initialization time for
 * MediaPipe or TensorFlow libraries.
 *
 * Usage:
 * ```tsx
 * {loading && <MLLoadingIndicator type="mediapipe" message="Initializing AI..." />}
 * ```
 */

import { Spin, Typography, Flex } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

export interface MLLoadingIndicatorProps {
  /** Type of ML library being loaded */
  type?: 'mediapipe' | 'tensorflow' | 'general';
  /** Custom loading message */
  message?: string;
  /** Show as overlay (full screen) or inline */
  overlay?: boolean;
  /** Size of the spinner */
  size?: 'small' | 'default' | 'large';
}

/**
 * Loading indicator for ML/AI library initialization
 */
export function MLLoadingIndicator({
  type = 'general',
  message,
  overlay = false,
  size = 'large',
}: MLLoadingIndicatorProps) {
  const { t } = useTranslation();

  const defaultMessages = {
    mediapipe: t('common.ml.loading.loadingPostureAnalysisAI'),
    tensorflow: t('common.ml.loading.loadingGestureRecognitionAI'),
    general: t('common.ml.loading.initializingAIFeatures'),
  };

  const displayMessage = message || defaultMessages[type];

  const spinnerSize = size === 'large' ? 48 : size === 'small' ? 24 : 32;

  const content = (
    <Flex vertical align="center" justify="center" gap={16}>
      <Spin
        indicator={<UntitledIcon name="loading" size={spinnerSize} spin />}
        size={size}
      />
      <Text
        style={{
          color: 'var(--color-purple-100)',
          fontSize: size === 'large' ? 16 : 14,
          textAlign: 'center',
        }}
      >
        {displayMessage}
      </Text>
      <Text
        type="secondary"
        style={{
          color: 'var(--color-purple-300)',
          fontSize: 12,
          textAlign: 'center',
        }}
      >
        {t('common.ml.loading.mayTakeFewSeconds')}
      </Text>
    </Flex>
  );

  if (overlay) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--overlay-dark)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-8)',
      }}
    >
      {content}
    </div>
  );
}

export default MLLoadingIndicator;
