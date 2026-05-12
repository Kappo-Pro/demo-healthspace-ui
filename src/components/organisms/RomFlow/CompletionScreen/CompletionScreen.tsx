import {
	getCustomRomSessionById,
	setSelectedRom,
} from '@stores/clinical/rom/customRom';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	setActiveStep,
	setVideoRecordState,
} from '@stores/shared/onBoard/onBoard';
import { Button, Flex, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;
// REMOVED: import { CustonRomSessionPaginated } from '@types';
 
import { UntitledIcon } from '@atoms/Icon';
import AiAssistantCustomRomScanResult from '@pages/CustomRomScanResult';
import { closeSession } from '@stores/clinical/rom/main';
import './CompletionScreen.css';

interface ICScreen {
	isDashboard: boolean;
}
export const CompletionScreen = (props: ICScreen) => {
	const { isDashboard } = props;
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [isLoading, setLoading] = useState(true);
	const { session } = useTypedSelector(state => state.rom.main);

	const handleClick = async () => {
		dispatch(setActiveStep(9));
		dispatch(setVideoRecordState(false));
	};
	const customRomSession = useTypedSelector(state => state.rom.main.session);

	const fetchSessionData = async (sessionId: string, page: number) => {
		customRomSession?.id &&
			(await dispatch(closeSession(customRomSession?.id || '')));
		const data = await dispatch(
			getCustomRomSessionById({
				customRomId: sessionId,
				page: page,
				completed: true,
			}),
		);
		dispatch(setSelectedRom(data?.payload?.data[0]));
	};

	useEffect(() => {
		if (session?.id) {
			fetchSessionData(session?.romProgramId, 1);
		}
		setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session?.id]);

	return (
		<Flex
			vertical
			align="center"
			gap={12}
			className="h-full"
			style={{ userSelect: 'none', paddingBottom: 'var(--spacing-5)' }}>
			<Flex vertical align="center" gap={8} className="w-full">
				<Flex
					align="center"
					justify="center"
					style={{
						backgroundcolor: 'var(--brand-primary)',
						borderRadius: 'var(--radius-full)',
						padding: 'var(--spacing-5)',
						height: '60px',
						width: '60px',
					}}>
					<UntitledIcon name="check" />
				</Flex>
				<Paragraph className="completion-screen-vitalscan-rom-title">
					{t('Admin.data.rehab.rehabPostAssessment.congratulations')}
				</Paragraph>
				<Paragraph className="completion-screen-vitalscan-rom-description">
					{t('Admin.data.rehab.rehabPostAssessment.description')}
				</Paragraph>
				{isLoading ? (
					<Flex align="center" justify="center">
						<Spin size="large" />
					</Flex>
				) : (
					<div className="completion-screen-vitalscan-rom-summary">
						<AiAssistantCustomRomScanResult
							isDashboard={isDashboard ?? false}
						/>
					</div>
				)}

				<Button
					className="completion-screen-vitalscan-rom-next-button"
					onClick={() => handleClick()}>
					{t('Patient.data.onboard.next')}
					<UntitledIcon name="check" />
				</Button>
			</Flex>
		</Flex>
	);
};
