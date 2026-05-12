/**
 * Mock Scheduling API
 *
 * Provides mock data and API responses for scheduled activities
 * Used for frontend development while backend API is being implemented
 *
 * TO REPLACE: Once backend API is ready, replace with actual API calls in schedulingApi.ts
 */

import { addDays, addWeeks, format, parseISO } from 'date-fns';

// ============================================================================
// Types (matching backend API specification)
// ============================================================================

export enum ActivityType {
	PROGRAM = 'PROGRAM',
	ROM = 'ROM',
	SURVEY = 'SURVEY',
	REHAB = 'REHAB',
	POSTURE = 'POSTURE',
	PAIN_ASSESSMENT = 'PAIN_ASSESSMENT',
	EVALUATION = 'EVALUATION',
}

export enum ScheduledActivityStatus {
	PENDING = 'PENDING',
	DUE = 'DUE',
	OVERDUE = 'OVERDUE',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
	SKIPPED = 'SKIPPED',
}

export enum RecurrenceFrequency {
	DAILY = 'DAILY',
	WEEKLY = 'WEEKLY',
	MONTHLY = 'MONTHLY',
}

export interface RecurringRule {
	id: string;
	frequency: RecurrenceFrequency;
	interval: number;
	daysOfWeek?: number[]; // 0=Sunday, 6=Saturday
	dayOfMonth?: number;
	endDate?: string;
	occurrences?: number;
	createdAt: string;
	updatedAt: string;
}

export interface ScheduledActivity {
	id: string;
	userId: string;
	assignedByUserId: string;

	// Resource references
	programId?: string;
	romTemplateId?: string;
	surveyId?: string;

	// Scheduling
	scheduledFor: string; // ISO datetime
	scheduledDate: string; // YYYY-MM-DD
	scheduledTime: string | null; // HH:mm

	// Activity details
	activityType: ActivityType;
	title: string;
	description?: string;
	instructions?: string;

	// Status
	status: ScheduledActivityStatus;
	completedAt?: string;
	completedActivityId?: string;

	// Recurring
	isRecurring: boolean;
	recurringRuleId?: string;
	parentSeriesId?: string;

	// Notifications
	reminderSent: boolean;
	reminderSentAt?: string;

	// Audit
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;

	// Relations (optional)
	program?: {
		id: string;
		name: string;
		description?: string;
	};
	user?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	assignedBy?: {
		id: string;
		firstName: string;
		lastName: string;
	};
	recurringRule?: RecurringRule;

	metadata?: Record<string, unknown>;
}

export interface CreateScheduledActivityDto {
	userId: string;
	activityType: ActivityType;
	scheduledFor: string; // ISO datetime

	programId?: string;
	romTemplateId?: string;
	surveyId?: string;

	title?: string;
	description?: string;
	instructions?: string;

	isRecurring?: boolean;
	recurringRule?: {
		frequency: RecurrenceFrequency;
		interval?: number;
		daysOfWeek?: number[];
		dayOfMonth?: number;
		endDate?: string;
		occurrences?: number;
	};

	metadata?: Record<string, unknown>;
}

export interface ScheduledActivityFilters {
	userId?: string;
	assignedByUserId?: string;
	activityType?: ActivityType;
	status?: ScheduledActivityStatus[];
	startDate?: string; // YYYY-MM-DD
	endDate?: string; // YYYY-MM-DD
	includeRecurring?: boolean;
	page?: number;
	limit?: number;
	sortBy?: 'scheduledFor' | 'createdAt' | 'status';
	sortOrder?: 'asc' | 'desc';
	include?: string[]; // ['program', 'user', 'assignedBy', 'recurringRule']
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

// ============================================================================
// Mock Data Store (in-memory)
// ============================================================================

class MockDataStore {
	private scheduledActivities: Map<string, ScheduledActivity> = new Map();
	private recurringRules: Map<string, RecurringRule> = new Map();
	private idCounter = 1;

	constructor() {
		this.seedMockData();
	}

	private generateId(): string {
		return `mock-${this.idCounter++}-${Date.now()}`;
	}

