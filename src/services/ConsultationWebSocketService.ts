/**
 * Consultation WebSocket Service
 *
 * Manages real-time communication for consultation sessions.
 * Handles WebSocket connection, reconnection, and message routing.
 *
 * @module services/ConsultationWebSocketService
 */

import type {
	ConsultationMessage,
	ConsultationMessageType,
} from '@types/consultation';

/**
 * WebSocket connection configuration
 */
interface WebSocketConfig {
	/** WebSocket server URL */
	url: string;

	/** Reconnection settings */
	reconnect: {
		maxAttempts: number;
		delayMs: number;
		backoffMultiplier: number;
	};

	/** Heartbeat settings */
	heartbeat: {
		intervalMs: number;
		timeoutMs: number;
	};
}

/**
 * Message handler callback type
 */
type MessageHandler = (message: ConsultationMessage) => void;

/**
 * Connection state change callback type
 */
type ConnectionStateHandler = (
	state: 'connecting' | 'connected' | 'disconnected' | 'error',
	error?: string,
) => void;

/**
 * Default WebSocket configuration
 */
const DEFAULT_CONFIG: WebSocketConfig = {
	// TODO: Replace with actual production WebSocket URL
	url:
		process.env.REACT_APP_WS_URL ||
		(process.env.NODE_ENV === 'production'
			? 'wss://api.vitalflow.ai/consultation'
			: 'ws://localhost:3001/consultation'),
	reconnect: {
		maxAttempts: 5,
		delayMs: 1000,
		backoffMultiplier: 1.5,
	},
	heartbeat: {
		intervalMs: 30000, // 30 seconds
		timeoutMs: 5000, // 5 seconds
	},
};

/**
 * Consultation WebSocket Service
 *
 * Singleton service managing WebSocket connection for real-time consultation features.
 */
class ConsultationWebSocketService {
	private socket: WebSocket | null = null;
	private config: WebSocketConfig;
	private reconnectAttempts = 0;
	private reconnectTimeout: NodeJS.Timeout | null = null;
	private heartbeatInterval: NodeJS.Timeout | null = null;
	private heartbeatTimeout: NodeJS.Timeout | null = null;
	private messageHandlers: Map<ConsultationMessageType, Set<MessageHandler>> =
		new Map();
	private connectionStateHandlers: Set<ConnectionStateHandler> = new Set();
	private sessionId: string | null = null;

