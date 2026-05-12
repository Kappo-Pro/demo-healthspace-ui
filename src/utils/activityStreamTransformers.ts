import { format, parseISO, isValid } from 'date-fns';
import type { ActivityStreamData, EvaluationItem } from '@types';

/**
 * Calendar Event interface for react-big-calendar
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    activityType: string;
    userId: string;
    userName: string;
    message?: string;
    hasMedia: boolean;
    hasVideo: boolean;
    hasImage: boolean;
    evaluationType?: string;
    originalData: ActivityStreamData | EvaluationItem;
  };
}

/**
 * Activity type display names mapping
 */
const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  'program': 'Program',
  'rom': 'ROM Assessment',
  'rehab': 'Rehab Session',
  'posture': 'Posture Analysis',
  'pain-assessment': 'Pain Assessment',
  'survey': 'Survey',
  'message': 'Message',
  'video': 'Video Upload',
  'image': 'Image Upload',
  'evaluation': 'Evaluation',
};

/**
 * Get display title for activity based on type
 */
function getActivityTitle(item: ActivityStreamData | EvaluationItem): string {
  const isEvaluationItem = 'data' in item;
  const data = isEvaluationItem ? (item as EvaluationItem).data : (item as ActivityStreamData);

  // Check for evaluation type first
  const evaluationType = isEvaluationItem ? (item as EvaluationItem).type : undefined;
  if (evaluationType && ACTIVITY_TYPE_LABELS[evaluationType]) {
    return ACTIVITY_TYPE_LABELS[evaluationType];
  }

  // Check for activity type in data
  const activityType = data.activityType || data.type;
  if (activityType && ACTIVITY_TYPE_LABELS[activityType]) {
    return ACTIVITY_TYPE_LABELS[activityType];
  }

  // Check for media content
  if (data.videoUrl) return ACTIVITY_TYPE_LABELS['video'];
  if (data.imageUrl || (data.images && data.images.length > 0)) return ACTIVITY_TYPE_LABELS['image'];
  if (data.message) return ACTIVITY_TYPE_LABELS['message'];

  // Default fallback
  return 'Activity';
}

/**
 * Safely parse date from various formats
 */
function parseDate(dateValue: string | Date | undefined | null): Date | null {
  if (!dateValue) return null;

  // If already a Date object
  if (dateValue instanceof Date) {
    return isValid(dateValue) ? dateValue : null;
  }

  // Try parsing ISO string
  try {
    const parsed = parseISO(dateValue);
    return isValid(parsed) ? parsed : null;
  } catch {
    // Try direct Date constructor as fallback
    try {
      const parsed = new Date(dateValue);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

/**
 * Extract user information from activity data
 */
function extractUserInfo(item: ActivityStreamData | EvaluationItem): { userId: string; userName: string } {
  const isEvaluationItem = 'data' in item;
  const data = isEvaluationItem ? (item as EvaluationItem).data : (item as ActivityStreamData);

  const userId = data.userId || data.patientId || data.user?.id || 'unknown';
  const userName = data.userName ||
                   data.user?.name ||
                   data.user?.firstName && data.user?.lastName
                     ? `${data.user.firstName} ${data.user.lastName}`
                     : 'Unknown User';

  return { userId, userName };
}

/**
 * Transform a single ActivityStreamData or EvaluationItem to CalendarEvent
 */
export function transformActivityToEvent(
  item: ActivityStreamData | EvaluationItem
): CalendarEvent | null {
  const isEvaluationItem = 'data' in item;
  const data = isEvaluationItem ? (item as EvaluationItem).data : (item as ActivityStreamData);

  // Parse date from createdAt field
  const startDate = parseDate(data.createdAt);
  if (!startDate) {
    return null;
  }

  // Events are instantaneous (same start and end time)
  const endDate = new Date(startDate);

  // Extract user info
  const { userId, userName } = extractUserInfo(item);

  // Get activity type
  const activityType = isEvaluationItem
    ? (item as EvaluationItem).type
    : data.activityType || data.type || 'activity';

  // Check for media content
  const hasVideo = Boolean(data.videoUrl);
  const hasImage = Boolean(data.imageUrl || (data.images && data.images.length > 0));
  const hasMedia = hasVideo || hasImage;

  // Build calendar event
  const event: CalendarEvent = {
    id: data.id || data.activityStreamId || `activity-${Date.now()}`,
    title: getActivityTitle(item),
    start: startDate,
    end: endDate,
    allDay: false,
    resource: {
      activityType,
      userId,
      userName,
      message: data.message,
      hasMedia,
      hasVideo,
      hasImage,
      evaluationType: isEvaluationItem ? (item as EvaluationItem).type : undefined,
      originalData: item,
    },
  };

  return event;
}

/**
 * Transform array of activities to calendar events
 */
export function transformActivitiesToEvents(
  activities: (ActivityStreamData | EvaluationItem)[]
): CalendarEvent[] {
  if (!activities || !Array.isArray(activities)) {
    return [];
  }

  return activities
    .map(transformActivityToEvent)
    .filter((event): event is CalendarEvent => event !== null);
}

/**
 * Group events by date for calendar views
 */
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();

  events.forEach(event => {
    const dateKey = format(event.start, 'yyyy-MM-dd');
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, event]);
  });

  return grouped;
}

/**
 * Filter events by date range
 */
export function filterEventsByDateRange(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  return events.filter(event => {
    const eventDate = event.start.getTime();
    return eventDate >= startDate.getTime() && eventDate <= endDate.getTime();
  });
}

/**
 * Get event count by activity type
 */
export function getEventCountsByType(events: CalendarEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};

  events.forEach(event => {
    const type = event.resource.activityType;
    counts[type] = (counts[type] || 0) + 1;
  });

  return counts;
}

/**
 * Sort events by date (newest first)
 */
export function sortEventsByDate(events: CalendarEvent[], ascending = false): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const diff = a.start.getTime() - b.start.getTime();
    return ascending ? diff : -diff;
  });
}
