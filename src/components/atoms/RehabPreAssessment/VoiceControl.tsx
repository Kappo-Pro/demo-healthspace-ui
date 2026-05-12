import { useEffect } from 'react';

// Extend Window interface for Speech Recognition API
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
};

/**
 * Custom hook for voice recognition.
 * Must be called following React's Rules of Hooks.
 * @param handleVoiceRecognition - Callback that receives transcribed speech
 */
export const useVoiceControl = (handleVoiceRecognition: (updatedTranscript: string) => void) => {
  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();

    if (!SpeechRecognitionAPI) {
      console.warn('VoiceControl: Speech Recognition API not available in this browser');
      return;
    }

    let recognition: SpeechRecognitionInstance | null = null;
    let isActive = true;

    try {
      recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Get the latest result (continuous mode appends to results)
        const lastResultIndex = event.results.length - 1;
        const result = event.results[lastResultIndex];

        if (result && result[0]) {
          const transcript = result[0].transcript;
          const updatedTranscript = transcript.toLowerCase();
          // Debug: verify transcripts are received
          handleVoiceRecognition(updatedTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Expected errors - don't log as warnings
        const expectedErrors = ['aborted', 'no-speech'];
        if (!expectedErrors.includes(event.error)) {
          console.warn('VoiceControl: Speech recognition error:', event.error);
        }
        // 'no-speech' and 'aborted' will trigger onend which auto-restarts
      };

      recognition.onend = () => {
        // Auto-restart if still active (continuous mode can stop unexpectedly)
        if (isActive && recognition) {
          try {
            recognition.start();
          } catch {
            // Ignore restart errors (may already be running)
          }
        }
      };

      recognition.start();
    } catch (error) {
      console.error('VoiceControl: Failed to initialize speech recognition:', error);
    }

    return () => {
      isActive = false;
      if (recognition) {
        try {
          recognition.abort();
        } catch {
          // Ignore cleanup errors
        }
        recognition = null;
      }
    };
  }, [handleVoiceRecognition]);
};

/** @deprecated Use useVoiceControl instead */
export const VoiceControl = useVoiceControl;

