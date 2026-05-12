/**
 * Mobile-Optimized PostureScan Component
 *
 * Lightweight wrapper for embedding PostureScan in mobile webviews (Flutter/React Native).
 *
 * Features:
 * - No authentication required
 * - Minimal UI chrome (no navigation, sidebar)
 * - JavaScript bridge for Flutter ↔ Web communication
 * - Fullscreen optimized for mobile devices
 * - Camera permissions handled by native app
 *
 * Communication Protocol:
 * - Web → Flutter: window.postMessage({ type: 'scan_complete', data: {...} })
 * - Flutter → Web: window.FlutterChannel.postMessage(...)
 */

import { useEffect, useRef, useState } from 'react';
import PostureScan from './index';
import { PosturalAnalytics } from './context/Controls.context';
import { message } from 'antd';

interface FlutterMessage {
	type: 'init' | 'cancel' | 'config';
	payload?: unknown;
}

export const MobilePostureScan = () => {
	const [isReady, setIsReady] = useState(false);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [config, setConfig] = useState<{
		patientId?: string;
		assessmentType?: string;
	}>({});

	// Inject mobile viewport and CSS styles
	useEffect(() => {
		// Add viewport meta tag
		const viewport = document.querySelector('meta[name="viewport"]');
		if (viewport) {
			viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
		} else {
			const meta = document.createElement('meta');
			meta.name = 'viewport';
			meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
			document.head.appendChild(meta);
		}

		// Add mobile CSS overrides
		const style = document.createElement('style');
		style.innerHTML = `
			/* Mobile-specific overrides for PostureScan */
			body {
				margin: 0 !important;
				padding: 0 !important;
				overflow: hidden !important;
				width: 100vw !important;
				height: 100vh !important;
			}

			/* Force PostureScan container to fit mobile viewport */
			#root {
				width: 100vw !important;
				height: 100vh !important;
				overflow: hidden !important;
			}

			/* Remove desktop aspect ratio constraints */
			.ant-col, .ant-layout-content {
				aspect-ratio: unset !important;
				max-width: 100vw !important;
				width: 100vw !important;
				height: 100vh !important;
			}

			/* Force full viewport height for all PostureScan containers */
			div[style*="aspectRatio"] {
				aspect-ratio: unset !important;
			}

			div[style*="maxWidth"] {
				max-width: 100vw !important;
			}

			/* Ensure camera viewport fills screen */
			video, canvas {
				width: 100% !important;
				height: 100% !important;
				object-fit: cover !important;
			}

			/* Fix z-index layering - video behind, UI on top */
			.ant-layout-content {
				position: relative !important;
			}

			.ant-layout-content > div {
				position: relative !important;
				z-index: 10 !important;
			}

			/* Video and canvas background layer */
			video[id*="video"],
			canvas[id*="canvas"] {
				position: absolute !important;
				top: 0 !important;
				left: 0 !important;
				z-index: 0 !important;
			}

			/* UI overlays on top - absolutely positioned */
			.ant-drawer,
			[class*="Progress"],
			[class*="TopBar"],
			[class*="Controls"] {
				position: absolute !important;
				z-index: 20 !important;
			}

			/* TopBar header at the top - force absolute positioning on mobile */
			.posture-top-bar {
				position: absolute !important;
				top: 16px !important;
				left: 50% !important;
				transform: translateX(-50%) !important;
				width: auto !important;
				max-width: 90% !important;
				margin-bottom: 0 !important;
				flex-direction: row !important;
			}

			/* Make sure buttons stay on top */
			button {
				z-index: 30 !important;
			}

			/* Content container should not scroll */
			.ant-layout-content {
				overflow: hidden !important;
			}
		`;
		document.head.appendChild(style);

		return () => {
			document.head.removeChild(style);
		};
	}, []);

	// Validate SDK key from URL params
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const sdkKey = params.get('sdk_key');

		if (sdkKey) {
			// Accept demo keys or production hex keys (64 chars)
			// Production keys are SHA-256 hashes (64 hex characters)
			const isDemoKey = sdkKey.startsWith('demo-');
			const isProductionKey = /^[a-f0-9]{64}$/i.test(sdkKey);

			if (isDemoKey || isProductionKey) {
				setIsAuthorized(true);
			} else {
				console.error('[MobilePostureScan] Invalid SDK key format');
			}
		} else {
			console.error('[MobilePostureScan] No SDK key provided');
		}
	}, []);

	// Expose API for Flutter communication
	useEffect(() => {
		if (!isAuthorized) return;

		// Auto-initialize after authorization (don't wait for Flutter message)
		// WebView communication can be unreliable, so we auto-start

		// Get patient info from URL if provided
		const params = new URLSearchParams(window.location.search);
		const patientId = params.get('patient_id') || `demo-patient-${Date.now()}`;
		const assessmentType = params.get('assessment_type') || 'posture';

		setConfig({
			patientId,
			assessmentType
		});

		// Auto-start after brief delay
		setTimeout(() => {
			setIsReady(true);
		}, 500);

		// Listen for messages from Flutter (fallback)
		const handleFlutterMessage = (event: MessageEvent<FlutterMessage>) => {
			try {
				const { type, payload } = event.data || {};

				switch (type) {
					case 'init':
						setConfig(payload);
						setIsReady(true);
						break;
					case 'cancel':
						break;
					case 'config':
						setConfig(payload);
						break;
					default:
						// Ignore unknown messages
						break;
				}
			} catch (e) {
				// Ignore message parsing errors
			}
		};

		window.addEventListener('message', handleFlutterMessage);

		// Cleanup
		return () => {
			window.removeEventListener('message', handleFlutterMessage);
		};
	}, [isAuthorized]);

	// Handle scan progress updates
	const handleProgressUpdate = (data: Partial<PosturalAnalytics>) => {
		window.postMessage({
			type: 'progress_update',
			data,
			timestamp: Date.now()
		}, '*');
	};

	// Handle scan completion
	const handleScanComplete = () => {
		message.success('Posture scan completed!');

		window.postMessage({
			type: 'scan_complete',
			timestamp: Date.now()
		}, '*');
	};

	// Handle splash complete (camera permissions granted)
	const handleSplashComplete = () => {
		window.postMessage({
			type: 'splash_complete',
			timestamp: Date.now()
		}, '*');
	};

	// Mobile-optimized styles
	const containerStyle: React.CSSProperties = {
		width: '100vw',
		height: '100vh',
		overflow: 'hidden',
		position: 'fixed',
		top: 0,
		left: 0,
		background: 'var(--surface-overlay)',
	};

	return (
		<div style={containerStyle}>
				{!isAuthorized ? (
				<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100%',
					color: 'var(--text-color-root)',
					fontSize: 'var(--font-size-sm)',
					fontFamily: 'system-ui'
				}}>
					<div style={{ textAlign: 'center' }}>
						<div style={{ marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-4xl)' }}>🔒</div>
						<div style={{ fontWeight: 'bold', marginBottom: 'var(--spacing-2)' }}>Unauthorized</div>
						<div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>Valid SDK key required</div>
					</div>
				</div>
			) : isReady ? (
				<PostureScan
					isDashboard={false}
					hideTopbar={true}
					onProgressUpdate={handleProgressUpdate}
					onScanComplete={handleScanComplete}
					onSplashComplete={handleSplashComplete}
				/>
			) : (
				<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100%',
					color: 'var(--text-color-root)',
					fontSize: 'var(--font-size-sm)',
					fontFamily: 'system-ui'
				}}>
					<div style={{ textAlign: 'center' }}>
						<div style={{ marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-xl)' }}>⏳</div>
						<div>Initializing PostureScan...</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MobilePostureScan;
