import { useTypedDispatch, useTypedSelector } from '@stores/index';

import {
	closeSession,
	completedExercise,
	createOnBoardSession,
	createSession,
	nextExercise,
	resetAll,
	savePatientResults,
	setMetricsDataValue,
	setResultExerciseValidateValue,
} from '@stores/clinical/rom/main';
import { useCallback, useRef } from 'react';
import { UseTutorialControls } from '../context/TutorialControls.context';

type SendResultArgs = {
	screenshotElId?: string;
	extra?: Record<string, unknown>;
};

export function useGuidedTourApi() {
	const dispatch = useTypedDispatch();
	const { session, metricsData, isCustom } = useTypedSelector(s => s.rom.main);

	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	const { selectedScan } = UseTutorialControls();

	const sentForExercise = useRef<Record<string, boolean>>({});

	const startSession = useCallback(
		async (userId: string) => {
			if (typeof window === 'undefined') return;

			const href = window.location.href.toLowerCase();
			const shouldSkip = href.includes('sitting');

			if (!shouldSkip) {
				await dispatch(createOnBoardSession({ userId })).unwrap();
			} else {
				const session = {
					strapiOmniRomProgramId: 55,
					userId: userId as string,
				};
				await dispatch(createSession(session)).unwrap();
			}
		},
		[dispatch],
	);

	const sendResult = useCallback(
		async (args?: SendResultArgs) => {
			const userSelected = user?.isPhysioterapist ? selectedUser.id : user?.id;
			if (!session || !selectedScan || !userSelected) return;

			const exId = String(selectedScan.id);
			if (sentForExercise.current[exId]) return;

			const elId = args?.screenshotElId || 'printscreen';
			const el = document.getElementById(elId);
			let screenshot = '';

			if (el) {
				const { default: html2canvas } = await import('html2canvas');
				const canvas = await html2canvas(el);
				screenshot = canvas.toDataURL();
			}

			await dispatch(setResultExerciseValidateValue({ screenshot }));

			await dispatch(
				setMetricsDataValue({
					userId: userSelected,
					strapiOmniRomExerciseId: selectedScan,
					romSessionId: session.id,
					screenshot,
					...args?.extra,
				}),
			);

			const payload = (
				metricsData ? { ...metricsData, screenshot } : { screenshot }
			) as unknown;
			const saved = await dispatch(savePatientResults(payload)).unwrap();

			sentForExercise.current[exId] = true;
			dispatch(completedExercise(saved));
			dispatch(nextExercise());
		},
		[dispatch, session, user, metricsData, selectedScan, selectedUser],
	);

	const completeSession = useCallback(async () => {
		if (!session?.id) return;
		await dispatch(closeSession(session.id)).unwrap();
		dispatch(resetAll());
	}, [dispatch, session?.id]);

	return { startSession, sendResult, completeSession };
}
