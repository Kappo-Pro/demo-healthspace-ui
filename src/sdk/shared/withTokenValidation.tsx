/**
 * Higher-Order Component for Token Validation
 *
 * Wraps SDK components with token validation logic.
 * Displays error components if token is invalid.
 */

import React, { useEffect, useState } from 'react';
import {
	extractToken,
	validateTokenLocally,
	isDevelopmentMode,
	TokenPayload,
	storeToken} from './tokenValidation';
import {
	UnauthorizedError,
	ForbiddenError,
	TokenExpiredError,
	InvalidTokenError} from './SDKError';
import { postMessageBridge, isRunningInWebView } from './postMessage';

export interface WithTokenValidationProps {
	tokenPayload: TokenPayload;
}

interface TokenValidationState {
	loading: boolean;
	valid: boolean;
	payload?: TokenPayload;
	errorCode?: string;
}

/**
 * HOC that validates tokens before rendering the wrapped component
 */
export function withTokenValidation<P extends WithTokenValidationProps>(
	WrappedComponent: React.ComponentType<P>,
	requiredScope = 'posture',
) {
	return function TokenValidatedComponent(props: Omit<P, 'tokenPayload'>) {
		const [state, setState] = useState<TokenValidationState>({
			loading: true,
			valid: false,
		});

		const handleValidToken = React.useCallback((token: string) => {
			const result = validateTokenLocally(token, requiredScope);

			if (result.valid && result.payload) {
				setState({
					loading: false,
					valid: true,
					payload: result.payload,
				});
			} else {
				// If token expired and running in WebView, notify parent
				if (result.error?.code === 'TOKEN_EXPIRED' && isRunningInWebView()) {
					postMessageBridge.tokenExpired();
				}

				setState({
					loading: false,
					valid: false,
					errorCode: result.error?.code,
				});
			}
		}, []);

		const validateToken = React.useCallback(() => {
			setState({ loading: true, valid: false });

			// Extract token from URL or storage
			const token = extractToken();

			if (!token) {
				// Development mode: auto-generate mock token
				if (isDevelopmentMode()) {
					const mockToken = 'mock_dev_user_posture';
					storeToken(mockToken);
					handleValidToken(mockToken);
					return;
				}

				// Production: require token
				setState({
					loading: false,
					valid: false,
					errorCode: 'MISSING_TOKEN',
				});
				return;
			}

			// Store token for later use
			storeToken(token);

			// Validate token locally
			handleValidToken(token);
		}, [handleValidToken]);

		useEffect(() => {
			validateToken();
		}, [validateToken]);

		const handleRetry = () => {
			validateToken();
		};

		const handleRefresh = async () => {
			// TODO: Implement token refresh flow
			// For now, just retry validation
			handleRetry();
		};

		// Loading state
		if (state.loading) {
			return (
				<div style={styles.loadingContainer}>
					<div style={styles.spinner} />
					<p style={styles.loadingText}>Validating access...</p>
				</div>
			);
		}

		// Error states
		if (!state.valid) {
			switch (state.errorCode) {
				case 'MISSING_TOKEN':
					return <UnauthorizedError onRetry={handleRetry} />;

				case 'TOKEN_EXPIRED':
					return <TokenExpiredError onRefresh={handleRefresh} />;

				case 'INSUFFICIENT_SCOPE':
					return <ForbiddenError requiredScope={requiredScope} />;

				case 'INVALID_TOKEN_FORMAT':
				case 'INVALID_AUDIENCE':
					return <InvalidTokenError />;

				default:
					return <UnauthorizedError onRetry={handleRetry} />;
			}
		}

		// Valid token - render wrapped component
		if (!state.payload) {
			return <UnauthorizedError onRetry={handleRetry} />;
		}

		return <WrappedComponent {...(props as P)} tokenPayload={state.payload} />;
	};
}

// Loading styles
const styles: Record<string, React.CSSProperties> = {
	loadingContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: '100vh',
		backgroundColor: "var(--color-neutral-50)",
	},
	spinner: {
		width: 'var(--spacing-12)',
		height: 'var(--spacing-12)',
		border: '4px solid var(--color-gray-200)',
		borderTop: '4px solid var(--color-purple-600)',
		borderRadius: '50%',
		animation: 'spin 1s linear infinite',
	},
	loadingText: {
		marginTop: 'var(--spacing-4)',
		fontSize: 'var(--font-size-sm)',
		color: 'var(--color-gray-500)',
	},
};

// Add keyframe animation for spinner
if (typeof document !== 'undefined') {
	const style = document.createElement('style');
	style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
	document.head.appendChild(style);
}
