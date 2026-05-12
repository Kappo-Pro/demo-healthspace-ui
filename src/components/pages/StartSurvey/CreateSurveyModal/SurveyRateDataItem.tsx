import { UntitledIcon } from '@atoms/Icon';
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCorners,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { NewOptionProps, SurveyRateDataProps } from '@types';
import { Button, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SurveyQuestionOptionItem } from './SurveyQuestionOptionItem';

const { Paragraph } = Typography;

const ratingExps = [
	<UntitledIcon name="face-frown" size={45} color="var(--color-error-700)" />,
	<UntitledIcon name="face-frown" size={45} color="var(--color-error-500)" />,
	<UntitledIcon name="face-sad" size={45} color="var(--color-warning-500)" />,
	<UntitledIcon name="face-sad" size={45} color="var(--color-warning-400)" />,
	<UntitledIcon name="face-neutral" size={45} color="var(--color-warning-600)" />,
	<UntitledIcon name="face-neutral" size={45} color="var(--color-warning-300)" />,
	<UntitledIcon name="face-smile" size={45} color="var(--color-success-300)" />,
	<UntitledIcon name="face-smile" size={45} color="var(--color-success-500)" />,
	<UntitledIcon name="face-wink" size={45} color="var(--color-success-700)" />,
	<UntitledIcon name="face-happy" size={45} color="var(--color-info-500)" />,
];