	private seedMockData() {
		const now = new Date();
		const mockUserId = 'user-patient-123';
		const mockTherapistId = 'user-therapist-456';

		// Mock programs
		const mockProgram = {
			id: 'program-001',
			name: 'Lower Back Strengthening',
			description: '10-minute daily exercises for lower back pain',
		};

		// Mock ROM template
		const mockRomTemplate = {
			id: 'rom-template-001',
			name: 'Shoulder Mobility Assessment',
		};

		// Seed data: Various scheduled activities
		const activities: Partial<ScheduledActivity>[] = [
			// Today's activities
			{
				userId: mockUserId,
				assignedByUserId: mockTherapistId,
				activityType: ActivityType.PROGRAM,
				scheduledFor: format(addDays(now, 0), "yyyy-MM-dd'T'09:00:00'Z'"),
				title: 'Morning Exercise Program',
				description: 'Complete your daily morning stretches',
				status: ScheduledActivityStatus.PENDING,
				programId: mockProgram.id,
				program: mockProgram,
				isRecurring: false,
			},
			{
				userId: mockUserId,
				assignedByUserId: mockTherapistId,
				activityType: ActivityType.ROM,
				scheduledFor: format(addDays(now, 0), "yyyy-MM-dd'T'14:00:00'Z'"),
				title: 'Afternoon ROM Check',
				status: ScheduledActivityStatus.DUE,
				romTemplateId: mockRomTemplate.id,
				isRecurring: false,
			},

			// Tomorrow
			{
				userId: mockUserId,
				assignedByUserId: mockTherapistId,
				activityType: ActivityType.PROGRAM,
				scheduledFor: format(addDays(now, 1), "yyyy-MM-dd'T'09:00:00'Z'"),
				title: 'Morning Exercise Program',
				status: ScheduledActivityStatus.PENDING,
				programId: mockProgram.id,
				program: mockProgram,
				isRecurring: false,
			},

			// Next week - recurring
			{
				userId: mockUserId,
				assignedByUserId: mockTherapistId,
				activityType: ActivityType.SURVEY,
				scheduledFor: format(addWeeks(now, 1), "yyyy-MM-dd'T'10:00:00'Z'"),
				title: 'Weekly Pain Assessment',
				status: ScheduledActivityStatus.PENDING,
				surveyId: 'survey-001',
				isRecurring: true,
				recurringRuleId: 'recurring-rule-001',
			},

			// Yesterday - overdue
			{
				userId: mockUserId,
				assignedByUserId: mockTherapistId,
				activityType: ActivityType.PROGRAM,
				scheduledFor: format(addDays(now, -1), "yyyy-MM-dd'T'09:00:00'Z'"),
				title: 'Morning Exercise Program',
				status: ScheduledActivityStatus.OVERDUE,
				programId: mockProgram.id,
				program: mockProgram,
				isRecurring: false,
			},

			// Last week - completed
			{
				userId: mockUserId,
				assignedByUserId: mockTherapistId,
				activityType: ActivityType.ROM,
				scheduledFor: format(addDays(now, -7), "yyyy-MM-dd'T'14:00:00'Z'"),
				title: 'ROM Assessment',
				status: ScheduledActivityStatus.COMPLETED,
				completedAt: format(addDays(now, -7), "yyyy-MM-dd'T'14:15:00'Z'"),
				completedActivityId: 'activity-completed-001',
				romTemplateId: mockRomTemplate.id,
				isRecurring: false,
			},
		];

		// Create scheduled activities
		activities.forEach(activityData => {
			const id = this.generateId();
			if (!activityData.scheduledFor) return;
			const scheduledFor = new Date(activityData.scheduledFor);
			const scheduledDate = format(scheduledFor, 'yyyy-MM-dd');
			const scheduledTime = format(scheduledFor, 'HH:mm');

			const activity: ScheduledActivity = {
				id,
				scheduledDate,
				scheduledTime,
				reminderSent: false,
				createdAt: format(
					addDays(scheduledFor, -7),
					"yyyy-MM-dd'T'12:00:00'Z'",
				),
				updatedAt: format(
					addDays(scheduledFor, -7),
					"yyyy-MM-dd'T'12:00:00'Z'",
				),
				...activityData,
			} as ScheduledActivity;

			this.scheduledActivities.set(id, activity);
		});

		// Create recurring rule
		const recurringRule: RecurringRule = {
			id: 'recurring-rule-001',
			frequency: RecurrenceFrequency.WEEKLY,
			interval: 1,
			daysOfWeek: [1], // Monday
			occurrences: 12,
			createdAt: format(now, "yyyy-MM-dd'T'12:00:00'Z'"),
			updatedAt: format(now, "yyyy-MM-dd'T'12:00:00'Z'"),
		};
		this.recurringRules.set(recurringRule.id, recurringRule);
	}

	getAll(): ScheduledActivity[] {
		return Array.from(this.scheduledActivities.values());
	}

	getById(id: string): ScheduledActivity | undefined {
		return this.scheduledActivities.get(id);
	}

	create(activity: ScheduledActivity): ScheduledActivity {
		this.scheduledActivities.set(activity.id, activity);
		return activity;
	}

	update(
		id: string,
		updates: Partial<ScheduledActivity>,
	): ScheduledActivity | undefined {
		const activity = this.scheduledActivities.get(id);
		if (!activity) return undefined;

		const updated = {
			...activity,
			...updates,
			updatedAt: new Date().toISOString(),
		};

		this.scheduledActivities.set(id, updated);
		return updated;
	}

