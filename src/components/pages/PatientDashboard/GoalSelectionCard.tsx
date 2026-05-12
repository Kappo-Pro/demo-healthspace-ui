import { GOAL_RESTRICTIONS } from '@pages/PatientDashboard/goalRestrictions';
import {
	getProgramExpLevel,
	getProgramSubgoal,
	getProgramTimeAvail,
	getProgramWorkOut,
} from '@stores/clinical/functionalGoals';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { ProgramFilterOptions } from '@types';
import { Flex, Select, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Option } = Select;

type GoalSelection = {
	id: string;
	name: string;
};

type FormDataType = {
	goalSelection: GoalSelection[] | [];
	experienceLevel: GoalSelection[] | [];
	workoutPreference: GoalSelection[] | [];
	timeAvailability: GoalSelection[] | [];
};

interface ExerciseFiltersProps {
	setFilterOptions: (value: ProgramFilterOptions) => void;
	formData: FormDataType;
	setFormData: (value: FormDataType) => void;
	filterOptions: {
		bodyRegionIds: [];
		exerciseCategoriesIds: [];
		jointsIds: [];
		functionalGoalsIds: [];
	};
}
const GoalSelectionCard = ({
	formData,
	setFormData,
	setFilterOptions,
}: ExerciseFiltersProps) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const savedFunctionalGoals = useTypedSelector(
		state => state.onBoard.onBoard.savedFunctionalGoals,
	);
	const { user, selectedUser } = useTypedSelector(state => ({
		user: state.user,
		selectedUser: state.contacts.main.selectedUser,
	}));
	const [matchedTitles, setMatchedTitles] = useState([]);
	const getFunctionalGoals = useTypedSelector(
		state => state.functionalGoals.functionalGoals,
	);
	const [formOptions, setFormOptions] = useState<FormDataType>({
		goalSelection: [],
		experienceLevel: [],
		workoutPreference: [],
		timeAvailability: [],
	});

	const [openForm, setOpenForm] = useState({
		goalSelection: false,
		experienceLevel: false,
		workoutPreference: false,
		timeAvailability: false,
	});
	const checkUser = user.isPhysioterapist ? selectedUser : user;

	const fetchAllOptions = useCallback(async () => {
		const programSubgoal = await dispatch(getProgramSubgoal());
		const programExpLevel = await dispatch(getProgramExpLevel());
		const programWorkOut = await dispatch(getProgramWorkOut());
		const ProgramTimeAvail = await dispatch(getProgramTimeAvail());
		setFormOptions({
			goalSelection: programSubgoal?.payload?.data || [],
			experienceLevel: programExpLevel?.payload?.data || [],
			workoutPreference: programWorkOut?.payload?.data || [],
			timeAvailability: ProgramTimeAvail?.payload?.data || [],
		});
	}, [dispatch]);

	useEffect(() => {
		fetchAllOptions();
	}, [fetchAllOptions]);

	const handleChange = (key: keyof FormDataType, value: unknown) => {
		setOpenForm(prev => ({ ...prev, [key]: false }));
		setFormData(prev => {
			if (key === 'goalSelection') {
				return {
					...prev,
					goalSelection: value,
					experienceLevel: [],
					workoutPreference: [],
					timeAvailability: [],
				};
			}
			return { ...prev, [key]: value };
		});
	};

	useEffect(() => {
		if (matchedTitles) {
			const mergedIds = matchedTitles.flatMap(title => {
				const matchedGoal = getFunctionalGoals?.data.find(
					goal => goal?.name === title,
				);
				return matchedGoal ? [matchedGoal.id] : [];
			});

			setFilterOptions((prev: IProgramFilterOptions) => ({
				...prev,
				functionalGoalsIds: mergedIds,
			}));
		}
	}, [matchedTitles, getFunctionalGoals]);

	useEffect(() => {
		if (!getFunctionalGoals?.data?.length) return;
		const lastGoalGroup = checkUser?.functionalGoals?.at(-1);
		const selectedIds = (lastGoalGroup?.functionalGoalsIds || []).map(id =>
			String(id),
		);

		const titles =
			getFunctionalGoals?.data
				?.filter(goal => selectedIds.includes(String(goal.id)))
				.map(goal => goal?.name) ?? [];

		setMatchedTitles(titles);
	}, [savedFunctionalGoals, checkUser, getFunctionalGoals]);

	const activeGoalName = useMemo(() => {
		if (!formData.goalSelection) return null;
		const goal = formOptions.goalSelection.find(
			({ id }) => String(id) === String(formData.goalSelection),
		);
		return goal?.name || null;
	}, [formData.goalSelection, formOptions.goalSelection]);

	const restrictions = useMemo(
		() => (activeGoalName ? GOAL_RESTRICTIONS[activeGoalName] ?? {} : {}),
		[activeGoalName],
	);

	const applyRestrictions = (options: GoalSelection[], hidden?: string[]) =>
		hidden?.length
			? options.filter(({ name }) => !hidden.includes(name))
			: options;

	const { filteredExperience, filteredWorkout, filteredTime } = useMemo(() => {
		return {
			filteredExperience: applyRestrictions(
				formOptions.experienceLevel,
				restrictions.hideExperience,
			),
			filteredWorkout: applyRestrictions(
				formOptions.workoutPreference,
				restrictions.hideWorkout,
			),
			filteredTime: applyRestrictions(
				formOptions.timeAvailability,
				restrictions.hideTime,
			),
		};
	}, [formOptions, restrictions]);

	return (
		<Flex justify="center" align="center" className="h-full">
			<Flex vertical style={{ width: '100%', padding: 'var(--spacing-20)' }}>
				<Flex align="center" gap={8} style={{ marginBottom: 24 }}>
					<Title level={2} style={{ margin: 0 }}>
						{t('Admin.data.intakeProcess.primaryGoal')}
					</Title>
					{/* <div
						className="cursor-pointer"
						onClick={e => {
							e.stopPropagation();
							dispatch(setFunctionalModal(true));
						}}>
						<EditOutlined />
					</div> */}
				</Flex>

				<Flex
					vertical
					gap="middle"
					style={{ marginBottom: 32 }}
					className="primary-goal-list">
					{matchedTitles.map((title, index) => (
						<div key={index}>{title}</div>
					))}
				</Flex>
			</Flex>

			<Flex
				vertical
				className="select-features-program h-full"
				justify="center"
				gap="large"
				style={{
					width: '100%',
					padding: 'var(--spacing-20)',
				}}>
				<div className="goal-selection-card">
					<Flex vertical>
						<Text strong style={{ marginBottom: 8 }}>
							{t('Admin.data.intakeProcess.step1')}
						</Text>
						<Select
							allowClear
							placeholder={t('Admin.data.intakeProcess.step1Placeholder')}
							className=" theme-select-dropdown select-subgoal-drp"
							style={{ width: '100%' }}
							value={formData.goalSelection || []}
							open={openForm.goalSelection}
							onDropdownVisibleChange={visible =>
								setOpenForm(prev => ({ ...prev, goalSelection: visible }))
							}
							onChange={value => handleChange('goalSelection', value)}>
							{formOptions?.goalSelection?.map(option => (
								<Option key={option.id} value={option.id}>
									{option.name}
								</Option>
							))}
						</Select>
					</Flex>

					<Flex vertical>
						<Text
							strong
							style={{
								marginBottom: 8,
								marginTop: 18,
							}}>
							{t('Admin.data.intakeProcess.step2')}
						</Text>
						<Select
							allowClear
							mode="multiple"
							placeholder={t('Admin.data.intakeProcess.step2Placeholder')}
							className="theme-select-dropdown select-subgoal-drp"
							style={{ width: '100%' }}
							value={formData.experienceLevel || []}
							open={openForm.experienceLevel}
							onDropdownVisibleChange={visible =>
								setOpenForm(prev => ({ ...prev, experienceLevel: visible }))
							}
							onChange={value => handleChange('experienceLevel', value)}>
							{filteredExperience?.map(option => (
								<Option key={option.id} value={option.id}>
									{option.name}
								</Option>
							))}
						</Select>
					</Flex>

					<Flex vertical>
						<Text
							strong
							style={{
								marginBottom: 8,
								marginTop: 18,
							}}>
							{t('Admin.data.intakeProcess.step3')}
						</Text>
						<Select
							allowClear
							mode="multiple"
							placeholder={t('Admin.data.intakeProcess.step3Placeholder')}
							className="theme-select-dropdown select-subgoal-drp"
							style={{ width: '100%' }}
							value={formData.workoutPreference || []}
							open={openForm.workoutPreference}
							onDropdownVisibleChange={visible =>
								setOpenForm(prev => ({ ...prev, workoutPreference: visible }))
							}
							onChange={value => handleChange('workoutPreference', value)}>
							{filteredWorkout?.map(option => (
								<Option key={option.id} value={option.id}>
									{option.name}
								</Option>
							))}
						</Select>
					</Flex>

					<Flex vertical>
						<Text
							strong
							style={{
								marginBottom: 8,
								marginTop: 18,
							}}>
							{t('Admin.data.intakeProcess.step4')}
						</Text>
						<Select
							allowClear
							mode="multiple"
							placeholder={t('Admin.data.intakeProcess.step4placeholder')}
							className="theme-select-dropdown select-subgoal-drp"
							style={{ width: '100%' }}
							value={formData.timeAvailability || []}
							open={openForm.timeAvailability}
							onDropdownVisibleChange={visible =>
								setOpenForm(prev => ({ ...prev, timeAvailability: visible }))
							}
							onChange={value => handleChange('timeAvailability', value)}>
							{filteredTime?.map(option => (
								<Option key={option.id} value={option.id}>
									{option.name}
								</Option>
							))}
						</Select>
					</Flex>
				</div>
			</Flex>
		</Flex>
	);
};

export default GoalSelectionCard;
