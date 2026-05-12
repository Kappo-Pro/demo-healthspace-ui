/**
 * SDK Error Components
 *
 * Display error messages for SDK authentication failures.
 */

import React from 'react';

export interface SDKErrorProps {
	code: string;
	message: string;
	recoverable?: boolean;
	onRetry?: () => void;
}

/**
 * Generic SDK Error Component
 */
export const SDKError: React.FC<SDKErrorProps> = ({
	code,
	message,
	recoverable = false,
	onRetry,
}) => {
	return (
		<div style={styles.container}>
			<div style={styles.card}>
				<div style={styles.iconContainer}>
					<svg
						width="64"
						height="64"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						style={styles.icon}>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
				</div>

				<h1 style={styles.title}>Access Denied</h1>
				<p style={styles.message}>{message}</p>
				<p style={styles.code}>Error Code: {code}</p>

				{recoverable && onRetry && (
					<button onClick={onRetry} style={styles.button}>
						Try Again
					</button>
				)}

				{!recoverable && (
					<p style={styles.hint}>
						Please contact support if this issue persists.
					</p>
				)}
			</div>
		</div>
	);
};

/**
 * 401 Unauthorized Error (Missing or Invalid Token)
 */
export const UnauthorizedError: React.FC<{ onRetry?: () => void }> = ({
	onRetry,
}) => {
	return (
		<SDKError
			code="UNAUTHORIZED"
			message="Authentication required. Please provide a valid access token."
			recoverable={true}
			onRetry={onRetry}
		/>
	);
};

/**
 * 403 Forbidden Error (Insufficient Scope)
 */
export const ForbiddenError: React.FC<{ requiredScope?: string }> = ({
	requiredScope,
}) => {
	const message = requiredScope
		? `You don't have permission to access this feature. Required scope: ${requiredScope}`
		: "You don't have permission to access this feature.";

	return <SDKError code="FORBIDDEN" message={message} recoverable={false} />;
};

/**
 * Token Expired Error
 */
export const TokenExpiredError: React.FC<{ onRefresh?: () => void }> = ({
	onRefresh,
}) => {
	return (
		<SDKError
			code="TOKEN_EXPIRED"
			message="Your access token has expired. Please refresh to continue."
			recoverable={true}
			onRetry={onRefresh}
		/>
	);
};

/**
 * Invalid Token Format Error
 */
export const InvalidTokenError: React.FC = () => {
	return (
		<SDKError
			code="INVALID_TOKEN"
			message="The provided token is invalid or malformed."
			recoverable={false}
		/>
	);
};

/**
 * Network Error
 */
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({
	onRetry,
}) => {
	return (
		<SDKError
			code="NETWORK_ERROR"
			message="Unable to verify your token. Please check your internet connection."
			recoverable={true}
			onRetry={onRetry}
		/>
	);
};

// Styles
const styles: Record<string, React.CSSProperties> = {
	container: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: '100vh',
		backgroundColor: "var(--color-neutral-50)",
		padding: 'var(--spacing-5)',
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
	},
	card: {
		backgroundColor: 'var(--surface-elevated)',
		borderRadius: '12px',
		padding: '48px 32px',
		maxWidth: '480px',
		width: '100%',
		textAlign: 'center',
		boxShadow: '0 4px 6px color-mix(in srgb, var(--color-black) 10%, transparent), 0 1px 3px color-mix(in srgb, var(--color-black) 8%, transparent)',
	},
	iconContainer: {
		marginBottom: 'var(--spacing-6)',
	},
	icon: {
		color: 'var(--color-error)',
		margin: '0 auto',
	},
	title: {
		fontSize: 'var(--font-size-xl)',
		fontWeight: 'var(--font-weight-semibold)',
		color: 'var(--color-gray-900)',
		marginBottom: 'var(--spacing-3)',
		marginTop: '0',
	},
	message: {
		fontSize: 'var(--font-size-sm)',
		color: 'var(--color-gray-500)',
		marginBottom: 'var(--spacing-2)',
		lineHeight: '1.5',
	},
	code: {
		fontSize: 'var(--font-size-sm)',
		color: 'var(--color-gray-400)',
		marginBottom: 'var(--spacing-6)',
		fontFamily: 'monospace',
	},
	button: {
		backgroundColor: 'var(--color-purple-600)',
		color: 'var(--text-on-primary)',
		border: 'none',
		borderRadius: '8px',
		padding: '12px 24px',
		fontSize: 'var(--font-size-sm)',
		fontWeight: 'var(--font-weight-medium)',
		cursor: 'pointer',
		transition: 'background-color 0.2s',
		marginTop: 'var(--spacing-2)',
	},
	hint: {
		fontSize: 'var(--font-size-sm)',
		color: 'var(--color-gray-400)',
		marginTop: 'var(--spacing-4)',
		marginBottom: '0',
	},
};
