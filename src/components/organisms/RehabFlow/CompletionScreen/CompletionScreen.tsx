import { ArrowNarrowLeft } from '@vitalflow-icons/arrows/arrowNarrowLeft';
import { router } from '@routers/routers';
import { savePatientEvaluation } from '@stores/clinical/rehab/main';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { Button, Flex, Typography } from 'antd';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import checkLogo from './CompletionLogo.json';
import VoiceRecordingLogo from './VoiceRecordingLogo.json';

const { Paragraph } = Typography;

interface CompletionScreenProps {
	sessionId: string;
	savedVoice: StringConstructor;
}

export const CompletionScreen = (props: CompletionScreenProps) => {
	const { sessionId, savedVoice } = props;
	const navigate = useNavigate();
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const { t } = useTranslation();
	const micRef = useRef<LottieRefCurrentProps>(null);

	useEffect(() => {
		if (
			savedVoice.toLowerCase().includes('dashboard') ||
			savedVoice.toLowerCase().includes('done')
		) {
			navigate(
				`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}${router.AIASSISTANT_LIST_SESSIONS}`,
			);
			dispatch(setActiveTab('listSessions'));
		}
	}, [savedVoice, navigate, user, selectedUser, dispatch]);

	const handleClick = () => {
		navigate(
			`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}${router.AIASSISTANT_LIST_SESSIONS}`,
		);
		dispatch(setActiveTab('listSessions'));
	};

	useEffect(() => {
		dispatch(savePatientEvaluation(sessionId));
	}, [sessionId, dispatch]);

	return (
		<Flex vertical className="pt-[153px] h-full" align="center" gap={12}>
			<Lottie animationData={checkLogo} loop={false} autoplay={true} />
			<Paragraph className="text-white text-3xl font-bold">
				{t('Admin.data.rehab.rehabPostAssessment.congratulations')}
			</Paragraph>
			<Paragraph className="text-white text-lg">
				{t('Admin.data.rehab.rehabPostAssessment.description')}
			</Paragraph>
			<Button
				className="!bg-success-500 !text-white !py-2.5 !px-4 !rounded-lg !h-10"
				onClick={() => handleClick()}
				icon={<ArrowNarrowLeft width={20} height={20} />}>
				{t('Admin.data.rehab.rehabPostAssessment.dashboard')}
			</Button>
			<Flex vertical justify="center" align="center">
				<Flex justify="flex-end" align="center">
					<Flex
						align="center"
						justify="center"
						style={{ height: '50px', width: '150px' }}>
						<Lottie
							lottieRef={micRef}
							animationData={VoiceRecordingLogo}
							loop={false}
							autoplay={false}
						/>
					</Flex>
					<img src="/images/microphone.svg" />
				</Flex>
				<Paragraph className="font-semibold text-lg text-white">
					{t('Admin.data.rehab.rehabPostAssessment.voiceCommand')}
				</Paragraph>
			</Flex>
		</Flex>
	);
};
