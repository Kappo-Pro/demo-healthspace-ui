import { router } from '@routers/routers';
import { useTypedSelector } from '@stores/index';
import { Button } from 'antd';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const PatientDashboardBanner = () => {
	const navigate = useNavigate();
	const user = useTypedSelector(state => state.user);
	const { t } = useTranslation();
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	const handleMobilityScoreCheck = async (e: MouseEvent) => {
		e.stopPropagation();
		// await dispatch(
		// 	createOnBoardSession({
		// 		userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
		// 	}),
		// );
		navigate(
			`/${user.isPhysioterapist ? selectedUser?.id : user?.id}${router.AIASSISTANT_START_SCAN}`,
		);
	};

	const getLogoSrc = () => {
		return '/images/dashboard/vitalscan-rom-logo.svg';
	};

	return (
		<div
			className={`dashboard-section-wrapper ${!location.pathname.includes('/dashboard') ? 'extra-margin-top' : ''}`}>
			<div className="dashboard-card left-card">
				<div className="dashboard-card-inner">
					<img
						className="dashboard-image"
						src="/images/dashboard/vitalscan-rom-dashboard.png"
						alt="Range of Motion"
					/>
					<div className="dashboard-content">
						<div className="logo-wrapper">
							<img src={getLogoSrc()} alt="Logo" />
						</div>
						<p className="dashboard-description text-primary">
							{t('Patient.data.dashboardScreen.romMeasures')}
						</p>
						<div className="dashboard-button-wrapper">
							<Button
								onClick={e =>
									handleMobilityScoreCheck(e as unknown as MouseEvent)
								}>
								{t('Patient.data.dashboardScreen.mobilityScore')}
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div
				className="dashboard-card right-card"
				style={{
					backgroundImage: 'url("/images/dashboard/posture-banner.png")',
				}}>
				<div className="dashboard-card-inner">
					<div className="dashboard-content white-text">
						<div className="logo-wrapper">
							<img
								src="/images/dashboard/posture-analysis.svg"
								alt="Posture Analysis"
							/>
						</div>
						<p className="dashboard-description">
							{t('Patient.data.dashboardScreen.postureAnalysis')}
						</p>
						<div className="dashboard-button-wrapper">
							<Button
								onClick={e => {
									e.stopPropagation();
									navigate(`/${user?.id}${router.AIASSISTANT_START_SCAN}`);
								}}>
								{t('Patient.data.dashboardScreen.startPostureScan')}
							</Button>
						</div>
					</div>
					<img
						className="dashboard-image second-image"
						src="/images/dashboard/posture-woman-banner.png"
						alt="Posture Scan"
					/>
				</div>
			</div>
		</div>
	);
};

export default PatientDashboardBanner;
