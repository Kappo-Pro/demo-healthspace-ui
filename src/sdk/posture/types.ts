/**
 * TypeScript types for PostureScan SDK
 */

import { PostureAPIClient } from './apiClient';

/**
 * SDK Configuration passed to PostureScan component
 * When present, enables SDK mode (no Redux)
 */
export interface SDKConfig {
  // User identification
  userId: string;
  sessionId?: string; // Optional: will be created if not provided

  // API client (injected)
  apiClient: PostureAPIClient;

  // Callbacks
  onComplete?: (results: PostureAssessmentResult) => void;
  onError?: (error: SDKError) => void;
  onProgress?: (progress: ProgressUpdate) => void;

  // Theme configuration (future)
  theme?: ThemeConfig;
}

/**
 * Assessment results returned to customer
 */
export interface PostureAssessmentResult {
  session_id: string;
  assessment_type: 'posture';
  created_at: string;
  user_id: string;

  // Overall score
  score: {
    overall: number; // 0-100
    confidence: number; // 0-1
  };

  // View-specific metrics
  metrics: {
    front?: PostureViewMetrics;
    back?: PostureViewMetrics;
    left?: PostureViewMetrics;
    right?: PostureViewMetrics;
  };

  // Raw data (optional)
  raw_data?: {
    screenshots: {
      front?: string;
      back?: string;
      left?: string;
      right?: string;
    };
    coordinates?: unknown[];
  };
}

export interface PostureViewMetrics {
  view: 'front' | 'back' | 'left' | 'right';
  head?: { angle_degrees: number; severity: string };
  ear: { angle_degrees: number; severity: string };
  shoulder: { angle_degrees: number; severity: string };
  elbow: { angle_degrees: number; severity: string };
  hip: { angle_degrees: number; severity: string };
  knee: { angle_degrees: number; severity: string };
  ankle?: { angle_degrees: number; severity: string };
}

/**
 * Error returned to customer
 */
export interface SDKError {
  error: {
    code: ErrorCode;
    message: string;
    recoverable: boolean;
  };
  timestamp: string;
}

export type ErrorCode =
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'SESSION_NOT_FOUND'
  | 'ASSESSMENT_ERROR'
  | 'NETWORK_ERROR'
  | 'CAMERA_PERMISSION_DENIED'
  | 'MEDIAPIPE_LOAD_FAILED'
  | 'UNKNOWN_ERROR';

/**
 * Progress updates during assessment
 */
export interface ProgressUpdate {
  stage: ProgressStage;
  progress: number; // 0-100
  message?: string;
}

export type ProgressStage =
  | 'initializing'
  | 'loading_mediapipe'
  | 'calibrating'
  | 'capturing_front'
  | 'capturing_left'
  | 'capturing_right'
  | 'capturing_back'
  | 'processing'
  | 'uploading'
  | 'complete';

/**
 * Theme configuration (future)
 */
export interface ThemeConfig {
  branding?: {
    logo_url?: string;
  };
  colors?: {
    primary?: string;
    background?: string;
    text?: string;
  };
  typography?: {
    font_family?: string;
  };
  layout?: {
    border_radius?: number;
  };
}
