import React from 'react';
import { useTranslation } from 'react-i18next';
import './PostureScoreBadge.css';

export interface PostureScoreBadgeProps {
  score: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  showLabel?: boolean;
}

const getScoreClass = (score: number): string => {
  if (score >= 76) return 'posture-score-badge--success';
  if (score >= 51) return 'posture-score-badge--warning';
  return 'posture-score-badge--error';
};

const PostureScoreBadge: React.FC<PostureScoreBadgeProps> = ({
  score,
  size = 'medium',
  animated = false,
  showLabel = false,
}) => {
  const { t } = useTranslation();
  const scoreClass = getScoreClass(score);
  const sizeClass = `posture-score-badge--${size}`;

  return (
    <div className="posture-score-badge-wrapper">
      {showLabel && (
        <label className="posture-score-badge__label">
          {t('Patient.data.postures.postureScore')}
        </label>
      )}
      <div
        className={`posture-score-badge ${scoreClass} ${sizeClass} ${
          animated ? 'posture-score-badge--animated' : ''
        }`}
        role="img"
        aria-label={`Posture score: ${score} out of 100`}
      >
        <div className="posture-score-badge__score">{score}</div>
        <div className="posture-score-badge__max">/100</div>
      </div>
    </div>
  );
};

export default PostureScoreBadge;
