import { UntitledIcon } from '@atoms/Icon';
import { router } from '@routers/routers';
import { useTypedSelector } from '@stores/index';
import {
	SurveyOptionList as _SurveyOptionList,
	SurveyQuestionOptions,
} from '@types';
import { Button, Flex, Input, Modal, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './style.css';

const { Paragraph } = Typography;

const { TextArea } = Input;

const hoverColors = [
	'-rose-700',
	'-rose-500',
	'-orange-400',
	'-orange-300',
	'-yellow-400',
	'-yellow-300',
	'-green-300',
	'-green-500',
	'-green-700',
	'-cyan-500',
];

export const SurveyOptionList = ({
	fetchSurveyData,
	saveSurvey,
	selectedOptionList,
	setSelectedSurvey,
	setSelectedOptionList,
	item,
	index,
	selectedSurveyData,
	selectedSurvey,
	setSelectedSurveyData,
}: _SurveyOptionList) => {
	const { t } = useTranslation();
	const [showThankyou, setShowThankyou] = useState(false);
	const [showExit, setShowExit] = useState(true);
	const [openText, setOpenText] = useState<string>('');
	const [selectedOptions, setSelectedOptions] = useState<
		SurveyQuestionOptions[]
	>([]);
	const [hoverIndex, setHoverIndex] = useState(-1);
	const [clicked, setClicked] = useState(false);
	const lastDivRef = useRef<HTMLDivElement>(null);
	const [isModal, setIsModal] = useState(false);
	const [showSubmit, setShowSubmit] = useState(false);
	const [totalScore, setTotalScore] = useState(0);
	const navigate = useNavigate();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	// Justification: This effect intentionally runs on every render to reset clicked state
	// when navigating through survey questions. Adding dependencies would break this behavior.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (index == selectedOptionList.length) setClicked(false);
	});

	useEffect(() => {
		setSelectedOptions([]);
		setClicked(false);
	}, [selectedSurvey]);

	const handleOptionClick = (data: SurveyQuestionOptions) => {
		if (selectedOptions.find(option => option?.id === data?.id))
			setSelectedOptions(
				selectedOptions.filter(option => option?.id !== data?.id),
			);
		else {
			if (item?.questionType == 'singleSelect') {
				setSelectedOptions([data]);
			} else {
				setSelectedOptions([...selectedOptions, data]);
			}
		}
	};

	const handleNextClick = () => {
		setClicked(true);
		index + 1 !== selectedSurvey?.questionList?.length &&
			selectedSurvey?.questionList?.[index + 1] &&
			setSelectedSurveyData([
				...(selectedSurveyData ?? []),
				selectedSurvey.questionList[index + 1],
			]);
		if (item?.questionType == 'singleSelect') {
			setSelectedOptionList([
				...selectedOptionList,
				{
					questionType: item?.questionType,
					question: item?.title,
					questionDescription: item?.description,
					selectedAnswer: selectedOptions[0]?.option,
					score: selectedOptions[0]?.score,
				},
			]);
		} else if (item?.questionType == 'rate') {
			setSelectedOptionList([
				...selectedOptionList,
				{
					questionType: item?.questionType,
					question: item?.title,
					questionDescription: item?.description,
					// TODO: Consider using optionList ?? defaultValue or optionList?.property instead of optionList!
					selectedAnswer: item?.optionList?.[hoverIndex].option,
					ratingLevel: hoverIndex + 1,
					// TODO: Consider using optionList ?? defaultValue or optionList?.property instead of optionList!
					score: item?.optionList?.[hoverIndex].score,
				},
			]);
		} else if (item?.questionType == 'openText') {
			setSelectedOptionList([
				...selectedOptionList,
				{
					questionType: item?.questionType,
					question: item?.title,
					questionDescription: item?.description,
					selectedAnswer: openText,
				},
			]);
		} else {
			setSelectedOptionList([
				...selectedOptionList,
				{
					questionType: item?.questionType,
					question: item?.title,
					questionDescription: item?.description,
					answerList: selectedOptions?.map(option => option?.option),
					score: selectedOptions?.reduce(
						(total, option) => total + (option?.score || 0),
						0,
					),
				},
			]);
		}
		// TODO: Consider using length ?? defaultValue or length?.property instead of length!
		if (index === (selectedSurvey?.questionList?.length ?? 0) - 1) {
			setShowThankyou(true);
			setShowSubmit(true);
			setShowExit(false);
		}
	};

	useEffect(() => {
		let score = 0;
		if (selectedOptionList) {
			selectedOptionList.forEach(item => {
				if (item && item.score) {
					score += item.score;
				}
			});
		}
		setTotalScore(score);
	}, [selectedOptionList]);

	// Justification: saveSurvey is a prop callback that may change on every render.
	// We only want to trigger when showThankyou changes to avoid infinite loops.
	useEffect(() => {
		showThankyou && saveSurvey();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showThankyou]);

	// Justification: isSelected is a function that depends on selectedOptions.
	// We want to scroll when selections change, not when the function reference changes.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const isSelected = (id: string) =>
		selectedOptions.find(option => option?.id == id);

	useEffect(() => {
		if (lastDivRef.current) {
			lastDivRef.current.scrollIntoView({ behavior: 'auto' });
		}
	}, [isSelected]);

	const getColor = (index: number) => {
		return index == hoverIndex ? hoverColors[index] : '-gray-300';
	};

	const getTextColor = (color: string) => {
		const colorMap = {
			'-rose-700': 'var(--color-error-700)',
			'-rose-500': 'var(--color-error-500)',
			'-orange-400': 'var(--color-warning-500)',
			'-orange-300': 'var(--color-warning-400)',
			'-yellow-400': 'var(--color-warning-600)',
			'-yellow-300': 'var(--color-warning-300)',
			'-green-300': 'var(--color-success-300)',
			'-green-500': 'var(--color-success-500)',
			'-green-700': 'var(--color-success-700)',
			'-cyan-500': 'var(--color-info-500)',
		};
		return {
			color:
				colorMap[color as keyof typeof colorMap] || 'var(--color-gray-300)',
		};
	};

	const getDesignSystemColor = (index: number) => {
		const colors = [
			'var(--color-error-700)', // rose-700
			'var(--color-error-500)', // rose-500
			'var(--color-warning-500)', // orange-400
			'var(--color-warning-400)', // orange-300
			'var(--color-warning-600)', // yellow-400
			'var(--color-warning-300)', // yellow-300
			'var(--color-success-300)', // green-300
			'var(--color-success-500)', // green-500
			'var(--color-success-700)', // green-700
			'var(--color-info-500)', // cyan-500
		];
		return index === hoverIndex ? colors[index] : 'var(--color-gray-300)';
	};

	const ratingExps = [
		<UntitledIcon name="face-frown" size={45} color={getDesignSystemColor(0)} />,
		<UntitledIcon name="face-frown" size={45} color={getDesignSystemColor(1)} />,
		<UntitledIcon name="face-sad" size={45} color={getDesignSystemColor(2)} />,
		<UntitledIcon name="face-sad" size={45} color={getDesignSystemColor(3)} />,
		<UntitledIcon name="face-neutral" size={45} color={getDesignSystemColor(4)} />,
		<UntitledIcon name="face-neutral" size={45} color={getDesignSystemColor(5)} />,
		<UntitledIcon name="face-smile" size={45} color={getDesignSystemColor(6)} />,
		<UntitledIcon name="face-smile" size={45} color={getDesignSystemColor(7)} />,
		<UntitledIcon name="face-wink" size={45} color={getDesignSystemColor(8)} />,
		<UntitledIcon name="face-happy" size={45} color={getDesignSystemColor(9)} />,
	];

	const renderFeedbackWithLineBreaks = (text: string) => {
		return text?.split('\n')?.map((line, index) => (
			<p key={index}>
				{line}
				<br />
			</p>
		));
	};

	return (
		<div className="survey-option-list">
			{item?.questionType == 'singleSelect' ||
			item?.questionType == 'multiSelect' ? (
				item?.optionList?.map(data => {
					return (
						<div
							onClick={() => !clicked && handleOptionClick(data)}
							style={{
								backgroundColor: isSelected(data?.id || '')
									? 'var(--color-success-500)'
									: 'var(--surface-primary)',
								borderColor: isSelected(data?.id || '')
									? 'var(--survey-selected-border)'
									: 'var(--surface-primary)',
							}}
							className="option-container">
							{data?.option}
							{isSelected(data?.id) && (
								<UntitledIcon
									name="check"
									size={18}
									color="var(--color-primary-500)"
									className="float-right"
								/>
							)}
						</div>
					);
				})
			) : item?.questionType == 'rate' ? (
				<div className="rate-container">
					<Paragraph className="question-type select-rate-label">
						{t('Admin.data.survey.selectRate')}
					</Paragraph>
					<div className="options-row">
						{item?.optionList?.map((item, index) => {
							if (item?.option?.length > 0)
								return (
									<div
										onMouseOver={() => !clicked && setHoverIndex(index)}
										className="rate"
										onClick={() => !clicked && handleNextClick()}>
										{ratingExps[index]}
										<span
											style={{
												fontSize: 'var(--font-size-sm)',
												...getTextColor(getColor(index)),
											}}>
											{item.option}
										</span>
									</div>
								);
						})}
					</div>
				</div>
			) : (
				<div>
					<TextArea
						rows={4}
						className="open-text"
						placeholder={t('Admin.data.survey.surveyDescription')}
						value={openText}
						onChange={e => !clicked && setOpenText(e.target.value)}
					/>
				</div>
			)}
			{showThankyou && (
				<div>
					<div className="ai-response">
						<span className="icon">
							<UntitledIcon name="magic-wand" size={20} />
						</span>
						<div className="content">
							<Paragraph className="ai-assistant">
								{t(
									'Admin.data.menu.patientDetail.aiVirtualAssessment.aiAssistant',
								)}
							</Paragraph>
						</div>
					</div>
					<div className="tankyou-text">
						{t('Admin.data.survey.thankYouText')}
						<div className="survey-container">
							<Paragraph className="survey-total">
								{t('Admin.data.survey.yourTotal')} {totalScore}
							</Paragraph>
							<Paragraph className="survey-point">
								{renderFeedbackWithLineBreaks(selectedSurvey?.resultFeedback)}
							</Paragraph>
						</div>
					</div>
				</div>
			)}
			<Flex justify={showExit ? 'space-between' : 'flex-end'}>
				{showExit && (!clicked || showSubmit) && (
					<Button
						onClick={() => {
							setIsModal(true);
						}}
						icon={<UntitledIcon name="log-out" size={16} />}
						iconPosition="end">
						{t('Admin.data.survey.exit')}
					</Button>
				)}
				<Modal
					title={t('Admin.data.survey.changesDiscardedConfirmation')}
					className="select-none"
					closable={false}
					centered
					open={isModal}
					onOk={() => {
						setSelectedSurvey(null);
						setSelectedSurveyData([]);
						setSelectedOptionList([]);
					}}
					onCancel={() => setIsModal(false)}
					okText={t('Admin.data.addToReports.yes')}
					cancelText={t('Admin.data.addToReports.no')}></Modal>
				{showSubmit ? (
					<Button
						type="primary"
						onClick={() => {
							setSelectedSurvey(null);
							setSelectedSurveyData([]);
							setSelectedOptionList([]);
							fetchSurveyData(1);
							navigate(
								`/${user.isPhysioterapist ? selectedUser.id : user.id}${router.AIASSISTANT_SURVEY_SUMMARY}`,
							);
						}}
						icon={<UntitledIcon name="check" size={18} color="var(--color-white)" />}
						iconPosition="end">
						{t('Admin.data.survey.done')}
					</Button>
				) : (
					!clicked && (
						<>
							<Flex gap="small">
								{index != 0 && (
									<Button
										type="primary"
										onClick={() => {
											const newList = [...selectedSurveyData];
											newList.pop();
											setSelectedSurveyData(newList);
											const newOpts = [...selectedOptionList];
											newOpts.pop();
											setSelectedOptionList(newOpts);
										}}
										icon={
											<UntitledIcon
												name="arrowLeft"
												size={18}
												color="var(--color-white)"
											/>
										}>
										{t('Admin.data.survey.back')}
									</Button>
								)}
								{selectedOptions?.length !== 0 || openText != ''
									? item?.questionType != 'rate' && (
											<Button
												type="primary"
												onClick={() => handleNextClick()}
												icon={
													<UntitledIcon
														name="arrowRight"
														size={18}
														color="var(--color-white)"
													/>
												}
												iconPosition="end">
												{!(
													index ===
													(selectedSurvey?.questionList?.length ?? 0) - 1
												)
													? t('Admin.data.survey.next')
													: t('Admin.data.survey.submit')}
											</Button>
										)
									: item?.questionType != 'rate' && (
											<Button
												type="primary"
												disabled
												icon={
													<UntitledIcon
														name="arrowRight"
														size={18}
														color="var(--color-white)"
													/>
												}
												iconPosition="end">
												{!(
													index ===
													(selectedSurvey?.questionList?.length ?? 0) - 1
												)
													? t('Admin.data.survey.next')
													: t('Admin.data.survey.submit')}
											</Button>
										)}
							</Flex>
						</>
					)
				)}
			</Flex>
		</div>
	);
};
