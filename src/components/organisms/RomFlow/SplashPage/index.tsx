import { showCustomModal } from '@atoms/CustomModalInfo';
import { UntitledIcon } from '@atoms/Icon';
import { ResponsiveImage } from '@atoms/ResponsiveImage';
import { ModalContentSkeleton } from '@atoms/Skeletons';
import { useTheme } from '@providers/ThemeProvider';
import {
	createSession,
	setStrapiOmniRomExerciseGroupId,
} from '@stores/clinical/rom/main';
import {
	fetchOmniromProgram,
	fetchStrapiExercises,
} from '@stores/clinical/rom/romTemplates';
import { THEME } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setVideoRecordState } from '@stores/shared/onBoard/onBoard';
import { CustomRomExercise, TOmniromSelectedExercise } from '@types';
import {
	Button,
	Card,
	Col,
	Flex,
	Image,
	List,
	Modal,
	Row,
	Segmented,
	Skeleton,
	Tooltip,
	Typography,
} from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { HotspotIcon } from './HotspotIcon';
import {
	bodyPoints,
	mainTemplateGroup,
	sittingBodyPoints,
} from './ProgramGroup';
import './style.css';

const { Paragraph, Text, Title } = Typography;

// Type definitions for body points and hotspots
interface BodyPointStyles {
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
}

interface BodyPoint {
	id: number;
	name: string;
	position: string;
	styles: BodyPointStyles;
	part: string;
}

interface HotspotPoint {
	id: number;
	name: string;
}

interface DropdownOption {
	id: number;
	title: string;
	vitalflowId?: number;
}

interface ExerciseGroup {
	OmniRomExerciseId?: {
		video?: { url: string };
		name?: string;
		description?: string;
		image?: { url: string };
	};
}

// Extended type for API response from fetchOmniromProgram
interface OmniRomProgramResponse extends TOmniromSelectedExercise {
	exercises?: ExerciseGroup[];
	omniRomJoints?: HotspotPoint[];
}

interface ISplashPageProps {
	onTogglesSplashPage: () => void;
}

const AreaHighlight = (highlightedPoints: BodyPoint[]): ReactNode => {
	const resolvedPoints = highlightedPoints.map(({ styles }) => {
		const resolved = { top: 0, left: 0 };

		if (styles.top !== undefined) {
			resolved.top = parseFloat(styles.top);
		} else if (styles.bottom !== undefined) {
			resolved.top = 430 - parseFloat(styles.bottom);
		}

		if (styles.left !== undefined) {
			resolved.left = parseFloat(styles.left);
		} else if (styles.right !== undefined) {
			resolved.left = 300 - parseFloat(styles.right);
		}

		return resolved;
	});

	const topValues = resolvedPoints.map(p => p.top);
	const leftValues = resolvedPoints.map(p => p.left);

	const minTop = Math.min(...topValues);
	const maxTop = Math.max(...topValues);
	const minLeft = Math.min(...leftValues);
	const maxLeft = Math.max(...leftValues);

	const width = maxLeft - minLeft;
	const height = maxTop - minTop;
	const diameter = Math.max(width, height) + 80;
	const centerTop = minTop + height / 2;
	const centerLeft = minLeft + width / 2;

	return (
		<div
			className="area-highlight"
			style={{
				position: 'absolute',
				top: centerTop - diameter / 2,
				left: centerLeft - diameter / 2,
				width: diameter,
				height: diameter,
				borderRadius: '1000px',
				backgroundColor: 'var(--splash-area-highlight)',
				zIndex: 9999,
				opacity: 0.119,
				pointerEvents: 'none',
			}}
		/>
	);
};

