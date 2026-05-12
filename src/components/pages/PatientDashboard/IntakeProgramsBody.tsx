import ImgFront from '@atoms/BodyFront';
import { getJoints } from '@stores/clinical/functionalGoals';
import { INTAKE_BODYPOINTS } from '@stores/constants';
import { useTypedDispatch } from '@stores/index';
import { TOmniromSelectedExercise } from '@types';
import { Flex, Select, Space, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JointsBodyPartMapping } from './ProgramGroup';
import './style.css';

const { Title } = Typography;

export interface BodyPoint {
	setSelectedDropdown: React.Dispatch<React.SetStateAction<string>>;
	selectedDropdown: string;
}

const BodyPage = ({ setSelectedDropdown, selectedDropdown }: BodyPoint) => {
	const dispatch = useTypedDispatch();
	const [activePart, setActivePart] = useState<string[]>([]);
	const [_selectedBodyPointOptions, _setSelectedBodyPointOptions] = useState(
		[],
	);
	const [dropdownOptions, setDropdownOptions] = useState([]);
	const [_savedExercise, setSavedExercise] =
		useState<TOmniromSelectedExercise>();

	const fetchingDataforFilters = useCallback(async () => {
		const data = await dispatch(getJoints());
		setDropdownOptions(data?.payload?.data);
	}, [dispatch]);

	useEffect(() => {
		fetchingDataforFilters();
	}, [fetchingDataforFilters]);

	const highlightArea = (bodyParts: string | string[]) => {
		const el = document.getElementById('highlght');
		if (el) {
			el.classList.remove(
				'upper',
				'right',
				'left',
				'full',
				'lower',
				'spine',
				'baseline',
			);
		}

		const partsArray = Array.isArray(bodyParts) ? bodyParts : [bodyParts];
		const normalizedParts = partsArray.map(p => p.toLowerCase());

		setActivePart(normalizedParts);

		if (el && normalizedParts.includes('spine')) {
			el.classList.add('spine');
		}
	};

	const setActiveHighlight = (part: string) => {
		const lowerCasePart = part.toLowerCase();
		return activePart.includes(lowerCasePart)
			? 'hotspot-circle active'
			: 'hotspot-circle';
	};

	const activeStyle = { display: 'inline' };
	const notActiveStyle = { display: 'none' };
	const { t } = useTranslation();

	useEffect(() => {
		if (selectedDropdown && dropdownOptions.length > 0) {
			const selectedExercise = dropdownOptions.find(
				ex => ex.id === selectedDropdown,
			);
			if (selectedExercise) {
				const bodyParts =
					JointsBodyPartMapping[selectedExercise?.name] || 'full';
				highlightArea(bodyParts);
			}
		}
	}, [selectedDropdown, dropdownOptions]);

	return (
		<Flex justify="center" align="center" className="h-full">
			<Flex vertical style={{ width: '100%', padding: '50px 80px' }}>
				<Title level={2} style={{ marginBottom: 24 }}>
					{t('Admin.data.intakeProcess.selectBodyRegion')}
				</Title>
				<Select
					className="select-features-dropdown theme-select-dropdown"
					placeholder={t('Admin.data.intakeProcess.selectExercise')}
					options={dropdownOptions?.map(
						(exercise): { label: string; value: string } => ({
							label: exercise?.name,
							value: exercise?.id,
						}),
					)}
					popupMatchSelectWidth={false}
					allowClear
					value={selectedDropdown || undefined}
					onChange={value => {
						setSelectedDropdown(value);
						const selectedExercise = dropdownOptions?.find(
							ex => ex?.id === value,
						);
						if (selectedExercise) {
							setSavedExercise(selectedExercise);
							const bodyParts =
								JointsBodyPartMapping[selectedExercise?.name] || 'full';
							if (Array.isArray(bodyParts)) {
								bodyParts.forEach(part => highlightArea(part));
							} else {
								highlightArea(bodyParts);
							}
						}
					}}
				/>
			</Flex>
			<Space
				align="center"
				className="select-features-program feature-styles h-full"
				direction="vertical"
				size="middle">
				<div className="inline-block" style={{ position: 'relative' }}>
					<div
						className="area-highlight"
						id="highlght"
						style={activePart ? activeStyle : notActiveStyle}></div>
					<ImgFront color="var(--stroke-default-white)" width={180} />
					{INTAKE_BODYPOINTS.map((hotspot, index) => (
						<div
							key={index}
							style={hotspot.styles}
							className={setActiveHighlight(hotspot.part.toLowerCase())}></div>
					))}
				</div>
			</Space>
		</Flex>
	);
};

export default BodyPage;
