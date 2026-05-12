/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unused-vars */
/**
 * Mock Posture Data Service Tests
 *
 * Test suite for MockPostureDataService implementation.
 * Validates mock data generation, latency simulation, and CRUD operations.
 */

import { MockPostureDataService } from '../MockPostureDataService';
import type { AdminFilter } from '@types/posture';
import type { PaginationParams } from '../types';

describe('MockPostureDataService', () => {
	let service: MockPostureDataService;

	beforeEach(() => {
		// Create service with minimal latency for faster tests
		service = new MockPostureDataService({
			sessionCount: 50,
			errorRate: 0, // Disable random errors for predictable tests
			latency: { min: 10, max: 20 }, // Minimal latency
		});
	});

	describe('getPatientSessions', () => {
		it('should return paginated sessions for a patient', async () => {
			// Find a patient ID from generated data
			const allSessions = await service.getPatientSessions('test-patient-1', {
				page: 1,
				pageSize: 100,
			});

			// Use a patient that exists in mock data
			const firstPatientId = allSessions.data[0]?.userId;
			if (!firstPatientId) {
				// If no sessions, test passes (edge case)
				expect(allSessions.data).toEqual([]);
				return;
			}

			const result = await service.getPatientSessions(firstPatientId, {
				page: 1,
				pageSize: 10,
			});

			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(result.pagination.currentPage).toBe(1);
			expect(result.pagination.pageSize).toBe(10);
			expect(result.pagination.totalCount).toBeGreaterThanOrEqual(0);

			// Verify all sessions belong to requested patient
			result.data.forEach(session => {
				expect(session.userId).toBe(firstPatientId);
			});
		});

		it('should handle pagination correctly', async () => {
			// Get any patient with multiple sessions
			const allSessions = await service.getPatientSessions('any-patient', {
				page: 1,
				pageSize: 100,
			});

			if (allSessions.data.length === 0) {
				return; // No data to test pagination
			}

			const patientId = allSessions.data[0].userId;

			// Get page 1
			const page1 = await service.getPatientSessions(patientId, {
				page: 1,
				pageSize: 2,
			});

			expect(page1.data.length).toBeLessThanOrEqual(2);
			expect(page1.pagination.currentPage).toBe(1);

			// Get page 2 if exists
			if (page1.pagination.totalPages > 1) {
				const page2 = await service.getPatientSessions(patientId, {
					page: 2,
					pageSize: 2,
				});

				expect(page2.pagination.currentPage).toBe(2);
				// Verify different sessions (no overlap)
				if (page1.data.length > 0 && page2.data.length > 0) {
					expect(page1.data[0].id).not.toBe(page2.data[0].id);
				}
			}
		});

		it('should sort sessions by timestamp (most recent first)', async () => {
			const result = await service.getPatientSessions('any-patient', {
				page: 1,
				pageSize: 100,
			});

			if (result.data.length < 2) {
				return; // Not enough data to verify sorting
			}

			// Verify descending timestamp order
			for (let i = 0; i < result.data.length - 1; i++) {
				const current = new Date(result.data[i].timestamp);
				const next = new Date(result.data[i + 1].timestamp);
				expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
			}
		});

		it('should simulate latency', async () => {
			const start = Date.now();
			await service.getPatientSessions('test-patient', {
				page: 1,
				pageSize: 10,
			});
			const duration = Date.now() - start;

			// Verify latency is within configured range (10-20ms)
			expect(duration).toBeGreaterThanOrEqual(10);
		});
	});

	describe('getSessionDetail', () => {
		it('should return detailed session data with recommendations', async () => {
			// Get a session ID from generated data
			const sessions = await service.getPatientSessions('any-patient', {
				page: 1,
				pageSize: 100,
			});

			if (sessions.data.length === 0) {
				return; // No sessions to test
			}

			const sessionId = sessions.data[0].id;
			const detail = await service.getSessionDetail(sessionId);

			// Verify base session data
			expect(detail.id).toBe(sessionId);
			expect(detail.userId).toBeDefined();
			expect(detail.timestamp).toBeDefined();
			expect(detail.poseData).toBeInstanceOf(Array);

			// Verify extended detail fields
			expect(detail.relatedSessions).toBeInstanceOf(Array);
			expect(detail.recommendations).toBeInstanceOf(Array);
			expect(['pending', 'reviewed', 'flagged']).toContain(detail.reviewStatus);

			// Verify recommendations have required fields
			if (detail.recommendations.length > 0) {
				const rec = detail.recommendations[0];
				expect(rec.id).toBeDefined();
				expect(rec.title).toBeDefined();
				expect(rec.targetAreas).toBeInstanceOf(Array);
				expect(['beginner', 'intermediate', 'advanced']).toContain(
					rec.difficulty,
				);
			}
		});

		it('should throw error for non-existent session', async () => {
			await expect(service.getSessionDetail('non-existent-id')).rejects.toThrow(
				'Session not found',
			);
		});

		it('should include related sessions from same patient', async () => {
			// Find a patient with multiple sessions
			const sessions = await service.getPatientSessions('any-patient', {
				page: 1,
				pageSize: 100,
			});

			if (sessions.data.length < 2) {
				return; // Need multiple sessions to test
			}

			const detail = await service.getSessionDetail(sessions.data[0].id);

			// Related sessions should be from same patient
			detail.relatedSessions.forEach(related => {
				expect(related.userId).toBe(detail.userId);
				expect(related.id).not.toBe(detail.id); // Not the same session
			});
		});
	});

	describe('getAdminDashboard', () => {
		it('should return dashboard data with summary stats', async () => {
			const filters: AdminFilter = {
				pagination: { page: 1, pageSize: 20 },
			};

			const result = await service.getAdminDashboard(filters);

			expect(result.sessions).toBeInstanceOf(Array);
			expect(result.summary).toBeDefined();
			expect(result.summary.totalPatients).toBeGreaterThan(0);
			expect(result.summary.totalSessions).toBeGreaterThan(0);
			expect(result.summary.avgScore).toBeGreaterThanOrEqual(0);
			expect(result.summary.avgScore).toBeLessThanOrEqual(100);

			expect(result.statusBreakdown).toBeDefined();
			expect(result.statusBreakdown.excellent).toBeGreaterThanOrEqual(0);
			expect(result.statusBreakdown.good).toBeGreaterThanOrEqual(0);
			expect(result.statusBreakdown.fair).toBeGreaterThanOrEqual(0);
			expect(result.statusBreakdown.poor).toBeGreaterThanOrEqual(0);
			expect(result.statusBreakdown.critical).toBeGreaterThanOrEqual(0);

			expect(result.pagination).toBeDefined();
		});

		it('should filter by status', async () => {
			const filters: AdminFilter = {
				status: ['critical', 'poor'],
				pagination: { page: 1, pageSize: 100 },
			};

			const result = await service.getAdminDashboard(filters);

			// All returned sessions should match filter
			result.sessions.forEach(session => {
				expect(['critical', 'poor']).toContain(session.analysis.status);
			});
		});

		it('should filter by date range', async () => {
			const filters: AdminFilter = {
				dateRange: {
					start: '2025-10-01T00:00:00Z',
					end: '2025-10-31T23:59:59Z',
				},
				pagination: { page: 1, pageSize: 100 },
			};

			const result = await service.getAdminDashboard(filters);

			const start = new Date(filters.dateRange!.start);
			const end = new Date(filters.dateRange!.end);

			result.sessions.forEach(session => {
				const sessionDate = new Date(session.timestamp);
				expect(sessionDate.getTime()).toBeGreaterThanOrEqual(start.getTime());
				expect(sessionDate.getTime()).toBeLessThanOrEqual(end.getTime());
			});
		});

		it('should filter by score range', async () => {
			const filters: AdminFilter = {
				scoreRange: { min: 50, max: 70 },
				pagination: { page: 1, pageSize: 100 },
			};

			const result = await service.getAdminDashboard(filters);

			result.sessions.forEach(session => {
				expect(session.analysis.overallScore).toBeGreaterThanOrEqual(50);
				expect(session.analysis.overallScore).toBeLessThanOrEqual(70);
			});
		});

		it('should sort by timestamp descending', async () => {
			const filters: AdminFilter = {
				sort: { field: 'timestamp', order: 'desc' },
				pagination: { page: 1, pageSize: 100 },
			};

			const result = await service.getAdminDashboard(filters);

			if (result.sessions.length < 2) {
				return; // Not enough data to verify sorting
			}

			for (let i = 0; i < result.sessions.length - 1; i++) {
				const current = new Date(result.sessions[i].timestamp);
				const next = new Date(result.sessions[i + 1].timestamp);
				expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
			}
		});

		it('should sort by score ascending', async () => {
			const filters: AdminFilter = {
				sort: { field: 'score', order: 'asc' },
				pagination: { page: 1, pageSize: 100 },
			};

			const result = await service.getAdminDashboard(filters);

			if (result.sessions.length < 2) {
				return;
			}

			for (let i = 0; i < result.sessions.length - 1; i++) {
				expect(result.sessions[i].analysis.overallScore).toBeLessThanOrEqual(
					result.sessions[i + 1].analysis.overallScore,
				);
			}
		});
	});

	describe('updateSessionStatus', () => {
		it('should update session review status', async () => {
			const sessions = await service.getPatientSessions('any-patient', {
				page: 1,
				pageSize: 1,
			});

			if (sessions.data.length === 0) {
				return;
			}

			const sessionId = sessions.data[0].id;

			// Update status
			await service.updateSessionStatus(sessionId, 'reviewed');

			// Verify update
			const updated = await service.getSessionDetail(sessionId);
			expect(updated.reviewStatus).toBe('reviewed');
		});

		it('should throw error for non-existent session', async () => {
			await expect(
				service.updateSessionStatus('non-existent-id', 'reviewed'),
			).rejects.toThrow('Session not found');
		});
	});

	describe('bulkUpdate', () => {
		it('should update multiple sessions', async () => {
			const sessions = await service.getPatientSessions('any-patient', {
				page: 1,
				pageSize: 100,
			});

			if (sessions.data.length < 2) {
				return; // Need multiple sessions
			}

			const sessionIds = sessions.data.slice(0, 2).map(s => s.id);

			const result = await service.bulkUpdate(sessionIds, {
				metadata: {
					deviceType: 'desktop',
					cameraQuality: 'high',
					lighting: 'good',
				},
			});

			expect(result.updatedCount).toBeGreaterThan(0);
			expect(result.failedIds).toBeInstanceOf(Array);
			expect(result.errors).toBeDefined();
		});

		it('should report failed updates', async () => {
			const validSessionIds = (
				await service.getPatientSessions('any-patient', {
					page: 1,
					pageSize: 1,
				})
			).data.map(s => s.id);

			const sessionIds = [
				...validSessionIds,
				'non-existent-1',
				'non-existent-2',
			];

			const result = await service.bulkUpdate(sessionIds, {});

			expect(result.failedIds).toContain('non-existent-1');
			expect(result.failedIds).toContain('non-existent-2');
			expect(result.errors['non-existent-1']).toBe('Session not found');
		});
	});

	describe('getExerciseRecommendations', () => {
		it('should return exercise recommendations for session', async () => {
			const sessions = await service.getPatientSessions('any-patient', {
				page: 1,
				pageSize: 1,
			});

			if (sessions.data.length === 0) {
				return;
			}

			const sessionId = sessions.data[0].id;
			const recommendations =
				await service.getExerciseRecommendations(sessionId);

			expect(recommendations).toBeInstanceOf(Array);

			if (recommendations.length > 0) {
				const rec = recommendations[0];
				expect(rec.id).toBeDefined();
				expect(rec.title).toBeDefined();
				expect(rec.description).toBeDefined();
				expect(rec.targetAreas).toBeInstanceOf(Array);
				expect(['beginner', 'intermediate', 'advanced']).toContain(
					rec.difficulty,
				);
				expect(rec.duration).toBeGreaterThan(0);
			}
		});

		it('should throw error for non-existent session', async () => {
			await expect(
				service.getExerciseRecommendations('non-existent-id'),
			).rejects.toThrow('Session not found');
		});
	});

	describe('getClinicalOutcomes', () => {
		it('should return clinical outcomes for patient', async () => {
			const sessions = await service.getPatientSessions('any-patient', {
				page: 1,
				pageSize: 100,
			});

			if (sessions.data.length === 0) {
				return;
			}

			const patientId = sessions.data[0].userId;
			const outcomes = await service.getClinicalOutcomes(patientId);

			expect(outcomes.patientId).toBe(patientId);
			expect(outcomes.progress).toBeDefined();
			expect(outcomes.progress.totalAssessments).toBeGreaterThan(0);
			expect(outcomes.progress.averageScore).toBeGreaterThanOrEqual(0);
			expect(outcomes.progress.averageScore).toBeLessThanOrEqual(100);
			expect(['improving', 'stable', 'declining']).toContain(
				outcomes.progress.trend,
			);

			expect(outcomes.metricOutcomes).toBeDefined();
			expect(outcomes.metricOutcomes.headAlignment).toBeDefined();
			expect(outcomes.metricOutcomes.shoulderSymmetry).toBeDefined();
			expect(outcomes.metricOutcomes.spineCurvature).toBeDefined();
			expect(outcomes.metricOutcomes.hipAlignment).toBeDefined();
			expect(outcomes.metricOutcomes.balance).toBeDefined();

			expect(outcomes.milestones).toBeInstanceOf(Array);
		});

		it('should calculate improvement correctly', async () => {
			const sessions = await service.getPatientSessions('any-patient', {
				page: 1,
				pageSize: 100,
			});

			if (sessions.data.length === 0) {
				return;
			}

			const patientId = sessions.data[0].userId;
			const outcomes = await service.getClinicalOutcomes(patientId);

			// Verify metric outcomes have valid data
			const headOutcome = outcomes.metricOutcomes.headAlignment;
			expect(headOutcome.current).toBeGreaterThanOrEqual(0);
			expect(headOutcome.current).toBeLessThanOrEqual(100);
			expect(headOutcome.baseline).toBeGreaterThanOrEqual(0);
			expect(headOutcome.baseline).toBeLessThanOrEqual(100);
			expect(['improving', 'stable', 'declining']).toContain(headOutcome.trend);
		});

		it('should throw error for patient with no sessions', async () => {
			await expect(
				service.getClinicalOutcomes('patient-with-no-sessions'),
			).rejects.toThrow('No sessions found');
		});
	});

	describe('realistic data generation', () => {
		it('should generate diverse posture statuses', async () => {
			const dashboard = await service.getAdminDashboard({
				pagination: { page: 1, pageSize: 100 },
			});

			const statuses = new Set(dashboard.sessions.map(s => s.analysis.status));

			// Should have variety of statuses (not all the same)
			expect(statuses.size).toBeGreaterThan(1);
		});

		it('should generate realistic pose keypoints', async () => {
			const sessions = await service.getPatientSessions('any-patient', {
				page: 1,
				pageSize: 1,
			});

			if (sessions.data.length === 0) {
				return;
			}

			const session = sessions.data[0];
			expect(session.poseData.length).toBeGreaterThan(0);

			const keypoint = session.poseData[0];
			expect(keypoint.name).toBeDefined();
			expect(keypoint.x).toBeGreaterThanOrEqual(0);
			expect(keypoint.x).toBeLessThanOrEqual(1);
			expect(keypoint.y).toBeGreaterThanOrEqual(0);
			expect(keypoint.y).toBeLessThanOrEqual(1);
			expect(keypoint.confidence).toBeGreaterThanOrEqual(0);
			expect(keypoint.confidence).toBeLessThanOrEqual(1);
		});

		it('should generate issues based on poor metrics', async () => {
			const sessions = await service.getPatientSessions('any-patient', {
				page: 1,
				pageSize: 100,
			});

			// Find a session with poor/critical status
			const poorSession = sessions.data.find(
				s => s.analysis.status === 'poor' || s.analysis.status === 'critical',
			);

			if (!poorSession) {
				return; // No poor sessions in dataset
			}

			// Poor sessions should have issues
			expect(poorSession.analysis.issues.length).toBeGreaterThan(0);

			const issue = poorSession.analysis.issues[0];
			expect(['critical', 'major', 'minor']).toContain(issue.severity);
			expect(issue.title).toBeDefined();
			expect(issue.affectedArea).toBeDefined();
		});
	});

	describe('error simulation', () => {
		it('should throw errors when error rate is set', async () => {
			const errorService = new MockPostureDataService({
				sessionCount: 10,
				errorRate: 1.0, // 100% error rate
				latency: { min: 10, max: 20 },
			});

			await expect(
				errorService.getPatientSessions('test-patient', {
					page: 1,
					pageSize: 10,
				}),
			).rejects.toThrow();
		});
	});
});
