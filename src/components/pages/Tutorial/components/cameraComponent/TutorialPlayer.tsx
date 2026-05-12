import Logo from '@pages/PostureScan/components/Logo';
import {
	FullScreenProvider,
	UseFullScreen,
} from '@pages/PostureScan/context/FullScreen.context';
import { InstructionalVideoProvider } from '@pages/PostureScan/context/InstructionalVideo.context';
import { MenuProvider } from '@pages/PostureScan/context/Menu.context';
import {
	SwitchVideoProvider,
	UseSwitchVideo,
} from '@pages/PostureScan/context/SwitchVideo.context';

import { URL_PATH } from '@stores/constants';
import { useTypedSelector } from '@stores/index';
import { Col, Row } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CaptionView from './component/CaptionView';
import InfoInterlude from './component/InfoInterlude';
import TransitionTutorial from './component/TransitionTutorial';
import TutorialBar from './component/TutorialBar';
import TutorialMediapipe from './component/TutorialMediapipe';
import TutorialMenu from './component/TutorialMenu';
import VoiceControlWidget from './component/VoiceControlWidget';
import VoiceInstructions from './component/VoiceInstructions';
import { useGlobalSpeech } from './context/SpeechContext';
import {
	TransitionStates,
	TransitionTutorialProvider,
	UseTransitionTutorial,
} from './context/TransitionTutorial.context';
import { UseTutorialControls } from './context/TutorialControls.context';
import { useGuidedTourApi } from './hooks/useGuidedTourApi';
import { useSendResult } from './hooks/useSendResult';
import { useVideoPreloader } from './hooks/useVideoPreloader';

type Side = 'left' | 'right';

function TutorialPlayer(props: { onBack: (completed: boolean) => void }) {
	const { onBack } = props;

	return (
		<FullScreenProvider>
			<SwitchVideoProvider>
				<MenuProvider>
					<TransitionTutorialProvider>
						<InstructionalVideoProvider>
							<TutorialPlayerContent
								onBack={(completed: boolean) => onBack(completed)}
							/>
						</InstructionalVideoProvider>
					</TransitionTutorialProvider>
				</MenuProvider>
			</SwitchVideoProvider>
		</FullScreenProvider>
	);
}

