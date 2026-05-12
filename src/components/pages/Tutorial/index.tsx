import { AspectRatioModal } from '@atoms/Modal';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScanSelectionScreen from './components/ScanSelectionScreen';
import TourProloguePlayer from './components/TourProloguePlayer';

import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setCollapsible } from '@stores/shared/patientDetail/patientDetail';
import ScanCompletedScreen from './components/ScanCompletedScreen';
import TutorialPlayer from './components/cameraComponent/TutorialPlayer';
import {
	SpeechProvider,
	useGlobalSpeech,
} from './components/cameraComponent/context/SpeechContext';
import { TutorialControlsProvider } from './components/cameraComponent/context/TutorialControls.context';
import './tutorial.css';

export default function Tutorial() {
	const navigate = useNavigate();
	const [step, setStep] = useState<
		'assistant' | 'scan' | 'tutorial' | 'completed'
	>('assistant');
	const { cancelSpeech } = useGlobalSpeech();
	const dispatch = useTypedDispatch();
	const _isCollapsible = useTypedSelector(
		state => state.patientDetail.patientDetail.isCollapsible,
	);

	useEffect(() => {
		dispatch(setCollapsible(true));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Mount-only effect - dispatch is stable

	const renderStepComponent = () => {
		switch (step) {
			case 'assistant':
				return (
					<TourProloguePlayer
						onContinue={() => {
							cancelSpeech();
							// setStep('scan');
							setStep('tutorial');
						}}
					/>
				);
			case 'scan':
				return (
					<ScanSelectionScreen
						onBack={() => setStep('assistant')}
						onContinue={() => {
							cancelSpeech();

							setStep('tutorial');
						}}
					/>
				);
			case 'tutorial':
				return (
					<TutorialPlayer
						onBack={(completed: boolean) => {
							cancelSpeech();
							// setStep('assistant');
							if (completed) {
								setStep('completed');
							} else {
								setStep('assistant');
							}
						}}
					/>
				);
			case 'completed':
				return <ScanCompletedScreen onRestart={() => setStep('assistant')} />;
		}
	};

	return (
		<AspectRatioModal
			open={true}
			onCancel={() => navigate(-1)}
			maskClosable={true}
			closable={false}
			styles={{
				body: {
					height: '100%',
					padding: 0,
					overflow: 'hidden',
					backgroundColor: 'transparent',
				},
				content: {
					padding: 0,
					backgroundColor: 'transparent',
					boxShadow: 'none',
				},
			}}
			destroyOnClose={true}>
			<TutorialControlsProvider>
				<SpeechProvider>
					<>{renderStepComponent()}</>
				</SpeechProvider>
			</TutorialControlsProvider>
		</AspectRatioModal>
	);
}
