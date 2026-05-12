import { CSSProperties, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	UsePostureScreenAudio,
	CalibrationAudioState,
	PostureAudioKey,
	SharedAudioKey,
	ViewTransitionAudioKey,
} from '@pages/PostureScan/context/PostureScreen.context';
import ClosedCaption, { ClosedCaptionVariant } from '@atoms/ClosedCaption';

interface PostureCaptionsProps {
	/** Override styles for the caption container */
	style?: CSSProperties;
	/** Whether captions are enabled (default: true) */
	enabled?: boolean;
}

type AudioKeyResult = {
	type: 'view';
	key: PostureAudioKey;
} | {
	type: 'shared';
	key: SharedAudioKey;
} | {
	type: 'view-transition';
	key: ViewTransitionAudioKey;
} | null;

// Map calibration state to the audio key being played
function getActiveAudioKey(state: CalibrationAudioState, currentKey: PostureAudioKey | SharedAudioKey | ViewTransitionAudioKey | null): AudioKeyResult {
	switch (state) {
		case 'playing_visibility':
			return { type: 'view', key: 'visibility' };
		case 'playing_frame':
			return { type: 'view', key: 'frame' };
		case 'playing_instruction':
			return { type: 'view', key: 'instruction' };
		case 'playing_wrongSide':
			return { type: 'view', key: 'wrongSide' };
		case 'playing_congratulations':
			return { type: 'view', key: 'congratulations' };
		case 'playing_poseLost':
			return { type: 'shared', key: 'poseLost' };
		case 'playing_view_intro':
			// Use currentKey to determine which title audio
			if (currentKey === 'title1' || currentKey === 'title2' || currentKey === 'title3' || currentKey === 'title4') {
				return { type: 'view-transition', key: currentKey };
			}
			return null;
		default:
			return null;
	}
}

// Map audio state to caption variant
function getVariantFromState(state: CalibrationAudioState): ClosedCaptionVariant {
	switch (state) {
		case 'playing_congratulations':
			return 'success';
		case 'playing_visibility':
		case 'playing_frame':
		case 'playing_wrongSide':
		case 'playing_poseLost':
			return 'error';
		case 'playing_view_intro':
			// View intro captions use default (same as instructions)
			return 'default';
		default:
			return 'default';
	}
}

/**
 * PostureCaptions - Displays closed captions synchronized with posture scan audio
 *
 * Shows caption text at the bottom of the screen during audio playback:
 * - visibility audio: Initial positioning instructions (error variant)
 * - frame audio: Frame/alignment instructions (error variant)
 * - instruction audio: Detailed pose instructions (default variant)
 * - wrongSide audio: Correction for left/right confusion (error variant)
 * - congratulations audio: After successful capture (success variant)
 * - poseLost audio: When pose is lost during instruction (error variant)
 * - viewIntro audio: During view intro transitions (default variant)
 *
 * Captions automatically hide when audio is not playing.
 */
export function PostureCaptions({ style, enabled = true }: PostureCaptionsProps) {
	const { t } = useTranslation();
	const { calibrationState, currentView, currentKey, isPlaying } = UsePostureScreenAudio();

	// Get the current caption text based on audio state
	const captionData = useMemo(() => {
		if (!enabled) return null;

		const audioKeyResult = getActiveAudioKey(calibrationState, currentKey);
		if (!audioKeyResult) return null;

		let translationKey: string;

		if (audioKeyResult.type === 'shared') {
			// Shared audio captions
			translationKey = `common.postureScan.calibration.captions.shared.${audioKeyResult.key}`;
		} else if (audioKeyResult.type === 'view-transition') {
			// View transition intro captions
			translationKey = `common.postureScan.calibration.captions.viewTransitions.${audioKeyResult.key}`;
		} else {
			// View-specific audio captions
			if (!currentView) return null;
			translationKey = `common.postureScan.calibration.captions.${currentView}.${audioKeyResult.key}`;
		}

		const caption = t(translationKey);

		// Return null if translation key not found (returns the key itself)
		if (caption === translationKey) return null;

		return {
			text: caption,
			variant: getVariantFromState(calibrationState),
		};
	}, [enabled, currentView, currentKey, calibrationState, t]);

	return (
		<ClosedCaption
			variant={captionData?.variant ?? 'default'}
			visible={!!(captionData?.text && isPlaying)}
			bottom={100}
			style={style}
		>
			{captionData?.text}
		</ClosedCaption>
	);
}

export default PostureCaptions;
