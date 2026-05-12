export type PermissionState = 'checking' | 'prompt' | 'granted' | 'denied' | 'error';

export type BrowserType = 'chrome' | 'safari' | 'firefox' | 'edge' | 'unknown';

export interface CameraPermissionSplashProps {
  /** Called with active stream when camera is ready */
  onReady: (stream: MediaStream) => void;
  /** Check audio permission too (for ROM voice commands) */
  requireAudio?: boolean;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
}

export interface UseCameraPermissionOptions {
  requireAudio?: boolean;
}

export interface UseCameraPermissionReturn {
  state: PermissionState;
  stream: MediaStream | null;
  error: string | null;
  browserType: BrowserType;
  requestPermission: () => Promise<void>;
  stopStream: () => void;
}
