import { FormSkeleton } from '@atoms/Skeletons';
import { getRomSessionList } from '@stores/clinical/rom/results';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getPostureByPage } from '@stores/posture/postures/postures';
import {
	getSuggestedProgram,
	selectOnboardingData,
	setCurrentStep,
	setExistingPatientData,
} from '@stores/shared/onBoard/onBoard';
import { useEffect, useState } from 'react';
// REMOVED: import { Spin } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import RomResultContent from '@organisms/TriageResultModal/RomResultContent';
import '@organisms/TriageResultModal/TriageResultModal.css';
import ExistingPatientDashboard from '@pages/PatientDashboard/ExistingPatientDashboard';
import PatientDashboardBanner from '@pages/PatientDashboard/PatientDashboardBanner';
import RecommendationDashboard from '@pages/PatientDashboard/RecommendationDashboard';
import SuggestedPrograms from '@pages/PatientDashboard/SuggestedPrograms';
import MyProgramsPatientOnboard from '@pages/PatientOnboard/MyProgramsPatientOnboard';
import TrueToFormPatientOnboard from '@pages/PatientOnboard/TrueToFormPatientOnboard';
import {
	getAllRomSessions,
	getRomSessionById,
	setSelectedRom
} from '@stores/clinical/rom/customRom';
import { ACTIVETAB, INTAKE_STEPS, PLANS } from '@stores/constants';
import { getPlansByUserId } from '@stores/settings/settingsSlice';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { getProgramList } from '@stores/shared/patientDetail/program';
import {
	CustomRomSession,
	IPaginationPluginDefaultResponse,
	SuggestedProgramItem,
	TSuggestedProgram,
} from '@types';
import { Flex, Typography } from 'antd';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import './style.css';

const { Text } = Typography;

interface Program {
	id: string;
	userId: string;
	name: string;
	description: string;
	thumbnail: string;
	active: boolean;
	duration: number;
	durationType: 'days' | 'weeks' | string;
	startAt: string | null;
	finishAt: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	status: string;
	originType: string;
	programTemplateId: string | null;
	strapiProgramTemplateId: string | null;
	exercises: Exercise[];
}

export interface ProgramItem {
	id: string;
	name: string;
	duration: string;
	durationType: string;
	description: string;
	thumbnail: string | { url: string };
	exercises: ProgramExerciseItem[];
}

export interface ProgramExerciseItem {
	strapiExerciseId: number | { id: number } | StrapiExerciseID;
	exerciseLibraryId: string | null;
	weeklyReps: number;
	dailyReps: number;
	sets: number;
	reps: number;
	thumbnail: {
		url?: string;
	};
}

export interface StrapiExerciseID {
	id: string;
	exercise_image: {
		url: string;
	}[];
}
interface Exercise {
	id: string;
	programId: string;
	strapiExerciseId: number;
	exerciseLibraryId: string | null;
	weeklyReps: number;
	dailyReps: number;
	sets: number;
	reps: number;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	order: number;
	name: string;
	description: string;
	is_bilateral: boolean;
	recommended_duration: number | null;
	publishedAt: string;
	locale: string;
	instructions: string;
	contraindications: string;
	therapist_notes: string;
	breathing: string;
	supportive_surfaces: string;
	alignment_tips: string;
	frequency: string;
	equipment_alternatives: string;
	precautions: string;
	functional_applications: string;
	function: string | null;
	orientation: string | null;
	assets: Asset[];
	video: string;
	image: string;
}

interface Asset {
	id: number;
	gender: 'male' | 'female' | string;
	sideBody: 'right' | 'left' | string;
	video: {
		data: {
			id: number;
			attributes: {
				url: string;
			};
		};
	};
	image: {
		data: {
			id: number;
			attributes: {
				url: string;
			};
		};
	};
}

export interface SelectedProgram {
	exercises?: {
		strapiExerciseId: {
			exercise_image: {
				url: string;
			}[];
			exercise_video: {
				url: string;
			}[];
			name: string;
			description: string;
		};
		weeklyReps: string;
		dailyReps: string;
		sets: string;
		reps: string;
	}[];
	functional_goals?: {
		name: string;
	}[];
	duration?: string;
	durationType?: string;
	name?: string;
	description?: string;
	updatedAt?: string;
	thumbnail: {
		url?: string;
	};
}

