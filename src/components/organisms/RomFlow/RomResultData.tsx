import { useVoiceControl } from '@atoms/RehabPreAssessment/VoiceControl';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { RomResultDataProps } from '@types';
import { ETransitions, repetingExercise } from '@stores/clinical/rom/main';
import { Button, Col, Divider, Flex, Row, Tag, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	MdCheckCircleOutline,
	MdFullscreen,
	MdFullscreenExit,
	MdHighlightOff,
	MdOutlinePauseCircle,
	MdOutlinePlayCircle,
	MdOutlineSwitchCamera,
	MdOutlineVideocam,
} from 'react-icons/md';
import { TbWindowMaximize, TbWindowMinimize } from 'react-icons/tb';

export default function RomResultData(props: RomResultDataProps) {
	const {
		isCompleted,
		isManual,
		onSavePhysicalAssessmentsMetrics,
		isSaving,
		onFullscreen,
		onTogglesSwitchMode,
		flipCamera: _flipCamera,
		switchCamera,
		isSwitchMode,
		isSplashOpened,
		isVideoPause,
		onTogglePauseVideo,
		onToggleTutorial,
		isFullscreen,
		transitionTime,
		hideControls,
	} = props;
	const [isHoverTryAgain, setHoverTryAgain] = useState(false);
	const [isHoverContinue, setHoverContinue] = useState(false);
	const [savedVoice, setSavedVoice] = useState('');
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const { metricsData, transition, finishedExercises } = useTypedSelector(
		state => state.rom.main,
	);
	const onRepeatExercise = useCallback(() => {
		dispatch(repetingExercise(true));
	}, [dispatch]);

	useEffect(() => {
		const lowerVoice = savedVoice?.toLowerCase();
		if (transition?.value == ETransitions.RESULT && lowerVoice && !isSaving) {
			if (
				lowerVoice == 'discard' ||
				lowerVoice == 'try again' ||
				lowerVoice == 'no'
			) {
				onRepeatExercise();
			} else if (lowerVoice == 'submit' || lowerVoice == 'yes') {
				onSavePhysicalAssessmentsMetrics();
			}
		}
	}, [savedVoice, transition?.value, onRepeatExercise, onSavePhysicalAssessmentsMetrics, isSaving]);

	// Memoize callback to prevent VoiceControl from restarting on every render
	const handleVoiceTranscript = useCallback(
		(updatedTranscript: string) => {
			setSavedVoice(updatedTranscript);
		},
		[],
	);

	useVoiceControl(handleVoiceTranscript);

	return (
		<Col span={12}>
			<Row
				justify="end"
				style={{ textAlign: 'end', paddingRight: 8, lineHeight: '35px' }}>
				<Col span={24}>
					<Flex justify="flex-end" align="center" className="h-[35px]">
					<Tag color="var(--color-purple)">{t('Patient.data.vitalscan-rom.betaRelease')}</Tag>
					{isManual &&
						!isCompleted &&
						transition?.value == ETransitions.RESULT && (
							<>
								{metricsData?.screenshot && (
									<>
										<Button
											onMouseEnter={() => {
												setHoverTryAgain(true);
											}}
											onMouseLeave={() => {
												setHoverTryAgain(false);
											}}
											onClick={onRepeatExercise}
											style={{
												height: '35px',
												border: 0,
												borderRadius: 0,
												backgroundColor: isHoverTryAgain
													? 'var(--color-error-600)'
													: 'var(--color-error-600)',
												color: 'var(--text-on-dark)',
											}}
											icon={
												<Flex align="center" gap={5}>
													<MdHighlightOff
														size={22}
														style={{
															verticalAlign: 'middle',
														}}
														color="var(--surface-primary)"
													/>
												</Flex>
											}>
											{t('Patient.data.vitalscan-rom.tryAgain')}
										</Button>
										<Button
											onMouseEnter={() => {
												setHoverContinue(true);
											}}
											onMouseLeave={() => {
												setHoverContinue(false);
											}}
											style={{
												height: '35px',
												border: 0,
												borderRadius: 0,
												backgroundColor: isHoverContinue
													? 'var(--color-success-500)'
													: 'var(--color-success-600)',
												color: 'var(--text-on-dark)',
											}}
											onClick={() => {
												onSavePhysicalAssessmentsMetrics();
											}}
											disabled={isSaving}
											loading={isSaving}
											icon={
												!isSaving && (
													<MdCheckCircleOutline
														size={22}
														style={{
															verticalAlign: 'middle',
														}}
														color="var(--surface-primary)"
													/>
												)
											}>
											{isSaving
												? 'Saving...'
												: t('Patient.data.vitalscan-rom.submitToConitinue')}
										</Button>
										<Divider
											type="vertical"
											className="h-[34px]" style={{ bordercolor: 'var(--color-gray-900)' }}
										/>
									</>
								)}
							</>
						)}
					{!hideControls && (
						<>
							{!isSplashOpened &&
								transition?.value != ETransitions.RESULT &&
								transitionTime && (
									<Flex>
										{isVideoPause ? (
											<Tooltip title={t('Patient.data.vitalscan-rom.pause')}>
												<MdOutlinePlayCircle
													size={30}
													className="align-middle cursor-pointer"
													onClick={onTogglePauseVideo}
													color="var(--color-gray-600)"
												/>
											</Tooltip>
										) : (
											<Tooltip title={t('Patient.data.vitalscan-rom.play')}>
												<MdOutlinePauseCircle
													size={30}
													className="align-middle cursor-pointer"
													onClick={onTogglePauseVideo}
													color="var(--color-gray-600)"
												/>
											</Tooltip>
										)}
									</Flex>
								)}
							<Divider
								type="vertical"
								className="h-[34px]" style={{ bordercolor: 'var(--color-gray-900)' }}
							/>
							<Tooltip title={t('Patient.data.vitalscan-rom.tutorial')}>
								<MdOutlineVideocam
									size={30}
									className="align-middle cursor-pointer"
									onClick={onToggleTutorial}
									color="var(--color-gray-600)"
								/>
							</Tooltip>
							<Divider
								type="vertical"
								className="h-[34px]" style={{ bordercolor: 'var(--color-gray-900)' }}
							/>
							<Tooltip title={t('Patient.data.vitalscan-rom.fullScreen')}>
								{isFullscreen ? (
									<MdFullscreenExit
										size={30}
										className="align-middle cursor-pointer"
										onClick={onFullscreen}
										color="var(--color-gray-600)"
									/>
								) : (
									<MdFullscreen
										size={30}
										className="align-middle cursor-pointer"
										onClick={onFullscreen}
										color="var(--color-gray-600)"
									/>
								)}
							</Tooltip>

							{!finishedExercises?.finished && !isCompleted && (
								<>
									{!isSplashOpened && (
										<>
											<Divider
												type="vertical"
												className="h-[34px]" style={{ bordercolor: 'var(--color-gray-900)' }}
											/>
											<Tooltip title={t('Patient.data.vitalscan-rom.flipCamera')}>
												<MdOutlineSwitchCamera
													size={30}
													className="align-middle cursor-pointer"
													onClick={switchCamera}
													color="var(--color-gray-600)"
												/>
											</Tooltip>
											<Divider
												type="vertical"
												className="h-[34px]" style={{ bordercolor: 'var(--color-gray-900)' }}
											/>
											<Tooltip title={t('Patient.data.vitalscan-rom.switchVideo')}>
												{isSwitchMode ? (
													<TbWindowMaximize
														size={30}
														className="align-middle cursor-pointer"
														onClick={onTogglesSwitchMode}
														color="var(--color-gray-600)"
													/>
												) : (
													<TbWindowMinimize
														size={30}
														className="align-middle cursor-pointer"
														onClick={onTogglesSwitchMode}
														color="var(--color-gray-600)"
													/>
												)}
											</Tooltip>
										</>
									)}
								</>
							)}
						</>
					)}
					</Flex>
				</Col>
			</Row>
		</Col>
	);
}
