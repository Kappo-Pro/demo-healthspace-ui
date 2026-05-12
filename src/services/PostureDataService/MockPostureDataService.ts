/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * Mock Posture Data Service
 *
 * In-memory implementation for development and testing.
 * Generates realistic fake data using @faker-js/faker.
 * Simulates API latency (200-500ms) to reveal loading state issues.
 *
 * @module services/PostureDataService/MockPostureDataService
 */

import { faker } from '@faker-js/faker';
import type {
	PostureSession,
	PostureStatus,
	PostureMetrics,
	PostureIssue,
	AdminFilter,
	ExerciseRecommendation,
	PoseKeypoint,
} from '@types/posture';
import type {
	OrganizationalMetricsData,
	OrganizationalMetricsFilter,
	CohortData,
	RiskDistribution,
	EngagementDataPoint,
	ExportTemplate,
	ExecutiveSummary,
} from '@types/organizationalMetrics';
import type {
	IPostureDataService,
	PaginationParams,
	PostureSessionPage,
	PostureSessionDetail,
	AdminDashboardData,
	BulkUpdateResult,
	ClinicalOutcomes,
	MetricOutcome,
	ServiceError,
} from './types';

/**
 * Mock Posture Data Service
 *
 * Features:
 * - 100+ realistic patient records
 * - Simulated API latency (200-500ms)
 * - In-memory CRUD operations
 * - Edge cases (empty states, errors, partial data)
 * - Consistent data relationships (sessions → recommendations)
 */
export class MockPostureDataService implements IPostureDataService {
	/** In-memory session storage */
	private sessions: Map<string, PostureSession>;

	/** In-memory session details storage */
	private sessionDetails: Map<string, PostureSessionDetail>;

	/** Simulated error rate (0-1) */
	private errorRate: number;

	/** Latency range (ms) */
	private latencyRange: { min: number; max: number };

	constructor(options?: {
		sessionCount?: number;
		errorRate?: number;
		latency?: { min: number; max: number };
	}) {
		this.sessions = new Map();
		this.sessionDetails = new Map();
		this.errorRate = options?.errorRate ?? 0; // 0% error rate by default
		this.latencyRange = options?.latency ?? { min: 200, max: 500 };

		// Generate initial dataset
		this.generateSessions(options?.sessionCount ?? 120);
	}

	/**
	 * Simulate network latency
	 */
	private async simulateLatency(): Promise<void> {
		const delay =
			Math.random() * (this.latencyRange.max - this.latencyRange.min) +
			this.latencyRange.min;
		await new Promise(resolve => setTimeout(resolve, delay));
	}

	/**
	 * Simulate random errors
	 */
	private maybeThrowError(operation: string): void {
		if (Math.random() < this.errorRate) {
			const error: ServiceError = new Error(
				`Mock error: ${operation}`,
			) as ServiceError;
			error.userMessage = `Simulated error during ${operation}. Please try again.`;
			error.retryable = true;
			error.statusCode = 500;
			throw error;
		}
	}

	/**
	 * Generate realistic posture sessions
	 */
	private generateSessions(count: number): void {
		const patientIds = Array.from({ length: 20 }, () => faker.string.uuid());

		for (let i = 0; i < count; i++) {
			const patientId = faker.helpers.arrayElement(patientIds);
			const session = this.generateSession(patientId);
			this.sessions.set(session.id, session);

			// Generate detailed view
			const detail = this.generateSessionDetail(session);
			this.sessionDetails.set(session.id, detail);
		}
	}

	/**
	 * Generate a single realistic session
	 */
	private generateSession(patientId: string): PostureSession {
		const score = faker.number.int({ min: 20, max: 100 });
		const status = this.scoreToStatus(score);

		const metrics: PostureMetrics = {
			headAlignment: faker.number.int({ min: 40, max: 100 }),
			shoulderSymmetry: faker.number.int({ min: 40, max: 100 }),
			spineCurvature: faker.number.int({ min: 40, max: 100 }),
			hipAlignment: faker.number.int({ min: 40, max: 100 }),
			balance: faker.number.int({ min: 40, max: 100 }),
			trends: {
				headAlignment: faker.number.float({
					min: -15,
					max: 15,
					fractionDigits: 1,
				}),
				shoulderSymmetry: faker.number.float({
					min: -15,
					max: 15,
					fractionDigits: 1,
				}),
				spineCurvature: faker.number.float({
					min: -15,
					max: 15,
					fractionDigits: 1,
				}),
				hipAlignment: faker.number.float({
					min: -15,
					max: 15,
					fractionDigits: 1,
				}),
				balance: faker.number.float({ min: -15, max: 15, fractionDigits: 1 }),
			},
		};

		const issues = this.generateIssues(metrics, status);
		const poseData = this.generatePoseData();

		return {
			id: faker.string.uuid(),
			userId: patientId,
			timestamp: faker.date.recent({ days: 90 }).toISOString(),
			duration: faker.number.int({ min: 30, max: 180 }),
			poseData,
			analysis: {
				overallScore: score,
				status,
				metrics,
				issues,
				insights: this.generateInsights(metrics, issues),
			},
			metadata: {
				deviceType: faker.helpers.arrayElement([
					'mobile',
					'desktop',
					'tablet',
				] as const),
				cameraQuality: faker.helpers.arrayElement([
					'low',
					'medium',
					'high',
				] as const),
				lighting: faker.helpers.arrayElement(['poor', 'fair', 'good'] as const),
			},
		};
	}

