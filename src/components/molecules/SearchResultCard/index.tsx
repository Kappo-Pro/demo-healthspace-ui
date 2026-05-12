/**
 * SearchResultCard
 *
 * Display search result with highlighted matches
 *
 * Features:
 * - Highlighted search terms
 * - Match summary (which fields matched)
 * - Status badge
 * - Click handler
 */

import React from 'react';
import { Card, Space, Typography, Tag } from 'antd';
import { format } from 'date-fns';
import StatusBadge from '@atoms/StatusBadge';
import { highlightMatches, getMatchSummary, type SearchResult } from '@utils/fuzzySearch';
import './styles.css';

const { Title, Text, Paragraph } = Typography;

interface SearchResultCardProps {
  result: SearchResult;
  searchQuery: string;
  onClick?: (activityId: string) => void;
  compact?: boolean;
}

export default function SearchResultCard({
  result,
  searchQuery,
  onClick,
  compact = false,
}: SearchResultCardProps) {
  const { item: activity, matches, score } = result;

  // Find matches for each field
  const titleMatches = matches?.filter(m => m.key === 'title');
  const notesMatches = matches?.filter(m => m.key === 'notes');

  // Highlight title
  const highlightedTitle = searchQuery && titleMatches?.length
    ? highlightMatches(activity.title, titleMatches)
    : activity.title;

  // Highlight notes
  const highlightedNotes = searchQuery && notesMatches?.length && activity.notes
    ? highlightMatches(activity.notes, notesMatches)
    : activity.notes;

  const matchSummary = getMatchSummary(matches);

  const handleClick = () => {
    if (onClick) {
      onClick(activity.id);
    }
  };

  return (
    <Card
      className={`search-result-card ${compact ? 'search-result-card--compact' : ''}`}
      size={compact ? 'small' : 'default'}
      hoverable
      onClick={handleClick}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Header with status and date */}
        <div className="search-result-card__header">
          <StatusBadge status={activity.status} size={compact ? 'small' : 'default'} />
          <Text type="secondary">
            {format(new Date(activity.scheduledFor), 'MMM d, yyyy @ h:mm a')}
          </Text>
        </div>

        {/* Title with highlighting */}
        <Title
          level={compact ? 5 : 4}
          style={{ margin: 0 }}
          dangerouslySetInnerHTML={{ __html: highlightedTitle }}
        />

        {/* Activity type tag */}
        <div>
          <Tag>{activity.activityType}</Tag>
          {activity.program && <Tag>{activity.program.name}</Tag>}
        </div>

        {/* Notes with highlighting */}
        {highlightedNotes && (
          <Paragraph
            ellipsis={{ rows: compact ? 1 : 2 }}
            style={{ margin: 0 }}
            dangerouslySetInnerHTML={{ __html: highlightedNotes }}
          />
        )}

        {/* Match summary */}
        {matchSummary && (
          <Text type="secondary" className="search-result-card__match-summary">
            {matchSummary}
          </Text>
        )}

        {/* Search score (for debugging) */}
        {score !== undefined && process.env.NODE_ENV === 'development' && (
          <Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
            Score: {score.toFixed(3)}
          </Text>
        )}
      </Space>
    </Card>
  );
}
