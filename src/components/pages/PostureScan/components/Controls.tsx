import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import EventEmitter from '@services/EventEmitter';
import { URL_PATH } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getPostureBySession } from '@stores/postures/postures';
import { setOnBoardPostureCompletion } from '@stores/shared/onBoard/onBoard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PosturalAnalytics, UseControls } from '../context/Controls.context';
import { TransitionStates, UseTransition } from '../context/Transition.context';

function Controls(props: {
	isDashboard?: boolean;
	onScanComplete?: () => void;
}) {
	const navigate = useNavigate();
	const { isDashboard, onScanComplete } = props;
	const { transition } = UseTransition();
	const {
		onSubmit,
		onGetCurrent,
		processAndCapturePosture,
		postureAnalyticsSessionId,
		results,
		canvasDimensions,
		shouldNavigate,
		isCompleted,
	} = UseControls();
	const dispatch = useTypedDispatch();

	const { userId } = useParams();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	const current = onGetCurrent() as Partial<PosturalAnalytics>;

	const hasCapturedRef = useRef(false);
	const onSubmitRef = useRef(onSubmit);
	const [hasSubmitted, setHasSubmitted] = useState(false);

	// Keep ref in sync with latest onSubmit
	useEffect(() => {
		onSubmitRef.current = onSubmit;
	}, [onSubmit]);

	const frameCallback = useCallback(
		(results: NormalizedLandmark[]) => {
			if (
				transition?.value === TransitionStates.CLOSING &&
				!hasCapturedRef.current
			) {
				hasCapturedRef.current = true;
				processAndCapturePosture(results, canvasDimensions);
			} else if (transition?.value !== TransitionStates.CLOSING) {
				hasCapturedRef.current = false;
			}
		},
		[transition, processAndCapturePosture, canvasDimensions],
	);

	useEffect(() => {
		EventEmitter.once('results', results => {
			frameCallback(results);
		});

		return () => {
			EventEmitter.off('results');
		};
	}, [frameCallback]);

	// Track which view the current results belong to
	const resultsViewRef = useRef<string | undefined>(undefined);

	// Track which view results belong to when captured
	// Reset hasSubmitted when NEW results are captured (allows submission for new view)
	const prevResultsRef = useRef(results);
	useEffect(() => {
		// Only update when results actually change (new capture)
		if (results && results !== prevResultsRef.current) {
			resultsViewRef.current = current?.view;
			setHasSubmitted(false); // Reset when NEW results captured - critical for multi-view flow
		}
		prevResultsRef.current = results;
	}, [results, current?.view]);

	// Submit results using ref to avoid stale closure
	// Only submit if results match current view (prevents duplicate submissions on view change)
	useEffect(() => {
		if (results && !hasSubmitted && resultsViewRef.current === current?.view) {
			setHasSubmitted(true);
			onSubmitRef.current();
		} else if (results && resultsViewRef.current !== current?.view) {
		}
	}, [results, hasSubmitted, current?.view]);

	// Navigate after final assessment submission or when all views completed
	useEffect(() => {
		// Navigate when shouldNavigate is true OR when completed and in OPENNING state
		const canNavigate =
			shouldNavigate ||
			(isCompleted && transition?.value === TransitionStates.OPENNING);

		const notInTransition =
			transition?.value !== TransitionStates.RESULT &&
			transition?.value !== TransitionStates.CLOSING;

		if (canNavigate && notInTransition && postureAnalyticsSessionId) {
			dispatch(setOnBoardPostureCompletion(true));
			// Close modal if in dashboard mode
			if (isDashboard && onScanComplete) {
				onScanComplete();
				return;
			}

			navigate(
				`/${user.isPhysioterapist ? selectedUser.id : user.id}/${URL_PATH.POSTURE}/${postureAnalyticsSessionId}/${URL_PATH.SCAN_RESULT}`,
				{
					state: {
						selectedUserId: userId as string,
						selectedScanId: postureAnalyticsSessionId,
					},
				},
			);

			dispatch(getPostureBySession({ sessionId: postureAnalyticsSessionId }));
		}
	}, [
		shouldNavigate,
		isCompleted,
		navigate,
		userId,
		user,
		selectedUser,
		postureAnalyticsSessionId,
		dispatch,
		transition?.value,
		isDashboard,
		onScanComplete,
	]);

	if (current?.completed || transition?.value !== TransitionStates.RESULT)
		return null;

	return <></>;
}

export default Controls;