export interface SuggestedProgramDetails {
	data: TSuggestedProgram[];
	meta: {
		pagination: {
			page: number;
			pageCount: number;
			pageSize: number;
			total: number;
		};
	};
}

export default function NewPatientOnboardDashboard() {
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();
	const [current, setCurrent] = useState(0);
	const [isLoading, setLoading] = useState(true);
	const [isLoadingExist, setLoadingExist] = useState(true);
	const [suggestedProgramData, setSuggestedProgramData] = useState<
		SuggestedProgramItem[]
	>([]);
	const [suggestedProgram, setSuggestedProgram] = useState<
		SuggestedProgramItem[]
	>([]);
	// Use memoized selector to prevent unnecessary re-renders
	const { suggestedProgramDetails, savedFunctionalGoals } =
		useTypedSelector(selectOnboardingData);
	const existingPatientData = useTypedSelector(
		state => state.onBoard.onBoard.existingPatientData,
	);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const [programData, setProgramData] = useState<Program[]>([]);
	const [pagination, setPagination] =
		useState<IPaginationPluginDefaultResponse | null>(null);
	const [functionalGoal, setFunctionalGoal] = useState<number[]>([]);
	const [isFunctionGoalChanged, setIsFunctionGoalChanged] =
		useState<boolean>(false);
	const [total, setTotal] = useState<number>(1);
	const id = user.isPhysioterapist ? selectedUser?.id : user?.id;
	const [customRomSessionExercise, setCustomRomSessionExercise] = useState<CustomRomSession | null>(null);
	const savedUserPlans = useTypedSelector(state => state.settings.plans.savedUserPlans);

	const planType = savedUserPlans?.planType;
	const isPlanOne = planType === PLANS?.SCREENING;
	const isVirtualPt = planType === PLANS?.VIRTUALPT;
	const [isRomDataLoading, setRomDataLoading] = useState(true);

	useEffect(() => {
		if (isPlanOne) {
			fetchData(1);
		} else {
			fetchHomeData(1);
		}
	}, [planType, selectedUser]);

	const fetchData = async (page: number) => {
			setRomDataLoading(true);
			try {
				const data = await dispatch(
					getAllRomSessions({
						patientId: id,
						page,
						limit: 10,
						completed: true,
					}),
				)
				const latestSession = data?.payload?.data?.[0];
				if (latestSession?.id) {
					const sessionData = await dispatch(getRomSessionById({ customRomId: latestSession?.id }),
					).unwrap();
					if (sessionData) {
						setCustomRomSessionExercise(sessionData);
						dispatch(setSelectedRom(sessionData));
					} else {
						setCustomRomSessionExercise(null);
					}
				} else {
					setCustomRomSessionExercise(null);
				}
			} catch (error) {
				setCustomRomSessionExercise(null);
			} finally {
				setRomDataLoading(false);
			}
	};

	useEffect(() => {
		if (isPlanOne && customRomSessionExercise) {
			dispatch(setSelectedRom(customRomSessionExercise));
		}
	}, [isPlanOne, dispatch]);

	const initializePlans = async () => {
		const id = user.isPhysioterapist ? selectedUser?.id : user?.id;
		await dispatch(getPlansByUserId(id));
	};

	useEffect(() => {
		initializePlans();
	}, []);

	const programDetails = async (current: number, functionalGoalsIds: number[]) => {
			await dispatch(getSuggestedProgram({ current, functionalGoalsIds }));
			setLoading(false);
	};

	const isExistingPatientThere = async () => {
		setLoadingExist(true);
		const romData = await dispatch(
			getRomSessionList({
				patientId: user.isPhysioterapist ? selectedUser?.id : user?.id,
				page: 1,
				limit: 10,
			}),
		);
		const postureData = await dispatch(
			getPostureByPage({
				userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
				page: 1,
			}),
		);
		dispatch(
			setExistingPatientData(
				romData?.payload?.data?.length > 0 &&
				postureData?.payload?.data?.length > 0,
			),
		);
		setLoadingExist(false);
	};

	useEffect(() => {
		dispatch(setActiveTab(ACTIVETAB.HOME));
		(user.isPhysioterapist ? selectedUser?.id : user?.id) &&
			isExistingPatientThere();
	}, [selectedUser]);

	useEffect(() => {
		if (suggestedProgramDetails && total !== suggestedProgram.length) {
			suggestedProgramDetails?.meta?.pagination?.page === 1 &&
				setSuggestedProgramData(suggestedProgramDetails?.data?.slice(0, 3));
			if (isFunctionGoalChanged) {
				setSuggestedProgram(
					suggestedProgramDetails?.data?.map(item => ({
						...item,
						thumbnail: item?.thumbnail || { url: '' },
					})),
				);
			} else {
				setSuggestedProgram((prev: SuggestedProgramItem[]) => [
					...prev,
					...(suggestedProgramDetails?.data?.map(item => ({
						...item,
						thumbnail: item?.thumbnail || { url: '' },
					})) || []),
				]);
			}
			setTotal(suggestedProgramDetails?.meta?.pagination?.total);
		}
	}, [
		suggestedProgramDetails,
		isFunctionGoalChanged,
		selectedUser]);

	useEffect(() => {
		if (savedFunctionalGoals?.functionalGoalsIds?.length > 0) {
			if (
				!areArraysEqual(
					savedFunctionalGoals?.functionalGoalsIds,
					functionalGoal,
				)
			) {
				setIsFunctionGoalChanged(true);
				setFunctionalGoal(savedFunctionalGoals.functionalGoalsIds);
			} else {
				setIsFunctionGoalChanged(false);
			}
		}
	}, [savedFunctionalGoals, selectedUser]);

	const areArraysEqual = (arr1: number[], arr2: number[]): boolean => {
		if (arr1.length !== arr2.length) return false;
		return arr1.every((value, index) => value === arr2[index]);
	};

	useEffect(() => {
		if (current === 0) {
			if (
				user.isPhysioterapist
					? selectedUser?.functionalGoals?.length > 0
					: user?.functionalGoals?.length > 0
			) {
				const lastIndex = user.isPhysioterapist
					? selectedUser?.functionalGoals?.length - 1
					: user?.functionalGoals?.length - 1;
				const functionGoalIds = user.isPhysioterapist
					? selectedUser?.functionalGoals[lastIndex]?.functionalGoalsIds
					: user?.functionalGoals[lastIndex]?.functionalGoalsIds;
				if (total !== suggestedProgram.length) {
					programDetails(currentPage, functionGoalIds);
				}
			} else {
				programDetails(currentPage, []);
			}
		}
	}, [
		currentPage,
		selectedUser,
		user?.functionalGoals
	]);

	const fetchHomeData = async (pageNumber: number) => {
			const payload = {
				userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
				limit: 10,
				page: pageNumber,
			};
			const data = (await dispatch(getProgramList(payload))) as {
				payload: {
					data: Program[];
					pagination: IPaginationPluginDefaultResponse;
				};
			};
			if (data?.payload?.data?.length) {
				if (pageNumber === 1) {
					setProgramData(data?.payload?.data);
				} else {
					setProgramData(prev => {
						const newData = data?.payload?.data?.filter(
							item => !prev?.find(prevItem => prevItem?.id === item?.id),
						);
						return [...prev, ...newData];
					});
				}
			}
			if (data?.payload?.data?.length >= 1) {
				dispatch(setCurrentStep(INTAKE_STEPS.SUGGESTED));
			} else {
				dispatch(setCurrentStep(INTAKE_STEPS.INTAKE_PROGRAMS));
			}
			setPagination(data?.payload?.pagination);
		};

	// Render result content based on type
	const renderResultContent = () => {
		const updatedUser = user.isPhysioterapist ? selectedUser : user;
		if (!updatedUser || !customRomSessionExercise) {
			return (
				<Flex justify="center" align="center" style={{ padding: 'var(--spacing-8)' }}>
					<Text type="secondary">{t('Admin.data.triage.noDataAvailable', 'No data available')}</Text>
				</Flex>
			);
		}

		const sessionDate = customRomSessionExercise?.createdAt
			? format(new Date(customRomSessionExercise.createdAt), 'MMM dd, yyyy, hh:mm a')
			: '';

		const scanType = customRomSessionExercise?.title || t('Admin.data.triage.resultTypes.rom', 'ROM Scan');
		const resultTitle = `${t('Admin.data.triage.resultTypes.romMonthlyReport', 'ROM Mobility Report')} - ${scanType}`;

		return (
			<div className="triage-result-modal triage-result-content-container">
				<Flex align="flex-start" justify="space-between" className="triage-modal-header" style={{ marginBottom: 'var(--spacing-4)' }}>
					<Flex align="center" gap={12} className="triage-modal-header__left-wrapper">
						<div className="triage-modal-header__icon-container">
							<UntitledIcon name="file06" size={24} color="var(--brand-primary)" />
						</div>
						<Flex vertical gap={4} className="triage-modal-header__left">
							<Text strong className="triage-modal-header__title">
								{resultTitle}
							</Text>
							{sessionDate && (
								<Text type="secondary" className="triage-modal-header__date">
									<UntitledIcon name="calendar" size={12} color="var(--text-tertiary)" />
									{sessionDate}
								</Text>
							)}
						</Flex>
					</Flex>
				</Flex>
				<div className="triage-result-content">
					<RomResultContent user={updatedUser as unknown} session={customRomSessionExercise as unknown} />
				</div>
			</div>
		);
	};

	const renderScreeningPlan = () => {
		if (isRomDataLoading) {
			return <FormSkeleton />;
		}
		return (
			<>
				{customRomSessionExercise ? (
					renderResultContent()
				) : (
					<div
						className={`select-none`}
						style={{
							backgroundColor: 'var(--home-bg-color)',
							paddingTop: 'var(--spacing-5)',
							paddingBottom: 'var(--spacing-2-5)',
						}}>
						<div className="m-5">
							<PatientDashboardBanner />
						</div>
					</div>
				)}
			</>
		);
	};

	const renderVirtualPtPlan = () => {
		return (
			<div
				style={{ backgroundColor: 'var(--home-bg-color)' }}
				className="mt-32 p-5">
				<div className="pt-5">
					<MyProgramsPatientOnboard
						programData={programData}
						fetchHomeData={fetchHomeData}
						pagination={{
							pageCount: pagination?.pageCount,
							totalCount: pagination?.totalCount,
						}}
					/>
				</div>
			</div>
		);
	};

	const renderDefaultPlan = () => {
		const showBanner =
			!existingPatientData ||
			(user.isPhysioterapist
				? !selectedUser?.profile?.isWellnessCheck
				: !user?.profile?.isWellnessCheck);
		return (
			<div
				className={`select-none`}
				style={{
					backgroundColor: 'var(--home-bg-color)',
					paddingTop:
						!existingPatientData ||
							(user.isPhysioterapist
								? !selectedUser?.profile?.isWellnessCheck
								: !user?.profile?.isWellnessCheck)
							? '20px'
							: '0px',
					paddingBottom: 'var(--spacing-2-5)',
				}}>
				<>
					{showBanner ? (
						<div className="m-5">
							<PatientDashboardBanner />
						</div>
					) : (
						<ExistingPatientDashboard
							suggestedProgramData={suggestedProgramData}
							fetchHomeData={fetchHomeData}
						/>
					)}
					<div className="m-5">
						{programData?.length > 0 && (
							<MyProgramsPatientOnboard
								programData={programData}
								fetchHomeData={fetchHomeData}
								pagination={{
									pageCount: pagination?.pageCount,
									totalCount: pagination?.totalCount,
								}}
							/>
						)}
						{(user.isPhysioterapist || user?.profile?.isWellnessCheck) && (
							<>
								<SuggestedPrograms
									current={current}
									setCurrent={setCurrent}
									suggestedProgramData={suggestedProgram}
									currentPage={currentPage}
									setCurrentPage={setCurrentPage}
									fetchHomeData={fetchHomeData}
								/>
								<RecommendationDashboard />
								<TrueToFormPatientOnboard />
							</>
						)}
					</div>
				</>
			</div>
		);
	};

	if (isLoading || isLoadingExist) {
		return <FormSkeleton />;
	}
	if (isPlanOne && !isVirtualPt) {
		return renderScreeningPlan();
	}
	if (isVirtualPt) {
		return renderVirtualPtPlan();
	}
	return renderDefaultPlan();
}
