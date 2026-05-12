import { FaceFrown } from '@vitalflow-icons/users/faceFrown';
import { FaceHappy } from '@vitalflow-icons/users/faceHappy';
import { FaceNeutral } from '@vitalflow-icons/users/faceNeutral';
import { FaceSad } from '@vitalflow-icons/users/faceSad';
import { FaceSmile } from '@vitalflow-icons/users/faceSmile';
import { FaceWink } from '@vitalflow-icons/users/faceWink';
import { Flex, Rate as Rating, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

type StrokeColors = string;

const wordToNumber: Record<string, number> = {
	zero: 0,
	one: 1,
	two: 2,
	three: 3,
	four: 4,
	five: 5,
	six: 6,
	seven: 7,
	eight: 8,
	nine: 9,
	ten: 10,
};

const hoverColors: StrokeColors[] = [
	'var(--color-blue-4)',
	'var(--color-success-300)',
	'var(--color-success-500)',
	'var(--color-success-400)',
	'var(--color-yellow-200)',
	'var(--color-yellow-400)',
	'var(--color-orange-300)',
	'var(--color-orange-400)',
	'var(--color-error-500)',
	'var(--color-error-600)',
	'var(--color-error-700)',
];

interface RateProps {
	activeStep: number;
	setActiveStep: (activeStep: number) => void;
	setPainLevel: (painLevel: number) => void;
	savedVoice: string;
}

export const Rate = (props: RateProps) => {
	const { activeStep, setActiveStep, setPainLevel, savedVoice } = props;
	const [hoverIndex, setHoverIndex] = useState(-1);
	const { t } = useTranslation();

	useEffect(() => {
		const spokenNumber = savedVoice.trim().toLowerCase();
		if (Object.prototype.hasOwnProperty.call(wordToNumber, spokenNumber)) {
			const numberValue = wordToNumber[spokenNumber];
			setPainLevel(numberValue);
			setActiveStep(activeStep + 1);
		} else {
			const numericValue = parseInt(spokenNumber);
			if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 10) {
				setPainLevel(numericValue);
				setActiveStep(activeStep + 1);
			}
		}
	}, [savedVoice, activeStep, setActiveStep, setPainLevel]);

	const getColor = (index: number) => {
		return index < hoverIndex ? hoverColors[index] : 'var(--ant-color-text)';
	};

	const ratingIcons = {
		0: <FaceHappy color={getColor(0)} width={36} height={36} />,
		1: <FaceWink color={getColor(1)} width={36} height={36} />,
		2: <FaceSmile color={getColor(2)} width={36} height={36} />,
		3: <FaceSmile color={getColor(3)} width={36} height={36} />,
		4: <FaceNeutral color={getColor(4)} width={36} height={36} />,
		5: <FaceNeutral color={getColor(5)} width={36} height={36} />,
		6: <FaceSad color={getColor(6)} width={36} height={36} />,
		7: <FaceSad color={getColor(7)} width={36} height={36} />,
		8: <FaceFrown color={getColor(8)} width={36} height={36} />,
		9: <FaceFrown color={getColor(9)} width={36} height={36} />,
		10: <FaceFrown color={getColor(10)} width={36} height={36} />,
	};

	const handleRating = (value: number) => {
		setPainLevel(value - 1);
		setActiveStep(activeStep + 1);
	};

	return (
		<Flex vertical align="center">
			<Paragraph className="main-heading-label">
				{t('Admin.data.rehab.rehabPreAssessment.rateYourPain')}
			</Paragraph>
			<div
				style={{
					backgroundColor:
						'color-mix(in srgb, var(--color-gray-50) 10%, transparent)',
				}}>
				<Flex
					justify="space-around"
					align="center"
					style={{ padding: 'var(--spacing-3)' }}>
					<Rating
						count={11}
						character={({ index }) => {
							return (
								<Flex justify="space-around" align="center">
									<Flex vertical align="center">
										<Paragraph>{index}</Paragraph>
										{ratingIcons[index]}
									</Flex>
								</Flex>
							);
						}}
						onChange={handleRating}
						onHoverChange={index => {
							setHoverIndex(index);
						}}
					/>
				</Flex>
			</div>
		</Flex>
	);
};
