import { FaceFrown } from '@vitalflow-icons/users/faceFrown';
import { FaceHappy } from '@vitalflow-icons/users/faceHappy';
import { FaceNeutral } from '@vitalflow-icons/users/faceNeutral';
import { FaceSad } from '@vitalflow-icons/users/faceSad';
import { FaceSmile } from '@vitalflow-icons/users/faceSmile';
import { RebhabProgramExercise } from '@types';
import { Flex, Rate, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

interface IRating {
	selectedRating: number;
	exercise: RebhabProgramExercise[];
	onRatingChange: (rating: number) => void;
}

const RateExercise = (props: IRating) => {
	const { selectedRating, onRatingChange } = props;
	const [hoverIndex, setHoverIndex] = useState(-1);
	const { t } = useTranslation();

	const desc = ['TOO EASY', 'EASY', 'NORMAL', 'HARD', 'TOO HARD'];

	const hoverColors = [
		'var(--color-success-300)',
		'var(--color-success-500)',
		'var(--color-yellow-400)',
		'var(--color-orange-400)',
		'var(--color-error-400)',
	];

	const getColor = (index: number) => {
		if (hoverIndex >= 0)
			return index == hoverIndex ? hoverColors[index] : 'var(--ant-color-text)';
		return index + 1 == selectedRating
			? hoverColors[index]
			: 'var(--ant-color-text)';
	};

	const customIcons: Record<number, React.ReactNode> = {
		0: <FaceHappy color={getColor(0)} width={33} height={33} />,
		1: <FaceSmile color={getColor(1)} width={33} height={33} />,
		2: <FaceNeutral color={getColor(2)} width={33} height={33} />,
		3: <FaceFrown color={getColor(3)} width={33} height={33} />,
		4: <FaceSad color={getColor(4)} width={33} height={33} />,
	};

	const handleRating = (value: number) => {
		onRatingChange(value);
	};

	return (
		<Flex vertical justify="center" align="center">
			<Flex align="center" gap={12}>
				<Typography>
					{t('Admin.data.addNotes.tooEasy').toUpperCase()}
				</Typography>
				<Rate
					value={selectedRating}
					character={({ index }) => (
						<Flex vertical justify="center" align="center">
							{customIcons[index]}
						</Flex>
					)}
					tooltips={desc}
					onChange={handleRating}
					onHoverChange={index => setHoverIndex(index - 1)}
				/>
				<Typography>
					{t('Admin.data.addNotes.tooHard').toUpperCase()}
				</Typography>
			</Flex>
		</Flex>
	);
};

export default RateExercise;
