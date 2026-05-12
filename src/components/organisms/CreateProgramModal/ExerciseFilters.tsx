import { UntitledIcon } from '@atoms/Icon';
import { setPopoverState } from '@stores/clinical/functionalGoals';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { ProgramFilterOptions, TSideFilters } from '@types';
import { Badge, Col, Flex, Popover, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExerciseFilterSection from './ExerciseFilterSection';
import './style.css';

const { Paragraph } = Typography;

interface ExerciseFiltersProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	setFilterOptions: (value: ProgramFilterOptions) => void;
	handleApply: (value: number) => void;
	filterExercise: string;
	activeKey: string;
	setFilterExercise: (value: string) => void;
	filterOptions: {
		bodyRegionIds: [];
		exerciseCategoriesIds: [];
		jointsIds: [];
		functionalGoalsIds: [];
		sideIds: [];
	};
}

export const ExerciseFilters = ({
	filterExercise,
	filterOptions,
	setFilterOptions,
	handleApply,
}: ExerciseFiltersProps) => {
	const filterBodyRegion = useTypedSelector(
		state => state?.functionalGoals?.bodyRegions?.data,
	);
	const filterExerciseCategories = useTypedSelector(
		state => state.functionalGoals?.categories?.data,
	);
	const filterJoints = useTypedSelector(
		state => state.functionalGoals?.joints?.data,
	);
	const filterFunctionalGoals = useTypedSelector(
		state => state?.functionalGoals?.functionalGoals?.data,
	);
	const jointWithBodyRegion = useTypedSelector(
		state => state?.functionalGoals?.jointWithBodyRegion?.data,
	);
	const popoverState = useTypedSelector(
		state => state.functionalGoals.popoverState,
	);
	const { t } = useTranslation();

	const filterSides: TSideFilters[] = [
		{
			id: '1',
			attributes: {
				name: t(
					'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.left',
				),
			},
		},
		{
			id: '2',
			attributes: {
				name: t(
					'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.right',
				),
			},
		},
		{
			id: '3',
			attributes: {
				name: t(
					'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.both',
				),
			},
		},
	];
	const dispatch = useTypedDispatch();
	const [totalOptionsCount, setTotalOptionsCount] = useState(0);
	const [disabledJoints, setDisabledJoints] = useState<number[]>([]);

	useEffect(() => {
		const selectedBodyRegionIds = filterOptions?.bodyRegionIds;
		let selectedJoints: number[] = [];
		if (selectedBodyRegionIds?.length > 0) {
			selectedJoints = jointWithBodyRegion
				?.filter(bodyRegion => selectedBodyRegionIds?.includes(bodyRegion?.id))
				?.flatMap(bodyRegion => bodyRegion?.joints?.map(joint => joint?.id));
		} else {
			selectedJoints = filterJoints?.map(joint => joint?.id);
		}
		const disabledJoints = filterJoints
			?.filter(joint => !selectedJoints?.includes(joint?.id))
			?.map(joint => joint?.id);
		setDisabledJoints(disabledJoints);
	}, [filterOptions.bodyRegionIds, jointWithBodyRegion, filterJoints]);

	const filterSections = [
		{
			key: 'bodyRegionIds',
			title: t(
				'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.region',
			),
			keyTitle: 'bodyRegionIds',
			options: filterBodyRegion,
		},
		{
			key: 'sideIds',
			title: t(
				'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.side',
			),
			keyTitle: 'sideIds',
			options: filterSides,
		},
		{
			key: 'jointsIds',
			title: t(
				'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.joint',
			),
			keyTitle: 'jointsIds',
			options: filterJoints,
		},
		{
			key: 'exerciseCategoriesIds',
			title: t(
				'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.category',
			),
			keyTitle: 'exerciseCategoriesIds',
			options: filterExerciseCategories,
		},
		{
			key: 'functionalGoalsIds',
			title: t(
				'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.functionalGoals',
			),
			keyTitle: 'functionalGoalsIds',
			options: filterFunctionalGoals,
		},
	];

	const handleOptionClick = (key: string, id: number) => {
		setFilterOptions(prevSelectedOptions => {
			const currentOptions = prevSelectedOptions[key] || [];
			const isOptionSelected = currentOptions.includes(id);

			return {
				...prevSelectedOptions,
				[key]: isOptionSelected
					? currentOptions.filter((selectedId: number) => selectedId !== id)
					: [...currentOptions, id],
			};
		});
	};

	const handleReset = () => {
		setFilterOptions({
			bodyRegionIds: [],
			exerciseCategoriesIds: [],
			jointsIds: [],
			functionalGoalsIds: [],
			sideIds: [],
		});
	};

	useEffect(() => {
		const totalCount = Object.keys(filterOptions)?.reduce((count, key) => {
			let filteredOptions = filterOptions[key] || [];
			if (key === 'jointsIds') {
				filteredOptions = filteredOptions?.filter(
					(id: number) => !disabledJoints?.includes(id),
				);
			}
			return count + filteredOptions?.length;
		}, 0);
		setTotalOptionsCount(totalCount);
	}, [filterOptions, disabledJoints]);

	return (
		<div style={{ width: '160px' }}>
			<Popover
				placement="bottomLeft"
				open={popoverState}
				content={
					<div className="filter-popover-content">
						<div className="filter-header">
							{filterExercise !== 'My Exercises' &&
								filterExercise !== 'My Templates' && (
									<div className="filter-reset-button" onClick={handleReset}>
										{t(
											'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.reset',
										)}
									</div>
								)}
						</div>
						<div className="filter-body">
							{filterExercise !== 'My Exercises' &&
								filterExercise !== 'My Templates' && (
									<>
										<Flex>
											<Col span={12}>
												<ExerciseFilterSection
													key={filterSections[0].key}
													title={filterSections[0].title}
													keyTitle={
														filterSections[0].keyTitle ?? 'bodyRegionIds'
													}
													options={filterSections[0].options}
													handleOptionClick={id =>
														handleOptionClick(filterSections[0].key, id)
													}
													filterOptions={filterOptions}
													setFilterOptions={setFilterOptions}
													disabledJoints={disabledJoints}
												/>
											</Col>
											<Col span={12}>
												<ExerciseFilterSection
													key={filterSections[1].key}
													title={filterSections[1].title}
													keyTitle={filterSections[1].keyTitle ?? 'sideIds'}
													options={filterSections[1].options}
													handleOptionClick={id =>
														handleOptionClick(filterSections[1].key, id)
													}
													filterOptions={filterOptions}
													setFilterOptions={setFilterOptions}
													filterSides={filterSides}
												/>
											</Col>
										</Flex>
										{[2, 3, 4].map(index => (
											<Row key={filterSections[index].key}>
												<div>
													<ExerciseFilterSection
														title={filterSections[index].title}
														keyTitle={filterSections[index].keyTitle ?? ''}
														options={filterSections[index].options}
														handleOptionClick={id =>
															handleOptionClick(filterSections[index].key, id)
														}
														filterOptions={filterOptions}
														setFilterOptions={setFilterOptions}
														disabledJoints={disabledJoints}
													/>
												</div>
											</Row>
										))}
									</>
								)}
						</div>
						<div className="filter-actions">
							<div
								className="filter-apply-button"
								onClick={() => {
									handleApply(1);
								}}>
								<Typography.Text
									style={{
										color: 'var(--text-on-brand)',
										fontWeight: 'var(--font-weight-semibold)',
									}}>
									{t(
										'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.apply',
									)}
								</Typography.Text>
							</div>
							<div
								className="filter-cancel-button"
								onClick={() => {
									dispatch(setPopoverState(false));
									handleReset();
								}}>
								<Typography.Text
									style={{
										color: 'var(--text-on-brand)',
										fontWeight: 'var(--font-weight-semibold)',
									}}>
									{t('Admin.data.menu.userRoles.pendingInvites.cancel')}
								</Typography.Text>
							</div>
						</div>
					</div>
				}>
				<Flex
					onClick={() => {
						dispatch(setPopoverState(!popoverState));
					}}
					className="filter-popover-trigger"
					justify="space-between"
					align="center">
					<Flex align="center" justify="center" gap={8}>
						<Typography.Text
							style={{
								fontWeight: 'var(--font-weight-medium)',
								color: 'var(--text-secondary)',
							}}>
							{t(
								'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.filters',
							)}
						</Typography.Text>
						{totalOptionsCount > 0 && (
							<Badge count={totalOptionsCount} color="var(--brand-secondary)" />
						)}
					</Flex>
					{popoverState ? (
						<UntitledIcon name="chevronUp" />
					) : (
						<UntitledIcon name="chevronDown" />
					)}
				</Flex>
			</Popover>
		</div>
	);
};
