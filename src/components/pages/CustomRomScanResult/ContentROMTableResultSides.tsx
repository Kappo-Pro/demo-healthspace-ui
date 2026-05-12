import { LoadingOutlined, PictureOutlined } from '@ant-design/icons';
import { UntitledIcon } from '@atoms/Icon';
import { useAuthenticatedImage } from '@hooks/useAuthenticatedImage';
import { ImageAnnotation } from '@pages/ImageAnnotation';
import { useCanvasState } from '@pages/ImageAnnotation/hooks/useCanvasState';
import { USER_ROLES } from '@stores/constants';
import { useTypedSelector } from '@stores/index';
import { CustomRomSession, OmniRomRomPatientResult } from '@types';
import { Card, Flex, Modal, Spin, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ContentROMTableResultSides.css';
import BodySilhouetteWithHotspots from './HotspotBodyJointfs';
import { evalScore } from './jointsTemplateData';

const { Text, Title } = Typography;

interface CombinedMobilityReportProps {
	getColorForCategory: (score: number) => string;
	getCategoryName: (score: number) => string;
	getCategoryDesc: (score: number) => string;
	selectedRom: CustomRomSession;
	isPdf?: boolean;
	isValidated: boolean;
	valueType?: 'P' | 'V' | 'PT';
	fetchData?: (value: string) => void;
}

interface JointData {
	title: string;
	score: number;
	value: number | null;
	side: 'left' | 'right';
	record?: OmniRomRomPatientResult;
	screenshot?: string;
}

const CombinedMobilityReport = ({
	getColorForCategory,
	getCategoryName,
	getCategoryDesc,
	selectedRom,
	isPdf = false,
	valueType = 'P',
	fetchData,
}: CombinedMobilityReportProps) => {
	const { t } = useTranslation();

	const [rightData, setRightData] = useState<JointData[]>([]);
	const [leftData, setLeftData] = useState<JointData[]>([]);

	// Modal states for image annotation
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [selectedRecord, setSelectedRecord] =
		useState<OmniRomRomPatientResult | null>(null);
	const [canvasLoading, setCanvasLoading] = useState(false);
	const [isSaveAction, setIsSaveAction] = useState(false);
	const { setCanvasState } = useCanvasState();
	const childRef = useRef<{ handleSave: () => void } | null>(null);
	const user = useTypedSelector(state => state.user);

	// Fetch image with auth headers
	const {
		blobUrl: authenticatedImageUrl,
		loading: imageLoading,
		error: imageError,
	} = useAuthenticatedImage(selectedImage);

	const isLeftRightObject = (
		input: unknown,
	): input is { left: number; right: number } => {
		return (
			input != null &&
			typeof input === 'object' &&
			('left' in input || 'right' in input)
		);
	};

	const extractValue = (
		input: number | { left?: number; right?: number },
		side?: 'left' | 'right',
	) => {
		if (input == null) return null;
		if (typeof input === 'number') return input;
		if (typeof input === 'object' && side) {
			return input[side] ?? null;
		}
		return null;
	};

	const extractSideFromTitle = (title: string): 'left' | 'right' | null => {
		const lowerTitle = title?.toLowerCase() || '';
		if (lowerTitle.includes('left')) return 'left';
		if (lowerTitle.includes('right')) return 'right';
		return null;
	};

	useEffect(() => {
		const left: JointData[] = [];
		const right: JointData[] = [];

		const hasPoseEstimationId =
			selectedRom?.poseEstimationId !== null &&
			selectedRom?.poseEstimationId !== undefined;

		selectedRom?.romPatientResults?.forEach(item => {
			item?.results?.forEach(result => {
				const name: string =
					item?.title ||
					result?.romProgramExercise?.exerciseLibrary?.title ||
					t('Patient.data.vitalscan-rom.noTitle');

				// Merge item and result (result overrides item) - same as old table component
				const merged = { ...item, ...result } as Record<string, unknown>;

				const hasLeftRight =
					isLeftRightObject(merged.value) ||
					isLeftRightObject(merged.validatedValue) ||
					isLeftRightObject(merged.validatedValuePt);

				const score = Number(evalScore(merged));

				// Get value based on valueType - now using merged object
				const getValue = (side: 'left' | 'right') => {
					switch (valueType) {
						case 'P':
							return extractValue(
								merged.value as number | { left?: number; right?: number },
								side,
							);
						case 'V':
							return extractValue(
								merged.validatedValue as
									| number
									| { left?: number; right?: number },
								side,
							);
						case 'PT':
							return extractValue(
								merged.validatedValuePt as
									| number
									| { left?: number; right?: number },
								side,
							);
						default:
							return extractValue(
								merged.value as number | { left?: number; right?: number },
								side,
							);
					}
				};

				// Get screenshot from item or merged result
				const screenshot = (item.screenshot || merged.screenshot) as
					| string
					| undefined;

				if (hasPoseEstimationId && hasLeftRight) {
					const cleanTitle = name.replace(/^(Left|Right)\s+/i, '');

					left.push({
						title: cleanTitle,
						score,
						value: getValue('left'),
						side: 'left',
						record: merged as unknown as OmniRomRomPatientResult,
						screenshot,
					});

					right.push({
						title: cleanTitle,
						score,
						value: getValue('right'),
						side: 'right',
						record: merged as unknown as OmniRomRomPatientResult,
						screenshot,
					});
				} else {
					const sideFromTitle = extractSideFromTitle(name);
					const cleanTitle = name.replace(/^(Left|Right)\s+/i, '');

					const jointData: JointData = {
						title: cleanTitle,
						score,
						value: getValue(sideFromTitle || 'right'),
						side: sideFromTitle || 'right',
						record: merged as unknown as OmniRomRomPatientResult,
						screenshot,
					};

					if (sideFromTitle === 'left') {
						left.push(jointData);
					} else {
						right.push(jointData);
					}
				}
			});
		});

		setLeftData(left);
		setRightData(right);
	}, [selectedRom, t, valueType]);

	// Get attention points (joints with score < 75)
	const attentionPoints = useMemo(() => {
		const points: JointData[] = [];

		rightData.forEach(item => {
			if (item.score < 75) {
				points.push({ ...item, title: `Right ${item.title}` });
			}
		});

		leftData.forEach(item => {
			if (item.score < 75) {
				points.push({ ...item, title: `Left ${item.title}` });
			}
		});

		return points.sort((a, b) => a.score - b.score);
	}, [rightData, leftData]);

	// Render score indicator dot
	const ScoreIndicator = ({ score }: { score: number }) => (
		<span
			className="score-indicator"
			style={{ backgroundColor: getColorForCategory(score) }}
		/>
	);

	// Handle image icon click - open annotation modal
	const handleImageClick = (item: JointData) => {
		if (item.screenshot && item.record) {
			setSelectedImage(item.screenshot);
			setSelectedRecord(item.record);
			setModalVisible(true);
		}
	};

	// Modal cancel handlers
	const handleFinalCancel = async () => {
		setModalVisible(false);

		if (!isSaveAction) {
			setCanvasState(prev => ({
				...prev,
				image: null,
				landmarks: [],
				annotations: [],
			}));
			setSelectedImage(null);
		}

		setIsSaveAction(false);
	};

	const handleCancel = async () => {
		if (
			user?.profile?.role === USER_ROLES.ADMIN ||
			user?.profile?.role === USER_ROLES.SUPER_ADMIN
		) {
			setIsSaveAction(true);
		} else {
			await handleFinalCancel();
		}
	};



	// Joint card item row - shows value based on P/V/PT selection
	const JointRow = ({ item }: { item: JointData }) => (
		<Flex justify="space-between" align="center" className="joint-row">
			<Flex align="center" gap={8}>
				{item.screenshot && (
					<UntitledIcon
						name="image"
						size={16}
						color="var(--text-tertiary)"
						style={{ cursor: 'pointer' }}
						onClick={() => handleImageClick(item)}
					/>
				)}
				<Text className="joint-name">{item.title}</Text>
			</Flex>
			<Flex align="center" gap={8}>
				<Text className="joint-score">
					{item.value !== null && item.value !== undefined
						? Math.round(item.value)
						: '-'}
				</Text>
				<ScoreIndicator score={item.score} />
			</Flex>
		</Flex>
	);

	return (
		<div className="body-score-metrics">
			{/* Left: Body Silhouette */}
			<div className="body-score-metrics__body">
				<BodySilhouetteWithHotspots
					isPdf={isPdf}
					selectedRom={selectedRom}
					getColorForCategory={getColorForCategory}
					getCategoryName={getCategoryName}
					getCategoryDesc={getCategoryDesc}
				/>
			</div>

			{/* Right: Cards */}
			<div className="body-score-metrics__cards">
				{/* Attention Points Card */}
				{attentionPoints.length > 0 && (
					<Card bordered={false} className="attention-points-card">
						<Flex
							justify="space-between"
							align="center"
							className="card-header">
							<Title level={5} className="card-title">
								{t('Patient.data.vitalscan-rom.attentionPoints', 'Attention points')}
							</Title>
							<Text type="secondary" className="card-subtitle">
								{t('Patient.data.vitalscan-rom.score', 'Score')}
							</Text>
						</Flex>
						<div className="card-body">
							{attentionPoints.map((item, index) => (
								<JointRow key={`attention-${index}`} item={item} />
							))}
						</div>
					</Card>
				)}

				{/* Joint Cards - Side by Side */}
				<Flex gap={16} className="joint-cards-row">
					{/* Right Side Card */}
					<Card bordered={false} className="joint-side-card">
						<Flex
							justify="space-between"
							align="center"
							className="card-header">
							<Title level={5} className="card-title">
								{t('Patient.data.vitalscan-rom.joint', 'Joint')}
							</Title>
							<Text type="secondary" className="card-subtitle">
								{t('Patient.data.vitalscan-rom.rightSide', 'Right Side')}
							</Text>
						</Flex>
						<div className="card-body">
							{rightData.length <= 0 ? (
								<Flex
									justify="space-between"
									align="center"
									className="joint-row">
									<Text className="joint-name">No Data</Text>
								</Flex>
							) : (
								rightData.map((item, index) => (
									<JointRow key={`right-${index}`} item={item} />
								))
							)}
						</div>
					</Card>

					{/* Left Side Card */}
					<Card bordered={false} className="joint-side-card">
						<Flex
							justify="space-between"
							align="center"
							className="card-header">
							<Title level={5} className="card-title">
								{t('Patient.data.vitalscan-rom.joint', 'Joint')}
							</Title>
							<Text type="secondary" className="card-subtitle">
								{t('Patient.data.vitalscan-rom.leftSide', 'Left Side')}
							</Text>
						</Flex>
						<div className="card-body">
							{leftData.length <= 0 ? (
								<Flex
									justify="space-between"
									align="center"
									className="joint-row">
									<Text className="joint-name">No Data</Text>
								</Flex>
							) : (
								leftData.map((item, index) => (
									<JointRow key={`left-${index}`} item={item} />
								))
							)}
						</div>
					</Card>
				</Flex>
			</div>

			{/* Image Annotation Modal */}
			<Modal
				open={modalVisible}
				onCancel={handleCancel}
				onClose={handleCancel}
				width={1600}
				destroyOnClose={true}
				centered
				zIndex={1000}
				getContainer={false}
				style={{
					top: 0,
					paddingBottom: 0,
					maxHeight: '100vh',
				}}
				styles={{
					body: {
						height: '85vh',
						overflow: 'hidden',
						padding: 0,
					},
				}}
				footer={null}
				maskClosable={false}
				keyboard={true}>
				{modalVisible && selectedRecord ? (
					imageLoading ? (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								// eslint-disable-next-line vitalflow/no-hardcoded-spacing
								minHeight: '500px',
								color: 'var(--text-secondary)',
							}}>
							<Spin
								indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
							/>
							<div style={{ marginTop: 16, fontSize: 14 }}>
								Loading screenshot...
							</div>
						</div>
					) : imageError ? (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								// eslint-disable-next-line vitalflow/no-hardcoded-spacing
								minHeight: '500px',
								color: 'var(--text-secondary)',
							}}>
							<PictureOutlined
								style={{
									fontSize: 64,
									color: 'var(--error-500)',
									marginBottom: 16,
								}}
							/>
							<div
								style={{
									fontSize: 18,
									color: 'var(--text-secondary)',
									marginBottom: 8,
								}}>
								Failed to load screenshot
							</div>
							<div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
								{imageError}
							</div>
						</div>
					) : authenticatedImageUrl ? (
						<ImageAnnotation
							ref={childRef}
							key={selectedRecord.romPatientResultId}
							canvasLoading={canvasLoading}
							fetchSessionData={fetchData}
							setCanvasLoading={setCanvasLoading}
							imageUrl={authenticatedImageUrl}
							record={selectedRecord}
							handleCancel={handleFinalCancel}
							showComparison={false}
							editingSide={null}
							isSaveConfirmationVisible={isSaveAction}
							onCloseSaveConfirmation={() => setIsSaveAction(false)}
						/>
					) : (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								// eslint-disable-next-line vitalflow/no-hardcoded-spacing
								minHeight: '500px',
								color: 'var(--text-secondary)',
							}}>
							<PictureOutlined
								style={{
									fontSize: 64,
									color: 'var(--border-color)',
									marginBottom: 16,
								}}
							/>
							<div
								style={{
									fontSize: 18,
									color: 'var(--text-secondary)',
									marginBottom: 8,
								}}>
								No screenshot available
							</div>
							<div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
								This exercise result doesn't have an associated screenshot
							</div>
						</div>
					)
				) : null}
			</Modal>
		</div>
	);
};

export default CombinedMobilityReport;