	/**
	 * Generate session detail with recommendations
	 */
	private generateSessionDetail(session: PostureSession): PostureSessionDetail {
		const relatedSessions = Array.from(this.sessions.values())
			.filter(s => s.userId === session.userId && s.id !== session.id)
			.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
			)
			.slice(0, 3);

		const recommendations = this.generateRecommendations(
			session.analysis.issues,
		);

		return {
			...session,
			relatedSessions,
			recommendations,
			clinicalNotes: faker.helpers.maybe(
				() => faker.lorem.sentence({ min: 10, max: 20 }),
				{ probability: 0.3 },
			),
			reviewStatus: faker.helpers.arrayElement([
				'pending',
				'reviewed',
				'flagged',
			] as const),
		};
	}

	/**
	 * Generate realistic pose keypoints
	 */
	private generatePoseData(): PoseKeypoint[] {
		const keypointNames = [
			'nose',
			'left_eye',
			'right_eye',
			'left_ear',
			'right_ear',
			'left_shoulder',
			'right_shoulder',
			'left_elbow',
			'right_elbow',
			'left_wrist',
			'right_wrist',
			'left_hip',
			'right_hip',
			'left_knee',
			'right_knee',
			'left_ankle',
			'right_ankle',
		];

		return keypointNames.map(name => ({
			name,
			x: faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 3 }),
			y: faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 3 }),
			z: faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 3 }),
			confidence: faker.number.float({ min: 0.7, max: 1.0, fractionDigits: 3 }),
		}));
	}

	/**
	 * Convert score to status
	 */
	private scoreToStatus(score: number): PostureStatus {
		if (score >= 90) return 'excellent';
		if (score >= 70) return 'good';
		if (score >= 50) return 'fair';
		if (score >= 30) return 'poor';
		return 'critical';
	}

	/**
	 * Generate issues based on metrics
	 */
	private generateIssues(
		metrics: PostureMetrics,
		status: PostureStatus,
	): PostureIssue[] {
		const issues: PostureIssue[] = [];

		// Critical/poor status gets more issues
		const issueCount =
			status === 'critical' || status === 'poor'
				? faker.number.int({ min: 2, max: 4 })
				: status === 'fair'
					? faker.number.int({ min: 1, max: 2 })
					: faker.number.int({ min: 0, max: 1 });

		const issueTemplates = [
			{
				title: 'Forward Head Posture',
				description:
					'Head is positioned significantly forward of the shoulders, increasing neck strain.',
				affectedArea: 'head' as const,
				metric: 'headAlignment',
			},
			{
				title: 'Shoulder Imbalance',
				description:
					'Left and right shoulders are not level, indicating asymmetry.',
				affectedArea: 'shoulders' as const,
				metric: 'shoulderSymmetry',
			},
			{
				title: 'Excessive Spinal Curvature',
				description: 'Spine shows abnormal curvature (kyphosis or lordosis).',
				affectedArea: 'spine' as const,
				metric: 'spineCurvature',
			},
			{
				title: 'Hip Misalignment',
				description: 'Pelvic tilt detected, affecting overall balance.',
				affectedArea: 'hips' as const,
				metric: 'hipAlignment',
			},
		];

		// Pick worst metrics for issues
		const metricEntries = Object.entries(metrics).filter(
			([key]) => key !== 'trends',
		) as Array<[keyof Omit<PostureMetrics, 'trends'>, number]>;
		const sortedMetrics = metricEntries.sort((a, b) => a[1] - b[1]);

		for (let i = 0; i < Math.min(issueCount, issueTemplates.length); i++) {
			const template = issueTemplates.find(
				t => t.metric === sortedMetrics[i][0],
			);
			if (template) {
				const severity =
					sortedMetrics[i][1] < 40
						? 'critical'
						: sortedMetrics[i][1] < 60
							? 'major'
							: ('minor' as const);

				issues.push({
					id: faker.string.uuid(),
					severity,
					title: template.title,
					description: template.description,
					affectedArea: template.affectedArea,
					recommendedExercises: faker.helpers.maybe(
						() => [faker.lorem.words(3), faker.lorem.words(3)],
						{ probability: 0.7 },
					),
				});
			}
		}

		return issues;
	}

	/**
	 * Generate AI insights
	 */
	private generateInsights(
		metrics: PostureMetrics,
		issues: PostureIssue[],
	): string[] {
		const insights: string[] = [];

		if (issues.length > 0) {
			insights.push(
				`${issues.length} posture issue${issues.length > 1 ? 's' : ''} detected requiring attention.`,
			);
		}

		const avgScore =
			(metrics.headAlignment +
				metrics.shoulderSymmetry +
				metrics.spineCurvature +
				metrics.hipAlignment +
				metrics.balance) /
			5;

		if (avgScore >= 80) {
			insights.push('Overall posture shows good alignment and balance.');
		} else if (avgScore < 60) {
			insights.push(
				'Multiple areas need improvement. Consider targeted exercise program.',
			);
		}

		if (metrics.trends) {
			const improvingMetrics = Object.values(metrics.trends).filter(
				t => t > 5,
			).length;
			if (improvingMetrics >= 3) {
				insights.push('Positive trends observed in multiple metrics.');
			}
		}

		return insights;
	}

	/**
	 * Generate exercise recommendations
	 */
	private generateRecommendations(
		issues: PostureIssue[],
	): ExerciseRecommendation[] {
		const exercises: ExerciseRecommendation[] = [
			{
				id: faker.string.uuid(),
				title: 'Chin Tucks',
				description: 'Strengthen neck muscles and improve head alignment',
				targetAreas: ['head'],
				difficulty: 'beginner',
				duration: 5,
				relevanceScore: 85,
				media: {
					thumbnailUrl: faker.image.urlLoremFlickr({
						category: 'exercise',
						width: 300,
						height: 200,
					}),
					videoUrl: faker.helpers.maybe(() =>
						faker.internet.url({ appendSlash: false }),
					),
				},
				instructions: [
					'Sit or stand with good posture',
					'Gently tuck your chin toward your chest',
					'Hold for 5 seconds',
					'Repeat 10 times',
				],
				benefits: [
					'Reduces forward head posture',
					'Strengthens deep neck flexors',
				],
			},
			{
				id: faker.string.uuid(),
				title: 'Shoulder Blade Squeezes',
				description: 'Improve shoulder symmetry and upper back strength',
				targetAreas: ['shoulders'],
				difficulty: 'beginner',
				duration: 5,
				relevanceScore: 80,
				media: {
					thumbnailUrl: faker.image.urlLoremFlickr({
						category: 'exercise',
						width: 300,
						height: 200,
					}),
				},
				instructions: [
					'Sit upright with arms at sides',
					'Squeeze shoulder blades together',
					'Hold for 5 seconds',
					'Relax and repeat 15 times',
				],
				benefits: ['Corrects rounded shoulders', 'Improves upper back posture'],
			},
			{
				id: faker.string.uuid(),
				title: 'Cat-Cow Stretch',
				description: 'Mobilize spine and improve flexibility',
				targetAreas: ['spine', 'core'],
				difficulty: 'beginner',
				duration: 5,
				relevanceScore: 75,
				media: {
					thumbnailUrl: faker.image.urlLoremFlickr({
						category: 'exercise',
						width: 300,
						height: 200,
					}),
					videoUrl: faker.helpers.maybe(() =>
						faker.internet.url({ appendSlash: false }),
					),
				},
				instructions: [
					'Start on hands and knees',
					'Arch back (cat pose)',
					'Drop belly and lift chest (cow pose)',
					'Repeat 10 times slowly',
				],
				benefits: ['Increases spinal mobility', 'Reduces back pain'],
			},
		];

		// Filter by relevant issues
		if (issues.length > 0) {
			return exercises
				.filter(ex =>
					issues.some(issue =>
						ex.targetAreas.includes(issue.affectedArea as never),
					),
				)
				.slice(0, 3);
		}

		return exercises.slice(0, 2);
	}

	/**
	 * Get paginated patient sessions
	 */
	async getPatientSessions(
		patientId: string,
		params: PaginationParams,
	): Promise<PostureSessionPage> {
		await this.simulateLatency();
		this.maybeThrowError('getPatientSessions');

		const allPatientSessions = Array.from(this.sessions.values())
			.filter(s => s.userId === patientId)
			.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
			);

		const totalCount = allPatientSessions.length;
		const totalPages = Math.ceil(totalCount / params.pageSize);
		const start = (params.page - 1) * params.pageSize;
		const end = start + params.pageSize;
		const data = allPatientSessions.slice(start, end);

		return {
			data,
			pagination: {
				currentPage: params.page,
				pageSize: params.pageSize,
				totalCount,
				totalPages,
			},
		};
	}

	/**
	 * Get session detail
	 */
	async getSessionDetail(sessionId: string): Promise<PostureSessionDetail> {
		await this.simulateLatency();
		this.maybeThrowError('getSessionDetail');

		const detail = this.sessionDetails.get(sessionId);
		if (!detail) {
			const error: ServiceError = new Error(
				`Session not found: ${sessionId}`,
			) as ServiceError;
			error.userMessage = 'Session not found. It may have been deleted.';
			error.statusCode = 404;
			error.retryable = false;
			throw error;
		}

		return detail;
	}

	/**
	 * Get admin dashboard data
	 */
	async getAdminDashboard(filters: AdminFilter): Promise<AdminDashboardData> {
		await this.simulateLatency();
		this.maybeThrowError('getAdminDashboard');

		let sessions = Array.from(this.sessions.values());

		// Apply filters
		if (filters.status && filters.status.length > 0) {
			sessions = sessions.filter(s =>
				filters.status!.includes(s.analysis.status),
			);
		}

		if (filters.dateRange) {
			const start = new Date(filters.dateRange.start);
			const end = new Date(filters.dateRange.end);
			sessions = sessions.filter(s => {
				const date = new Date(s.timestamp);
				return date >= start && date <= end;
			});
		}

		if (filters.scoreRange) {
			sessions = sessions.filter(
				s =>
					s.analysis.overallScore >= filters.scoreRange!.min &&
					s.analysis.overallScore <= filters.scoreRange!.max,
			);
		}

		if (filters.issueSeverity && filters.issueSeverity.length > 0) {
			sessions = sessions.filter(s =>
				s.analysis.issues.some(issue =>
					filters.issueSeverity!.includes(issue.severity),
				),
			);
		}

		if (filters.searchQuery) {
			const query = filters.searchQuery.toLowerCase();
			sessions = sessions.filter(s => s.userId.toLowerCase().includes(query));
		}

		// Apply sorting
		if (filters.sort) {
			sessions.sort((a, b) => {
				let aVal: string | number;
				let bVal: string | number;

				switch (filters.sort!.field) {
					case 'timestamp':
						aVal = new Date(a.timestamp).getTime();
						bVal = new Date(b.timestamp).getTime();
						break;
					case 'score':
						aVal = a.analysis.overallScore;
						bVal = b.analysis.overallScore;
						break;
					case 'status':
						aVal = a.analysis.status;
						bVal = b.analysis.status;
						break;
					default:
						aVal = a.userId;
						bVal = b.userId;
				}

				const order = filters.sort!.order === 'asc' ? 1 : -1;
				return aVal > bVal ? order : aVal < bVal ? -order : 0;
			});
		}

		// Calculate summary stats
		const uniquePatients = new Set(sessions.map(s => s.userId));
		const criticalCases = sessions.filter(
			s => s.analysis.status === 'critical' || s.analysis.status === 'poor',
		).length;
		const avgScore =
			sessions.reduce((sum, s) => sum + s.analysis.overallScore, 0) /
			(sessions.length || 1);

		// Status breakdown
		const statusBreakdown: Record<PostureStatus, number> = {
			excellent: 0,
			good: 0,
			fair: 0,
			poor: 0,
			critical: 0,
		};
		sessions.forEach(s => {
			statusBreakdown[s.analysis.status]++;
		});

		// Pagination
		const page = filters.pagination?.page ?? 1;
		const pageSize = filters.pagination?.pageSize ?? 50;
		const totalCount = sessions.length;
		const totalPages = Math.ceil(totalCount / pageSize);
		const start = (page - 1) * pageSize;
		const paginatedSessions = sessions.slice(start, start + pageSize);

		return {
			sessions: paginatedSessions,
			summary: {
				totalPatients: uniquePatients.size,
				totalSessions: sessions.length,
				criticalCases,
				avgScore: Math.round(avgScore * 10) / 10,
			},
			statusBreakdown,
			pagination: {
				currentPage: page,
				pageSize,
				totalCount,
				totalPages,
			},
		};
	}

	/**
	 * Update session status
	 */
	async updateSessionStatus(
		sessionId: string,
		status: PostureSessionDetail['reviewStatus'],
	): Promise<void> {
		await this.simulateLatency();
		this.maybeThrowError('updateSessionStatus');

		const detail = this.sessionDetails.get(sessionId);
		if (!detail) {
			const error: ServiceError = new Error(
				`Session not found: ${sessionId}`,
			) as ServiceError;
			error.userMessage = 'Session not found. It may have been deleted.';
			error.statusCode = 404;
			error.retryable = false;
			throw error;
		}

		detail.reviewStatus = status;
	}

	/**
	 * Bulk update sessions
	 */
	async bulkUpdate(
		sessionIds: string[],
		updates: Partial<PostureSession>,
	): Promise<BulkUpdateResult> {
		await this.simulateLatency();
		this.maybeThrowError('bulkUpdate');

		const failedIds: string[] = [];
		const errors: Record<string, string> = {};
		let updatedCount = 0;

		for (const sessionId of sessionIds) {
			const session = this.sessions.get(sessionId);
			if (!session) {
				failedIds.push(sessionId);
				errors[sessionId] = 'Session not found';
				continue;
			}

			// Simulate 10% failure rate per session
			if (Math.random() < 0.1) {
				failedIds.push(sessionId);
				errors[sessionId] = 'Update failed (simulated error)';
				continue;
			}

			// Apply updates
			Object.assign(session, updates);
			updatedCount++;
		}

		return {
			updatedCount,
			failedIds,
			errors,
		};
	}

	/**
	 * Get exercise recommendations
	 */
	async getExerciseRecommendations(
		sessionId: string,
	): Promise<ExerciseRecommendation[]> {
		await this.simulateLatency();
		this.maybeThrowError('getExerciseRecommendations');

		const detail = this.sessionDetails.get(sessionId);
		if (!detail) {
			const error: ServiceError = new Error(
				`Session not found: ${sessionId}`,
			) as ServiceError;
			error.userMessage = 'Session not found. It may have been deleted.';
			error.statusCode = 404;
			error.retryable = false;
			throw error;
		}

		return detail.recommendations;
	}

	/**
	 * Get clinical outcomes
	 */
	async getClinicalOutcomes(patientId: string): Promise<ClinicalOutcomes> {
		await this.simulateLatency();
		this.maybeThrowError('getClinicalOutcomes');

		const patientSessions = Array.from(this.sessions.values())
			.filter(s => s.userId === patientId)
			.sort(
				(a, b) =>
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
			);

		if (patientSessions.length === 0) {
			const error: ServiceError = new Error(
				`No sessions found for patient: ${patientId}`,
			) as ServiceError;
			error.userMessage = 'No assessment data found for this patient.';
			error.statusCode = 404;
			error.retryable = false;
			throw error;
		}

		const firstSession = patientSessions[0];
		const latestSession = patientSessions[patientSessions.length - 1];

		const avgScore =
			patientSessions.reduce((sum, s) => sum + s.analysis.overallScore, 0) /
			patientSessions.length;

		const scoreImprovement =
			((latestSession.analysis.overallScore -
				firstSession.analysis.overallScore) /
				firstSession.analysis.overallScore) *
			100;

		const trend: 'improving' | 'stable' | 'declining' =
			scoreImprovement > 5
				? 'improving'
				: scoreImprovement < -5
					? 'declining'
					: 'stable';

		// Calculate metric outcomes
		const calculateMetricOutcome = (
			metric: keyof PostureMetrics,
		): MetricOutcome => {
			const current = latestSession.analysis.metrics[metric] as number;
			const baseline = firstSession.analysis.metrics[metric] as number;
			const improvement = ((current - baseline) / baseline) * 100;
			const metricTrend: 'improving' | 'stable' | 'declining' =
				improvement > 5
					? 'improving'
					: improvement < -5
						? 'declining'
						: 'stable';

			return {
				current,
				baseline,
				improvement: Math.round(improvement * 10) / 10,
				trend: metricTrend,
				target: baseline < 80 ? 80 : undefined,
				progressToTarget:
					baseline < 80
						? Math.round(((current - baseline) / (80 - baseline)) * 100)
						: undefined,
			};
		};

		// Generate milestones
		const milestones: ClinicalOutcomes['milestones'] = [];
		if (patientSessions.length >= 1) {
			milestones.push({
				id: faker.string.uuid(),
				title: 'Initial Assessment Completed',
				achievedAt: firstSession.timestamp,
				description: 'Baseline posture metrics established',
			});
		}
		if (patientSessions.length >= 5) {
			milestones.push({
				id: faker.string.uuid(),
				title: '5 Assessments Milestone',
				achievedAt: patientSessions[4].timestamp,
				description: 'Consistent assessment participation',
			});
		}
		if (scoreImprovement > 20) {
			milestones.push({
				id: faker.string.uuid(),
				title: '20% Improvement Achieved',
				achievedAt: latestSession.timestamp,
				description: 'Significant posture improvement demonstrated',
			});
		}

		// Generate clinical outcome measures (FR17)
		const generateOutcomeMeasures = () => {
			const measures: unknown[] = [];
			const dataPoints = patientSessions.length;

			// NPRS (Pain Level) - inversely correlated with posture (better posture = less pain)
			const nprsHistory = patientSessions.map((s, idx) => {
				const postureScore = s.analysis.overallScore;
				// Pain decreases as posture improves
				const painScore = Math.max(
					0,
					Math.min(10, 10 - postureScore / 10 + faker.number.float(-1, 1)),
				);
				return {
					date: s.timestamp,
					value: Math.round(painScore * 10) / 10,
					notes: idx % 3 === 0 ? faker.lorem.sentence() : undefined,
				};
			});

			measures.push({
				measureType: 'NPRS',
				label: 'Pain Level',
				unit: '/10',
				scale: { min: 0, max: 10 },
				history: nprsHistory,
				current: nprsHistory[nprsHistory.length - 1].value,
				baseline: nprsHistory[0].value,
				trend:
					nprsHistory[nprsHistory.length - 1].value < nprsHistory[0].value
						? 'improving'
						: nprsHistory[nprsHistory.length - 1].value > nprsHistory[0].value
							? 'worsening'
							: 'stable',
			});

			// NDI (Neck Disability) - correlated with head alignment
			if (dataPoints >= 3) {
				const ndiHistory = patientSessions.map(s => {
					const headAlignment = s.analysis.metrics.headAlignment;
					const disability = Math.max(
						0,
						Math.min(100, 100 - headAlignment + faker.number.float(-5, 5)),
					);
					return {
						date: s.timestamp,
						value: Math.round(disability),
					};
				});

				measures.push({
					measureType: 'NDI',
					label: 'Neck Disability',
					unit: '%',
					scale: { min: 0, max: 100 },
					history: ndiHistory,
					current: ndiHistory[ndiHistory.length - 1].value,
					baseline: ndiHistory[0].value,
					trend:
						ndiHistory[ndiHistory.length - 1].value < ndiHistory[0].value
							? 'improving'
							: 'stable',
				});
			}

			return measures;
		};

		// Generate correlations (FR17)
		const generateCorrelations = (measures: unknown[]) => {
			const correlations: Record<string, unknown> = {};

			measures.forEach((measure: unknown) => {
				const dataPoints = measure.history.map((h: unknown, idx: number) => ({
					date: h.date,
					postureScore: patientSessions[idx].analysis.overallScore,
					outcomeValue: h.value,
				}));

				// Calculate mock correlation coefficient
				// NPRS is negatively correlated, others positively
				const isNegative = measure.measureType === 'NPRS';
				const baseCorr = isNegative ? -0.75 : 0.82;
				const coefficient = baseCorr + faker.number.float(-0.1, 0.1);

				correlations[measure.measureType] = {
					dataPoints,
					coefficient: Math.round(coefficient * 100) / 100,
					pValue: 0.002,
					interpretation:
						Math.abs(coefficient) > 0.7
							? isNegative
								? 'strong negative'
								: 'strong positive'
							: 'moderate positive',
					isSignificant: true,
				};
			});

			return correlations;
		};

		// Generate clinical insights (FR17)
		const generateInsights = () => {
			const insights: unknown[] = [];

			// Inflection point insight
			if (patientSessions.length >= 5) {
				const midPoint = Math.floor(patientSessions.length / 2);
				const midSession = patientSessions[midPoint];
				insights.push({
					id: faker.string.uuid(),
					type: 'inflection_point',
					severity: 'info',
					title: 'Pain decreased after posture improved',
					description: `Significant improvement observed around ${new Date(midSession.timestamp).toLocaleDateString()}. Posture score increased by ${Math.round((latestSession.analysis.overallScore - firstSession.analysis.overallScore) * 10) / 10} points.`,
					relatedDates: [midSession.timestamp],
					suggestedActions: ['Continue current exercise regimen'],
				});
			}

			// Outlier insight
			if (scoreImprovement < 5 && patientSessions.length >= 3) {
				insights.push({
					id: faker.string.uuid(),
					type: 'outlier',
					severity: 'warning',
					title: 'Posture improved but pain persists',
					description:
						'Posture metrics have improved, but pain levels remain elevated. Consider reassessing pain source or underlying conditions.',
					suggestedActions: [
						'Review current pain management strategy',
						'Consider additional diagnostic assessment',
					],
				});
			}

			// Correlation insight
			insights.push({
				id: faker.string.uuid(),
				type: 'correlation',
				severity: 'info',
				title: 'Strong correlation between posture and pain',
				description:
					'Statistical analysis shows a strong negative correlation (r = -0.78) between posture improvements and pain levels.',
				suggestedActions: ['Maintain focus on posture-based interventions'],
			});

			return insights;
		};

		// Generate outcome goals (FR17)
		const generateGoals = () => {
			const goals: unknown[] = [];

			// Pain reduction goal
			goals.push({
				id: faker.string.uuid(),
				measureType: 'NPRS',
				targetValue: 3,
				currentValue: 5.2,
				progress: 60,
				targetDate: faker.date.future({ years: 0.5 }).toISOString(),
				predictedDate: faker.date.future({ years: 0.3 }).toISOString(),
				status: 'on-track',
				description: 'Reduce pain to <3/10',
			});

			return goals;
		};

		const measures = generateOutcomeMeasures();
		const correlations = generateCorrelations(measures);
		const insights = generateInsights();
		const goals = generateGoals();

		return {
			patientId,
			progress: {
				startDate: firstSession.timestamp,
				lastAssessmentDate: latestSession.timestamp,
				totalAssessments: patientSessions.length,
				averageScore: Math.round(avgScore * 10) / 10,
				scoreImprovement: Math.round(scoreImprovement * 10) / 10,
				trend,
			},
			metricOutcomes: {
				headAlignment: calculateMetricOutcome('headAlignment'),
				shoulderSymmetry: calculateMetricOutcome('shoulderSymmetry'),
				spineCurvature: calculateMetricOutcome('spineCurvature'),
				hipAlignment: calculateMetricOutcome('hipAlignment'),
				balance: calculateMetricOutcome('balance'),
			},
			milestones,
			measures,
			correlations,
			insights,
			goals,
		};
	}

	/**
	 * Get organizational metrics for multi-clinic analytics (FR27 - Story 3.6)
	 */
	async getOrganizationalMetrics(
		filters: OrganizationalMetricsFilter,
	): Promise<OrganizationalMetricsData> {
		await this.simulateLatency();
		this.maybeThrowError('getOrganizationalMetrics');

		// Get all sessions
		const allSessions = Array.from(this.sessions.values());

		// Calculate aggregate metrics
		const totalPatients = new Set(allSessions.map(s => s.userId)).size;
		const avgImprovement = faker.number.int({ min: 15, max: 35 });
		const engagementRate = faker.number.int({ min: 65, max: 90 });
		const adherenceRate = faker.number.int({ min: 55, max: 85 });

		// Generate cohort data based on groupBy filter
		const cohorts: CohortData[] = [];

		if (filters.cohortGroupBy === 'condition') {
			// Group by clinical condition
			const conditions = [
				'chronic_back_pain',
				'neck_pain',
				'scoliosis',
				'kyphosis',
				'postural_dysfunction',
			];
			conditions.forEach(condition => {
				cohorts.push({
					id: faker.string.uuid(),
					label: condition
						.replace(/_/g, ' ')
						.replace(/\b\w/g, l => l.toUpperCase()),
					patientCount: faker.number.int({ min: 15, max: 45 }),
					averageImprovement: faker.number.int({ min: 10, max: 40 }),
					engagementRate: faker.number.int({ min: 60, max: 95 }),
					adherenceRate: faker.number.int({ min: 50, max: 90 }),
					averageBaselineScore: faker.number.int({ min: 45, max: 60 }),
					averageCurrentScore: faker.number.int({ min: 65, max: 85 }),
					confidence: faker.number.float({ min: 0.8, max: 1.0 }),
				});
			});
		} else if (filters.cohortGroupBy === 'ageGroup') {
			// Group by age
			const ageGroups = ['<18', '18-30', '31-45', '46-60', '61-75', '>75'];
			ageGroups.forEach(age => {
				cohorts.push({
					id: faker.string.uuid(),
					label: `Age ${age}`,
					patientCount: faker.number.int({ min: 10, max: 40 }),
					averageImprovement: faker.number.int({ min: 8, max: 35 }),
					engagementRate: faker.number.int({ min: 55, max: 92 }),
					adherenceRate: faker.number.int({ min: 45, max: 88 }),
					averageBaselineScore: faker.number.int({ min: 40, max: 65 }),
					averageCurrentScore: faker.number.int({ min: 60, max: 88 }),
					confidence: faker.number.float({ min: 0.75, max: 1.0 }),
				});
			});
		} else if (filters.cohortGroupBy === 'clinician') {
			// Group by assigned clinician
			for (let i = 0; i < 8; i++) {
				cohorts.push({
					id: faker.string.uuid(),
					label: `Dr. ${faker.person.lastName()}`,
					patientCount: faker.number.int({ min: 12, max: 35 }),
					averageImprovement: faker.number.int({ min: 12, max: 38 }),
					engagementRate: faker.number.int({ min: 62, max: 93 }),
					adherenceRate: faker.number.int({ min: 52, max: 87 }),
					averageBaselineScore: faker.number.int({ min: 42, max: 62 }),
					averageCurrentScore: faker.number.int({ min: 62, max: 86 }),
					confidence: faker.number.float({ min: 0.82, max: 1.0 }),
				});
			}
		} else if (filters.cohortGroupBy === 'riskLevel') {
			// Group by risk level
			const risks = ['critical', 'high', 'medium', 'low', 'excellent'];
			risks.forEach(risk => {
				cohorts.push({
					id: faker.string.uuid(),
					label: risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk',
					patientCount: faker.number.int({ min: 8, max: 50 }),
					averageImprovement: faker.number.int({ min: 5, max: 45 }),
					engagementRate: faker.number.int({ min: 50, max: 95 }),
					adherenceRate: faker.number.int({ min: 40, max: 90 }),
					averageBaselineScore: faker.number.int({ min: 35, max: 70 }),
					averageCurrentScore: faker.number.int({ min: 55, max: 90 }),
					confidence: faker.number.float({ min: 0.78, max: 1.0 }),
				});
			});
		}

		// Generate insights
		const insights = [
			`Patients >65 show ${faker.number.int({ min: 15, max: 25 })}% slower improvement rate`,
			`Chronic back pain cohort has highest engagement (${faker.number.int({ min: 85, max: 95 })}%)`,
			`Average triage time reduced by ${faker.number.int({ min: 8, max: 15 })} minutes`,
			`${faker.number.int({ min: 78, max: 92 })}% of patients meeting functional goals`,
		];

		// Generate risk distribution
		const riskDistribution: RiskDistribution[] = [
			{
				level: 'critical',
				count: faker.number.int({ min: 5, max: 15 }),
				percentage: faker.number.int({ min: 3, max: 10 }),
				color: 'var(--status-error)',
			},
			{
				level: 'high',
				count: faker.number.int({ min: 15, max: 30 }),
				percentage: faker.number.int({ min: 10, max: 20 }),
				color: 'var(--status-warning)',
			},
			{
				level: 'medium',
				count: faker.number.int({ min: 30, max: 50 }),
				percentage: faker.number.int({ min: 25, max: 35 }),
				color: 'var(--brand-warning)',
			},
			{
				level: 'low',
				count: faker.number.int({ min: 25, max: 45 }),
				percentage: faker.number.int({ min: 20, max: 30 }),
				color: 'var(--status-info)',
			},
			{
				level: 'excellent',
				count: faker.number.int({ min: 20, max: 40 }),
				percentage: faker.number.int({ min: 15, max: 25 }),
				color: 'var(--status-success)',
			},
		];

		// Generate engagement trends (last 90 days, weekly data points)
		const engagementTrends: EngagementDataPoint[] = [];
		const now = new Date();
		for (let i = 12; i >= 0; i--) {
			const date = new Date(now);
			date.setDate(date.getDate() - i * 7);

			engagementTrends.push({
				date: date.toISOString().split('T')[0],
				engagementRate: faker.number.int({ min: 60, max: 90 }),
				activePatients: faker.number.int({ min: 80, max: 150 }),
				newAssessments: faker.number.int({ min: 40, max: 120 }),
				adherenceRate: faker.number.int({ min: 55, max: 85 }),
			});
		}

		return {
			aggregate: {
				totalPatients,
				averageImprovementPercent: avgImprovement,
				engagementRate,
				adherenceRate,
				dateRange: filters.dateRange,
				lastUpdated: new Date().toISOString(),
			},
			cohorts: {
				groupBy: filters.cohortGroupBy,
				cohorts,
				dateRange: filters.dateRange,
				insights,
				significance: {
					pValue: 0.023,
					interpretation: 'Statistically significant differences detected',
				},
			},
			roi: {
				retentionRate: faker.number.int({ min: 78, max: 92 }),
				outcomeAchievementRate: faker.number.int({ min: 75, max: 90 }),
				triageTimeReduction: faker.number.int({ min: 8, max: 15 }),
				efficiency: {
					avgSessionsPerPatient: faker.number.float({
						min: 6.5,
						max: 12.5,
					}),
					avgTimeToImprovement: faker.number.int({ min: 14, max: 45 }),
					improvementRate: faker.number.int({ min: 72, max: 88 }),
				},
				cost: {
					avgCostPerPatient: faker.number.float({
						min: 450,
						max: 850,
					}),
					costPerOutcome: faker.number.float({
						min: 125,
						max: 275,
					}),
					totalProgramCost: faker.number.float({
						min: 50000,
						max: 120000,
					}),
				},
				dateRange: filters.dateRange,
				lastUpdated: new Date().toISOString(),
			},
			riskDistribution,
			engagementTrends,
		};
	}

	/**
	 * Generate executive summary for organizational report
	 */
	async generateExecutiveSummary(
		metrics: OrganizationalMetricsData,
	): Promise<ExecutiveSummary> {
		await this.simulateLatency();
		this.maybeThrowError('generateExecutiveSummary');

		// Generate highlights from metrics
		const highlights = [
			`${metrics.aggregate.totalPatients} patients actively tracked across organization`,
			`${metrics.aggregate.averageImprovementPercent}% average posture improvement achieved`,
			`${metrics.roi.retentionRate}% patient retention rate demonstrates strong engagement`,
			`Clinical efficiency improved with ${metrics.roi.triageTimeReduction} minute average triage time reduction`,
			`${metrics.roi.outcomeAchievementRate}% of patients meeting their functional goals`,
		];

		// Generate key metrics summary
		const keyMetrics = [
			{
				label: 'Total Patients',
				value: metrics.aggregate.totalPatients.toString(),
				trend: 'up' as const,
				change: '+12%',
			},
			{
				label: 'Avg Improvement',
				value: `${metrics.aggregate.averageImprovementPercent}%`,
				trend: 'up' as const,
				change: '+8%',
			},
			{
				label: 'Engagement Rate',
				value: `${metrics.aggregate.engagementRate}%`,
				trend: 'stable' as const,
				change: '+2%',
			},
			{
				label: 'ROI Achievement',
				value: `${metrics.roi.outcomeAchievementRate}%`,
				trend: 'up' as const,
				change: '+15%',
			},
		];

		// Generate recommendations
		const recommendations = [
			'Focus intervention resources on high-risk cohorts to improve outcomes',
			'Expand successful protocols from top-performing clinicians to wider team',
			'Increase engagement campaigns for cohorts with adherence rates below 70%',
			'Implement automated triage workflows to further reduce review time',
			'Conduct deeper analysis on age-related outcome variations',
		];

		return {
			title: `Organizational Posture Analytics Report`,
			dateRange: metrics.aggregate.dateRange,
			highlights,
			keyMetrics,
			recommendations,
			generatedAt: new Date().toISOString(),
		};
	}

	/**
	 * Export organizational report to PDF or PowerPoint
	 */
	async exportReport(
		template: ExportTemplate,
		metrics: OrganizationalMetricsData,
		summary: ExecutiveSummary,
	): Promise<Blob> {
		await this.simulateLatency();
		this.maybeThrowError('exportReport');

		// In a real implementation, this would use jsPDF/html2canvas or pptxgenjs
		// For mock, create a simple text file as Blob
		const reportContent = `
${summary.title}
Generated: ${new Date(summary.generatedAt).toLocaleString()}
Date Range: ${summary.dateRange.start} to ${summary.dateRange.end}

EXECUTIVE SUMMARY
${summary.highlights.map(h => `• ${h}`).join('\n')}

KEY METRICS
${summary.keyMetrics.map(m => `${m.label}: ${m.value} (${m.change})`).join('\n')}

RECOMMENDATIONS
${summary.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

DETAILED METRICS
Total Patients: ${metrics.aggregate.totalPatients}
Average Improvement: ${metrics.aggregate.averageImprovementPercent}%
Engagement Rate: ${metrics.aggregate.engagementRate}%
Adherence Rate: ${metrics.aggregate.adherenceRate}%

ROI METRICS
Retention Rate: ${metrics.roi.retentionRate}%
Outcome Achievement: ${metrics.roi.outcomeAchievementRate}%
Triage Time Reduction: ${metrics.roi.triageTimeReduction} minutes

COHORT ANALYSIS (${metrics.cohorts.groupBy})
${metrics.cohorts.cohorts
	.map(
		c =>
			`${c.label}: ${c.patientCount} patients, ${c.averageImprovement}% improvement`,
	)
	.join('\n')}

---
Report generated by VitalFlow Posture Analytics System
		`.trim();

		// Create blob with appropriate MIME type
		const mimeType =
			template.format === 'pdf'
				? 'application/pdf'
				: template.format === 'pptx'
					? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
					: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

		return new Blob([reportContent], { type: mimeType });
	}
}
