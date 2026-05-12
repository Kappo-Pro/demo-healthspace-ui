import React from 'react';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import type { BrowserType } from './types';

interface BrowserInstructionsProps {
  browserType: BrowserType;
  requireAudio?: boolean;
}

interface InstructionStep {
  icon: string;
  text: string;
}

/**
 * Browser-specific instructions for enabling camera permissions
 */
export const BrowserInstructions: React.FC<BrowserInstructionsProps> = ({
  browserType,
  requireAudio = false,
}) => {
  const { t } = useTypedTranslation();

  const permissionType = requireAudio ? 'camera and microphone' : 'camera';

  const getInstructions = (): InstructionStep[] => {
    switch (browserType) {
      case 'chrome':
        return [
          {
            icon: 'lock',
            text: t('CameraPermission.instructions.chrome.step1', {
              defaultValue: 'Click the lock icon in the address bar',
            }),
          },
          {
            icon: 'settings',
            text: t('CameraPermission.instructions.chrome.step2', {
              defaultValue: 'Click "Site settings"',
            }),
          },
          {
            icon: 'camera',
            text: t('CameraPermission.instructions.chrome.step3', {
              defaultValue: `Find "${permissionType}" and select "Allow"`,
            }),
          },
          {
            icon: 'reload',
            text: t('CameraPermission.instructions.chrome.step4', {
              defaultValue: 'Click "Try Again" below',
            }),
          },
        ];

      case 'safari':
        return [
          {
            icon: 'list',
            text: t('CameraPermission.instructions.safari.step1', {
              defaultValue: 'Click "Safari" in the menu bar',
            }),
          },
          {
            icon: 'settings',
            text: t('CameraPermission.instructions.safari.step2', {
              defaultValue: 'Select "Settings" → "Websites"',
            }),
          },
          {
            icon: 'camera',
            text: t('CameraPermission.instructions.safari.step3', {
              defaultValue: `Click "Camera" and find this website`,
            }),
          },
          {
            icon: 'check',
            text: t('CameraPermission.instructions.safari.step4', {
              defaultValue: 'Change permission to "Allow"',
            }),
          },
          {
            icon: 'reload',
            text: t('CameraPermission.instructions.safari.step5', {
              defaultValue: 'Click "Try Again" below',
            }),
          },
        ];

      case 'firefox':
        return [
          {
            icon: 'lock',
            text: t('CameraPermission.instructions.firefox.step1', {
              defaultValue: 'Click the lock icon in the address bar',
            }),
          },
          {
            icon: 'settings',
            text: t('CameraPermission.instructions.firefox.step2', {
              defaultValue: 'Click "Connection secure" → "More Information"',
            }),
          },
          {
            icon: 'fileShield',
            text: t('CameraPermission.instructions.firefox.step3', {
              defaultValue: 'Go to "Permissions" tab',
            }),
          },
          {
            icon: 'camera',
            text: t('CameraPermission.instructions.firefox.step4', {
              defaultValue: `Find "Use the Camera" and click "Allow"`,
            }),
          },
          {
            icon: 'reload',
            text: t('CameraPermission.instructions.firefox.step5', {
              defaultValue: 'Click "Try Again" below',
            }),
          },
        ];

      case 'edge':
        return [
          {
            icon: 'lock',
            text: t('CameraPermission.instructions.edge.step1', {
              defaultValue: 'Click the lock icon in the address bar',
            }),
          },
          {
            icon: 'settings',
            text: t('CameraPermission.instructions.edge.step2', {
              defaultValue: 'Click "Permissions for this site"',
            }),
          },
          {
            icon: 'camera',
            text: t('CameraPermission.instructions.edge.step3', {
              defaultValue: `Find "Camera" and select "Allow"`,
            }),
          },
          {
            icon: 'reload',
            text: t('CameraPermission.instructions.edge.step4', {
              defaultValue: 'Click "Try Again" below',
            }),
          },
        ];

      default:
        return [
          {
            icon: 'settings',
            text: t('CameraPermission.instructions.unknown.step1', {
              defaultValue: 'Open your browser settings',
            }),
          },
          {
            icon: 'fileShield',
            text: t('CameraPermission.instructions.unknown.step2', {
              defaultValue: 'Find "Privacy" or "Site Settings"',
            }),
          },
          {
            icon: 'camera',
            text: t('CameraPermission.instructions.unknown.step3', {
              defaultValue: `Enable ${permissionType} for this website`,
            }),
          },
          {
            icon: 'reload',
            text: t('CameraPermission.instructions.unknown.step4', {
              defaultValue: 'Click "Try Again" below',
            }),
          },
        ];
    }
  };

  const getBrowserName = (): string => {
    switch (browserType) {
      case 'chrome':
        return 'Google Chrome';
      case 'safari':
        return 'Safari';
      case 'firefox':
        return 'Firefox';
      case 'edge':
        return 'Microsoft Edge';
      default:
        return t('CameraPermission.yourBrowser', { defaultValue: 'your browser' });
    }
  };

  const instructions = getInstructions();

  return (
    <div className="browser-instructions">
      <div className="browser-instructions__header">
        <UntitledIcon name="warning" size={24} color="var(--warning-500)" />
        <h3 className="browser-instructions__title">
          {t('CameraPermission.accessBlocked', {
            defaultValue: 'Camera access is blocked',
          })}
        </h3>
      </div>

      <p className="browser-instructions__subtitle">
        {t('CameraPermission.enableInstructions', {
          defaultValue: `To enable ${permissionType} in ${getBrowserName()}:`,
        })}
      </p>

      <ol className="browser-instructions__steps">
        {instructions.map((step, index) => (
          <li key={index} className="browser-instructions__step">
            <span className="browser-instructions__step-number">{index + 1}</span>
            <UntitledIcon
              name={step.icon as 'lock' | 'settings' | 'camera' | 'reload' | 'list' | 'check' | 'fileShield'}
              size={16}
              color="var(--text-secondary)"
            />
            <span className="browser-instructions__step-text">{step.text}</span>
          </li>
        ))}
      </ol>

      <div className="browser-instructions__tip">
        <UntitledIcon name="lightning" size={16} color="var(--brand-primary)" />
        <span>
          {t('CameraPermission.tip', {
            defaultValue:
              'If you previously denied permission, you may need to clear site data or use the steps above.',
          })}
        </span>
      </div>
    </div>
  );
};
