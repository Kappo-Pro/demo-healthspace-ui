import { UntitledIcon } from '@atoms/Icon';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Survey, SurveyQuestionOptions } from '@types';
import { Input, message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const SurveyQuestionOptionItem = ({
	survey,
	scored,
	option,
	deleteOptionByIndex,
	updateOptionTitle,
}: {
	survey: Survey;
	scored: boolean;
	option: SurveyQuestionOptions;
	deleteOptionByIndex: () => void;
	updateOptionTitle: (title: string, score: number) => void;
}) => {
	const [isEdit, setIsEdit] = useState(false);
	const [title, setTitle] = useState<string>(option?.option || '');
	const [score, setScore] = useState<number>(option?.score || 0);
	const [_isScored, _setScored] = useState(scored);
	// TODO: Consider using id ?? defaultValue or id?.property instead of id!
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: option?.id });
	const { t } = useTranslation();
	const style = {
		transition,
		transform: CSS.Transform.toString({
			// TODO: Consider using x ?? defaultValue or x?.property instead of x!
			x: transform?.x,
			// TODO: Consider using y ?? defaultValue or y?.property instead of y!
			y: transform?.y,
			scaleX: 1,
			scaleY: 1,
		}),
		border: !isEdit ? '1px solid lightgray' : '',
	};

	const validateOption = () => {
		if (title?.trim() == '') {
			message.error(t('Admin.data.survey.answerEmptyError'));
		} else if (isNaN(score)) {
			message.error(t('Admin.data.survey.scoreEmptyError'));
		} else {
			setIsEdit(false);
			updateOptionTitle(title, score);
		}
	};

	return (
		<div
			className="survey-question-option-item"
			key={option.id}
			style={style}
			{...attributes}>
			<div className="option-content">
				{isEdit ? (
					<Input
						className="input-title"
						value={title}
						onChange={e => setTitle(e.target.value)}
					/>
				) : (
					<p>{option?.option}</p>
				)}
			</div>
			{_isScored != false && (
				<>
					{isEdit ? (
						<Input
							className="input-score"
							value={score}
							type="number"
							onChange={e => setScore(parseInt(e.target.value))}
						/>
					) : (
						<>
							<div className="score-outer-div">
								<div className="score-display">
									<span>{score ? score : 0}</span>
								</div>
							</div>
						</>
					)}
				</>
			)}
			{!survey?.clinicallyValidated && (
				<>
					{isEdit ? (
						<span className="save-button" onClick={validateOption}>
							<UntitledIcon name="save" size={20} />
						</span>
					) : (
						<span className="edit-button" onClick={() => setIsEdit(true)}>
							<UntitledIcon name="edit" size={20} />
						</span>
					)}
					<div className="delete-button" onClick={deleteOptionByIndex}>
						<UntitledIcon name="delete" size={20} />
					</div>
					<div className="drag-handle" ref={setNodeRef} {...listeners}>
						<img src="/images/menu.svg" />
					</div>
				</>
			)}
		</div>
	);
};
