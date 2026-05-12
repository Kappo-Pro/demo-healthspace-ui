/**
 * PostureResultContent - Displays posture scan result in triage modal
 *
 * Shows complete posture analysis with bento-grid card layout
 * following the same structure as ROM results
 */

import { useBlockNavigation } from '@atoms/BlockNavigation';
import { UntitledIcon } from '@atoms/Icon';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import ScanData from '@pages/PostureScanResultSummary/components/ScanData';
import {
	getPersonas,
	getPostureBenefits,
} from '@pages/PostureScanResultSummary/constants';
import { router } from '@routers/routers';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	getPostureBySessionInActivityStream,
	getPostureReport,
	getStrapiPostureReport,
	setSelectedScan,
	setTempSelectedScan,
} from '@stores/posture/postures/postures';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import {
	createProgram,
	getProgramList,
	selectExercise,
	selectProgram,
} from '@stores/shared/patientDetail/program';
import type {
	GroupedScanResult,
	PostureAlignment,
	PostureAnalysisItem,
	PostureData,
	PostureIssues,
	ProgramTemplate,
} from '@types';
import { Posture, Session, UserWithSession } from '@types';
import { Avatar, Button, Card, Empty, Flex, Typography, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Text, Title, Paragraph } = Typography;

interface PostureResultContentProps {
	user: UserWithSession;
	session: Session;
}

const initialIssues: PostureIssues = {
	front: [],
	back: [],
	left: [],
	right: [],
};

