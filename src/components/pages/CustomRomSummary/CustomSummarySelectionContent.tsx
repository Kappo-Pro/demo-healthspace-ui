import { RomPatientResult } from '@types';
import { Empty, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import CustomSummaryContent from './CustomSummaryContent';
import CustomSummaryContentResult from './CustomSummaryContentResult';

const { Title } = Typography;

interface ICustomSummarySelectionContent {
	item: RomPatientResult[];
}

const CustomSummarySelectionContent = (
	props: ICustomSummarySelectionContent,
) => {
	const { item } = props;
	const { t } = useTranslation();

	const hasResults = item.some(
		exercise => exercise.results && exercise.results.length > 0,
	);
	const hasRomExercise = item.some(
		exercise => exercise.romProgramexercise && exercise.romProgramexercise.id,
	);

	return (
		<>
			{hasResults ? (
				<CustomSummaryContentResult item={item} />
			) : hasRomExercise ? (
				<CustomSummaryContent item={item} />
			) : (
				<Empty />
			)}
		</>
	);
};

export default CustomSummarySelectionContent;
