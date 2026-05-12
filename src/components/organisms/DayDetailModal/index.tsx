import { Modal } from 'antd';
import { format } from 'date-fns';
import type { CalendarEvent } from '@utils/activityStreamTransformers';
import { useTranslation } from 'react-i18next';
import { VideoRecorder } from '@vitalflow-icons/media/videoRecorder';
import { Image01 } from '@vitalflow-icons/files/image01';
import './styles.css';

export interface DayDetailModalProps {
  visible: boolean;
  date: Date | null;
  events: CalendarEvent[];
  onClose: () => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

/**
 * DayDetailModal - Shows all events for a selected day
 *
 * Features:
 * - Full list of day's activities sorted by time
 * - Event details with type, user, and time
 * - Media indicators for video/image content
 * - Click event to scroll to activity in timeline
 */
export default function DayDetailModal({
  visible,
  date,
  events,
  onClose,
  onSelectEvent,
}: DayDetailModalProps) {
  const { t } = useTranslation();

  if (!date) return null;

  // Sort events by time
  const sortedEvents = [...events].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  // Group events by activity type
  const eventsByType = sortedEvents.reduce((acc, event) => {
    const type = event.resource.activityType || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const activityTypeLabels: Record<string, string> = {
    program: t('activityTypes.program') || 'Program',
    rom: t('activityTypes.rom') || 'ROM Assessment',
    rehab: t('activityTypes.rehab') || 'Rehab Session',
    posture: t('activityTypes.posture') || 'Posture Analysis',
    'pain-assessment': t('activityTypes.painAssessment') || 'Pain Assessment',
    survey: t('activityTypes.survey') || 'Survey',
    message: t('activityTypes.message') || 'Message',
    video: t('activityTypes.video') || 'Video',
    image: t('activityTypes.image') || 'Image',
    evaluation: t('activityTypes.evaluation') || 'Evaluation',
  };

  return (
    <Modal
      title={
        <div className="day-detail-modal__title">
          <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
          <span className="day-detail-modal__count">
            {events.length} {t('calendar.activities') || 'activities'}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      className="day-detail-modal"
    >
      <div className="day-detail">
        {/* Summary section */}
        <div className="day-detail__summary">
          <div className="day-detail__summary-stats">
            {Object.entries(eventsByType).map(([type, typeEvents]) => (
              <div key={type} className="day-detail__summary-stat">
                <span className="day-detail__summary-stat-count">{typeEvents.length}</span>
                <span className="day-detail__summary-stat-label">
                  {activityTypeLabels[type] || type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Events list */}
        <div className="day-detail__events">
          {sortedEvents.length === 0 ? (
            <div className="day-detail__empty">
              {t('calendar.noActivities') || 'No activities on this day'}
            </div>
          ) : (
            sortedEvents.map((event) => (
              <div
                key={event.id}
                className={`day-detail__event day-detail__event--${event.resource.activityType}`}
                onClick={() => {
                  onSelectEvent(event);
                  onClose();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectEvent(event);
                    onClose();
                  }
                }}
                style={{
                  borderLeft: `4px solid ${
                    event.resource.activityType === 'program' ? 'var(--color-primary-500)'
                    : event.resource.activityType === 'rom' ? 'var(--color-blue-500)'
                    : event.resource.activityType === 'rehab' ? 'var(--color-green-500)'
                    : event.resource.activityType === 'posture' ? 'var(--color-purple-500)'
                    : event.resource.activityType === 'pain-assessment' ? 'var(--color-red-500)'
                    : event.resource.activityType === 'survey' ? 'var(--color-yellow-500)'
                    : event.resource.hasVideo ? 'var(--color-pink-500)'
                    : event.resource.hasImage ? 'var(--color-indigo-500)'
                    : 'var(--color-gray-500)'
                  }`,
                }}
              >
                {/* Time */}
                <div className="day-detail__event-time">
                  {format(event.start, 'h:mm a')}
                </div>

                {/* Info */}
                <div className="day-detail__event-info">
                  <div className="day-detail__event-header">
                    <h4 className="day-detail__event-title">{event.title}</h4>
                    <div className="day-detail__event-icons">
                      {event.resource.hasVideo && (
                        <VideoRecorder
                          width={14}
                          height={14}
                          color="var(--color-text-secondary)"
                          aria-label={t('common.dayDetail.modal.hasVideo')}
                        />
                      )}
                      {event.resource.hasImage && (
                        <Image01
                          width={14}
                          height={14}
                          color="var(--color-text-secondary)"
                          aria-label={t('common.dayDetail.modal.hasImage')}
                        />
                      )}
                    </div>
                  </div>

                  <div className="day-detail__event-meta">
                    <span className="day-detail__event-user">
                      {event.resource.userName}
                    </span>
                    <span className="day-detail__event-type">
                      {activityTypeLabels[event.resource.activityType] || event.resource.activityType}
                    </span>
                  </div>

                  {event.resource.message && (
                    <p className="day-detail__event-message">
                      {event.resource.message}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
