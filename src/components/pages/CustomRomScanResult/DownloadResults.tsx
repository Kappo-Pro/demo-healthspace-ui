import ContentRomResult from './ContentRomTableResult';
import ContentRomResultSides from './ContentROMTableResultSides';
import { Flex, Row, Col, Typography, Avatar, QRCode } from 'antd';

const { Paragraph } = Typography;
import './style.css';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import MobilityPersonas from './MobilityPersonna';
import MobilityOverview from './MobilityOverview';
import { getMobilityData } from '@stores/constants';
import { useEffect, useState } from 'react';
import { useTypedSelector } from '@stores/index';
import { evalScore } from './jointsTemplateData';
import LogoWithFallback from '@atoms/AdminMenu/LogoMark';
import PieChart from './PieChart';
import OldRadarChart from './OldRadarChart';
const { Title, Text } = Typography;

const DownloadResults = ({ selectedRom, chartType }) => {
	const { t } = useTranslation();
	const [avgScore, setAvgScore] = useState(0);
	const mobilityOptions = getMobilityData(Math.round(avgScore), t);
	const persona = mobilityOptions.find(option => option.active);
	const getColorForCategory = (score: number) => {
		if (Math.round(score) >= 90) return 'var(--color-success-600)';
		if (Math.round(score) >= 75 && Math.round(score) <= 89) return 'var(--color-success-400)';
		if (Math.round(score) >= 60 && Math.round(score) <= 74) return 'var(--color-warning-600)';
		if (Math.round(score) >= 40 && Math.round(score) <= 59) return 'var(--color-warning-500)';
		if ( Math.round(score) >= 20 && Math.round(score) <= 39) return 'var(--color-error-500)';
		return 'var(--color-error)';
	};
	const { selectedUser } = useTypedSelector((state) => state.contacts.main)
	const user = useTypedSelector(state => state.user);

	const calculateAge = (birthdate: Date) => {
		const today = new Date();
		const birthdateDate = new Date(birthdate);
		let age = today.getFullYear() - birthdateDate.getFullYear();
		const monthDiff = today.getMonth() - birthdateDate.getMonth();
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthdateDate.getDate())
		) {
			age--;
		}
		return age;
	};

	useEffect(() => {
  if (selectedRom?.romPatientResults) {
    const totalScore = selectedRom?.romPatientResults?.reduce((sum: number, item: { results: {score: number}[]; }) => {
      const itemScore = item?.results?.reduce((innerSum: number, result: { score: number; }) => {
        const score = Math.round(evalScore(result));
        return innerSum + (score > 100 ? 100 : score);
      }, 0);
      return sum + (itemScore || 0);
    }, 0);
const totalResultsLength = selectedRom?.romPatientResults?.reduce(
  (total: number, item: { results: { score: number }[] }) => total + (item.results?.length || 0),
  0
);
	setAvgScore(Math.round(totalScore / totalResultsLength))
  }
}, [selectedRom]);

	const formatBirthdate = (birthdate: Date) => {
		if (!birthdate) return 'N/A';
		const birthdateDate = new Date(birthdate);
		const age = calculateAge(birthdateDate);
		return (
			<span>
				{`${age}`} {t('admin.managePatient.yearsOld')}
			</span>
		);
	};

	const getCategoryName = (score: number) => {
		if (score >= 90) return t('Patient.data.vitalscan-rom.optimalMobility');
		if (score >= 75) return t('Patient.data.vitalscan-rom.functionalMobility');
		if (score >= 60) return t('Patient.data.vitalscan-rom.moderateRestriction');
		if (score >= 40) return t('Patient.data.vitalscan-rom.limitedMobility');
		if (score >= 20) return t('Patient.data.vitalscan-rom.restrictedMobility');
		return t('Patient.data.vitalscan-rom.criticallyImpaired');
	};

	const getCategoryDesc = (score: number) => {
		if (score >= 90) return t('Patient.data.vitalscan-rom.optimalMobilityDesc');
		if (score >= 75) return t('Patient.data.vitalscan-rom.functionalMobilityDesc');
		if (score >= 60) return t('Patient.data.vitalscan-rom.moderateRestrictionDesc');
		if (score >= 40) return t('Patient.data.vitalscan-rom.limitedMobilityDesc');
		if (score >= 20) return t('Patient.data.vitalscan-rom.restrictedMobilityDesc');
		return t('Patient.data.vitalscan-rom.criticallyImpairedDesc');
	};

	return (
		<div style={{ margin: 40, backgroundColor: 'var(--summary-bg-colors)' }}>
			<Flex className="mobility-report-physio-data pdf-section" justify="space-between" align="center">
				<div className="logo-mark">
					<LogoWithFallback download={true}/>
				</div>
				<Flex align="center" gap={16} className="w-[100%]" justify="flex-end">
					<div>
						<QRCode
							value={window.location.href}
							size={100}
						/>
					</div>
					<div>
						<p className={`inter-heading-bold pdf-margin`}>
							{t('patient.reports.mobility.mobilityProgressReport')}
						</p>
						<p className={`inter-text-regular-sm  pdf-margin`}>
							{t('patient.reports.mobility.reportCreated')} : {user?.profile?.fullName}
						</p>
						<p className={`inter-text-regular-sm  pdf-margin`}>
							{new Date().toLocaleDateString('en-GB')}
						</p>
					</div>
				</Flex>
				<div className="user-info-container">
					<Flex inline align="flex-start" className="mt-5" style={{
							backgroundColor: user?.profile?.avatarColor || 'var(--brand-primary)',
							color: 'var(--text-on-brand)',
							fontSize: '52px',
							border: '4px solid white',
							borderRadius: 'var(--radius-full)',
							width: '100px',
							height: '100px',
						}} justify="center">
						<Avatar
							style={{
								backgroundColor: 'transparent',
								color: 'var(--text-on-brand)',
								fontSize: '52px',
								border: 'none',
							}}
							alt="avatar"
							size={100}>
							<Paragraph className="pdf-margin -mt-5">
								{user?.isPhysioterapist ? selectedUser?.profile?.firstName?.charAt(0)?.toUpperCase() : user?.profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
							</Paragraph>
						</Avatar>
					</Flex>
					<div className="user-info">
						<div className="text-end">
							<span
								style={{
									fontSize: 'var(--font-size-lg)',
									lineHeight: 'var(--spacing-7)',
									fontWeight: 'var(--font-weight-bold)',
								}}>
								<Paragraph>{user?.isPhysioterapist ? selectedUser?.profile?.fullName : user?.profile?.fullName}</Paragraph>
							</span>
							<div className="user-metric-data">
								<p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--spacing-4)' }}>
									<p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--spacing-4)' }}>
										{t('patient.reports.mobility.birthDate')} : {user.profile.birthDate}
									</p>
									<div style={{ fontSize: '15px' }}>
										<span
											style={{
												marginTop: '-1px',
												textTransform: 'capitalize',
											}}>
											{user?.profile?.gender || 'N/A'},{' '}
										</span>
										<span>{formatBirthdate(user?.profile?.birthDate)}</span>
									</div>
									<span style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--spacing-4)' }}>
										<span style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--spacing-4)' }}>
											{t('patient.reports.mobility.weight')} :{' '}
											{user?.profile?.imperialWeight
												? `${user?.profile?.weight[0]?.imperialWeight} lbs `
												: `${user?.profile?.weight[0]?.metricWeight} kg `}
										</span>
										<span style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--spacing-4)' }}>
											| {t('patient.reports.mobility.height')}: {user?.profile?.imperialHeight}"
										</span>
									</span>
								</p>
							</div>
						</div>
					</div>
				</div>
			</Flex>
			<Flex vertical>
				<Row className="pdf-section">
					<Col flex="auto">
						<Flex align="flex-end" gap={10}>
							<Title
								type="secondary"
								level={4}>
								{t('Patient.data.vitalscan-rom.romMobilityReport')}
							</Title>
							<Title
								type="secondary"
								level={4}>
								- {selectedRom?.romProgram?.title}
							</Title>
						</Flex>
					</Col>
					<Col flex="180px">
						<Text type="secondary">
							{moment(selectedRom?.createdAt).local().format('LLL')}
						</Text>
					</Col>
				</Row>
				<Row gutter={16} className="pdf-section">
					<Col
						span={12}
						style={{
							padding: 'var(--spacing-2-5)',
							backgroundColor: 'var(--surface-primary)',
							borderRadius: '14px',
						}}>
					<Flex className="rounded-lg p-4 mb-4" align="center" justify="center" gap={8} style={{ backgroundColor: "var(--color-gray-100)" }}>
							<div className="mobility-icon">
								<img src={persona?.selectedIcon} alt={persona?.title} />
							</div>
							<div className="mobility-text">
								<div
									className={`mobility-title-text pdf-margin`}
									style={{ color: persona?.color }}>
									{t('patient.reports.mobility.youAre')} "{persona?.title?.toUpperCase()}"
								</div>
								<div className={`mobility-description pdf-margin`}>
									{persona?.range}
								</div>
							</div>
						</Flex>
						{persona && (chartType === 'radar' ?
						<OldRadarChart selectedRom={selectedRom} persona={persona} avgScore={avgScore} isPdf/>
					: <PieChart selectedRom={selectedRom} persona={persona} avgScore={avgScore} isPdf/> )}
						</Col>
					<Col span={12}>
						<ContentRomResultSides
							isPdf
							selectedRom={selectedRom}
							getColorForCategory={getColorForCategory}
							getCategoryName={getCategoryName}
							getCategoryDesc={getCategoryDesc}
						/>
					</Col>
				</Row>
				<MobilityOverview
					isPdf
					persona={{
						color: '',
					}}
				/>
				<ContentRomResult
					isPdf
					selectedRom={selectedRom}
					getColorForCategory={getColorForCategory}
					getCategoryName={getCategoryName}
				/>
				<MobilityPersonas isPdf avgScore={avgScore} />
			</Flex>
		</div>
	);
};

export default DownloadResults;