const SplashPage = (props: ISplashPageProps) => {
	const { onTogglesSplashPage } = props;
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();
	const { theme } = useTheme();
	const backgroundImage =
		theme === THEME.DARK
			? '/images/rom/background-dark.jpg'
			: '/images/rom/background-light.jpg';
	const [selectedButton, setSelectedButton] = useState('favorites');
	const options = [
		{
			label: 'Baseline',
			value: 'favorites',
		},
		{
			label: 'By Region',
			value: 'region',
		},
		{
			label: 'By Specialty',
			value: 'speciality',
		},
	];
	const { user, selectedUser } = useTypedSelector(state => ({
		user: state.user,
		selectedUser: state.contacts.main.selectedUser,
	}));
	const [selectedDropdown, setSelectedDropdown] = useState<string | number>('');
	const [selectedBodyPointOptions, setSelectedBodyPointOptions] = useState<
		ExerciseGroup[]
	>([]);
	const [highlightPoints, setHighlightPoints] = useState<HotspotPoint[]>([]);
	const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);
	const [areaHighlight, setAreaHighlight] = useState<ReactNode>(null);
	const [highlightedButton, setHighlightedButton] = useState('');
	const [exerciseLoading, setExerciseLoading] = useState(false);
	const [startScanLoading, setStartScanLoading] = useState(false);
	const [dropdownLoading, setDropdownLoading] = useState(false);
	const [savedExercise, setSavedExercise] =
		useState<TOmniromSelectedExercise>();

	useEffect(() => {
		fetchData(selectedButton);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const highlightedAreaPoints = (bodyPoints as BodyPoint[]).filter(hotspot =>
			highlightPoints?.find(
				point => point?.name?.toLowerCase() === hotspot?.name?.toLowerCase(),
			),
		);
		const highlightedArea = AreaHighlight(highlightedAreaPoints);

		setAreaHighlight(
			highlightedAreaPoints?.length > 1 ? highlightedArea : null,
		);
	}, [highlightPoints]);

	const fetchData = async (value: string) => {
		try {
			setDropdownLoading(true);
			const data = await dispatch(fetchStrapiExercises({ value }));
			setDropdownOptions(data?.payload?.data || []);
		} catch (error) {
			// Error handling: silently fail to maintain UX flow
		} finally {
			setDropdownLoading(false);
		}
	};

	const createSessionAndSetId = async (programId: number | string) => {
		dispatch(setStrapiOmniRomExerciseGroupId(programId));
		const session = {
			strapiOmniRomProgramId: programId,
			userId: user.isPhysioterapist ? selectedUser?.id : user.id,
		};
		return dispatch(createSession(session));
	};

	const handleDropdownChange = async (programId: number | string) => {
		try {
			setExerciseLoading(true);
			const response = await dispatch(
				fetchOmniromProgram({ omniRomProgramId: Number(programId) }),
			);

			// Handle rejected or empty responses
			const payload = response?.payload as OmniRomProgramResponse[] | undefined;
			if (response?.meta?.requestStatus === 'rejected' || !payload?.length) {
				setSelectedBodyPointOptions([]);
				setExerciseLoading(false);
				return;
			}

			setSelectedBodyPointOptions(payload[0]?.exercises || []);
			if (payload[0]?.omniRomJoints) {
				setHighlightPoints(payload[0]?.omniRomJoints);
			}
			if (payload[0]) {
				setSavedExercise(payload[0]);
			}
			setExerciseLoading(false);
		} catch (error) {
			console.error('handleDropdownChange error:', error);
			setSelectedBodyPointOptions([]);
			setExerciseLoading(false);
		}
	};

	const onToggleSplash = async (programId: number | string) => {
		try {
			setStartScanLoading(true);
			dispatch(setVideoRecordState(true));
			await createSessionAndSetId(programId);
			onTogglesSplashPage();
		} catch (error) {
			Modal.error({
				title: t('Patient.data.vitalscan-rom.scanStartError', 'Scan Could Not Start'),
				content: t(
					'Patient.data.vitalscan-rom.scanStartErrorMessage',
					'Please try again. If the problem persists, contact support.',
				),
				okText: t('common.ok', 'OK'),
			});
		} finally {
			setStartScanLoading(false);
		}
	};

	const handleSelectExercise = (
		exercise: DropdownOption & CustomRomExercise,
	) => {
		setHighlightedButton('');
		setSelectedDropdown(exercise.vitalflowId ?? exercise.id);
		setExerciseLoading(true); // Immediate visual feedback
		handleDropdownChange(exercise.vitalflowId);
		setSavedExercise(exercise as unknown as TOmniromSelectedExercise);
		if (exercise.vitalflowId === 55) {
			setHighlightedButton('sittingBaseline');
		}
	};

	return (
		<Flex
			vertical
			align="center"
			justify="start"
			style={{
				height: '100%',
				width: '100%',
				overflow: 'hidden',
				backgroundImage: `url(${backgroundImage})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
				position: 'relative',
			}}>
			{/* Logo header is now rendered by parent RomData component */}
			<Row
				gutter={[16, 16]}
				className="orom-splash-wrapper"
				align="top"
				justify="center">
				{/* Exercise List Panel */}
				<Col xs={24} md={8} lg={7} className="splash-row-css">
					<Card
						className="splash-row-css"
						styles={{
							body: {
								padding: 'var(--spacing-3)',
								height: '100%',
								display: 'flex',
								flexDirection: 'column',
							},
						}}>
						<Flex vertical gap={8} className="exercise-list-header">
							<Title
								level={4}
								style={{
									color: 'var(--text-primary)',
									margin: 0,
								}}>
								{t('Patient.data.vitalscan-rom.chooseScan')}
							</Title>
							<Segmented
								options={options}
								value={selectedButton}
								onChange={value => {
									setSelectedButton(value as string);
									fetchData(value as string);
								}}
								block
							/>
						</Flex>
						<div className="exercise-list-container">
							{dropdownLoading ? (
								<Flex vertical gap={8}>
									<Skeleton.Input active block style={{ height: 40 }} />
									<Skeleton.Input active block style={{ height: 40 }} />
									<Skeleton.Input active block style={{ height: 40 }} />
									<Skeleton.Input active block style={{ height: 40 }} />
									<Skeleton.Input active block style={{ height: 40 }} />
								</Flex>
							) : selectedButton === 'favorites' ? (
								<List
									className="exercises-list"
									dataSource={mainTemplateGroup}
									renderItem={group => {
										const isSelected = highlightedButton === group.key;
										const isLoading = exerciseLoading && isSelected;
										return (
											<List.Item
												key={group.id}
												className={`exercise-item ${isSelected ? 'selected' : ''} ${isLoading ? 'loading' : ''}`}
												onClick={() => {
													if (group.navigateTo) {
														navigate(group.navigateTo);
													} else {
														setHighlightedButton(group.key);
														setSelectedDropdown(group.vitalflowId);
														setHighlightPoints(group.hotspotPoints);
														setSavedExercise(
															group as unknown as TOmniromSelectedExercise,
														);
														handleDropdownChange(group.vitalflowId);
													}
												}}
												onMouseEnter={() => {
													setHighlightPoints(group.hotspotPoints);
												}}
												style={{
													opacity: isLoading ? 0.7 : 1,
													cursor: exerciseLoading ? 'wait' : 'pointer',
												}}>
												{group?.name}
											</List.Item>
										);
									}}
								/>
							) : (
								<List
									className="exercises-list"
									dataSource={dropdownOptions}
									renderItem={exercise => {
										const isSelected = selectedDropdown === exercise.id;
										const isLoading = exerciseLoading && isSelected;
										return (
											<List.Item
												key={exercise?.id}
												className={`exercise-item ${isSelected ? 'selected' : ''} ${isLoading ? 'loading' : ''}`}
												onClick={() =>
													handleSelectExercise(
														exercise as DropdownOption & CustomRomExercise,
													)
												}
												style={{
													opacity: isLoading ? 0.7 : 1,
													cursor: exerciseLoading ? 'wait' : 'pointer',
												}}>
												{exercise.title}
											</List.Item>
										);
									}}
								/>
							)}
						</div>
					</Card>
				</Col>

				{/* Body Points Visualization */}
				<Col xs={24} md={8} lg={10} className="splash-row-css">
					<Flex
						justify="center"
						align="center"
						className="body-points select-none">
						<div
							className="body-shape-front"
							style={
								highlightedButton === 'sittingBaseline'
									? { width: 450, height: 630 }
									: { width: 250, height: 500 }
							}>
							{areaHighlight}
							{highlightedButton === 'sittingBaseline' ? (
								<ResponsiveImage
									src="/images/rom/sitting.webp"
									style={{ width: 380 }}
									loading="eager"
									alt={t('Patient.data.vitalscan-rom.splashPage.sittingPositionAlt')}
								/>
							) : (
								<ResponsiveImage
									src="/images/rom/front.webp"
									style={{ width: 200 }}
									loading="eager"
									alt={t('Patient.data.vitalscan-rom.splashPage.bodyFrameAlt')}
								/>
							)}
							{(highlightedButton === 'sittingBaseline'
								? sittingBodyPoints
								: bodyPoints
							).map((hotspot, index) => (
								<HotspotIcon
									key={index}
									style={{
										position: 'absolute',
										...hotspot.styles,
									}}
									active={
										!!highlightPoints?.find(
											point =>
												point?.name?.toLowerCase() ===
												hotspot?.name?.toLowerCase(),
										)
									}
									className="hotspot-icon"
								/>
							))}
						</div>
					</Flex>
				</Col>

				{/* Exercise Preview Panel */}
				<Col xs={24} md={8} lg={7} className="splash-row-css">
					<Card
						className="exercise-preview-panel splash-row-css"
						style={{
							height: '100%',
							opacity: selectedBodyPointOptions?.length > 0 ? 1 : 0,
							transition: 'opacity 0.3s ease',
						}}
						styles={{
							body: {
								padding: 'var(--spacing-3)',
								height: '100%',
								display: 'flex',
								flexDirection: 'column',
							},
						}}>
						{exerciseLoading ? (
							<ModalContentSkeleton />
						) : (
							selectedBodyPointOptions?.length > 0 && (
								<>
									{savedExercise?.title && (
										<Title
											level={5}
											style={{
												color: 'var(--text-primary)',
												margin: '0 0 var(--spacing-2) 0',
											}}>
											{savedExercise.title}
										</Title>
									)}
									<Flex
										vertical
										gap={10}
										style={{
											flex: 1,
											overflowY: 'auto',
											color: 'var(--text-primary)',
											fontSize: 'calc(var(--font-size-sm) * 0.9)',
											paddingRight: 4,
										}}>
										{selectedBodyPointOptions?.map((group, index) => (
											<Flex key={index} gap={12} align="center">
												<div
													className="exercise-thumbnail"
													onClick={e => {
														e.stopPropagation();
														showCustomModal({
															video: group?.OmniRomExerciseId?.video?.url,
															name: group?.OmniRomExerciseId?.name,
															description:
																group?.OmniRomExerciseId?.description ?? '',
														});
													}}>
													{group?.OmniRomExerciseId?.image?.url ? (
														<Image
															src={group.OmniRomExerciseId.image.url}
															className="exercise-thumbnail-image"
															alt={group?.OmniRomExerciseId?.name ?? 'Exercise'}
															width={64}
															height={64}
															loading="lazy"
															placeholder={
																<Skeleton.Image
																	active
																	style={{
																		width: 64,
																		height: 64,
																		borderRadius: 'var(--radius-lg)',
																	}}
																/>
															}
															preview={false}
														/>
													) : (
														<div className="exercise-thumbnail-placeholder">
															<UntitledIcon
																name="playCircle"
																color="var(--color-white)"
															/>
														</div>
													)}
													<div className="exercise-thumbnail-overlay">
														<UntitledIcon
															name="playCircle"
															color="var(--color-white)"
														/>
													</div>
												</div>
												<Tooltip
													title={
														group?.OmniRomExerciseId?.description ||
														t('Patient.data.vitalscan-rom.noDescription')
													}>
													<Flex
														vertical
														flex={1}
														gap={2}
														className="exercise-preview-content">
														<Text strong className="exercise-preview-title">
															{group?.OmniRomExerciseId?.name}
														</Text>
														<Text
															type="secondary"
															className="exercise-preview-description">
															{group?.OmniRomExerciseId?.description ||
																t('Patient.data.vitalscan-rom.noDescription')}
														</Text>
													</Flex>
												</Tooltip>
											</Flex>
										))}
									</Flex>
									<div style={{ marginTop: 'var(--spacing-3)' }}>
										<Button
											type="primary"
											loading={startScanLoading}
											disabled={startScanLoading}
											block
											icon={
												!startScanLoading && <UntitledIcon name="playCircle" />
											}
											onClick={() => onToggleSplash(selectedDropdown)}>
											{t('Admin.data.managePatient.omniRom.startScan')}
										</Button>
										<Flex gap={4} justify="center" style={{ marginTop: 8 }}>
											<Text strong>
												{t('Admin.data.managePatient.omniRom.estimatedTime')}:
											</Text>
											<Text>
												{savedExercise?.estimatedMinutes}{' '}
												{t('Admin.data.managePatient.omniRom.min')}{' '}
												{savedExercise?.estimatedSeconds}{' '}
												{t('Admin.data.managePatient.omniRom.sec')}
											</Text>
										</Flex>
									</div>
								</>
							)
						)}
					</Card>
				</Col>
			</Row>
		</Flex>
	);
};

export default SplashPage;
