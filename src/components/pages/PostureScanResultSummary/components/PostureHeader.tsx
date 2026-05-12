import LogoWithFallback from '@atoms/AdminMenu/LogoMark';
import { ArrowLeft } from '@vitalflow-icons/arrows/arrowLeft';
import { useTypedSelector } from '@stores/index';
import { Avatar, Card, Col, Flex, QRCode, Row, Typography } from 'antd';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

interface PostureHeaderProps {
	handleEmptySelectedScan: () => void;
	scanDate: Date | undefined | string | null;
}

export default function PostureHeader({
	handleEmptySelectedScan,
	scanDate,
}: PostureHeaderProps) {
	const formattedDate = scanDate
		? format(parseISO(scanDate as string), 'MM/dd/yy')
		: '';

	const handleArrowClick = async () => {
		handleEmptySelectedScan();
	};

	const { Title, Text } = Typography;

	const { user } = useTypedSelector(state => ({
		user: state.user,
	}));
	const { t } = useTranslation();
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);
	const physiotherapistData = user?.isPhysioterapist
		? selectedUser?.physiotherapistPatientAssociationPatientIdRelation
		: user?.physiotherapistPatientAssociationPatientIdRelation;

	return (
		<Row gutter={[16, 16]}>
			<Col xs={8} sm={8} md={4} lg={4} xl={4} xxl={4}>
				<Card
					bordered
					style={{
						height: '100%',
						borderRadius: 12,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					<span
						onClick={handleArrowClick}
						style={{
							cursor: 'pointer',
							position: 'absolute',
							left: 16,
							top: 16,
							zIndex: 2,
						}}>
						<ArrowLeft color="stroke-[--text-color-root]" />
					</span>
					<LogoWithFallback download={true} />
				</Card>
			</Col>

			<Col xs={16} sm={16} md={10} lg={10} xl={10} xxl={10}>
				<Card
					bordered
					style={{
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					<Flex align="center" justify="center" gap={24}>
						<div>
							<QRCode size={100} value={`${window.location.href}`} />
						</div>
						<div style={{ textAlign: 'center' }}>
							<Title level={4} style={{ margin: 0 }}>
								{t('Patient.data.postures.postureAnalysis')}
							</Title>
							<Text>
								{t('Patient.data.postures.ReportCreatedBy')}{' '}
								{physiotherapistData[0]?.physiotherapist?.profile.fullName
									? physiotherapistData[0].physiotherapist.profile.fullName.toUpperCase()
									: 'N/A'}
							</Text>
							<br />
							<Text type="secondary">
								{t('Patient.data.postures.Report')} #1 – {formattedDate}
							</Text>
						</div>
					</Flex>
				</Card>
			</Col>

			<Col xs={24} sm={24} md={10} lg={10} xl={10} xxl={10}>
				<Card
					bordered
					style={{
						height: '100%',
						padding: 16,
						textAlign: 'right',
						borderRadius: 12,
					}}>
					<Flex justify="space-between" align="center">
						<Avatar
							style={{
								backgroundColor:
									user?.profile?.avatarColor || 'var(--brand-primary)',
								color: 'var(--text-on-brand)',
								fontSize: '52px',
								border: '4px solid white',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
							alt="avatar"
							size={100}>
							{user?.isPhysioterapist
								? selectedUser?.profile?.firstName?.charAt(0)?.toUpperCase()
								: user?.profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
						</Avatar>
						{selectedUser !== null ? (
							<div>
								<Title level={3} className="inter-bold-text">
									{selectedUser?.profile?.fullName || 'N/A'}
								</Title>

								<Text type="secondary">
									{t('Patient.data.postures.DOB')}:{' '}
									{selectedUser?.profile?.birthDate || 'N/A'} <br />
									{t('Patient.data.postures.Height')}:{' '}
									{selectedUser?.profile?.metricHeight
										? `${selectedUser.profile.metricHeight} cm`
										: 'N/A'}
									<br />
									{t('Patient.data.postures.Weight')}:{' '}
									{selectedUser?.profile?.weight?.[0]?.metricWeight
										? `${selectedUser.profile.weight[0].metricWeight} kg`
										: 'N/A'}
								</Text>
							</div>
						) : (
							<div>
								<Title level={3} className="inter-bold-text">
									{user?.profile?.fullName || 'N/A'}
								</Title>

								<Text type="secondary">
									{t('Patient.data.postures.DOB')}:{' '}
									{user?.profile?.birthDate || 'N/A'} <br />
									{t('Patient.data.postures.Height')}:{' '}
									{user?.profile?.metricHeight
										? `${user.profile.metricHeight} cm`
										: 'N/A'}
									<br />
									{t('Patient.data.postures.Weight')}:{' '}
									{user?.profile?.weight?.[0]?.metricWeight
										? `${user.profile.weight[0].metricWeight} kg`
										: 'N/A'}
								</Text>
							</div>
						)}
					</Flex>
				</Card>
			</Col>
		</Row>
	);
}
