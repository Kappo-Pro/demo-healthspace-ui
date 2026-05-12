/**
 * API Client for PostureScan SDK
 *
 * Connects to VitalFlow backend API for:
 * - Fetching posture analysis positions (Strapi)
 * - Creating assessment sessions
 * - Submitting assessment results
 * - Submitting reports
 */

import axios, { AxiosInstance } from 'axios';
import strapi from '@strapi';
import { stringify } from 'qs';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';

// ==================== Types ====================

export interface PostureAPIClient {
	// Fetch available posture positions from Strapi
	getPositions: () => Promise<StrapiPostureAnalysis[]>;

	// Create new assessment session
	createSession: (userId: string) => Promise<{ id: string }>;

	// Submit completed assessment results
	submitResults: (
		data: PostureAnalysisCompleted,
		onUploadProgress?: (progress: number) => void,
	) => Promise<void>;

	// Submit assessment report
	submitReport: (data: ReportData) => Promise<void>;
}

export interface StrapiPostureAnalysis {
	id: number;
	name: string;
	view: 'front' | 'left' | 'right' | 'back';
	video: {
		id: number;
		url: string;
	};
}

export interface PostureAnalysisCompleted {
	userId: string;
	view: 'front' | 'left' | 'right' | 'back';
	head?: number;
	ear: number;
	shoulder: number;
	elbow: number;
	hip: number;
	knee: number;
	ankle?: number;
	coordinates: NormalizedLandmark[];
	screenshot: string | null;
	postureAnalysisSessionId: string;
	completed: boolean;
}

export interface ReportData {
	userId: string;
	sessionId: string;
	assessments: PostureAnalysisCompleted[];
	metadata?: Record<string, unknown>;
}

// ==================== SDK API Client Factory ====================

/**
 * Creates API client for SDK mode
 *
 * For MVP: Reuses existing backend endpoints
 * Future: Can add token-based authentication headers
 */
export function createSDKAPIClient(config?: {
	token?: string;
	baseURL?: string;
}): PostureAPIClient {
	// Create axios instance with optional token authentication
	const axiosClient: AxiosInstance = config?.token
		? axios.create({
				baseURL: config.baseURL || process.env.REACT_APP_API_URL,
				headers: {
					Authorization: `Bearer ${config.token}`,
					'X-VitalFlow-SDK-Version': '1.0.0',
				},
			})
		: axios; // Use default axios for MVP (same as main app)

	return {
		/**
		 * Fetch posture analysis positions from Strapi
		 * Used to get list of views (front, left, right, back) with instructional videos
		 */
		async getPositions(): Promise<StrapiPostureAnalysis[]> {
			const query = stringify({
				fields: ['name', 'view'],
				order: ['order:desc'],
				populate: {
					video: {
						fields: ['url'],
					},
				},
			});

			const { data } = await strapi.get(`/posture-analytics?${query}`);
			const positions = data.data as StrapiPostureAnalysis[];

			// Sort by view order: front, left, right, back
			const sortedPositions = positions.sort((a, b) => {
				const order = { front: 0, left: 1, right: 2, back: 3 };
				return (
					order[a.view as keyof typeof order] -
					order[b.view as keyof typeof order]
				);
			});

			return sortedPositions;
		},

		/**
		 * Create new posture analysis session
		 * Returns session ID to track this assessment
		 */
		async createSession(userId: string): Promise<{ id: string }> {
			const { data } = await axiosClient.post('/posture-analytics/sessions', {
				userId,
			});

			return { id: data.id };
		},

		/**
		 * Submit completed posture analysis results
		 * Uploads screenshots and angle measurements for one view
		 */
		async submitResults(
			body: PostureAnalysisCompleted,
			onUploadProgress?: (progress: number) => void,
		): Promise<void> {
			const config = onUploadProgress
				? {
						onUploadProgress: (progressEvent: unknown) => {
							const progress = Math.round(
								(progressEvent.loaded * 100) / (progressEvent.total || 1),
							);
							onUploadProgress(progress);
						},
					}
				: undefined;

			await axiosClient.post('/posture-analytics', body, config);
		},

		/**
		 * Submit final assessment report
		 * Called after all views completed
		 */
		async submitReport(body: ReportData): Promise<void> {
			await axiosClient.post('/posture-analytics/report', body);
		},
	};
}

/**
 * Create mock API client for testing/development
 * Returns fake data without hitting real backend
 */
export function createMockAPIClient(): PostureAPIClient {
	return {
		async getPositions(): Promise<StrapiPostureAnalysis[]> {
			// Mock data for testing
			return [
				{
					id: 1,
					name: 'Front View',
					view: 'front',
					video: { id: 1, url: 'https://example.com/front.mp4' },
				},
				{
					id: 2,
					name: 'Left View',
					view: 'left',
					video: { id: 2, url: 'https://example.com/left.mp4' },
				},
				{
					id: 3,
					name: 'Right View',
					view: 'right',
					video: { id: 3, url: 'https://example.com/right.mp4' },
				},
				{
					id: 4,
					name: 'Back View',
					view: 'back',
					video: { id: 4, url: 'https://example.com/back.mp4' },
				},
			];
		},

		async createSession(_userId: string): Promise<{ id: string }> {
			// Generate mock session ID
			const sessionId = `mock_session_${Date.now()}`;
			return { id: sessionId };
		},

		async submitResults(
			data: PostureAnalysisCompleted,
			onUploadProgress?: (progress: number) => void,
		): Promise<void> {
			// Simulate upload progress
			if (onUploadProgress) {
				for (let i = 0; i <= 100; i += 20) {
					await new Promise(resolve => setTimeout(resolve, 100));
					onUploadProgress(i);
				}
			}
		},

		async submitReport(_data: ReportData): Promise<void> {},
	};
}
