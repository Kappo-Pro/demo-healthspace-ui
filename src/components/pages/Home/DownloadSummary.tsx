import LogoWithFallback from '@atoms/AdminMenu/LogoMark';
import { useTypedSelector } from '@stores/index';
import { Avatar, Card, Flex, Typography } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { SummaryReviewInterface } from './SummaryReview';
import { Options, PainAssessments } from './interface';
import SummuryOptionList from './summaryOptionList';

const { Paragraph } = Typography;

export default function DownloadSummary(props: SummaryReviewInterface) {
	const { list, medicalHistoryOptionsData, savedEvaluationData } = props;
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);
	const associatedSymptomsData = useTypedSelector(
		state => state.painAssessment.associatedSymptoms,
	);
	const medicalHistoryData = useTypedSelector(
		state => state.painAssessment.medicalHistory,
	);
	const formattedDate = moment(new Date()).format('MMMM DD, YYYY hh:mm A');

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

	const formatBirthdate = (birthdate: Date) => {
		if (!birthdate) return 'Unknown';
		const birthdateDate = new Date(birthdate);
		const age = calculateAge(birthdateDate);
		return (
			<span>
				{`${age}`} {t('admin.managePatient.yearsOld')}
			</span>
		);
	};

	return (
		<div className="summary-review">
			<Flex
				align="center"
				gap={16}
				className="mobility-report-physio-data pdf-section gray-colour-text"
				style={{ width: '100%' }}>
				<div
					style={{
						width: '15%',
						flexShrink: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'transparent',
						transform: 'scale(0.8)',
					}}>
					<div className="logo-mark-css">
						<LogoWithFallback download={true} />
					</div>
				</div>
				<Flex align="center" gap={16} style={{ width: '45%', flexShrink: 0 }}>
					<div style={{ width: '100%' }}>
						<p className="font-semibold pdf-margin">
							{t('Patient.data.virtualEvaluation.summary.patientID')}{' '}
							<span className="font-regular">
								{user.isPhysioterapist ? selectedUser.id : user.id}
							</span>
						</p>
						<p className={`inter-text-regular-sm font-semibold pdf-margin`}>
							{t('patient.reports.mobility.reportCreated')} :{' '}
							<span className="font-regular">{user?.profile?.fullName}</span>
						</p>
						<p className={`inter-text-regular-sm font-semibold pdf-margin`}>
							Date Report Generated :{' '}
							<span className="font-regular">
								{new Date().toLocaleDateString('en-US')}
							</span>
						</p>
						<p className="font-semibold">
							{t('Patient.data.virtualEvaluation.summary.dateOfAssessment')}{' '}
							<span className="font-regular">{formattedDate}</span>
						</p>
					</div>
				</Flex>
				<div
					className="user-info-container"
					style={{
						width: '40%',
						flexShrink: 0,
						marginRight: 0,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'transparent',
					}}>
					<Avatar
						style={{
							backgroundColor:
								user?.profile?.avatarColor || 'var(--brand-primary)',
							color: 'var(--text-on-brand)',
							fontSize: '80px',
							border: '4px solid white',
							flexShrink: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
						alt="avatar"
						size={120}>
						<span
							style={{
								lineHeight: 1,
								fontWeight: 'var(--font-weight-semibold)',
							}}>
							{user?.isPhysioterapist
								? selectedUser?.profile?.firstName?.charAt(0)?.toUpperCase()
								: user?.profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
						</span>
					</Avatar>

					<div className="user-info" style={{ flex: 1, minWidth: 0 }}>
						<div style={{ textAlign: 'left', width: '100%' }}>
							<div
								style={{
									fontSize: 'var(--font-size-base)',
									lineHeight: 'var(--spacing-5)',
									fontWeight: 'var(--font-weight-bold)',
									marginBottom: 'var(--spacing-2)',
									wordWrap: 'break-word',
								}}>
								{user?.isPhysioterapist
									? selectedUser?.profile?.fullName
									: user?.profile?.fullName}
							</div>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: 'var(--spacing-1)',
								}}>
								<p
									style={{
										fontSize: 'var(--font-size-sm)',
										lineHeight: 'var(--spacing-4)',
									}}>
									{t('patient.reports.mobility.birthDate')} :{' '}
									{user.profile.birthDate || 'Unknown'}
								</p>
								<p style={{ fontSize: 'var(--font-size-sm)' }}>
									<span style={{ textTransform: 'capitalize' }}>
										{user?.profile?.gender || 'N/A'},{' '}
									</span>
									<span>{formatBirthdate(user?.profile?.birthDate)}</span>
								</p>
								<p
									style={{
										fontSize: 'var(--font-size-sm)',
										lineHeight: 'var(--spacing-4)',
									}}>
									{t('patient.reports.mobility.weight')} :{' '}
									{user?.profile?.imperialWeight
										? `${user?.profile?.weight?.[0]?.imperialWeight ?? 'Unknown'} lbs`
										: user?.profile?.weight?.[0]?.metricWeight
											? `${user?.profile?.weight[0].metricWeight} kg`
											: 'Unknown'}{' '}
									| {t('patient.reports.mobility.height')}:{' '}
									{user?.profile?.imperialHeight}"
								</p>
							</div>
						</div>
					</div>
				</div>
			</Flex>
			<div
				id="summary"
				className="download-page-container pdf-section gray-colour-text">
				<div
					className="assessment-date gray-colour-text"
					style={{ marginTop: 'var(--spacing-8)' }}></div>
				{savedEvaluationData?.painAssessments &&
				savedEvaluationData.painAssessments.length > 0 ? (
					<>
						<div className="pain-assessments-container gray-colour-text">
							<span className="pain-summary-text">
								{t('patient.progress.evaluation.painSummary')}
							</span>
						</div>
						<Card className="associated-card">
							<ul>
								{savedEvaluationData?.painAssessments?.map(
									(item: PainAssessments, index: number) => {
										return (
											<li className="summary-option-list" key={index}>
												<SummuryOptionList item={item} />
											</li>
										);
									},
								)}
							</ul>
						</Card>
					</>
				) : null}
				<div className="associated-symptoms-container gray-colour-text">
					<span className="associated-symptoms">
						{t('patient.progress.evaluation.associatedSymptoms')}
					</span>
				</div>
				<Card className="associated-card">
					<div className="do-you-have-symptoms-container">
						<span className="do-you-have-symptoms">
							{t(
								'Patient.data.virtualEvaluation.associatedSymptoms.doYouHaveAnyOfTheseSymptoms',
							)}
						</span>
					</div>
					<ul className="text-start">
						{associatedSymptomsData?.strapiHealthSignsIds?.map(
							(id: string, index: number) => {
								const associatedSymptom = list?.find(
									(symptom: Options) => symptom?.id === id,
								);
								if (!associatedSymptom) return null;
								return (
									<li className="associated-symptoms-list" key={index}>
										<span className="font-regular">
											{associatedSymptom?.name}
										</span>
									</li>
								);
							},
						)}
					</ul>
				</Card>
				<div className="medical-history-container gray-colour-text">
					<span className="medical-history">
						{t('patient.progress.evaluation.medicalHistory')}
					</span>
				</div>
				<Card className="associated-card">
					<div className="have-you-been-diagnosed-container">
						<span className="have-you-been-diagnosed">
							{t(
								'Patient.data.virtualEvaluation.medicalHistory.haveYouBeenDiagnosedWithAnyOfTheFollowing',
							)}
						</span>
					</div>
					<ul className="text-start">
						{medicalHistoryData?.strapiMedicalHistoriesIds?.map(
							(id: string, index: number) => {
								const medicalHistoryName = medicalHistoryOptionsData?.find(
									(symptom: Options) => symptom.id == id,
								);
								if (!medicalHistoryName) return null;
								return (
									<li className="medical-history-list" key={index}>
										<span className="font-regular">
											{medicalHistoryName?.name}
										</span>
									</li>
								);
							},
						)}
					</ul>
				</Card>
			</div>
		</div>
	);
}
