import { UntitledIcon } from '@atoms/Icon';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { wellCheckNess } from '@stores/shared/onBoard/onBoard';
import { setIsProgramPaused } from '@stores/shared/patientDetail/program';
import { getUser } from '@stores/shared/user';
import { Button, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import './WellnessCheck.css';

const { Paragraph } = Typography;

interface IWellnessCheckProps {
	setWellnessCheckVisible: (visible: boolean) => void;
}

export default function WellnessCheck(props: IWellnessCheckProps) {
	const { setWellnessCheckVisible } = props;
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();
	const userId = useTypedSelector(state => state.user.id);
	const program = useTypedSelector(
		state => state.patientDetail.program.program,
	);
	const isProgramPaused = useTypedSelector(
		state => state.patientDetail.program.isProgramPaused,
	);

	const handleYesClick = async () => {
		dispatch(setIsProgramPaused(true));
		await dispatch(wellCheckNess({ userId, isWellCheckNess: true }));
		await dispatch(getUser(userId));
	};

	const handleNoClick = async () => {
		dispatch(setIsProgramPaused(false));
		await dispatch(wellCheckNess({ userId, isWellCheckNess: false }));
		await dispatch(getUser(userId));
	};

	return (
		<div className="wellness-check-card">
			<div className="wellness-check-header">
				<UntitledIcon name="activity" size="small" />
				<Paragraph className="wellness-check-label">
					{t('admin.patient.wellnessCheck.label')}
				</Paragraph>
				<UntitledIcon
					name="close"
					size="small"
					onClick={() => setWellnessCheckVisible(false)}
					style={{ cursor: 'pointer', marginLeft: 'auto' }}
				/>
			</div>

			<div className="wellness-check-content">
				<span className="wellness-check-title">
					{t('admin.patient.wellnessCheck.title')}
				</span>
				<span className="wellness-check-description">
					{t('admin.patient.wellnessCheck.description')}
				</span>
			</div>

			<div className="wellness-check-action">
				<span className="wellness-check-question">
					{t('admin.patient.wellnessCheck.stillDiscomfort')}
				</span>
				{isProgramPaused ? (
					<Button
						className="wellness-button"
						type="default"
						onClick={handleNoClick}>
						{t('admin.patient.wellnessCheck.noBetter')}
					</Button>
				) : (
					<Button
						className="wellness-button"
						type="primary"
						onClick={handleYesClick}>
						{t('admin.patient.wellnessCheck.yesPain')}
					</Button>
				)}
			</div>
		</div>
	);
}
