/**
 * PostMessage Bridge for WebView Communication
 *
 * Sends messages from React SDK to Flutter/React Native parent app
 */

import { PostureAssessmentResult, SDKError, ProgressUpdate } from '@sdk/posture/types';

export interface PostMessagePayload {
  type: string;
  payload: unknown;
  timestamp: string;
}

/**
 * PostMessage bridge for sending SDK events to parent app
 */
export const postMessageBridge = {
  /**
   * Send assessment completion results to parent
   */
  complete: (results: PostureAssessmentResult): void => {
    const message: PostMessagePayload = {
      type: 'VITALFLOW_POSTURE_COMPLETE',
      payload: results,
      timestamp: new Date().toISOString(),
    };

    // Send to parent window (Flutter WebView)
    window.parent.postMessage(message, '*');

    // Also log to console for debugging
  },

  /**
   * Send error to parent
   */
  error: (error: SDKError): void => {
    const message: PostMessagePayload = {
      type: 'VITALFLOW_POSTURE_ERROR',
      payload: error,
      timestamp: new Date().toISOString(),
    };

    window.parent.postMessage(message, '*');
  },

  /**
   * Send progress update to parent
   */
  progress: (progress: ProgressUpdate): void => {
    const message: PostMessagePayload = {
      type: 'VITALFLOW_POSTURE_PROGRESS',
      payload: progress,
      timestamp: new Date().toISOString(),
    };

    window.parent.postMessage(message, '*');
  },

  /**
   * Send ready signal when SDK is initialized
   */
  ready: (): void => {
    const message: PostMessagePayload = {
      type: 'VITALFLOW_POSTURE_READY',
      payload: { ready: true },
      timestamp: new Date().toISOString(),
    };

    window.parent.postMessage(message, '*');
  },

  /**
   * Send token expired signal to parent for refresh
   */
  tokenExpired: (): void => {
    const message: PostMessagePayload = {
      type: 'VITALFLOW_TOKEN_EXPIRED',
      payload: { reason: 'Token has expired' },
      timestamp: new Date().toISOString(),
    };

    window.parent.postMessage(message, '*');
  },
};

/**
 * Helper to check if running in WebView
 */
export function isRunningInWebView(): boolean {
  // Check if window.parent is different (iframe or WebView)
  return window.parent !== window;
}

/**
 * Helper to get URL parameters
 */
export function getURLParameter(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