	delete(id: string): boolean {
		return this.scheduledActivities.delete(id);
	}

	getRecurringRule(id: string): RecurringRule | undefined {
		return this.recurringRules.get(id);
	}
}

const mockStore = new MockDataStore();

// ============================================================================
// Mock API Functions
// ============================================================================

/**
 * Simulate API delay
 */
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create scheduled activity
 */
export async function createScheduledActivity(
	dto: CreateScheduledActivityDto,
	assignedByUserId = 'user-therapist-456',
): Promise<ScheduledActivity> {
	await delay(300);

	const id = `mock-${Date.now()}`;
	const scheduledFor = parseISO(dto.scheduledFor);
	const scheduledDate = format(scheduledFor, 'yyyy-MM-dd');
	const scheduledTime = format(scheduledFor, 'HH:mm');

	// Auto-generate title if not provided
	const titleMap: Record<ActivityType, string> = {
		[ActivityType.PROGRAM]: 'Exercise Program',
		[ActivityType.ROM]: 'ROM Assessment',
		[ActivityType.SURVEY]: 'Survey',
		[ActivityType.REHAB]: 'Rehabilitation Session',
		[ActivityType.POSTURE]: 'Posture Analysis',
		[ActivityType.PAIN_ASSESSMENT]: 'Pain Assessment',
		[ActivityType.EVALUATION]: 'Evaluation',
	};

	const activity: ScheduledActivity = {
		id,
		userId: dto.userId,
		assignedByUserId,
		activityType: dto.activityType,
		scheduledFor: dto.scheduledFor,
		scheduledDate,
		scheduledTime,
		title: dto.title || titleMap[dto.activityType],
		description: dto.description,
		instructions: dto.instructions,
		programId: dto.programId,
		romTemplateId: dto.romTemplateId,
		surveyId: dto.surveyId,
		status: ScheduledActivityStatus.PENDING,
		isRecurring: dto.isRecurring || false,
		reminderSent: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		metadata: dto.metadata,
	};

	// Handle recurring events
	if (dto.isRecurring && dto.recurringRule) {
		const ruleId = `recurring-rule-${Date.now()}`;
		activity.recurringRuleId = ruleId;
		// In real implementation, would generate recurring instances here
	}

	return mockStore.create(activity);
}

/**
 * Get scheduled activities with filters
 */
export async function getScheduledActivities(
	filters: ScheduledActivityFilters = {},
): Promise<PaginatedResponse<ScheduledActivity>> {
	await delay(400);

	let activities = mockStore.getAll();

	// Apply filters
	if (filters.userId) {
		activities = activities.filter(a => a.userId === filters.userId);
	}

	if (filters.assignedByUserId) {
		activities = activities.filter(
			a => a.assignedByUserId === filters.assignedByUserId,
		);
	}

	if (filters.activityType) {
		activities = activities.filter(
			a => a.activityType === filters.activityType,
		);
	}

	if (filters.status && filters.status.length > 0) {
		activities = activities.filter(a => filters.status?.includes(a.status));
	}

	if (filters.startDate) {
		activities = activities.filter(a => a.scheduledDate >= filters.startDate);
	}

	if (filters.endDate) {
		activities = activities.filter(a => a.scheduledDate <= filters.endDate);
	}

	// Sorting
	const sortBy = filters.sortBy || 'scheduledFor';
	const sortOrder = filters.sortOrder || 'asc';
	activities.sort((a, b) => {
		const aVal = a[sortBy];
		const bVal = b[sortBy];
		const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
		return sortOrder === 'asc' ? comparison : -comparison;
	});

	// Pagination
	const page = filters.page || 1;
	const limit = filters.limit || 50;
	const total = activities.length;
	const start = (page - 1) * limit;
	const end = start + limit;
	const data = activities.slice(start, end);

	return {
		data,
		pagination: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
	};
}

/**
 * Get single scheduled activity by ID
 */
export async function getScheduledActivity(
	id: string,
	include?: string[],
): Promise<ScheduledActivity | null> {
	await delay(200);

	const activity = mockStore.getById(id);
	if (!activity) return null;

	// Populate relations if requested
	if (include?.includes('recurringRule') && activity.recurringRuleId) {
		activity.recurringRule = mockStore.getRecurringRule(
			activity.recurringRuleId,
		);
	}

	return activity;
}

/**
 * Update scheduled activity
 */
export async function updateScheduledActivity(
	id: string,
	updates: Partial<ScheduledActivity>,
): Promise<ScheduledActivity | null> {
	await delay(300);

	return mockStore.update(id, updates) || null;
}

/**
 * Delete scheduled activity
 */
export async function deleteScheduledActivity(
	id: string,
	_deleteSeries = false,
): Promise<boolean> {
	await delay(200);

	// In real implementation, would handle _deleteSeries for recurring events
	return mockStore.delete(id);
}

/**
 * Mark scheduled activity as completed
 */
export async function completeScheduledActivity(
	id: string,
	completionData: {
		completedAt?: string;
		notes?: string;
		activityData?: Record<string, unknown>;
	} = {},
): Promise<{
	scheduledActivity: ScheduledActivity;
	activity: { id: string; [key: string]: unknown };
}> {
	await delay(400);

	const activity = mockStore.getById(id);
	if (!activity) {
		throw new Error('Scheduled activity not found');
	}

	const completedAt = completionData.completedAt || new Date().toISOString();
	const completedActivityId = `activity-${Date.now()}`;

	const updatedActivity = mockStore.update(id, {
		status: ScheduledActivityStatus.COMPLETED,
		completedAt,
		completedActivityId,
	});

	// Create mock Activity record
	const createdActivity = {
		id: completedActivityId,
		userId: activity.userId,
		activityType: activity.activityType,
		createdAt: completedAt,
		scheduledActivityId: id,
		notes: completionData.notes,
		...completionData.activityData,
	};

	if (!updatedActivity) {
		throw new Error('Failed to update scheduled activity');
	}

	return {
		scheduledActivity: updatedActivity,
		activity: createdActivity,
	};
}

/**
 * Bulk operations
 */
export async function bulkScheduledActivities(
	operation: 'create' | 'update' | 'delete',
	activities: unknown[],
): Promise<{
	success: number;
	failed: number;
	results: Array<{
		index: number;
		success: boolean;
		data?: unknown;
		error?: string;
	}>;
}> {
	await delay(600);

	const results: unknown[] = [];
	let success = 0;
	let failed = 0;

	for (let i = 0; i < activities.length; i++) {
		try {
			let data;
			if (operation === 'create') {
				data = await createScheduledActivity(activities[i]);
			} else if (operation === 'update') {
				data = await updateScheduledActivity(activities[i].id, activities[i]);
			} else if (operation === 'delete') {
				await deleteScheduledActivity(activities[i].id);
			}

			results.push({ index: i, success: true, data });
			success++;
		} catch (error: unknown) {
			results.push({ index: i, success: false, error: error.message });
			failed++;
		}
	}

	return { success, failed, results };
}

/**
 * Bulk delete activities
 */
export async function bulkDeleteActivities(
	activityIds: string[],
): Promise<void> {
	await delay(400);

	for (const id of activityIds) {
		mockStore.delete(id);
	}
}

/**
 * Bulk reschedule activities to specific date
 */
export async function bulkRescheduleActivities(
	activityIds: string[],
	newDate: Date,
): Promise<void> {
	await delay(400);

	for (const id of activityIds) {
		const activity = mockStore.getById(id);
		if (activity) {
			const scheduledFor = new Date(newDate);
			// Preserve original time
			const originalTime = activity.scheduledTime;
			if (originalTime) {
				const [hours, minutes] = originalTime.split(':');
				scheduledFor.setHours(parseInt(hours), parseInt(minutes));
			}

			mockStore.update(id, {
				scheduledFor: scheduledFor.toISOString(),
				scheduledDate: format(scheduledFor, 'yyyy-MM-dd'),
				scheduledTime: originalTime,
			});
		}
	}
}

/**
 * Bulk shift activities by days
 */
export async function bulkShiftActivitiesByDays(
	activityIds: string[],
	days: number,
): Promise<void> {
	await delay(400);

	for (const id of activityIds) {
		const activity = mockStore.getById(id);
		if (activity) {
			const currentDate = new Date(activity.scheduledFor);
			const newDate = addDays(currentDate, days);

			mockStore.update(id, {
				scheduledFor: newDate.toISOString(),
				scheduledDate: format(newDate, 'yyyy-MM-dd'),
			});
		}
	}
}

/**
 * Bulk update activity status
 */
export async function bulkUpdateActivityStatus(
	activityIds: string[],
	status: ScheduledActivityStatus,
): Promise<void> {
	await delay(400);

	for (const id of activityIds) {
		const updates: Partial<ScheduledActivity> = {
			status,
		};

		// Add timestamps for completed activities
		if (status === ScheduledActivityStatus.COMPLETED) {
			updates.completedAt = new Date().toISOString();
			updates.completedActivityId = `activity-${Date.now()}-${id}`;
		}

		mockStore.update(id, updates);
	}
}

// ============================================================================
// Export mock store for testing
// ============================================================================

export { mockStore };
