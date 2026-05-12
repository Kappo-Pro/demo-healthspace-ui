import { LogOut04 } from '@vitalflow-icons/general/logOut04';
import { UseAuth } from '@contexts/AuthContext';
import { useTheme } from '@providers/ThemeProvider';
import { useTypedSelector } from '@stores/index';
import { Avatar, Popover, Progress } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';

interface ProgressBarProps {
  progressPercent: number;
  onBack?: () => void;
  showBack?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercent,
  onBack,
  showBack = true,
}) => {
  const { onLogout } = UseAuth();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const user = useTypedSelector(state => state.user);

  const logoSrc = isDark
    ? '/brand/logo/full/horizontal/color/logo-horizontal-color-dark.svg'
    : '/brand/logo/full/horizontal/color/logo-horizontal-color-light.svg';
  const selectedUser = useTypedSelector(
    state => state.contacts.main.selectedUser,
  );
  const profileDetails = useTypedSelector(
    state => state.onBoard.onBoard.profileDetails,
  );

  const popoverContent = (
    <div>
      <div className="text-left">
        <h3 style={{ fontSize: 'var(--font-size-base)' }}>
          {profileDetails
            ? `${profileDetails?.profile?.firstName} ${profileDetails?.profile?.lastName}`
            : `${user?.profile?.firstName} ${user?.profile?.lastName}`}
        </h3>
        <p style={{ color: 'var(--color-gray-400)' }}>{user?.profile?.email}</p>
      </div>

      <hr style={{ margin: '8px 0' }} />
      <div
        className="onboard-header-logout"
        onClick={() => onLogout()}>
        <span>{t('Admin.data.menu.logout')}</span>
        <LogOut04 color="stroke-purple-700" width={20} height={20} />
      </div>
    </div>
  );

  return (
    <div className="onboard-header">
      <div className="onboard-header-top">
        {/* Back Arrow - Far Left */}
        <div className="onboard-header-left">
          {showBack && onBack && (
            <button
              className="onboard-header-back"
              onClick={onBack}
              aria-label="Go back">
              <UntitledIcon name="arrowLeft" size="medium" />
            </button>
          )}
        </div>

        {/* Logo - Center */}
        <div className="onboard-header-center">
          <img src={logoSrc} alt="VitalFlow" width={150} />
        </div>

        {/* Avatar - Far Right */}
        <div className="onboard-header-right">
          <Popover content={popoverContent} trigger="hover" placement="leftBottom">
            <div className="onboard-header-avatar">
              {selectedUser?.profile?.imageUrl || user?.profile?.imageUrl ? (
                <Avatar
                  src={
                    user?.isPhysioterapist
                      ? selectedUser?.profile?.imageUrl
                      : user?.profile?.imageUrl
                  }
                  alt="avatar"
                  size={32}
                />
              ) : (
                <Avatar
                  style={{
                    backgroundColor: user?.isPhysioterapist
                      ? selectedUser?.profile?.avatarColor
                      : user?.profile?.avatarColor,
                  }}
                  alt="avatar"
                  size={32}>
                  {user?.isPhysioterapist
                    ? selectedUser?.profile?.firstName?.charAt(0)?.toUpperCase()
                    : user?.profile?.firstName?.charAt(0)?.toUpperCase()}
                </Avatar>
              )}
            </div>
          </Popover>
        </div>
      </div>

      {/* Progress Bar - Below Logo */}
      <div className="onboard-header-progress">
        <Progress
          percent={progressPercent}
          strokeColor="var(--color-lime-500)"
          trailColor="var(--color-gray-300)"
          showInfo={false}
          size={{ height: 6 }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;