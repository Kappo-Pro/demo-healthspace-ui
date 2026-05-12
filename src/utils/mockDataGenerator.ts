import { addDays, addHours, addMinutes, subDays } from 'date-fns';
import type { CalendarEvent } from './activityStreamTransformers';

/**
 * Mock data generator for performance testing
 */

const activityTypes = [
  'program',
  'rom',
  'rehab',
  'posture',
  'pain-assessment',
  'survey',
  'video',
  'image',
  'evaluation',
];

const titles = [
  'Morning Exercise Program',
  'ROM Assessment',
  'Rehab Session',
  'Posture Analysis',
  'Pain Assessment',
  'Survey Response',
  'Video Recording',
  'Image Capture',
  'Virtual Evaluation',
  'Physical Therapy',
  'Mobility Check',
  'Strength Training',
  'Flexibility Assessment',
  'Balance Exercises',
  'Core Workout',
];

const users = [
  'John Doe',
  'Jane Smith',
  'Bob Johnson',
  'Alice Williams',
  'Charlie Brown',
  'Diana Prince',
  'Eve Anderson',
  'Frank Miller',
  'Grace Lee',
  'Henry Davis',
];

const messages = [
  'Completed morning stretching routine',
  'Shoulder mobility check',
  'Physical therapy exercises',
  'Lower back pain evaluation',
  'Excellent progress today',
  'Feeling much better',
  'Need to adjust intensity',
  'Great improvement in range of motion',
  'Experiencing some discomfort',
  'Ready for next level',
];

/**
 * Generate random calendar events for performance testing
 *
 * @param count - Number of events to generate
 * @param daysRange - Number of days to spread events across (default: 90)
 * @returns Array of mock calendar events
 *
 * @example
 * const events = generateMockEvents(1000, 30); // 1000 events over 30 days
 */
export function generateMockEvents(count: number, daysRange = 90): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const startDate = subDays(new Date(), daysRange / 2);

  for (let i = 0; i < count; i++) {
    // Random day within range
    const dayOffset = Math.floor(Math.random() * daysRange);
    const hourOffset = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
    const minuteOffset = Math.floor(Math.random() * 60);

    let eventDate = addDays(startDate, dayOffset);
    eventDate = addHours(eventDate, hourOffset);
    eventDate = addMinutes(eventDate, minuteOffset);

    const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const userName = users[Math.floor(Math.random() * users.length)];
    const hasMessage = Math.random() > 0.5;
    const hasVideo = Math.random() > 0.7;
    const hasImage = Math.random() > 0.7;

    events.push({
      id: `mock-event-${i}`,
      title,
      start: eventDate,
      end: eventDate,
      allDay: false,
      resource: {
        activityType,
        userId: `user-${Math.floor(Math.random() * users.length)}`,
        userName,
        message: hasMessage ? messages[Math.floor(Math.random() * messages.length)] : undefined,
        hasMedia: hasVideo || hasImage,
        hasVideo,
        hasImage,
        originalData: {} as unknown,
      },
    });
  }

  // Sort by date
  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Generate events with specific density patterns for testing
 *
 * @param pattern - 'sparse' | 'moderate' | 'dense' | 'extreme'
 * @returns Array of calendar events
 */
export function generateEventsByPattern(
  pattern: 'sparse' | 'moderate' | 'dense' | 'extreme'
): CalendarEvent[] {
  const patterns = {
    sparse: { count: 50, days: 90 },
    moderate: { count: 200, days: 60 },
    dense: { count: 500, days: 30 },
    extreme: { count: 1500, days: 30 },
  };

  const config = patterns[pattern];
  return generateMockEvents(config.count, config.days);
}