	constructor(config: Partial<WebSocketConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	/**
	 * Connect to WebSocket server
	 */
	public connect(sessionId: string): void {
		if (this.socket?.readyState === WebSocket.OPEN) {
			return;
		}

		this.sessionId = sessionId;
		this.notifyConnectionState('connecting');

		try {
			const wsUrl = `${this.config.url}?sessionId=${sessionId}`;
			this.socket = new WebSocket(wsUrl);

			this.socket.onopen = this.handleOpen.bind(this);
			this.socket.onclose = this.handleClose.bind(this);
			this.socket.onerror = this.handleError.bind(this);
			this.socket.onmessage = this.handleMessage.bind(this);
		} catch (error) {
			this.notifyConnectionState(
				'error',
				error instanceof Error ? error.message : 'Connection failed',
			);
			this.scheduleReconnect();
		}
	}

	/**
	 * Disconnect from WebSocket server
	 */
	public disconnect(): void {
		this.clearReconnectTimeout();
		this.stopHeartbeat();

		if (this.socket) {
			this.socket.close(1000, 'Client disconnect');
			this.socket = null;
		}

		this.sessionId = null;
		this.reconnectAttempts = 0;
		this.notifyConnectionState('disconnected');
	}

	/**
	 * Send message through WebSocket
	 */
	public send(
		type: ConsultationMessageType,
		payload: unknown,
		senderId: string,
	): boolean {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
			return false;
		}

		if (!this.sessionId) {
			return false;
		}

		const message: ConsultationMessage = {
			type,
			sessionId: this.sessionId,
			payload,
			timestamp: Date.now(),
			senderId,
		};

		try {
			this.socket.send(JSON.stringify(message));
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Subscribe to messages of a specific type
	 */
	public subscribe(
		type: ConsultationMessageType,
		handler: MessageHandler,
	): () => void {
		if (!this.messageHandlers.has(type)) {
			this.messageHandlers.set(type, new Set());
		}
		const handlers = this.messageHandlers.get(type);
		if (handlers) {
			handlers.add(handler);
		}

		// Return unsubscribe function
		return () => {
			this.messageHandlers.get(type)?.delete(handler);
		};
	}

	/**
	 * Subscribe to connection state changes
	 */
	public onConnectionStateChange(handler: ConnectionStateHandler): () => void {
		this.connectionStateHandlers.add(handler);

		// Return unsubscribe function
		return () => {
			this.connectionStateHandlers.delete(handler);
		};
	}

	/**
	 * Get current connection state
	 */
	public getConnectionState():
		| 'connecting'
		| 'connected'
		| 'disconnected'
		| 'error' {
		if (!this.socket) return 'disconnected';

		switch (this.socket.readyState) {
			case WebSocket.CONNECTING:
				return 'connecting';
			case WebSocket.OPEN:
				return 'connected';
			case WebSocket.CLOSING:
			case WebSocket.CLOSED:
				return 'disconnected';
			default:
				return 'disconnected';
		}
	}

	/**
	 * Handle WebSocket open event
	 */
	private handleOpen(): void {
		this.reconnectAttempts = 0;
		this.notifyConnectionState('connected');
		this.startHeartbeat();
	}

	/**
	 * Handle WebSocket close event
	 */
	private handleClose(event: CloseEvent): void {
		this.stopHeartbeat();
		this.notifyConnectionState('disconnected');

		// Attempt reconnection if not a normal closure
		if (event.code !== 1000) {
			this.scheduleReconnect();
		}
	}

	/**
	 * Handle WebSocket error event
	 */
	private handleError(_event: Event): void {
		this.notifyConnectionState('error', 'WebSocket error occurred');
	}

	/**
	 * Handle incoming WebSocket message
	 */
	private handleMessage(event: MessageEvent): void {
		try {
			const message: ConsultationMessage = JSON.parse(event.data);

			// Validate message structure
			if (!this.isValidMessage(message)) {
				return;
			}

			// Route message to subscribed handlers
			const handlers = this.messageHandlers.get(message.type);
			if (handlers) {
				handlers.forEach(handler => {
					try {
						handler(message);
					} catch (error) {
						// Intentionally suppress handler errors to prevent one handler from affecting others
					}
				});
			}
		} catch (error) {
			// Intentionally suppress message parsing errors to maintain connection stability
		}
	}

	/**
	 * Validate message structure
	 */
	private isValidMessage(message: unknown): message is ConsultationMessage {
		if (typeof message !== 'object' || message === null) return false;

		const msg = message as Partial<ConsultationMessage>;
		return (
			typeof msg.type === 'string' &&
			typeof msg.sessionId === 'string' &&
			typeof msg.timestamp === 'number' &&
			typeof msg.senderId === 'string' &&
			msg.payload !== undefined
		);
	}

	/**
	 * Schedule reconnection attempt
	 */
	private scheduleReconnect(): void {
		if (this.reconnectAttempts >= this.config.reconnect.maxAttempts) {
			this.notifyConnectionState(
				'error',
				'Failed to reconnect after maximum attempts',
			);
			return;
		}

		const delay =
			this.config.reconnect.delayMs *
			Math.pow(this.config.reconnect.backoffMultiplier, this.reconnectAttempts);

		this.clearReconnectTimeout();
		this.reconnectTimeout = setTimeout(() => {
			this.reconnectAttempts++;
			if (this.sessionId) {
				this.connect(this.sessionId);
			}
		}, delay);
	}

	/**
	 * Clear reconnect timeout
	 */
	private clearReconnectTimeout(): void {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
	}

	/**
	 * Start heartbeat ping/pong
	 */
	private startHeartbeat(): void {
		this.stopHeartbeat();

		this.heartbeatInterval = setInterval(() => {
			if (this.socket?.readyState === WebSocket.OPEN) {
				this.send('session:pause', { type: 'heartbeat' }, 'system');

				// Set timeout to detect unresponsive connection
				this.heartbeatTimeout = setTimeout(() => {
					this.socket?.close(1000, 'Heartbeat timeout');
				}, this.config.heartbeat.timeoutMs);
			}
		}, this.config.heartbeat.intervalMs);
	}

	/**
	 * Stop heartbeat
	 */
	private stopHeartbeat(): void {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
		if (this.heartbeatTimeout) {
			clearTimeout(this.heartbeatTimeout);
			this.heartbeatTimeout = null;
		}
	}

	/**
	 * Notify connection state change to subscribers
	 */
	private notifyConnectionState(
		state: 'connecting' | 'connected' | 'disconnected' | 'error',
		error?: string,
	): void {
		this.connectionStateHandlers.forEach(handler => {
			try {
				handler(state, error);
			} catch (err) {
				// Intentionally suppress handler errors to prevent one handler from affecting others
			}
		});
	}
}

/**
 * Singleton instance
 */
export const consultationWebSocketService = new ConsultationWebSocketService();

/**
 * Export class for testing
 */
export { ConsultationWebSocketService };
