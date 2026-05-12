import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Button, Spin } from 'antd';
import Lottie from 'lottie-react';
import { UntitledIcon } from '@atoms/Icon';
import { Logo } from '@atoms/Logo';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { useTheme } from '@providers/ThemeProvider';
import { THEME } from '@stores/constants';
import { useCameraPermission } from './useCameraPermission';
import { BrowserInstructions } from './BrowserInstructions';
import type { CameraPermissionSplashProps } from './types';
import waveAnimation from './wave-loop.json';
import './styles.css';

/**
 * Camera Permission Splash Screen
 *
 * Displays before ROM/Posture scans to:
 * 1. Check camera (and optionally audio) permissions
 * 2. Show browser-specific instructions when denied
 * 3. Display live camera preview when granted
 * 4. Only proceed when camera feed is confirmed working
 */
export const CameraPermissionSplash: React.FC<CameraPermissionSplashProps> = ({
  onReady,
  requireAudio = false,
  title,
  description,
}) => {
  const { t } = useTypedTranslation();
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const { state, stream, error, browserType, requestPermission, stopStream } =
    useCameraPermission({ requireAudio });

  // Use same background as Choose Scan screen
  const backgroundImage =
    theme === THEME.DARK
      ? '/images/rom/background-dark.jpg'
      : '/images/rom/background-light.jpg';

  // Attach stream to video element when available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      setIsVideoReady(false);
    }
  }, [stream]);

  // Handle video loaded - verify actual feed is received and auto-forward
  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      setIsVideoReady(true);
      // Auto-forward after brief delay to show camera is working
      setTimeout(() => {
        if (stream) {
          onReady(stream);
        }
      }, 800);
    }
  }, [stream, onReady]);

  // Proceed when camera feed is confirmed working
  const handleContinue = useCallback(() => {
    if (stream && isVideoReady) {
      onReady(stream);
    }
  }, [stream, isVideoReady, onReady]);

  // Default texts
  const displayTitle =
    title ||
    t('CameraPermission.title', {
      defaultValue: requireAudio ? 'Camera & Microphone Access' : 'Camera Access Required',
    });

  const displayDescription =
    description ||
    t('CameraPermission.description', {
      defaultValue: requireAudio
        ? 'This assessment uses your camera and microphone for guidance. Please allow access to continue.'
        : 'This assessment uses your camera. Please allow access to continue.',
    });

  return (
    <div
      className="camera-permission-splash"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Wave animation layer - behind card, on top of background */}
      <div className="camera-permission-splash__wave">
        <Lottie
          animationData={waveAnimation}
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="camera-permission-splash__card">
        {/* Header */}
        <div className="camera-permission-splash__header">
          {state === 'denied' ? (
            <div className="camera-permission-splash__icon-wrapper">
              <UntitledIcon name="lock" size={32} color="var(--error-500)" />
            </div>
          ) : (
            <Logo variant="icon" width={64} height={64} />
          )}
          <h2 className="camera-permission-splash__title">{displayTitle}</h2>
          <p className="camera-permission-splash__description">{displayDescription}</p>
        </div>

        {/* Content based on state */}
        <div className="camera-permission-splash__content">
          {/* Checking state */}
          {state === 'checking' && (
            <div className="camera-permission-splash__loading">
              <Spin size="large" />
              <p>
                {t('CameraPermission.checking', { defaultValue: 'Checking camera access...' })}
              </p>
            </div>
          )}

          {/* Prompt state - user needs to grant permission */}
          {state === 'prompt' && (
            <div className="camera-permission-splash__prompt">
              <Button
                type="primary"
                size="large"
                icon={<UntitledIcon name="camera" size={16} />}
                onClick={requestPermission}
                className="camera-permission-splash__enable-btn"
              >
                {t('CameraPermission.enableCamera', { defaultValue: 'Enable Camera' })}
              </Button>
            </div>
          )}

          {/* Denied state - show browser instructions */}
          {state === 'denied' && (
            <div className="camera-permission-splash__denied">
              <BrowserInstructions browserType={browserType} requireAudio={requireAudio} />
              <Button
                type="primary"
                size="large"
                icon={<UntitledIcon name="reload" size={16} />}
                onClick={requestPermission}
                className="camera-permission-splash__retry-btn"
              >
                {t('CameraPermission.tryAgain', { defaultValue: 'Try Again' })}
              </Button>
            </div>
          )}

          {/* Error state */}
          {state === 'error' && (
            <div className="camera-permission-splash__error">
              <div className="camera-permission-splash__error-icon">
                <UntitledIcon name="exclamationCircle" size={48} color="var(--error-500)" />
              </div>
              <p className="camera-permission-splash__error-text">{error}</p>
              <Button
                type="primary"
                size="large"
                icon={<UntitledIcon name="reload" size={16} />}
                onClick={requestPermission}
              >
                {t('CameraPermission.retry', { defaultValue: 'Retry' })}
              </Button>
            </div>
          )}

          {/* Granted state - show camera preview */}
          {state === 'granted' && (
            <div className="camera-permission-splash__granted">
              <div className="camera-permission-splash__preview">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedData={handleVideoLoaded}
                  className="camera-permission-splash__video"
                />
                {!isVideoReady && (
                  <div className="camera-permission-splash__preview-loading">
                    <Spin size="default" />
                    <span>
                      {t('CameraPermission.loadingFeed', { defaultValue: 'Loading camera...' })}
                    </span>
                  </div>
                )}
              </div>
              {isVideoReady && (
                <div className="camera-permission-splash__ready">
                  <div className="camera-permission-splash__success-badge">
                    <UntitledIcon name="checkCircle" size={20} color="var(--success-500)" />
                    <span>
                      {t('CameraPermission.cameraReady', { defaultValue: 'Camera ready' })}
                    </span>
                  </div>
                  <p className="camera-permission-splash__auto-forward">
                    {t('CameraPermission.starting', { defaultValue: 'Starting...' })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CameraPermissionSplash;
export * from './types';
