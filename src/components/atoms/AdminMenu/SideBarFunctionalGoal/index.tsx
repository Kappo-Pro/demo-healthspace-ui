import { newImageMapping } from '@atoms/AdminMenu/FunctionalGoals/ImageMapping';
import { UntitledIcon } from '@atoms/Icon';
import AnimationCard from '@pages/PatientOnboard/FunctionalGoals/AnimationCard';
import { FEATURES_MOCK } from '@pages/PatientOnboard/FunctionalGoals/FeaturesMock';
import { getUserById } from '@stores/activity/contacts/contacts';
import { getUser } from '@stores/shared/user';
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
import { Button, Flex, Modal, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';

const { Paragraph } = Typography;

interface UserProps {
	userDetails?: Record<string, unknown>;
	functionalData?: [] | undefined;
}

export const SideBarFunctionalGoal = (props: UserProps) => {
	const { userDetails } = props;
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const { user, selectedUser } = useTypedSelector(state => ({
		user: state.user,
		selectedUser: state.contacts.main.selectedUser,
	}));
	const isAdmin = user.profile.role === USER_ROLES.ADMIN;
	const isSuperAdmin = user.profile.role === USER_ROLES.SUPER_ADMIN;
	const savedUserPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans,
	);
	const planType = savedUserPlans?.planType;
	const isScreening = planType === PLANS.SCREENING;
	const functionalModal = useTypedSelector(
		state => state.onBoard.onBoard.functionalModal,
	);
	const displayedFunctionalGoalTitle = useTypedSelector(
		state => state.onBoard.onBoard.displayedFunctionalGoalTitle,
	);
	const [savedData, setSavedData] = useState({});
	const [selectedCards, setSelectedCards] = useState<Record<string, number[]>>(
		{},
	);
	const [tempSelectedCards, setTempSelectedCards] =
		useState<Record<string, number[]>>(selectedCards);
	const [functionalGoalList, setFunctionalGoalList] = useState<GetDetails>();
	const getFunctionalGoalsData = useTypedSelector(
		state => state.functionalGoals.functionalGoals,
	);
	const functionalGoals = useTypedSelector(
		state => state.settings.content.functionalGoals,
	);


	useEffect(() => {
		const updatedGoals = getFunctionalGoalsData?.data.map(goal => {
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
						matched?.description ||
						t(`Patient.data.functionalGoals.description-${goal?.id}`) ||
						'',
					thumbnail: matched?.thumbnail || '',
					personaImage: matchedMock?.personaImage || '',
				},
			};
		});

		setFunctionalGoalList({
			data: updatedGoals,
			// TODO: Consider using meta ?? defaultValue or meta?.property instead of meta!
			meta: getFunctionalGoalsData?.meta,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getFunctionalGoalsData, functionalGoals]); // t intentionally excluded - static translation function

	// For regular users, selectedUser is populated by getUserById in AppLayoutWrapper
	// For admin/physio, selectedUser is the patient they're viewing
	useEffect(() => {
		const userFunctionalGoals = user.isPhysioterapist
			? selectedUser?.functionalGoals
			: user?.functionalGoals;
		// Get the last functional goals entry (functionalGoals is an array of goal sets)
		const lastGoals = userFunctionalGoals?.[userFunctionalGoals?.length - 1];
		setSavedData(lastGoals);
	}, [user.isPhysioterapist, selectedUser?.functionalGoals, user?.functionalGoals]);


	useEffect(() => {
		let savedIds: number[] = [];
		if (savedData?.functionalGoalsIds?.length) {
			savedIds = savedData?.functionalGoalsIds;
		} else if (selectedUser?.functionalGoals?.length) {
			const lastIndex = selectedUser.functionalGoals.length - 1;
			savedIds =
				selectedUser.functionalGoals[lastIndex]?.functionalGoalsIds || [];
		}
		if (savedIds.length > 0 && Array.isArray(functionalGoalList?.data)) {
			const preSelectedCards: Record<string, number[]> = {};

			functionalGoalList.data.forEach(({ id, attributes }) => {
				if (savedIds.includes(id)) {
					preSelectedCards[attributes.name] = [id];
				}
			});

			setSelectedCards(preSelectedCards);
		} else {
			setSelectedCards({});
		}
	}, [savedData, selectedUser, functionalGoalList]);

	useEffect(() => {
		setTempSelectedCards(selectedCards);
	}, [selectedCards, selectedUser]);

	useEffect(() => {
		const selectedTitles = Object.keys(selectedCards);
		dispatch(setSelectedFunctionalGoalTitle(selectedTitles));
		dispatch(setDisplayedFunctionalGoalTitle(selectedTitles[0] || null));
	}, [selectedCards, dispatch, selectedUser]);

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
			// Update user state for regular users so sidebar reflects changes
			await dispatch(getUser(user?.id));
		} else {
			await dispatch(getUserById(selectedUser?.id));
		}
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
									<img src={iconSrc} alt={title} className="saved-icon" />
								) : (
									<Typography>{t('admin.patient.noIcon')}</Typography>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<div className="functional-check-card">
					<Typography>{t('admin.patient.noFunctionalGoals')}</Typography>
				</div>
			)}
		</div>
	);

	return (
		<>
			<div className="functional-check-card">
				<Flex align="center" justify="space-between">
					<Flex className="functional-title" align="baseline" gap={40}>
						{t('admin.patient.functionalGoals')}
					</Flex>
					<Button
						onClick={e => {
							e.stopPropagation();
							dispatch(setFunctionalModal(true));
						}}>
						{t('admin.patient.edit')}
					</Button>
				</Flex>
				{displayedFunctionalGoalTitle && (
					<div className="functional-check-card">
						<Typography>{displayedFunctionalGoalTitle}</Typography>
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
									<UntitledIcon name="edit" />
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
					<div className="functional-card-div">
						{functionalGoalList?.data?.map((feature, index) => (
							<AnimationCard
								key={index}
								{...feature}
								handleCardSelection={handleCardSelect}
								isSelected={!!tempSelectedCards[feature.attributes?.name]}
							/>
						))}
					</div>
					<Flex
						justify="center"
						align="center"
						style={{
							marginTop: '30px',
						}}>
						<Button size="large" type="primary" onClick={handleNextClick}>
							{t('Patient.data.onboard.save')}
						</Button>
					</Flex>
				</Modal>
			</div>
		</>
	);
};
