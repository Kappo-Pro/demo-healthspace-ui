import { UntitledIcon } from '@atoms/Icon';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SurveyQuestionItemProps } from '@types';
import { Collapse, Input, message, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SurveyRateDataItem from './SurveyRateDataItem';

const { Paragraph } = Typography;

export const SurveyQuestionItem = ({
	survey,
	question,
	index,
	handleQuestionTitle,
	handleQuestionDelete,
	updateOptionTitle,
	updateOptionByIndex,
	addOptionsByIndex,
	deleteOptionByIndex,
	addRatingOptionByIndex,
}: SurveyQuestionItemProps) => {
	const { t } = useTranslation();
	const [questionTitle, setQuestionTitle] = useState<string>(
		question?.title || '',
	);
	const [isQuestionEdit, setQuestionEdit] = useState(false);
	const [isEdit, setIsEdit] = useState(
		!(question?.id?.length > 10 && question?.questionType === 'rate'),
	);
	const [ratingOptions, setRatingOptions] = useState<
		{
			id: string;
			option: string;
			score: number;
			isDeleted: boolean;
		}[]
	>([]);

	useEffect(() => {
		setRatingOptions(() => {
			if (question?.questionType === 'rate') {
				let initialOptions =
					question?.optionList?.map(rate => {
						if (rate.option == '')
							return {
								...rate,
								isDeleted: true,
							};
						else
							return {
								...rate,
								isDeleted: false,
							};
					}) ?? [];
				if (initialOptions.length > 10) {
					initialOptions = initialOptions.slice(0, 10);
				}
				return [
					...initialOptions,
					...Array(10 - initialOptions.length).fill({
						option: '',
						score: NaN,
						isDeleted: false,
					}),
				];
			} else {
				return [];
			}
		});
	}, [question]);

	const handleReset = () => {
		setRatingOptions(
			ratingOptions?.map(rate => {
				return {
					...rate,
					score: rate?.isDeleted ? NaN : rate?.score,
					isDeleted: false,
				};
			}),
		);
	};

	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: question?.id });

	const style = {
		transition,
		transform: CSS.Transform.toString({
			x: transform?.x ?? 0,
			y: transform?.y ?? 0,
			scaleX: 1,
			scaleY: 1,
		}),
	};

	const getTaskPos = (id: string) =>
		question?.optionList?.findIndex(option => option.id === id);

	const handleDragEnd = (event: {
		active: { id: string };
		over: { id: string };
	}) => {
		const { active, over } = event;
		if (!active.id || !over.id || active.id === over.id) return;

		const originalPos = getTaskPos(active.id);
		const newPos = getTaskPos(over.id);

		if (originalPos === -1 || newPos === -1) return;
		const newArray = [...(question?.optionList ?? [])];
		[newArray[originalPos], newArray[newPos]] = [
			newArray[newPos],
			newArray[originalPos],
		];
		updateOptionByIndex(index, newArray);
	};

	const handleInputChange = (index: number, value: string) => {
		const newRatingOptions = [...ratingOptions];
		newRatingOptions[index] = { ...newRatingOptions[index], option: value };
		setRatingOptions(newRatingOptions);
	};

	const handleDeleteRate = (index: number) => {
		const newRatingOptions = [...ratingOptions];
		newRatingOptions[index] = {
			...newRatingOptions[index],
			option: '',
			isDeleted: true,
			score: 0,
		};
		setRatingOptions(newRatingOptions);
	};

	const handleScoreChange = (index: number, score: number) => {
		const newRatingOptions = [...ratingOptions];
		newRatingOptions[index] = { ...newRatingOptions[index], score: score };
		setRatingOptions(newRatingOptions);
	};

	const validateQuestion = () => {
		if (questionTitle?.trim() === '') {
			message.error(t('Admin.data.survey.errQuestionEmpty'));
		} else {
			setQuestionEdit(false);
			handleQuestionTitle(index, questionTitle);
		}
	};

	useEffect(() => {
		setQuestionTitle(question?.title || '');
	}, [question]);

	return (
		<div
			className="survey-question-item"
			key={question.id}
			style={style}
			{...attributes}>
			{question?.questionType === 'openText' ? (
				<div className="survey-open-text-item">
					{isQuestionEdit ? (
						<Input
							className="input"
							value={questionTitle}
							onChange={e => setQuestionTitle(e.target.value)}
						/>
					) : (
						<span>
							{question?.title} (
							{question?.questionType
								?.split(/(?=[A-Z])/)
								.map(word => word.charAt(0).toUpperCase() + word.slice(1))
								.join(' ')}
							)
						</span>
					)}
					{!survey?.clinicallyValidated && (
						<span className="option-container">
							{isQuestionEdit ? (
								<span
									onClick={() => {
										validateQuestion();
									}}>
									<UntitledIcon name="save" size={20} />
								</span>
							) : (
								<span onClick={() => setQuestionEdit(true)}>
									<UntitledIcon name="edit" size={20} />
								</span>
							)}
							<span onClick={() => handleQuestionDelete(index)}>
								<UntitledIcon name="delete" size={20} />
							</span>
							<div
								ref={setNodeRef}
								{...listeners}
								className="survey-question-image">
								<img src="/images/menu.svg" />
							</div>
						</span>
					)}
				</div>
			) : (
				<Collapse bordered={false} className="survey-panel">
					<Collapse.Panel
						className="question-panel"
						header={
							<div className="question-panel-header panel-header-height">
								{isQuestionEdit ? (
									<Input
										className="question-input"
										value={questionTitle}
										onChange={e => setQuestionTitle(e.target.value)}
									/>
								) : (
									`${question?.title} (${question?.questionType
										?.split(/(?=[A-Z])/)
										.map(word => word.charAt(0).toUpperCase() + word.slice(1))
										.join(' ')})`
								)}
							</div>
						}
						key={index}
						extra={
							<>
								{!survey?.clinicallyValidated && (
									<span
										className="extra-options"
										onClick={e => e.stopPropagation()}
										onMouseDown={e => e.stopPropagation()}>
										{isQuestionEdit ? (
											<span
												onClick={e => {
													e.stopPropagation();
													validateQuestion();
												}}
												onMouseDown={e => e.stopPropagation()}>
												<UntitledIcon name="save" />
											</span>
										) : (
											<span
												onClick={e => {
													e.stopPropagation();
													setQuestionEdit(!isQuestionEdit);
												}}
												onMouseDown={e => e.stopPropagation()}>
												<UntitledIcon name="edit" />
											</span>
										)}
										<span
											onClick={e => {
												e.stopPropagation();
												handleQuestionDelete(index);
											}}
											onMouseDown={e => e.stopPropagation()}>
											<UntitledIcon name="delete" />
										</span>
										<div
											ref={setNodeRef}
											{...listeners}
											className="survey-image-css"
											onClick={e => e.stopPropagation()}
											onMouseDown={e => e.stopPropagation()}>
											<img src="/images/menu.svg" />
										</div>
									</span>
								)}
							</>
						}>
						<SurveyRateDataItem
							survey={survey}
							question={question}
							handleReset={handleReset}
							handleDeleteRate={handleDeleteRate}
							updateOptionByIndex={updateOptionByIndex}
							isEdit={isEdit}
							ratingOptions={ratingOptions}
							handleDragEnd={handleDragEnd}
							setIsEdit={setIsEdit}
							index={index}
							handleInputChange={handleInputChange}
							handleScoreChange={handleScoreChange}
							updateOptionTitle={updateOptionTitle}
							addOptionsByIndex={addOptionsByIndex}
							deleteOptionByIndex={deleteOptionByIndex}
							addRatingOptionByIndex={addRatingOptionByIndex}
						/>
					</Collapse.Panel>
				</Collapse>
			)}
		</div>
	);
};
