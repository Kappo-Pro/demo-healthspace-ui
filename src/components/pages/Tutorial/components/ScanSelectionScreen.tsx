import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import { PlayCircle } from '@vitalflow-icons/media/playCircle';
import { ResponsiveImage } from '@atoms/ResponsiveImage';

import { Button, Card, Col, Flex, Row, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_ASSISTANT } from './cameraComponent/component/TutorialConstants';
import { useGlobalSpeech } from './cameraComponent/context/SpeechContext';
import {
	MovementExercise,
	UseTutorialControls,
} from './cameraComponent/context/TutorialControls.context';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface Props {
	onBack: () => void;
	onContinue: () => void;
}

const ScanSelectionScreen: React.FC<Props> = ({ onBack, onContinue }) => {
	const { t } = useTranslation();
	const { speakText, cancelSpeech } = useGlobalSpeech();

	const voiceName = DEFAULT_ASSISTANT.voiceName;

	const rate = 1;

	const selectedAssistant = DEFAULT_ASSISTANT;

	const textContent = {
		welcomeTitle: `Welcome to VitalFlow, your own virtual space for health and wellness. I'm your guide, ${selectedAssistant?.name}`,
		bodyVisibility:
			'Please ensure your whole body is visible on camera and that you have enough space to move freely. ',
		mobilityIntro:
			'Today, we\'ll start by assessing your flexibility through a series of range of motion exercises.',
		chooseScan: 'We will be doing following exercises:',
		speakIntro: `Welcome to VitalFlow, your own virtual space for health and wellness. I'm your guide for the journey. Please ensure your whole body is visible on camera and that you have enough space to move freely. Today, we'll start by assessing your flexibility through a series of range of motion exercises. Choose a scan to begin your guided tour.`,
	};

	const { exerciseList, selectedScan, setSelectedScan } = UseTutorialControls();

	const itemsPerPage = 4;
	const scrollStep = 4;

	const [startIndex, setStartIndex] = useState(0);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const visibleExercises = exerciseList.slice(
		startIndex,
		startIndex + itemsPerPage,
	);

	const handleScrollNext = () => {
		if (startIndex + scrollStep < exerciseList.length) {
			setStartIndex(prev => prev + scrollStep);
		}
	};

	const handleScrollPrev = () => {
		if (startIndex - scrollStep >= 0) {
			setStartIndex(prev => prev - scrollStep);
		}
	};

	// useEffect(() => {
	// 	if (voiceName && selectedScan === null) {
	// 		speakText(textContent.speakIntro, voiceName, rate);
	// 	}
	// 	return () => {
	// 		cancelSpeech();
	// 	};
	// }, [voiceName]);

	const handleSelectScan = (scan: MovementExercise): void => {
		setSelectedScan(scan);
		cancelSpeech();
		if (voiceName) {
			speakText(`You have selected ${scan.name}`, voiceName, rate);
		}
	};

	useEffect(() => {
		setSelectedScan(visibleExercises[0]);
	}, []);

	return (
		<div
			style={{
				padding: 0,
				height: '100%',
				display: 'flex',
				justifyContent: 'center',
			}}>
			<Card
				style={{
					width: '100%',
					borderRadius: 12,
					boxShadow: '0 2px 12px var(--color-black-alpha-10)',
					padding: 'var(--spacing-4)',
				}}>
				<Button
					type="link"
					icon={<ArrowLeftOutlined />}
					style={{ position: 'absolute', top: -30, left: 10 }}
					onClick={() => {
						onBack();
						setSelectedScan(null);
					}}>
					Back
				</Button>
				<Title level={3} style={{ textAlign: 'center', marginBottom: 'var(--spacing-4)' }}>
					Baseline Scan
				</Title>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row', // Side-by-side
						gap: 'var(--spacing-4)',
						alignItems: 'flex-start',
					}}>
					<div
						style={{
							width: 370,
							borderRadius: 12,
							padding: 'var(--spacing-4) var(--spacing-2) var(--spacing-4) var(--spacing-4)',
							minHeight: 200,
							maxHeight: 600,
							backgroundColor: 'var(--card-bg-color)',
							boxShadow: '0px 2px 12px var(--box-shadow)',
							display: 'flex',
							flexDirection: 'column',
							gap: 12,
						}}>
						<>
							<div
								style={{
									flex: 1,
									minHeight: 0,
									overflowY: 'auto',
									paddingRight: 8,
									WebkitOverflowScrolling: 'touch',
									display: 'flex',
									flexDirection: 'column',
									gap: 14,
									fontSize: 16,
									color: 'var(--text-primary)',
								}}>
								{exerciseList?.map(scan => {
									return (
										<div className="flex">
											<div
												onClick={e => {
													e.stopPropagation();
												}}>
												<div className="orom-exercise-data-item image-wrapper">
													<img
														src={scan.image?.url || ''}
														className="orom-exercise-data-item-image"
													/>
													<div className="play-button">
														<PlayCircle width={40} height={40} />
													</div>
												</div>
											</div>
											<div style={{ width: '100%', marginLeft: 10 }}>
												<p className="orom-exercise-data-item-title">
													{scan.name}
												</p>
											</div>
										</div>
									);
								})}
							</div>
							{/* <Button
							className="start-session-css"
							style={buttonStyle}
							icon={
								<PlayCircle height={18} width={18} color="stroke-purple-700" />
							}>
							Start Scan
						</Button> */}
							<div className="orom-estimated-time">
								<span style={{ marginRight: 'var(--spacing-1)', fontWeight: 'var(--font-weight-semibold)' }}>
									2 min
								</span>
								25 seconds
							</div>
						</>
					</div>
					<div>
						<Flex justify="center">
							<div>
								<div>
									<div className="inline" />
									<ResponsiveImage
										src="/images/rom/front.webp"
										style={{ width: 307 }}
										alt={t('tutorial.scanSelection.bodyFrame')}
										loading="eager"
									/>
								</div>
							</div>
						</Flex>
					</div>
				</div>
				<Button
					type="primary"
					icon={<CheckOutlined />}
					size="large"
					block
					style={{
						marginTop: 32,
						fontSize: 18,
						backgroundColor: 'var(--color-purple-600)',
					}}
					onClick={onContinue}
					disabled={!selectedScan}>
					Start Scan
				</Button>
			</Card>
		</div>
	);
};

export default ScanSelectionScreen;
