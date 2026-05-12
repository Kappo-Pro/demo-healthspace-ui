import { FaceFrown } from "@vitalflow-icons/users/faceFrown";
import { FaceHappy } from "@vitalflow-icons/users/faceHappy";
import { FaceNeutral } from "@vitalflow-icons/users/faceNeutral";
import { FaceSad } from "@vitalflow-icons/users/faceSad";
import { FaceSmile } from "@vitalflow-icons/users/faceSmile";
import { Flex, Rate, Typography } from 'antd';

const { Paragraph } = Typography;
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface IRating {
  onStopRating: () => void
  selectedRating: number
  setSelectedRating: (value: number) => void
}

const RatingFeedback = (props: IRating) => {
  const { onStopRating, selectedRating, setSelectedRating } = props
  const [hoverIndex, setHoverIndex] = useState(-1);
  const { t } = useTranslation()

  const desc = ['TOO EASY', 'EASY', 'NORMAL', 'HARD', 'TOO HARD'];

  const getColor = (index: unknown) => {
    return index < hoverIndex ? hoverColors[index] : "stroke-white"
  };

  const hoverColors = [
    "stroke-green-200",
    "stroke-green-500",
    "stroke-yellow-200",
    "stroke-yellow-500",
    "stroke-yellow-700",
  ]

  const customIcons: Record<number, React.ReactNode> = {
    0: <FaceHappy color={getColor(0)} width={33} height={33} />,
    1: <FaceSmile color={getColor(1)} width={33} height={33} />,
    2: <FaceNeutral color={getColor(2)} width={33} height={33} />,
    3: <FaceFrown color={getColor(3)} width={33} height={33} />,
    4: <FaceSad color={getColor(4)} width={33} height={33} />,
  };

  const handleRating = (value: number) => {
    setSelectedRating(value)
    onStopRating();
  }

  return (
    <Flex vertical justify="center" align="center">
      <Paragraph className="font-semibold text-lg text-white">{t('Admin.data.rehab.rehabPostAssessment.difficultyExercise')}</Paragraph>
      <Flex className="mt-2" align="center" gap={12}>
        <Paragraph className="!text-white font-semibold text-sm">{t('Admin.data.rehab.rehabPostAssessment.tooEasy')}</Paragraph>
        <Rate
          value={selectedRating}
          defaultValue={3}
          character={({ index }) => (
            <Flex vertical justify="center" align="center">
              {customIcons[index]}
              <Paragraph className="!text-white font-semibold text-sm">{index + 1}</Paragraph>
            </Flex>
          )}
          tooltips={desc}
          onChange={handleRating}
          onHoverChange={(index) => {
            setHoverIndex(index);
          }}
        />
        <Paragraph className="!text-white font-semibold text-sm">{t('Admin.data.rehab.rehabPostAssessment.tooHard')}</Paragraph>
      </Flex>
    </Flex>
  )

}
export default RatingFeedback;