export default function SurveyRateDataItem(props: SurveyRateDataProps) {
	const {
		survey,
		handleDeleteRate,
		handleReset,
		question,
		isEdit,
		ratingOptions,
		handleDragEnd,
		index,
		setIsEdit,
		updateOptionByIndex,
		handleScoreChange,
		handleInputChange,
		updateOptionTitle,
		addOptionsByIndex,
		deleteOptionByIndex,
		_addRatingOptionByIndex,
	} = props;
	const [idCounter, setIdCounter] = useState(1);
	const { t } = useTranslation();
	const [answerValue, setAnswerValue] = useState<string>();
	const [score, setScore] = useState<number>();
	const showReset = ratingOptions?.filter(rate => !rate?.isDeleted)?.length < 7;

	const validateRating = () => {
		if (
			ratingOptions.some(
				rate =>
					(rate.option == '' && rate?.isDeleted == false) ||
					(question?.scored && isNaN(rate.score) && rate?.isDeleted == false),
			)
		) {
			message.warning(t('Admin.data.survey.errRateEmpty'));
		} else {
			updateOptionByIndex(index, ratingOptions);
			setIsEdit(false);
		}
	};

	const handleAnswer = () => {
		if (answerValue?.trim() === '') {
			message.error(t('Admin.data.survey.answerEmptyError'));
		} else if (question?.scored && (score === undefined || isNaN(score))) {
			message.error(t('Admin.data.survey.scoreEmptyError'));
		} else {
			const newOption: NewOptionProps = {
				id: idCounter.toString(),
				option: answerValue || '',
				score: score || 0,
			};
			addOptionsByIndex(index, newOption);
			setAnswerValue('');
			setIdCounter(idCounter + 1);
			setScore(0);
		}
	};

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	return (
		<div className="survey-rate-data-item">
			{question?.questionType === 'rate' ? (
				<div className="rate-section">
					<div className="rate-items">
						{[...Array(10)].map((_, i) => {
							if (ratingOptions[i]?.isDeleted != true)
								return (
									<span
										className={`rate-item ${isEdit ? 'edit-mode' : 'view-mode'}`}>
										{ratingExps[i]}
										<div style={{ width: '90%' }}>
											<Paragraph style={{ marginBottom: 4 }}>
												{t('Admin.data.survey.answerTitle')}
											</Paragraph>
											{isEdit ? (
												<Input
													className="w-full"
													className="input"
													value={ratingOptions[i]?.option}
													onChange={e => handleInputChange(i, e.target.value)}
													readOnly={survey?.clinicallyValidated}
												/>
											) : (
												<Paragraph className="display-input">
													{ratingOptions[i]?.option}
												</Paragraph>
											)}
										</div>
										{question?.scored && (
											<div style={{ width: '10%' }}>
												<Paragraph style={{ marginBottom: 4 }}>
													{t('Admin.data.survey.scoreTitle')}
												</Paragraph>
												{isEdit ? (
													<Input
														className="w-full"
														className="input score-input"
														value={ratingOptions[i]?.score}
														type="number"
														readOnly={survey?.clinicallyValidated}
														onChange={e =>
															handleScoreChange(i, parseInt(e.target.value))
														}
													/>
												) : (
													<p
														className="w-full"
														className="display-input score-display">
														{ratingOptions[i]?.score}
													</p>
												)}
											</div>
										)}
										{ratingOptions?.filter(item => item?.isDeleted == false)
											.length > 2 &&
											isEdit &&
											!survey?.clinicallyValidated && (
												<span
													className="delete-rate-item"
													onClick={() => handleDeleteRate(i)}>
													<UntitledIcon name="delete" size={20} />
												</span>
											)}
									</span>
								);
						})}
					</div>
					{!survey?.clinicallyValidated && (
						<div className="action-button">
							{!isEdit ? (
								<Button onClick={() => setIsEdit(true)} size="small">
									<span className="button-content">
										<UntitledIcon name="edit" size={17} />
										{t('Admin.data.survey.edit')}
									</span>
								</Button>
							) : (
								<div className="reset-button-div">
									{showReset && (
										<Button
											onClick={() => handleReset()}
											style={{ marginRight: 'var(--spacing-2-5)' }}>
											<span className="button-content">
												<UntitledIcon name="refresh-ccw-01" size={17} />
												Reset
											</span>
										</Button>
									)}
									<Button onClick={() => validateRating()}>
										<span className="button-content">
											<UntitledIcon name="check" size={20} />
											{t('Admin.data.survey.save')}
										</span>
									</Button>
								</div>
							)}
						</div>
					)}
				</div>
			) : (
				<div className="add-answer-section">
					{!survey?.clinicallyValidated && (
						<>
							<div className="title-section">
								<Paragraph>{t('Admin.data.survey.answerTitle')}</Paragraph>
								<Input
									className="answer-input"
									value={answerValue}
									onChange={e => setAnswerValue(e.target.value)}
								/>
							</div>
							<div className="score-section">
								{question?.scored && (
									<Paragraph>{t('Admin.data.survey.score')}</Paragraph>
								)}
								<div className="score-input-section">
									{question?.scored && (
										<Input
											type="number"
											className="score-input"
											onChange={e => {
												const value = e.target.value;
												setScore(parseInt(value));
											}}
											value={score}
										/>
									)}
									<Button onClick={() => handleAnswer()} size="large">
										<span className="button-content">
											<UntitledIcon name="plus" size={20} />
											{t('Admin.data.survey.addItem')}
										</span>
									</Button>
								</div>
							</div>
						</>
					)}
				</div>
			)}
			{question?.questionType !== 'rate' &&
				(question?.optionList?.length ?? 0) > 0 && (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCorners}
						onDragEnd={event =>
							handleDragEnd({
								active: { id: String(event.active.id) },
								over: { id: String(event.over?.id || '') },
							})
						}>
						<SortableContext
							items={(question?.optionList || [])
								.filter(option => option.id)
								.map(option => ({ id: option.id || '' }))}
							strategy={verticalListSortingStrategy}>
							{(question?.optionList || []).map((option, optionIndex) => (
								<SurveyQuestionOptionItem
									survey={survey}
									scored={question?.scored || false}
									key={option.id}
									updateOptionTitle={(title: string, score: number) =>
										updateOptionTitle(index, optionIndex, title, score)
									}
									deleteOptionByIndex={() =>
										deleteOptionByIndex(index, optionIndex)
									}
									option={option}
								/>
							))}
						</SortableContext>
					</DndContext>
				)}
		</div>
	);
}
