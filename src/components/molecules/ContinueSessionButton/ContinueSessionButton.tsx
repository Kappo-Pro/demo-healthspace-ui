/**
 * ContinueSessionButton Molecule Component
 *
 * A call-to-action button that displays the program name and allows users
 * to resume their last incomplete rehab session.
 *
 * Features:
 * - Displays program name in label
 * - Primary Ant Design Button styling
 * - PlayCircleOutlined icon
 * - Fully accessible (keyboard, screen reader, ARIA)
 * - Responsive (full-width on mobile)
 * - Hover effects
 *
 * @example
 * <ContinueSessionButton
 *   programName="Lower Back Program"
 *   programId="123"
 *   sessionId="456"
 * />
 */

import React from 'react';
import { Button } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useNavigate } from 'react-router-dom';
import { router } from '@routers/routers';
import { useTypedSelector } from '@stores/index';
import type { ContinueSessionButtonProps } from './types';
import './ContinueSessionButton.css';

export const ContinueSessionButton: React.FC<ContinueSessionButtonProps> = ({
  programName,
  programId,
  sessionId,
  onClick,
}) => {
  const navigate = useNavigate();
  const user = useTypedSelector((state) => state.user);

  const handleClick = () => {
    // Call optional callback first
    if (onClick) {
      onClick();
    }

    // Navigate to program session with query parameters
    const userId = user.id;
    navigate(`/${userId}${router.AIASSISTANT_PROGRAM_START}?programId=${programId}&sessionId=${sessionId}`);
  };

  // Truncate program name if too long for mobile
  const displayName = programName.length > 30
    ? `${programName.substring(0, 27)}...`
    : programName;

  return (
    <Button
      type="primary"
      size="large"
      icon={<UntitledIcon name="playCircle" size={16} />}
      onClick={handleClick}
      className="continue-session-button"
      aria-label={`Continue ${programName} session`}
      data-testid="continue-session-button"
    >
      Continue {displayName}
    </Button>
  );
};

export default ContinueSessionButton;
