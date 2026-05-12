import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  PermissionState,
  BrowserType,
  UseCameraPermissionOptions,
  UseCameraPermissionReturn,
} from './types';

/**
 * Detect browser type from user agent
 */
const detectBrowser = (): BrowserType => {
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('edg/')) return 'edge';
  if (ua.includes('chrome') && !ua.includes('edg/')) return 'chrome';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  if (ua.includes('firefox')) return 'firefox';

  return 'unknown';
};

/**
 * Hook for managing camera (and optionally audio) permissions
 */
export const useCameraPermission = (
  options: UseCameraPermissionOptions = {}
): UseCameraPermissionReturn => {
  const { requireAudio = false } = options;

  const [state, setState] = useState<PermissionState>('checking');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [browserType] = useState<BrowserType>(() => detectBrowser());

  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Stop all tracks and cleanup stream
   */
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (isMountedRef.current) {
      setStream(null);
    }
  }, []);

  /**
   * Request camera (and optionally audio) permission
   */
  const requestPermission = useCallback(async () => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('error');
      setError('Camera access not supported in this browser');
      return;
    }

    setState('checking');
    setError(null);

    // Stop any existing stream
    stopStream();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: requireAudio,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!isMountedRef.current) {
        // Component unmounted during async operation
        mediaStream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setState('granted');
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;

      const mediaError = err as DOMException;

      if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
        setState('denied');
        setError('Camera access was denied. Please enable camera in your browser settings.');
      } else if (mediaError.name === 'NotFoundError') {
        setState('error');
        setError('No camera found. Please connect a camera and try again.');
      } else if (mediaError.name === 'NotReadableError') {
        setState('error');
        setError('Camera is in use by another application. Please close other apps using the camera.');
      } else if (mediaError.name === 'OverconstrainedError') {
        // Try again with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: requireAudio,
          });

          if (!isMountedRef.current) {
            basicStream.getTracks().forEach(track => track.stop());
            return;
          }

          streamRef.current = basicStream;
          setStream(basicStream);
          setState('granted');
          setError(null);
        } catch {
          setState('error');
          setError('Could not access camera with available settings.');
        }
      } else {
        setState('error');
        setError(`Camera error: ${mediaError.message || 'Unknown error'}`);
      }
    }
  }, [requireAudio, stopStream]);

  // Initial permission check on mount
  useEffect(() => {
    isMountedRef.current = true;

    // Check if permission was previously granted via enumerateDevices
    const checkExistingPermission = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasLabeledCamera = devices.some(
          device => device.kind === 'videoinput' && device.label
        );

        if (hasLabeledCamera) {
          // Permission was previously granted, request stream
          requestPermission();
        } else {
          // Permission not yet granted, show prompt state
          setState('prompt');
        }
      } catch {
        setState('prompt');
      }
    };

    checkExistingPermission();

    return () => {
      isMountedRef.current = false;
      stopStream();
    };
  }, [requestPermission, stopStream]);

  return {
    state,
    stream,
    error,
    browserType,
    requestPermission,
    stopStream,
  };
};