function TutorialPlayerContent(props: {
	onBack: (completed: boolean) => void;
}) {
	const { ref, isFullScreen } = UseFullScreen();
	const { cameraId } = UseSwitchVideo();
	const { onBack } = props;

	const {
		setCanvasDimensions,
		selectedScan,
		canvasDimensions,
		isPersonCentered,
		setHasShownInfoInterlude,
	} = UseTutorialControls();
	const { transition, setTransitionToState } = UseTransitionTutorial();
	const [videoEnded, setVideoEnded] = useState(false);
	const [repeat, setRepeat] = useState(false);
	const { sending } = useSendResult();
	const [exerciseCompleted, setExerciseCompleted] = useState(false);

	const [firebaseUrl, setFirebaseUrl] = useState<string | undefined>(undefined);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const { currentCaption } = useGlobalSpeech();

	const [highlights, setHighlights] = useState<number[]>([]);

	function getHighlightPoints(pointsToCalculateAngle: {
		a?: { value?: number | null } | null;
		b?: { value?: number | null } | null;
		c?: { value?: number | null } | null;
		d?: { value?: number | null } | null;
	}): number[] {
		const points = [
			pointsToCalculateAngle.a,
			pointsToCalculateAngle.b,
			pointsToCalculateAngle.c,
			pointsToCalculateAngle.d,
		];
		return points
			.filter(
				(pt): pt is { value?: number | null } =>
					pt !== null &&
					pt !== undefined &&
					pt.value !== undefined &&
					pt.value !== null,
			)
			.map(pt => pt.value as number);
	}

	const inferExpectedSide = (title?: string): Side | null => {
		if (!title) return null;
		const t = title.toLowerCase();
		if (t.includes('left')) return 'left';
		if (t.includes('right')) return 'right';
		return null;
	};

	const SIDE_HIGHLIGHTS: Record<Side, number[]> = {
		left: [11, 13, 15, 23, 25, 27, 29, 31],
		right: [12, 14, 16, 24, 26, 28, 32, 30],
	};

	const navigate = useNavigate();

	const sessionId = useTypedSelector(s => s.rom.main.session?.id);
	const userId = useTypedSelector(s => s.user?.id);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const createInFlight = useRef(false);
	const { startSession } = useGuidedTourApi();

	useEffect(() => {
		const userSelected = user?.isPhysioterapist ? selectedUser.id : user?.id;
		if (!userSelected) return;
		if (sessionId) return;
		if (createInFlight.current) return;

		createInFlight.current = true;
		startSession(userSelected).finally(() => {
			createInFlight.current = false;
		});
	}, [sessionId, startSession, selectedUser]);
	useEffect(() => {
		if (sessionId) createInFlight.current = false;
	}, [sessionId]);

	useEffect(() => {
		if (!selectedScan) return;

		const side = inferExpectedSide(selectedScan.bodySideTitle);
		if (side) {
			setHighlights(SIDE_HIGHLIGHTS[side]);
			return;
		} else {
			const bodyPointsToHighlight = getHighlightPoints(
				selectedScan?.pointsToCalculateAngle,
			);
			setHighlights(bodyPointsToHighlight);
		}
	}, [selectedScan]);

	useEffect(() => {
		if (videoEnded && currentCaption === null) {
			const t = setTimeout(() => {
				setTransitionToState(TransitionStates.READYSETGO);
			}, 2500);
			return () => clearTimeout(t);
		}
	}, [videoEnded, currentCaption]);

	useEffect(() => {
		setVideoEnded(false);
		setRepeat(false);
		const v = videoRef.current;
		if (v) {
			v.currentTime = 0;
			v.play().catch(() => {});
		}
	}, [selectedScan?.id, selectedScan?.video?.url]);

	useEffect(() => {
		if (exerciseCompleted && !sending) {
			const t = setTimeout(() => {
				navigate(
					`/${userId}/${URL_PATH.ROM}/${sessionId}/${URL_PATH.SCAN_RESULT}`,
				);
				onBack(false);
			}, 1500);
			return () => clearTimeout(t);
		}
	}, [exerciseCompleted, sending]);

	useEffect(() => {
		const url =
			selectedScan?.video?.src ?? selectedScan?.video?.url ?? undefined;
		setFirebaseUrl(url);
	}, [selectedScan?.video?.src, selectedScan?.video?.url]);

	const { src: preloadedSrc, state } = useVideoPreloader(firebaseUrl);
	const videoSrc: string | undefined = preloadedSrc ?? firebaseUrl;

	return (
		<div style={{ width: '100%', height: '100%' }}>
			<Row
				justify="center"
				style={{
					background: 'var(--p-text-color)',
					height: '100%',
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					padding: 0,
					overflow: 'hidden',
				}}>
				<Col
					ref={ref}
					style={{
						// aspectRatio: ASPECT_RATIO_4_3,
						width: '100%',
						height: '100%',
						// maxWidth: isFullScreen ? '100%' : 1280,
					}}>
					<Content
						style={{
							zIndex: 1,
							background: 'transparent',
							overflow: 'hidden',
							position: 'relative',
							width: '100%',
							height: '100%',
						}}>
						<TutorialBar isDashboard={false} onBack={() => onBack(false)} />
						<TutorialMenu />
						<TransitionTutorial>
							{transition?.value === TransitionStates.INFO ? (
								<InfoInterlude
									seconds={8}
									title="Arrange a stable chair"
									subtitle="Sit in a hard back chair with your full body visible to the camera."
									onComplete={() =>
										setTransitionToState(TransitionStates.INTRO)
									}
								/>
							) : (
								<>
									<VoiceInstructions
										onCompleted={() => {
											setHasShownInfoInterlude(false);
											setExerciseCompleted(true);
										}}
									/>

									{isPersonCentered ? (
										<Row style={{ height: '100%', width: '100%' }} gutter={0}>
											<Col
												span={12}
												style={{
													position: 'relative',
													background: 'var(--color-black)',
													height: '100%',
													padding: 0,
												}}>
												<TutorialMediapipe
													key={cameraId as string}
													bodyPointsToHighlight={highlights}
													setCanvasDimensions={setCanvasDimensions}
													fit="cover"
												/>
											</Col>

											<Col
												span={12}
												style={{
													background: 'transparent',
													height: '100%',
													padding: 0,
													position: 'relative',
												}}>
												<video
													key={selectedScan?.id}
													ref={videoRef}
													src={videoSrc}
													playsInline
													autoPlay
													crossOrigin="anonymous"
													muted
													preload="auto"
													style={{
														width: '100%',
														height: '100%',
														inset: 0,
														objectFit: 'cover',
														position: 'absolute',
														opacity: 0.85,
													}}
													onEnded={() => setVideoEnded(true)}
													onError={e => {
														const v = e.currentTarget as HTMLVideoElement;
													}}
												/>
											</Col>
										</Row>
									) : (
										<div
											style={{
												height: '100%',
												width: '100%',
												background: 'var(--color-black)',
											}}>
											<TutorialMediapipe
												key={cameraId as string}
												bodyPointsToHighlight={highlights}
												setCanvasDimensions={setCanvasDimensions}
												fit="contain"
											/>
										</div>
									)}
								</>
							)}
						</TransitionTutorial>

						<CaptionView />
						<VoiceControlWidget />
						<Logo />
					</Content>
				</Col>
			</Row>
		</div>
	);
}

export default TutorialPlayer;
