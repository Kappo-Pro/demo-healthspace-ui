import { LoadingOutlined, PictureOutlined } from '@ant-design/icons';
import { UntitledIcon } from '@atoms/Icon';
import { useAuthenticatedImage } from '@hooks/useAuthenticatedImage';
import { ImageAnnotation } from '@pages/ImageAnnotation';
import { useCanvasState } from '@pages/ImageAnnotation/hooks/useCanvasState';
import { USER_ROLES } from '@stores/constants';
import { useTypedSelector } from '@stores/index';
import { CustomRomSession, OmniRomRomPatientResult } from '@types';
import { Button, Collapse, Flex, Modal, Spin, Tag, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CategorySlider from './CategorySlider';
import { evalScore } from './jointsTemplateData';
import './style.css';

const { Text, Title } = Typography;

interface ContentRomResultProps {
	getColorForCategory: (score: number) => string;
	getCategoryName: (score: number) => string;
	selectedRom: CustomRomSession;
	isPdf?: boolean;
	isValidated: boolean;
	fetchData: (value: string) => void;
}

const ContentRomResult = ({
	getColorForCategory,
	getCategoryName,
	selectedRom,
	isPdf = false,
	fetchData,
	isValidated: _isValidated,
}: ContentRomResultProps) => {
	const { t } = useTranslation();
	const dataSource = selectedRom?.romPatientResults;

	const [modalVisible, setModalVisible] = useState(false);
	const { setCanvasState } = useCanvasState();
	const [canvasLoading, setCanvasLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [selectedRecord, _setSelectedRecord] =
		useState<OmniRomRomPatientResult | null>(null);
	const [showComparison, _setShowComparison] = useState(false);
	const [editingSide, _setEditingSide] = useState<'left' | 'right' | null>(
		null,
	);
	const user = useTypedSelector(state => state.user);

	// Fetch image with auth headers - converts URL to blob URL for <img> tags
	const {
		blobUrl: authenticatedImageUrl,
		loading: imageLoading,
		error: imageError,
	} = useAuthenticatedImage(selectedImage);
	const childRef = useRef<{ handleSave: () => void } | null>(null);
	const categories = [
		{
			name: t('Patient.data.vitalscan-rom.optimalMobility'),
			range: '90 - 100',
			color: 'var(--color-success-600)',
			scoreRange: [90, 100],
			description: t('Patient.data.vitalscan-rom.optimalMobilityDesc'),
		},
		{
			name: t('Patient.data.vitalscan-rom.functionalMobility'),
			range: '75 - 89',
			color: 'var(--color-success-400)',
			scoreRange: [75, 89],
			description: t('Patient.data.vitalscan-rom.functionalMobilityDesc'),
		},
		{
			name: t('Patient.data.vitalscan-rom.moderateRestriction'),
			range: '60 - 74',
			color: 'var(--color-warning-600)',
			scoreRange: [60, 74],
			description: t('Patient.data.vitalscan-rom.moderateRestrictionDesc'),
		},
		{
			name: t('Patient.data.vitalscan-rom.restrictedMobility'),
			range: '40 - 59',
			color: 'var(--color-warning-500)',
			scoreRange: [40, 59],
			description: t('Patient.data.vitalscan-rom.limitedMobilityDesc'),
		},
		{
			name: t('Patient.data.vitalscan-rom.severelyRestricted'),
			range: '20 - 39',
			color: 'var(--color-error-500)',
			scoreRange: [20, 39],
			description: t('Patient.data.vitalscan-rom.restrictedMobilityDesc'),
		},
		{
			name: t('Patient.data.vitalscan-rom.criticallyImpaired'),
			range: 'Below 20',
			color: 'var(--color-error-600)',
			scoreRange: [0, 19],
			description: t('Patient.data.vitalscan-rom.criticallyImpairedDesc'),
		},
	];

	const isLeftRightObject = (
		input: unknown,
	): input is { left: number; right: number } => {
		return (
			input != null &&
			typeof input === 'object' &&
			('left' in input || 'right' in input)
		);
	};

	const extractSideFromTitle = (title: string): 'left' | 'right' | null => {
		const lowerTitle = title?.toLowerCase() || '';
		if (lowerTitle.includes('left')) return 'left';
		if (lowerTitle.includes('right')) return 'right';
		return null;
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
		if (typeof input === 'object') return input?.right ?? null;
		return null;
	};

	const flattenDataSource = dataSource
		?.map(item =>
			item?.results?.map(result => {
				const merged = { ...item, ...result };
				// Preserve parent's screenshot - result.screenshot may be empty/undefined and overwrite item.screenshot
				merged.screenshot = item.screenshot || merged.screenshot;

				// Determine if splitting is required based on poseEstimationId
				const hasPoseEstimationId =
					selectedRom?.poseEstimationId !== null &&
					selectedRom?.poseEstimationId !== undefined;

				// Check if this record has left/right split values
				const hasLeftRight =
					isLeftRightObject(merged.value) ||
					isLeftRightObject(merged.validatedValue) ||
					isLeftRightObject(merged.validatedValuePt);

				// Only split if poseEstimationId exists AND values are objects
				if (hasPoseEstimationId && hasLeftRight) {
					// Create two separate records for left and right
					const baseTitle =
						merged.romProgramExercise?.title || merged.title || '';

					// Remove any existing "Left" or "Right" prefix to avoid duplication
					const cleanTitle = baseTitle.replace(/^(Left|Right)\s+/i, '');

					const leftRecord = {
						...merged,
						side: 'left' as const,
						title: `Left ${cleanTitle}`,
						value: extractValue(merged.value, 'left'),
						validatedValue: extractValue(merged.validatedValue, 'left'),
						validatedValuePt: extractValue(merged.validatedValuePt, 'left'),
						validatedScorePt: extractValue(merged.validatedScorePt, 'left'),
						// Keep original values for saving later
						originalValue: merged.value,
						originalValidatedValue: merged.validatedValue,
						originalValidatedValuePt: merged.validatedValuePt,
					};

					const rightRecord = {
						...merged,
						side: 'right' as const,
						title: `Right ${cleanTitle}`,
						value: extractValue(merged.value, 'right'),
						validatedValue: extractValue(merged.validatedValue, 'right'),
						validatedValuePt: extractValue(merged.validatedValuePt, 'right'),
						validatedScorePt: extractValue(merged.validatedScorePt, 'right'),
						// Keep original values for saving later
						originalValue: merged.value,
						originalValidatedValue: merged.validatedValue,
						originalValidatedValuePt: merged.validatedValuePt,
					};

					return [leftRecord, rightRecord];
				}

				// Single record - extract side from title for object values
				const title =
					merged.romProgramExercise?.exerciseLibrary?.title ||
					merged.romProgramExercise?.strapiOmniRomExercise?.name ||
					merged.title ||
					'';
				const sideFromTitle = extractSideFromTitle(title);

				return {
					...merged,
					value: extractValue(merged.value, sideFromTitle),
					validatedValue: extractValue(merged.validatedValue, sideFromTitle),
					validatedValuePt: extractValue(
						merged.validatedValuePt,
						sideFromTitle,
					),
					validatedScorePt: extractValue(
						merged.validatedScorePt,
						sideFromTitle,
					),
				};
			}),
		)
		?.flat(2); // flat(2) to handle the nested arrays from left/right split

	const categorizedData = flattenDataSource?.map(record => {
		const rawScore = Number(evalScore(record)) || 0;
		const score = rawScore >= 100 ? 100 : rawScore;
		const name = getCategoryName(score);
		return {
			...record,
			category: name ? name : 'Uncategorized',
			score,
		};
	});

	const groupedData = categories?.map(category => {
		const filteredData = categorizedData?.filter(
			record => record?.category === category?.name,
		);
		return {
			categoryName: category?.name,
			categoryColor: category?.color,
			data: filteredData,
			range: category?.range,
			categoryDescription: category?.description,
		};
	});

	const defaultActiveKeys = groupedData
		?.map((category, index) =>
			category?.data && category?.data.length > 0 ? index.toString() : null,
		)
		?.filter(index => index !== null);

	const [activeKeys, setActiveKeys] = useState<string[]>(
		(defaultActiveKeys as string[]) || [],
	);

	useEffect(() => {
		setActiveKeys((defaultActiveKeys as string[]) || []);
	}, [isPdf, groupedData?.length, fetchData]);

	const [isSaveAction, setIsSaveAction] = useState(false);

	const handleFinalCancel = async () => {
		setModalVisible(false);

		if (!isSaveAction) {
			setCanvasState(prev => ({
				...prev,
				image: null,
				landmarks: [],
				annotations: [],
			}));
			setSelectedImage('');
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

	const handleSaveClick = async () => {
		if (childRef.current) {
			await childRef.current.handleSave();
		}
		handleFinalCancel();
	};

	return (
		<div>
			<Collapse
				accordion={true}
				bordered={false}
				expandIcon={({ isActive }) =>
					isActive ? (
						<UntitledIcon name="minus" size={16} />
					) : (
						<UntitledIcon name="plus" size={16} />
					)
				}
				activeKey={activeKeys}
				onChange={keys => {
					if (!keys) {
						setActiveKeys([]);
						return;
					}
					setActiveKeys(Array.isArray(keys) ? keys : [keys]);
				}}
				className="collapse-categories-results bg-transparent">
				{groupedData?.map((category, index) => {
					const isEmpty = !category?.data || category.data.length === 0;

					// Calculate average score for exercises in this category
					const categoryAvgScore = !isEmpty
						? Math.round(
								category.data.reduce(
									(sum, item) => sum + (Number(item?.score) || 0),
									0,
								) / category.data.length,
							)
						: 0;

					return (
						<Collapse.Panel
							key={index?.toString()}
							data-color={category?.categoryName}
							collapsible={isEmpty ? 'disabled' : undefined}
							className={`collapse-panel-new ${isEmpty ? 'collapse-panel-empty' : ''}`}
							header={
								<Flex
									justify="space-between"
									align="center"
									className="collapse-header-new">
									<div className="collapse-header-new__left">
										<Title style={{ margin: 0 }} level={5}>
											{category?.categoryName}
										</Title>
										<Text type="secondary">
											{category?.categoryDescription}
										</Text>
									</div>
									<div className="collapse-header-new__right">
										<CategorySlider
											score={categoryAvgScore}
											categoryIndex={index}
											showScoreBadge={true}
											scoreBadgeLabel={t('Patient.data.vitalscan-rom.score', 'Score')}
										/>
									</div>
								</Flex>
							}>
							<div className="collapse-content-cards">
								{category?.data?.map((item, itemIndex) => (
									<div key={itemIndex} className="collapse-content-card">
										<Text className="collapse-content-card__name">
											{item?.title}
										</Text>
										<Tag
											className="collapse-content-card__score"
											color={getColorForCategory(item?.score || 0)}>
											{Math.round(item?.score || 0)}
										</Tag>
									</div>
								))}
							</div>
						</Collapse.Panel>
					);
				})}
			</Collapse>

			<Modal
				open={isSaveAction}
				centered
				closable={false}
				zIndex={3000}
				footer={[
					<Button key="cancel" onClick={handleFinalCancel}>
						Cancel
					</Button>,
					<Button key="save" type="primary" onClick={handleSaveClick}>
						Yes, Save
					</Button>,
				]}>
				Are you sure you want to save your changes?
			</Modal>

			<Modal
				open={modalVisible}
				onCancel={handleCancel}
				onClose={handleCancel}
				width={showComparison ? '95vw' : 1600}
				destroyOnClose={true}
				centered
				zIndex={1000}
				getContainer={false}
				style={{
					top: 0,
					paddingBottom: 0,
					maxHeight: '100vh',
				}}
				bodyStyle={{
					height: '85vh',
					overflow: 'hidden',
					padding: 0,
				}}
				footer={null}
				maskClosable={false}
				keyboard={true}>
				{modalVisible && selectedRecord ? (
					imageLoading ? (
						// Loading state while fetching image with auth
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
						// Error state if image fetch failed
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
							key={`${selectedRecord.romPatientResultId}-${showComparison}`}
							canvasLoading={canvasLoading}
							fetchSessionData={fetchData}
							setCanvasLoading={setCanvasLoading}
							image={authenticatedImageUrl}
							imageUrl={authenticatedImageUrl}
							record={selectedRecord}
							handleCancel={handleCancel}
							showComparison={showComparison}
							editingSide={editingSide}
						/>
					) : (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								// eslint-disable-next-line vitalflow/no-hardcoded-spacing
								minHeight: '500px', // Large modal content height - no design token for large layout values
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

export default ContentRomResult;
