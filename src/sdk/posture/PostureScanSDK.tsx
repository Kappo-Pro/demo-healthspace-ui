/**
 * PostureScan SDK Wrapper Component
 *
 * Entry point for SDK mode - handles:
 * - URL parameter parsing
 * - API client creation
 * - PostMessage bridge setup
 * - Error handling
 */

import React, { useEffect, useState } from 'react';
import PostureScan from '@pages/PostureScan';
import { SDKConfig, PostureAssessmentResult, SDKError } from './types';
import { createSDKAPIClient, createMockAPIClient } from './apiClient';
import { postMessageBridge, getURLParameter } from '@sdk/shared/postMessage';
import {
	withTokenValidation,
	WithTokenValidationProps} from '@sdk/shared/withTokenValidation';
import { Spin } from 'antd';

/**
 * Loading screen shown while SDK initializes
 */
function LoadingScreen() {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100vh',
				background: 'var(--p-text-color)',
				color: 'var(--text-on-primary)',
			}}>
			<Spin size="large" />
			<p style={{ marginTop: 16, fontSize: 16 }}>Initializing PostureScan...</p>
		</div>
	);
}

/**
 * Error screen shown when SDK initialization fails
 */
function ErrorScreen({ error }: { error: string }) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100vh',
				background: 'var(--color-gray-100)',
				padding: 24,
			}}>
			<div
				style={{
					maxWidth: 480,
					padding: 24,
					background: 'var(--surface-elevated)',
					borderRadius: 8,
					boxShadow: 'var(--shadow-sm)',
				}}>
				<h2 style={{ color: 'var(--color-error)', marginBottom: 16 }}>
					SDK Initialization Error
				</h2>
				<p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
					{error}
				</p>
				<p style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
					Please check the SDK integration documentation or contact support.
				</p>
			</div>
		</div>
	);
}

/**
 * PostureScan SDK Wrapper (Internal Component)
 *
 * This component is wrapped with token validation.
 * Token payload is injected via WithTokenValidationProps.
 */
type PostureScanSDKInternalProps = WithTokenValidationProps;

const PostureScanSDKInternal: React.FC<PostureScanSDKInternalProps> = ({
	tokenPayload,
}) => {
	const [initialized, setInitialized] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sdkConfig, setSdkConfig] = useState<SDKConfig | null>(null);

	useEffect(() => {
		const initializeSDK = async () => {
			try {
				// Get mode from URL parameters (mock or live)
				const mode = getURLParameter('mode'); // 'mock' or 'live'

				// Use userId from validated token
				const userId = tokenPayload.sub;

				// Create API client based on mode
				const apiClient =
					mode === 'mock' ? createMockAPIClient() : createSDKAPIClient();

				// Build SDK configuration
				const config: SDKConfig = {
					userId,
					apiClient,

					// Completion callback: Send results via postMessage
					onComplete: (results: PostureAssessmentResult) => {
						postMessageBridge.complete(results);
					},

					// Error callback: Send error via postMessage
					onError: (error: SDKError) => {
						postMessageBridge.error(error);
					},

					// Progress callback: Send progress via postMessage
					onProgress: progress => {
						postMessageBridge.progress(progress);
					},
				};

				setSdkConfig(config);
				setInitialized(true);

				// Send ready signal to parent
				postMessageBridge.ready();
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: 'Unknown error during SDK initialization';
				setError(errorMessage);

				// Send error to parent
				postMessageBridge.error({
					error: {
						code: 'ASSESSMENT_ERROR',
						message: errorMessage,
						recoverable: false,
					},
					timestamp: new Date().toISOString(),
				});
			}
		};

		initializeSDK();
	}, [tokenPayload.sub, tokenPayload.customerId, tokenPayload.scope]);

	// Show loading state
	if (!initialized && !error) {
		return <LoadingScreen />;
	}

	// Show error state
	if (error) {
		return <ErrorScreen error={error} />;
	}

	// Render PostureScan in SDK mode
	if (!sdkConfig) {
		return <ErrorScreen error="SDK configuration not available" />;
	}

	return <PostureScan isDashboard={false} sdkConfig={sdkConfig} />;
};

/**
 * PostureScan SDK with Token Validation
 *
 * Usage:
 * https://sdk.vitalflow.ai/sdk/posture?token=eyJhbGc...
 * or (development mode):
 * http://localhost:3000/sdk/posture (auto-generates mock token)
 */
export const PostureScanSDK = withTokenValidation(
	PostureScanSDKInternal,
	'posture',
);

export default PostureScanSDK;
