import React, { useEffect } from 'react';
import { Button, Radio, Typography } from 'antd';

const { Paragraph } = Typography;
import { ProgramFilterOptions, TSideFilters } from '@types';
import { useTypedDispatch } from '@stores/index';
import { setSelectedSideName } from '@stores/clinical/functionalGoals';

interface ExerciseFilterSectionProps {
	keyTitle: string;
	title: string;
	options: {
		id: number;
		name: string;
		attributes?: {
			name: string;
		};
	}[];
	isRadio?: boolean;
	handleOptionClick?: (id: number) => void;
	filterExercise?: string;
	setFilterExercise?: (value: string) => void;
	filterOptions: Record<string, number[]>;
	setFilterOptions: (value: ProgramFilterOptions) => void;
	disabledJoints: number[];
	filterSides: TSideFilters[];
}

const ExerciseFilterSection: React.FC<ExerciseFilterSectionProps> = ({
	keyTitle,
	title,
	options,
	isRadio = false,
	filterExercise,
	setFilterExercise,
	filterOptions,
	setFilterOptions,
	disabledJoints,
	filterSides,
}) => {
	const selectedIds = filterOptions[keyTitle] || [];
	const dispatch = useTypedDispatch();

	const handleButtonClick = (id: number) => {
		if (keyTitle === 'jointsIds' && disabledJoints?.includes(id)) {
			return;
		}
		const isSelected = selectedIds?.includes(id);
		if (keyTitle === 'sideIds') {
			if (isSelected) {
				const updatedSelectedIds = selectedIds?.filter(
					selectedId => selectedId !== id,
				);
				setFilterOptions({
					...filterOptions,
					[keyTitle]: updatedSelectedIds,
				});
				dispatch(setSelectedSideName(''));
			} else {
				setFilterOptions({
					...filterOptions,
					[keyTitle]: [id],
				});
				const selectedSide = filterSides?.find(side => side?.id === id);
				if (selectedSide) {
					dispatch(setSelectedSideName(selectedSide.attributes.name));
				}
			}
		} else {
			if (isSelected) {
				const updatedSelectedIds = selectedIds.filter(
					selectedId => selectedId !== id,
				);
				setFilterOptions({
					...filterOptions,
					[keyTitle]: updatedSelectedIds,
				});
			} else {
				const updatedSelectedIds = [...selectedIds, id];
				setFilterOptions({
					...filterOptions,
					[keyTitle]: updatedSelectedIds,
				});
			}
		}
	};

	useEffect(() => {
		if (keyTitle === 'jointsIds') {
			const updatedSelectedIds = selectedIds?.filter(
				id => !disabledJoints?.includes(id),
			);
			if (updatedSelectedIds?.length !== selectedIds?.length) {
				setFilterOptions({
					...filterOptions,
					[keyTitle]: updatedSelectedIds,
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [disabledJoints, keyTitle]);

	return (
		<div className="section">
			<span className="section-title">{title}</span>
			{isRadio ? (
				<Radio.Group
					className="radio-group"
					style={{ width: '200px', marginTop: 'var(--spacing-2)' }}
					value={filterExercise}
					onChange={e => setFilterExercise?.(e.target.value)}>
					{options?.map(option => (
						<Radio
							key={option?.id}
							value={option?.name || option?.attributes?.name}>
							<Paragraph className="radio-group-label">
								{option?.name || option?.attributes?.name}
							</Paragraph>
						</Radio>
					))}
				</Radio.Group>
			) : (
				<div className="button-group-exercise-filter">
					{options?.map(option => {
						const isDisabled =
							keyTitle === 'jointsIds' && disabledJoints?.includes(option?.id);
						const isSelected = selectedIds?.includes(option?.id) && !isDisabled;
						return (
							<Button
								key={option?.id}
								className={`filter-button-css-item ${isSelected ? 'selected' : ''}`}
								onClick={() => handleButtonClick(option.id)}
								disabled={isDisabled}>
								{option?.name || option?.attributes?.name}
							</Button>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ExerciseFilterSection;
