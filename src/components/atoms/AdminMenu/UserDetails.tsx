import { WeightHistoryChart } from '@atoms/WeightHistoryChart';
import { Edit05 } from '@vitalflow-icons/general/edit05';
import { Target04 } from '@vitalflow-icons/general/target04';
import { FUNCTIONAL_GOAL_IDS } from '@constants/plans';
import AnimationCard from '@pages/PatientOnboard/FunctionalGoals/AnimationCard';
import { FEATURES_MOCK } from '@pages/PatientOnboard/FunctionalGoals/FeaturesMock';
import { getUserById } from '@stores/activity/contacts/contacts';
import { GetDetails } from '@stores/clinical/functionalGoals';
import { PLANS, USER_ROLES } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	getSuggestedProgram,
	setDisplayedFunctionalGoalTitle,
	setFunctionalModal,
	setSelectedFunctionalGoalTitle,
	updateFunctionalGoal,
} from '@stores/shared/onBoard/onBoard';
import {
	getConsentFormTemplate,
	getFunctionalGoalById,
} from '@stores/shared/settings/settings';
import { Button, Flex, Modal, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { newImageMapping } from './FunctionalGoals/ImageMapping';
import InformedConsentWidget from './InformedConsentWidget';
import ManagedBy from './ManagedBy';
import WellnessCheck from './WellnessCheck';

const { Paragraph } = Typography;

interface UserProps {
	userDetails: Record<string, unknown>;
	functionalData: [] | undefined;
}

const UserDetails = (props: UserProps) => {
	const { userDetails } = props;
	const { t } = useTranslation();
	const functionalModal = useTypedSelector(
		state => state.onBoard.onBoard.functionalModal,
	);
	const { user, selectedUser } = useTypedSelector(state => ({
		user: state.user,
		selectedUser: state.contacts.main.selectedUser,
	}));
	const isAdmin = user.profile.role === USER_ROLES.ADMIN;
	const isSuperAdmin = user.profile.role === USER_ROLES.SUPER_ADMIN;
	const dispatch = useTypedDispatch();
	const [savedData, setSavedData] = useState({});
	const displayedFunctionalGoalTitle = useTypedSelector(
		state => state.onBoard.onBoard.displayedFunctionalGoalTitle,
	);
	const [selectedCards, setSelectedCards] = useState<Record<string, number[]>>(
		{},
	);
	const savedUserPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans,
	);
	const planType = savedUserPlans?.planType;
	const isScreening = planType === PLANS.SCREENING;
	const isScreeningOrIntervention =
		planType === PLANS.SCREENING || planType === PLANS.EARLYINTERVENTION;
	const isVirtualPt = planType === PLANS?.VIRTUALPT;

	const [tempSelectedCards, setTempSelectedCards] =
		useState<Record<string, number[]>>(selectedCards);
	const [functionalGoalList, setFunctionalGoalList] = useState<GetDetails>();
	const checkUser = user.isPhysioterapist ? selectedUser : user;
	const showMiniBannerBasedFunctionalGoals =
		checkUser?.functionalGoals?.length > 0;

	useEffect(() => {
		fetchUSerData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchUSerData = async () => {
		setSavedData(checkUser?.functionalGoals);
	};
	const getFunctionalGoals = useTypedSelector(
		state => state.functionalGoals.functionalGoals,
	);
	const functionalGoals = useTypedSelector(
		state => state.settings.content.functionalGoals,
	);

	useEffect(() => {
		fetchFunctionalGoals();
		fetchConsentFormTemplate();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchConsentFormTemplate = async () => {
		await dispatch(getConsentFormTemplate());
	};

	useEffect(() => {
		const updatedGoals = getFunctionalGoals?.data.map(goal => {
			const matched = functionalGoals?.find(
				fg => fg?.functionalGoalId === goal?.id,
			);
			const matchedMock = FEATURES_MOCK.find(
				item => item.id === Number(goal?.id),
			);

			return {
				id: goal?.id,
				attributes: {
					...goal?.attributes,
					name: matched?.title || goal.attributes?.name || matchedMock?.name,
					description:
						matched?.description || goal.attributes?.description || '',
					thumbnail: matched?.thumbnail || matchedMock?.imageSrc || '',
				},
			};
		});

		setFunctionalGoalList({
			data: updatedGoals,
			meta: getFunctionalGoals?.meta ?? {
				pagination: { page: 1, pageSize: 10, pageCount: 1, total: 0 },
			},
		});
	}, [getFunctionalGoals, functionalGoals]);

	useEffect(() => {
		const savedIds = savedData?.functionalGoalsIds?.length
			? savedData.functionalGoalsIds
			: userDetails?.functionalGoals?.at(-1)?.functionalGoalsIds || [];

		if (savedIds.length > 0 && Array.isArray(functionalGoalList?.data)) {
			const selected = {};
			functionalGoalList.data.forEach(({ id, attributes }) => {
				if (savedIds.includes(id)) {
					selected[attributes?.name] = id;
				}
			});
			setSelectedCards(selected);
		} else {
			setSelectedCards({});
		}
	}, [
		savedData,
		userDetails,
		isAdmin,
		selectedUser,
		isSuperAdmin,
		functionalGoalList?.data,
	]);

	useEffect(() => {
		setTempSelectedCards(selectedCards);
	}, [selectedCards, selectedUser]);

	useEffect(() => {
		const selectedTitles = Object.keys(selectedCards);
		dispatch(setSelectedFunctionalGoalTitle(selectedTitles));
		dispatch(setDisplayedFunctionalGoalTitle(selectedTitles[0] || null));
	}, [selectedCards, dispatch, selectedUser]);

	const fetchFunctionalGoals = async () => {
		for (const id of FUNCTIONAL_GOAL_IDS) {
			await dispatch(getFunctionalGoalById(id));
		}
	};

	const handleCardSelect = (title: string) => {
		setTempSelectedCards(prev => {
			const updatedCards = { ...prev };
			if (updatedCards[title]) {
				delete updatedCards[title];
			} else {
				const matchedGoal = functionalGoalList?.data?.find(
					goal => goal.attributes.name === title,
				);

				if (matchedGoal) {
					updatedCards[title] = matchedGoal.id;
				}
			}
			return updatedCards;
		});
	};

	const handleNextClick = async () => {
		const functionalGoalsIds = Object.values(tempSelectedCards).flat();
		if (functionalGoalsIds.length === 0) {
			message.error(
				t(
					'Patient.data.virtualEvaluation.associatedSymptoms.pleaseSelectAtLeastOneOption',
				),
			);
			return;
		}

		const payload = { functionalGoalsIds };
		const current = 1;
		await dispatch(
			updateFunctionalGoal({
				userId: user.isPhysioterapist ? selectedUser.id : user?.id,
				payload,
			}),
		);
		if (!user.isPhysioterapist) {
			await dispatch(getSuggestedProgram({ current, functionalGoalsIds }));
		}
		await dispatch(
			getUserById(user.isPhysioterapist ? selectedUser?.id : user?.id),
		);
		setSelectedCards(tempSelectedCards);
		dispatch(setSelectedFunctionalGoalTitle(Object.keys(tempSelectedCards)));
		dispatch(
			setDisplayedFunctionalGoalTitle(
				Object.keys(tempSelectedCards)[0] || null,
			),
		);
		dispatch(setFunctionalModal(false));
	};

	useEffect(() => {
		if (!functionalModal) {
			setSelectedCards(tempSelectedCards);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [functionalModal, selectedUser]);

	const popoverContent = (
		<div>
			{Object.keys(selectedCards).length > 0 ? (
				<div className="popover-content-div">
					{Object.keys(selectedCards).map(title => {
						const iconId = selectedCards[title];
						const iconSrc = iconId ? newImageMapping[iconId] : null;
						const isSelected = displayedFunctionalGoalTitle === title;

						return (
							<div
								key={title}
								className={`function-goal-icon-css ${
									isSelected
										? 'function-goal-icon-selected'
										: 'function-goal-icon-non-selected'
								}`}
								onClick={() =>
									dispatch(setDisplayedFunctionalGoalTitle(title))
								}>
								{iconSrc ? (
									<img
										src={iconSrc}
										alt={title}
										className="w-12 h-12 ml-[2px] cursor-pointer filter brightness-0 invert"
									/>
								) : (
									<Paragraph className="text-white text-sm font-normal">
										{t('admin.patient.noIcon')}
									</Paragraph>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<div
					className="m-2 rounded-md text-center h-16 grid place-items-center"
					style={{ backgroundColor: 'var(--adminmenu-bg-color)' }}>
					<Paragraph className="text-white text-sm font-normal">
						{t('admin.patient.noFunctionalGoals')}
					</Paragraph>
				</div>
			)}
		</div>
	);

	return (
		<div className="user-details-main-container">
			{isVirtualPt && <WellnessCheck />}
			{userDetails?.profile?.weight?.length > 0 && (
				<WeightHistoryChart userDetails={userDetails} />
			)}
			{!isScreening && (
				<ul
					className="mt-2.5"
					style={{
						background: 'var(--user-menu-bg-color)',
						borderRadius: 'var(--radius-lg)',
					}}>
					<div className="functional-button-div mx-3 justify-between">
						<Flex align="center">
							<Target04 width={17} height={17} color="stroke-white" />
							<Flex className="functional-title" align="baseline" gap={40}>
								{t('admin.patient.functionalGoals')}
							</Flex>
						</Flex>
						<div>
							<span
								className="start-session-css text-xs px-2 py-1 rounded-full font-semibold cursor-pointer"
								style={{
									color: 'var(--button-text-color)',
									border: 'inherit',
								}}
								onClick={e => {
									e.stopPropagation();
									dispatch(setFunctionalModal(true));
								}}>
								{t('admin.patient.edit')}
							</span>
						</div>
					</div>
					{displayedFunctionalGoalTitle && (
						<div
							className="m-2 rounded-md text-center h-16 grid place-items-center"
							style={{ backgroundColor: 'var(--adminmenu-bg-color)' }}>
							<Paragraph className="text-white text-sm font-medium">
								{displayedFunctionalGoalTitle}
							</Paragraph>
						</div>
					)}
					<Flex vertical gap={8}>
						{popoverContent}
					</Flex>
					<Modal
						title={
							<>
								<Flex gap={16}>
									<span>
										<Edit05 width={20} height={20} color="stroke-primary-600" />
									</span>
									<span className="titleStyle">
										{t('admin.patient.editFunctionalGoal')}
									</span>
								</Flex>
							</>
						}
						open={functionalModal}
						onCancel={() => {
							setTempSelectedCards(selectedCards);
							dispatch(setFunctionalModal(false));
						}}
						footer={false}
						width={1800}
						className="select-none">
						<Flex
							justify="center"
							gap={10}
							style={{
								marginBottom: '-10px',
							}}>
							{functionalGoalList?.data?.map((feature, index) => (
								<AnimationCard
									key={index}
									{...feature}
									handleCardSelection={handleCardSelect}
									isSelected={!!tempSelectedCards[feature.attributes?.name]}
								/>
							))}
						</Flex>
						<Flex
							justify="center"
							align="center"
							style={{
								marginTop: '30px',
							}}>
							<Button
								size="large"
								type="primary"
								className="back-button-inside-css"
								block
								style={{
									height: '43px',
									background: 'var(--button-color-primary)',
									color: 'var(--text-on-dark)',
									width: '308px',
								}}
								onClick={handleNextClick}>
								{t('Patient.data.onboard.save')}
							</Button>
						</Flex>
					</Modal>
				</ul>
			)}
			{!userDetails?.profile?.consentPolicyRead && <InformedConsentWidget />}
			{!isScreeningOrIntervention && <ManagedBy />}
		</div>
	);
};
export default UserDetails;