export const PostureResultContent: React.FC<PostureResultContentProps> = ({
	session,
	user,
}) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [loading, setLoading] = useState(true);
	const [postureScanData, setPostureScanData] = useState<
		GroupedScanResult<PostureData>
	>({
		sortedData: [],
		groupedByView: { front: [], back: [], left: [], right: [] },
		front: null,
		back: null,
		left: null,
		right: null,
	});
	const [issues, setIssues] = useState<PostureIssues>(initialIssues);
	const [personaScore, setPersonaScore] = useState<number>(0);
	const [recommendations, setRecommendations] = useState<ProgramTemplate[]>([]);
	const [visibleCount, setVisibleCount] = useState(4);
	const [enrollingProgramId, setEnrollingProgramId] = useState<string | null>(
		null,
	);
	const [userPrograms, setUserPrograms] = useState<
		Array<{ id: string; strapiProgramTemplateId: string }>
	>([]);

	const [savedExercise, setSavedExercise] = useState([]);
	const navigate = useNavigate();
	const currentUser = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const { clearNavigation } = useBlockNavigation();

	// Cast session to Posture type
	const postureSession = session as unknown as Posture;

	// Get selectedScan from Redux (will have report added by setSelectedScan)
	const selectedScan = useTypedSelector(
		state => state.postures.postures.selectedScan,
	);
	const postureReportData = useTypedSelector(
		state => state.postures.postures.postureReport,
	);
	const strapiPostureReport = useTypedSelector(
		state => state.postures.postures.strapiPostureReport,
	);

	// Get personas and benefits
	const personas = useMemo(() => getPersonas(t), [t]);
	const benefits = useMemo(() => getPostureBenefits(t), [t]);

	// Find active persona with fallback
	const activePersona = useMemo(() => {
		// First, try to find persona by score range
		let persona = personas.find(
			p => personaScore >= p.range[0] && personaScore <= p.range[1],
		);

		// Fallback: if score is too high (>14), use worst persona
		if (!persona && personaScore > 14) {
			persona = personas[personas.length - 1]; // Collapsed Coper
		}

		return persona;
	}, [personaScore, personas]);

	// Process posture data
	const processPostureData = useCallback(
		(rawData: PostureAnalysisItem[]): GroupedScanResult<PostureData> => {
			const sortedData = [...rawData].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
			const groupedByView = sortedData.reduce(
				(acc, item) => {
					if (!acc[item.view]) {
						acc[item.view] = [];
					}
					acc[item.view].push(item);
					return acc;
				},
				{} as Record<string, PostureData[]>,
			);

			return {
				sortedData,
				groupedByView,
				front: groupedByView.front?.[0] || null,
				back: groupedByView.back?.[0] || null,
				left: groupedByView.left?.[0] || null,
				right: groupedByView.right?.[0] || null,
			};
		},
		[],
	);

	// Extract issues and calculate score
	const extractIssuesByView = useCallback(
		(
			reportData: Partial<
				Record<'front' | 'back' | 'left' | 'right', PostureData>
			>,
		): {
			issues: PostureIssues;
			score: number;
		} => {
			const issues: PostureIssues = {
				front: [],
				back: [],
				left: [],
				right: [],
			};

			let totalScore = 0;

			if (!reportData) return { issues, score: totalScore };

			(Object.keys(issues) as Array<keyof PostureIssues>).forEach(view => {
				const viewData = reportData[view];
				if (!viewData) return;

				Object.entries(viewData).forEach(([_, value]) => {
					if ('leftLeg' in value || 'rightLeg' in value) {
						(['leftLeg', 'rightLeg'] as const).forEach(leg => {
							const legData = value[leg];
							if (legData?.assessment) {
								Object.entries(legData.assessment).forEach(
									([issue, isTrue]) => {
										if (isTrue) {
											if (!issues[view].includes(issue)) {
												issues[view].push(issue);
											}
											totalScore += 1;
										}
									},
								);
							}
						});
					} else if (
						'assessment' in value &&
						typeof value.assessment === 'object'
					) {
						Object.entries(value.assessment).forEach(([issue, isTrue]) => {
							if (isTrue) {
								issues[view].push(issue);
								totalScore += 1;
							}
						});
					}
				});

				if (issues[view].length === 0) {
					issues[view].push('Normal Assessment');
				}
			});

			return { issues, score: totalScore };
		},
		[],
	);

	// Fetch posture data and report
	const fetchData = useCallback(
		async (postureId: string, userId: string) => {
			setLoading(true);
			try {
				// Fetch session data
				const data = await dispatch(
					getPostureBySessionInActivityStream({ sessionId: postureId }),
				).unwrap();

				// Fetch report data
				const reportData = await dispatch(
					getPostureReport({ userId, page: 1 }),
				).unwrap();

				// Fetch strapi posture report
				await dispatch(getStrapiPostureReport());

				// Set temp selected scan
				dispatch(setTempSelectedScan({ item: data }));

				// Set selected scan with report (this adds the report to the scan)
				dispatch(
					setSelectedScan({
						item: data,
						postureReportData: reportData,
					}),
				);
			} catch (error) {
				console.error('[PostureResultContent] Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		},
		[dispatch],
	);

	// Fetch user programs to check enrollment status
	useEffect(() => {
		const fetchUserPrograms = async () => {
			const userId = currentUser.isPhysioterapist
				? selectedUser?.id
				: currentUser?.id;
			if (userId) {
				try {
					const result = await dispatch(
						getProgramList({ userId, limit: 100, page: 1, searchValue: '' }),
					).unwrap();
					if (result?.data) {
						setSavedExercise(result?.data);
						setUserPrograms(
							result?.data?.map(
								(program: { id: string; strapiProgramTemplateId: string }) => ({
									id: program.id,
									strapiProgramTemplateId: program.strapiProgramTemplateId,
								}),
							),
						);
					}
				} catch (error) {
					console.error(
						'[PostureResultContent] Error fetching user programs:',
						error,
					);
				}
			}
		};
		fetchUserPrograms();
	}, [
		currentUser?.id,
		selectedUser?.id,
		dispatch,
		currentUser.isPhysioterapist,
	]);

	// Set selected scan in Redux and fetch data
	useEffect(() => {
		if (postureSession?.id && user?.id) {
			fetchData(postureSession.id, user.id);
		}
	}, [postureSession?.id, user?.id, fetchData]);

	// Process selectedScan from Redux when it updates
	useEffect(() => {
		if (selectedScan && Array.isArray(selectedScan.postureAnalytics)) {
			const processedData = processPostureData(selectedScan.postureAnalytics);
			setPostureScanData(processedData);

			const { issues: extractedIssues, score } = extractIssuesByView(
				selectedScan.report as Partial<
					Record<'front' | 'back' | 'left' | 'right', PostureData>
				>,
			);

			setIssues(extractedIssues);
			setPersonaScore(score);
		}
	}, [selectedScan, processPostureData, extractIssuesByView]);

	// Extract program recommendations based on detected issues
	useEffect(() => {
		if (!strapiPostureReport || strapiPostureReport.length === 0) {
			return;
		}
		const programs: ProgramTemplate[] = [];

		strapiPostureReport.forEach((item: PostureAlignment) => {
			const issueName = item?.name?.toLowerCase();
			const matches = ['front', 'back', 'left', 'right'].some(view =>
				issues[view as keyof PostureIssues].some(
					issue =>
						typeof issueName === 'string' &&
						issueName.includes(issue.toLowerCase()),
				),
			);

			if (matches) {
				programs.push(...item.programTemplates);
			}
		});
		setRecommendations(programs);
	}, [strapiPostureReport, issues]);

	// Get active landmarks for 3D visualization
	const activeLandmarks =
		postureScanData.front?.coordinates ||
		postureScanData.back?.coordinates ||
		postureScanData.left?.coordinates ||
		postureScanData.right?.coordinates ||
		[];

	// Get persona gradient class
	const getPersonaClassName = (personaId: string | undefined) => {
		if (!personaId) return 'agile';
		const classMap: Record<string, string> = {
			'agile-achiever': 'agile',
			'balanced-mover': 'balanced',
			'compensating-contender': 'compensating',
			'stiff-struggler': 'stiff',
			'collapsed-coper': 'collapsed',
		};
		return classMap[personaId] || 'agile';
	};

	// Check if user is already enrolled in a program
	const isProgramEnrolled = (
		programTemplateId: string,
	): { enrolled: boolean; programId?: string } => {
		const enrolledProgram = userPrograms.find(
			p => p.strapiProgramTemplateId === programTemplateId,
		);
		return {
			enrolled: !!enrolledProgram,
			programId: enrolledProgram?.id,
		};
	};

	// Handle start session (navigate to enrolled program)
	const handleStartSession = async (programId: string) => {
		// Find the enrolled program from savedExercise array based on programId
		const enrolledProgram = savedExercise.find(
			(prog: { id: string }) => prog.id === programId,
		);

		if (!enrolledProgram) {
			console.warn('Program not found in savedExercise yet', programId);
			return;
		}

		// Dispatch the enrolled program with its exercises
		dispatch(selectProgram(enrolledProgram));
		dispatch(selectExercise(enrolledProgram?.exercises || []));
		clearNavigation();

		const userId = currentUser.isPhysioterapist
			? selectedUser?.id
			: currentUser?.id;
		navigate(`/${userId}${router.AIASSISTANT_PROGRAM_START}`);
		dispatch(setActiveTab(''));
	};

	// Handle program enrollment
	const handleEnroll = async (program: ProgramTemplate) => {
		setEnrollingProgramId(program.id);

		try {
			const exercises: {
				strapiExerciseId: string;
				weeklyReps: number;
				dailyReps: number;
				sets: number;
				reps: number;
				order: number;
			}[] = [];

			program?.exercises?.forEach((exercise, index: number) => {
				const tempExercise = {
					strapiExerciseId: String(
						typeof exercise?.strapiExerciseId === 'object'
							? exercise?.strapiExerciseId?.id
							: exercise?.strapiExerciseId || '',
					),
					weeklyReps: exercise.weeklyReps,
					dailyReps: exercise.dailyReps,
					sets: exercise.sets,
					reps: exercise.reps,
					order: index + 1,
				};
				exercises.push(tempExercise);
			});

			const formData = new FormData();
			formData.append('name', program?.name);
			formData.append('duration', program?.duration.toString());
			formData.append('durationType', program?.durationType);
			formData.append('description', program?.description as string);
			formData.append(
				'thumbnail',
				typeof program?.thumbnail === 'string'
					? program?.thumbnail
					: program?.thumbnail?.url || '',
			);
			if (currentUser.isPhysioterapist ? selectedUser?.id : currentUser?.id) {
				formData.append(
					'userId',
					String(
						currentUser.isPhysioterapist ? selectedUser?.id : currentUser?.id,
					),
				);
			} else {
				return;
			}
			formData.append('strapiProgramTemplateId', program?.id);
			exercises?.forEach((exercise, index) => {
				Object.keys(exercise).forEach(key => {
					if (exercise[key as keyof typeof exercise]) {
						formData.append(
							`exercises[create][${index}][${key}]`,
							exercise[key as keyof typeof exercise] as string,
						);
					}
				});
			});

			const data = await dispatch(createProgram(formData));
			if (data?.payload) {
				message.success(t('Patient.data.newDashboard.enrolled'));

				// ✅ 1. Update userPrograms (for button toggle)
				setUserPrograms(prev => [
					...prev,
					{
						id: data.payload.id,
						strapiProgramTemplateId: program.id,
					},
				]);

				// ✅ 2. Update savedExercise (for Start Session)
				setSavedExercise(prev => [
					...prev,
					data.payload, // <-- FULL program object from API
				]);
			}
		} catch (error) {
			message.error(
				'There was an error enrolling in the program. Please try again later.',
			);
		} finally {
			setEnrollingProgramId(null);
		}
	};

	// Format user data
	const userName =
		user?.profile?.firstName && user?.profile?.lastName
			? `${user.profile.firstName} ${user.profile.lastName}`
			: user?.profile?.email || 'User';

	const userEmail = user?.profile?.email || '';

	const userGender = user?.profile?.gender || '';

	// Correct field name: birthDate (not birthdate)
	const userBirthdate = user?.profile?.birthDate
		? user.profile.birthDate.replace(/(\d{4})-(\d{2})-(\d{2})/, '$2/$3/$1')
		: '';

	// Use imperial or metric height
	const userHeight = user?.profile?.imperialHeight
		? `${user.profile.imperialHeight} Ft`
		: user?.profile?.metricHeight
			? `${user.profile.metricHeight} cm`
			: '';

	// Weight is an array - get the latest entry (first item is newest)
	let userWeight = '';
	if (
		user?.profile?.weight &&
		Array.isArray(user.profile.weight) &&
		user.profile.weight.length > 0
	) {
		const weightObj = user.profile.weight[0];

		// Check measurement system preference
		if (
			user?.profile?.measurementSystem === 'imperial' &&
			weightObj.imperialWeight
		) {
			userWeight = `${weightObj.imperialWeight}lb`;
		} else if (weightObj.metricWeight) {
			userWeight = `${weightObj.metricWeight}kg`;
		} else if (weightObj.imperialWeight) {
			userWeight = `${weightObj.imperialWeight}lb`;
		}
	}

	const userAvatar =
		user?.profile?.profilePicture || user?.profile?.avatar || null;
	const userAvatarColor =
		user?.profile?.avatarColor || user?.avatarColor || 'var(--brand-primary)';

	if (loading) {
		return <ActivityFeedSkeleton count={5} />;
	}

	if (
		!postureSession?.postureAnalytics ||
		postureSession.postureAnalytics.length === 0
	) {
		return (
			<Flex
				justify="center"
				align="center"
				style={{ padding: 'var(--spacing-8)' }}>
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={t(
						'Admin.data.triage.noPostureData',
						'No posture data available',
					)}
				/>
			</Flex>
		);
	}

	return (
		<div className="posture-result-wrapper">
			{/* Bento Grid Layout */}
			<div className="rom-bento-grid posture-bento-grid">
				{/* User Info Card - Far left column */}
				<Card
					bordered={false}
					className="rom-mobility-card rom-bento-item rom-bento-user-info">
					<Flex vertical gap={12}>
						{/* Avatar and Name */}
						<Flex align="center" gap={12}>
							<Avatar
								src={userAvatar}
								size="large"
								style={{ backgroundColor: userAvatarColor, flexShrink: 0 }}>
								{!userAvatar && userName.charAt(0).toUpperCase()}
							</Avatar>
							<Flex vertical gap={2}>
								<Text
									strong
									style={{
										fontSize: 'var(--font-size-base)',
										color: 'var(--text-primary)',
									}}>
									{userName}
								</Text>
								{userEmail && (
									<Text
										type="secondary"
										style={{ fontSize: 'var(--font-size-xs)' }}>
										{userEmail}
									</Text>
								)}
							</Flex>
						</Flex>

						{/* Patient Data */}
						<Flex
							wrap="wrap"
							gap={8}
							justify="space-between"
							style={{
								fontSize: 'var(--font-size-xs)',
								color: 'var(--text-secondary)',
							}}>
							{userGender && <Text type="secondary">{userGender}</Text>}
							{userBirthdate && (
								<Text type="secondary">Birthdate {userBirthdate}</Text>
							)}
							{userHeight && <Text type="secondary">{userHeight} Height</Text>}
							{userWeight && <Text type="secondary">{userWeight} Weight</Text>}
						</Flex>
					</Flex>
				</Card>

				{/* Persona Banner - Left of 3D viewer */}
				{activePersona && (
					<div
						className={`rom-persona-banner rom-bento-item rom-bento-persona posture-persona-banner--${getPersonaClassName(activePersona.id)}`}>
						<img
							src={activePersona.image}
							alt={activePersona.title}
							style={{ height: '100px', objectFit: 'contain' }}
						/>
						<Flex vertical style={{ flex: 1 }}>
							<h2 className="rom-persona-banner__title">
								{activePersona.title}
							</h2>
							<Text className="rom-persona-banner__subtitle">
								{activePersona.subtitle}
							</Text>
							<Paragraph className="rom-persona-banner__description">
								{activePersona.description}
							</Paragraph>
						</Flex>
					</div>
				)}

				{/* Scan Data - full width */}
				<div className="rom-joints-container rom-bento-item rom-bento-full">
					<Flex
						align="center"
						gap={12}
						style={{ marginBottom: 'var(--spacing-5)' }}>
						<div className="rom-card-icon-container">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 18 18"
								fill="none">
								<path
									d="M8.97802 6.59693C6.6822 6.59693 4.50264 8.26373 4.77799 10.5627C4.80002 10.7413 4.82572 10.9298 4.85509 11.1282C4.9432 11.7208 5.45474 12.1529 6.05073 12.1529H6.72993L7.22556 15.2593C7.29233 15.6854 7.50762 16.0734 7.83269 16.3536C8.15777 16.6338 8.57128 16.7877 8.99883 16.7877C9.42637 16.7877 9.83988 16.6338 10.165 16.3536C10.49 16.0734 10.7053 15.6854 10.7721 15.2593L11.2665 12.1529H11.9555C12.2415 12.1549 12.5188 12.0538 12.7373 11.8677C12.9559 11.6816 13.1014 11.4228 13.1475 11.138C13.1747 10.9598 13.1992 10.7812 13.2209 10.6022C13.5036 8.28596 11.291 6.59693 8.97802 6.59693ZM9.00005 6.28827C10.5665 6.28827 11.4476 5.39931 11.4476 3.81894C11.4476 2.23857 10.5665 1.34961 9.00005 1.34961C7.4336 1.34961 6.55248 2.23857 6.55248 3.81894C6.55248 5.39931 7.4336 6.28827 9.00005 6.28827Z"
									stroke="var(--brand-primary)"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
						<Title level={4} style={{ margin: 0 }}>
							{t(
								'Patient.data.postures.yourPosture',
								'Your posture at every angle',
							)}
						</Title>
					</Flex>
					<ScanData
						postureScanData={postureScanData}
						issues={issues}
						strapiPostureReport={strapiPostureReport}
					/>
				</div>

				{/* 3D Visualization Card - Right column */}
				{/* TEMPORARILY HIDDEN - Keep code for future use */}
				{/* {activeLandmarks.length > 0 && (
					<Card bordered={false} className="rom-mobility-card rom-bento-item rom-bento-chart">
						<Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
							<Title level={4} style={{ margin: 0 }}>
								{t('Patient.data.postures.yourPosture', 'Your Posture')}
							</Title>
							<span
								style={{
									background: 'var(--success-default)',
									color: 'var(--text-on-success)',
									padding: 'var(--spacing-1) var(--spacing-3)',
									borderRadius: 'var(--radius-sm)',
									fontSize: 'var(--font-size-xs)',
									fontWeight: 'var(--font-weight-semibold)',
								}}>
								3D
							</span>
						</Flex>
						<div className="rom-chart-container" style={{ minHeight: 400 }}>
							<PostureVisualization
								landmarks={activeLandmarks}
								deviationDegrees={personaScore || 5}
								showPerformance={false}
							/>
						</div>
					</Card>
				)} */}

				{/* Did You Know - Unified card with benefits grid */}
				<Card
					bordered={false}
					className="rom-mobility-card rom-bento-item rom-bento-didyouknow-unified">
					<Title
						level={3}
						style={{
							margin: 0,
							marginBottom: 8,
							fontSize: 'var(--font-size-xl)',
							fontWeight: 'var(--font-weight-semibold)',
						}}>
						{t('patient.reports.mobility.didYouKnow', 'Did You Know?')}
					</Title>
					<Paragraph
						type="secondary"
						style={{
							marginBottom: 'var(--spacing-5)',
							fontSize: 'var(--font-size-base)',
						}}>
						{t(
							'Patient.data.postures.didYouKnowDescription',
							'Improving your joint mobility not only relieves pain but also boosts posture, balance and energy levels.',
						)}
					</Paragraph>

					{/* Benefits Grid 2x3 */}
					<div className="posture-benefits-grid">
						{benefits.map((benefit, index) => (
							<div key={index} className="posture-benefit-card">
								<Text
									strong
									style={{
										display: 'block',
										marginBottom: 'var(--spacing-1)',
										fontSize: 'var(--font-size-base)',
										color: 'var(--text-primary)',
									}}>
									{benefit.label}
								</Text>
								<Text
									type="secondary"
									style={{
										fontSize: 'var(--font-size-sm)',
										lineHeight: 'var(--line-height-normal)',
									}}>
									{benefit.description}
								</Text>
							</div>
						))}
					</div>
				</Card>

				{/* Posture Persona Cards Container - 5 cards side by side */}
				<div className="rom-bento-item rom-bento-persona-cards-container">
					{[...personas].reverse().map((personaItem, index) => {
						const isActive = personaItem.id === activePersona?.id;
						return (
							<div
								key={index}
								className={`rom-persona-card rom-bento-item ${isActive ? `rom-persona-card--active posture-persona-card--${getPersonaClassName(personaItem.id)}` : ''}`}>
								{/* Score badge for active card */}
								{isActive && (
									<div className="rom-persona-card__score">
										<Text className="rom-persona-card__score-label">Score</Text>
										<Text className="rom-persona-card__score-value">
											{personaScore}
										</Text>
									</div>
								)}

								{/* Icon + Title Row */}
								<div className="rom-persona-card__header">
									<div className="rom-persona-card__icon">
										<img
											src={personaItem.image}
											alt={personaItem.title}
											style={{ height: '100px', objectFit: 'contain' }}
										/>
									</div>
									<Title level={5} className="rom-persona-card__title">
										{personaItem.title}
									</Title>
								</div>

								{/* Tagline + Description */}
								<Text className="rom-persona-card__tagline">
									{personaItem.tagline}
								</Text>
								{isActive ? (
									<div className="rom-persona-card__content">
										<Text className="rom-persona-card__description">
											{personaItem.description}
										</Text>
									</div>
								) : (
									<Text className="rom-persona-card__description">
										{personaItem.description}
									</Text>
								)}
							</div>
						);
					})}
				</div>

				{/* Posture Categories Rule Card */}
				<Card
					bordered={false}
					className="rom-mobility-card rom-bento-item rom-bento-posture-categories">
					<img
						src="/assets/rule-categories.svg"
						alt={t(
							'Patient.data.vitalscan-rom.ruleCategories',
							'Posture Categories Rule',
						)}
						className="rom-rule-categories__image"
					/>
				</Card>

				{/* Recommended Programs Card */}
				{recommendations.length > 0 && (
					<Card
						bordered={false}
						className="rom-bento-item rom-bento-recommended-programs">
						<Title
							level={3}
							style={{
								margin: 0,
								marginBottom: 'var(--spacing-4)',
								fontSize: 'var(--font-size-xl)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
							}}>
							{t(
								'Patient.data.postures.RecommendedPrograms',
								'Recommended Programs',
							)}
						</Title>

						{/* Programs Grid 2x2 */}
						<div className="recommended-programs-grid">
							{recommendations.slice(0, visibleCount).map(program => {
								const isEnrolling = enrollingProgramId === program.id;
								const thumbnailUrl =
									typeof program.thumbnail === 'string'
										? program.thumbnail
										: program.thumbnail?.url || '';
								const enrollmentStatus = isProgramEnrolled(program.id);
								const isEnrolled = enrollmentStatus.enrolled;

								return (
									<div key={program.id} className="recommended-program-card">
										{/* Image */}
										<div className="recommended-program-card__image">
											{thumbnailUrl ? (
												<img src={thumbnailUrl} alt={program.name} />
											) : (
												<div className="recommended-program-card__image-placeholder">
													<UntitledIcon name="image" size="large" />
												</div>
											)}
										</div>

										{/* Content */}
										<div className="recommended-program-card__content">
											<Title
												level={5}
												className="recommended-program-card__title">
												{program.name}
											</Title>
											<Flex
												align="center"
												gap={8}
												style={{ marginBottom: 'var(--spacing-2)' }}>
												<UntitledIcon
													name="calendar"
													size="small"
													color="var(--text-secondary)"
												/>
												<Text
													type="secondary"
													style={{ fontSize: 'var(--font-size-sm)' }}>
													{program.duration} {program.durationType}
												</Text>
											</Flex>
											<Paragraph
												ellipsis={{ rows: 2 }}
												type="secondary"
												className="recommended-program-card__description">
												{program.description}
											</Paragraph>
										</div>

										{/* Enroll / Start Session Button */}
										<Button
											type="primary"
											loading={isEnrolling}
											disabled={isEnrolling}
											onClick={() => {
												if (isEnrolled && enrollmentStatus.programId) {
													handleStartSession(enrollmentStatus.programId);
												} else {
													handleEnroll(program);
												}
											}}
											className={`${isEnrolled ? 'start-session-btn' : 'recommended-program-card__button'}`}
										>
											{isEnrolled
												? t('patient.dashboard.new.startSession', 'Start Session')
												: t('patient.dashboard.new.enroll', 'Enroll')}
										</Button>
									</div>
								);
							})}
						</div>

						{/* See More Button */}
						{recommendations.length > visibleCount && (
							<div
								style={{ textAlign: 'center', marginTop: 'var(--spacing-4)' , display: 'flex', gap: 20, justifyContent: 'center'}}>
								<Button
									type="primary"
									onClick={() => setVisibleCount(prev => prev + 4)}
								>
									{t('Patient.data.postures.seeMore', 'See More')}
								</Button>
								<Button
								type="primary"
								onClick={() => {
									if (currentUser.isPhysioterapist && selectedUser?.id) {
										navigate(`/${selectedUser.id}${router.PATIENTVIEW}`);
									} else {
										navigate(router.ROOT);
									}
								}}
							>
								{t('common.goToDashboard', 'Go to Dashboard')}
							</Button>
							</div>
						)}
					</Card>
				)}
			</div>
		</div>
	);
};

export default PostureResultContent;
