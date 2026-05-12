import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { useCallback, useRef, useState } from 'react';

import {
	completedExercise,
	nextExercise,
	savePatientResults,
	setResultExerciseValidateValue,
} from '@stores/clinical/rom/main';
import { bodyArr } from '../component/TutorialConstants';
import { UseTutorialControls } from '../context/TutorialControls.context';

export function useSendResult() {
	const dispatch = useTypedDispatch();
	const {
		resultBus,
		selectedScan,
		hasSentResult,
		markResultSent,
		resetResultBus,
	} = UseTutorialControls();

	const { session, uploadProgress } = useTypedSelector(s => s.rom.main);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	const [sending, setSending] = useState(false);
	const [error, setError] = useState<unknown | null>(null);

	const sendingMap = useRef<Record<string, boolean>>({});
	const sentMap = useRef<Record<string, boolean>>({});

	const buildTitle = (side?: 'left' | 'right') => {
		if (!selectedScan) return '';
		const base =
			selectedScan.name ||
			`${selectedScan.movementTitle || 'Exercise'}${selectedScan.bodySideTitle ? ` (${selectedScan.bodySideTitle})` : ''}`;
		return side ? `${base} (${side})` : base;
	};
	const send = useCallback(async () => {
		const userSelected = user?.isPhysioterapist ? selectedUser.id : user?.id;
		if (!session?.id || !selectedScan || !userSelected) return;

		const screenshot = resultBus?.screenshot || '';
		const angle = Number(resultBus?.angle ?? NaN);
		const coordsArr = resultBus?.coordinates ?? bodyArr;

		if (!screenshot) return;
		const da = resultBus?.dualAngles;
		const hasBothSides =
			da && typeof da.left === 'number' && typeof da.right === 'number';

		if (hasBothSides) {
			const pairs: Array<['left' | 'right', number]> = [
				['left', Math.round(da!.left!)],
				['right', Math.round(da!.right!)],
			];

			setSending(true);
			setError(null);

			try {
				await Promise.all(
					pairs.map(async ([side, value]) => {
						const title = buildTitle(side);
						const dupKey = `${session.id}:${selectedScan.id}:${side}`;
						if (
							sentMap.current[dupKey] ||
							hasSentResult(title) ||
							sendingMap.current[title]
						)
							return;

						sendingMap.current[title] = true;

						const normal = Number(selectedScan.normal ?? 0);
						const min = Number(selectedScan.min ?? 0);
						const max =
							selectedScan.max == null ? null : Number(selectedScan.max);
						const wfl = Number(selectedScan.wfl ?? 0);
						const outOfRange =
							max != null ? value < min || value > max : value < min;
						const romProgramExerciseId = String(selectedScan.id);

						const payload = {
							results: {
								create: [
									{
										value: value ?? 0,
										normal,
										min,
										max,
										wfl,
										outOfRange,
										romProgramExerciseId,
									},
								],
							},
							title,
							userId: String(userSelected ?? ''),
							romSessionId: String(session.id),
							screenshot,
							coordinates: coordsArr,
						};

						await dispatch(savePatientResults(payload as unknown)).unwrap();
						sentMap.current[dupKey] = true;
						markResultSent(title);
					}),
				);

				dispatch(completedExercise(selectedScan as unknown));
				dispatch(nextExercise());
			} catch (err) {
				setError(err);
				console.error('Error sending dual-angle results:', err);
			} finally {
				pairs?.forEach(([side]) => {
					sendingMap.current[buildTitle(side)] = false;
				});
				setSending(false);
			}
			return;
		}

		if (!Number.isFinite(angle)) return;

		const romSessionId = session.id;
		const exerciseId = selectedScan?.id;

		const dupKey = `${romSessionId}:${exerciseId}`;
		if (sentMap.current[dupKey]) return;

		await dispatch(setResultExerciseValidateValue({ screenshot }));

		const normal = Number(selectedScan.normal ?? 0);
		const min = Number(selectedScan.min ?? 0);
		const max = selectedScan.max == null ? null : Number(selectedScan.max);
		const wfl = Number(selectedScan.wfl ?? 0);
		const outOfRange = max != null ? angle < min || angle > max : angle < min;
		const romProgramExerciseId = String(selectedScan.id);
		const title = buildTitle();

		if (hasSentResult(title) || sendingMap.current[title]) return;

		sendingMap.current[title] = true;
		setSending(true);
		setError(null);

		try {
			const payload = {
				results: {
					create: [
						{
							value: Number.isFinite(angle) ? Math.round(angle) : 0,
							normal,
							min,
							max,
							wfl,
							outOfRange,
							romProgramExerciseId,
						},
					],
				},
				title,
				userId: String(userSelected ?? ''),
				romSessionId: String(session.id),
				screenshot,
				coordinates: coordsArr,
			};

			const saved = await dispatch(
				savePatientResults(payload as unknown),
			).unwrap();

			sentMap.current[dupKey] = true;
			markResultSent(title);

			dispatch(completedExercise(saved));
			dispatch(nextExercise());
		} catch (err) {
			setError(err);
			console.error('Error sending result:', err);
		} finally {
			sendingMap.current[title] = false;
			setSending(false);
		}
	}, [dispatch, session?.id, selectedScan, user, resultBus]);

	return {
		send,
		sending,
		progress: uploadProgress,
		error,
	};
}
