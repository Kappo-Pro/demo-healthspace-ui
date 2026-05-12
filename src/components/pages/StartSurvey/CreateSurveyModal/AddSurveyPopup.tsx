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
import {
	createSurvey,
	createSurveyTemplate,
	updateSurvey,
} from '@stores/content/survey/survey';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	AddSurveyPopupProps,
	CreateSurveyPayload,
	SurevyEdit,
	SurveyOptionPayload,
	SurveyQuestionOptions,
	SurveyQuestionPayload,
} from '@types';
import { Button, Checkbox, Empty, Modal, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SurveyPopUpForm from './SurveyPopUpForm';
import { SurveyQuestionItem } from './SurveyQuestionItem';

const { Paragraph } = Typography;

export const AddSurveyPopup = (props: AddSurveyPopupProps) => {
	const {
		imgFile,
		setImgFile,
		surveyTitle,
		setSurveyTitle,
		surveyResultFeedback,
		setSurveyResultFeedback,
		surveyDescription,
		setSurveyDescription,
		surveyInstructions,
		setSurveyInstructions,
		questionList,
		setQuestionList,
		onOk,
		onCancel,
		isEdit,
		survey,
		refresh,
		setRefresh,
		cancelTriggered,
		setSelectedSurvey,
	} = props;
	const [isSaveTemplate, setSaveTemplate] = useState(false);
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [deletedQuestionIdsList, setDeletedQuestionIdsList] = useState<
		{ id: string }[]
	>([]);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const [questionValue, setQuestionValue] = useState('');
	const [questionType, setQuestionType] = useState<string | undefined>(
		undefined,
	);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (survey) {
			setSurveyTitle(survey.title ?? '');
			setSurveyDescription(survey.description ?? '');
			setSurveyInstructions(survey.instructions ?? '');
			setSurveyResultFeedback(survey.resultFeedback ?? '');
			const newList = (survey.questionList || []).map(item => {
				const sortedOptionList = (item.optionList || [])
					.map(option => ({
						id: option?.id,
						option: option?.option,
						score: option?.score,
						order: option?.order ?? 0,
					}))
					.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
				return {
					id: item?.id,
					title: item?.title,
					description: item?.description,
					questionType: item?.questionType,
					scored: item?.scored,
					order: item?.order ?? 0,
					optionList: sortedOptionList,
				};
			});
			setQuestionList(newList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [survey]);

	useEffect(() => {
		if (cancelTriggered) {
			if (checkChanges()) {
				Modal.confirm({
					title: t('Admin.data.survey.discardChangesTitle'),
					content: t('Admin.data.survey.discardChangesContent'),
					onOk: () => {
						onCancel();
						handleClearSelectedSurvey();
					},
				});
			} else {
				handleClearSelectedSurvey();
				onCancel();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cancelTriggered]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleClearSelectedSurvey = () => {
		setSelectedSurvey(null);
		setImgFile([]);
		setSurveyTitle('');
		setSurveyDescription('');
		setSurveyInstructions('');
		setSurveyResultFeedback('');
		setQuestionList([]);
		setQuestionType(undefined);
	};

	const getTaskPos = (id: string) =>
		questionList?.findIndex(exercise => exercise.id === id);

	const handleDragEnd = (event: {
		activeId: string;
		overId: string | null;
	}) => {
		const { activeId, overId } = event;

		if (!overId || activeId === overId) return;
		const originalPos = getTaskPos(activeId);
		const newPos = getTaskPos(overId);
		if (originalPos === -1 || newPos === -1) return;
		const newArray = [...questionList];
		[newArray[originalPos], newArray[newPos]] = [
			newArray[newPos],
			newArray[originalPos],
		];
		setQuestionList(newArray);
	};

	const validateSurvey = () => {
		message.destroy();
		if (survey?.clinicallyValidated != true) {
			if (!surveyTitle?.trim()) {
				message.warning(t('Admin.data.survey.errSurveyTitle'));
				return;
			}
			if (!surveyDescription?.trim()) {
				message.warning(t('Admin.data.survey.errSurveyDescription'));
				return;
			}
			if (!surveyInstructions?.trim()) {
				message.warning(t('Admin.data.survey.errSurveyInstructions'));
				return;
			}
			if (!surveyResultFeedback?.trim()) {
				message.warning(t('Admin.data.survey.errSurveyResultFeedback'));
				return;
			}
			if (questionList?.length === 0) {
				message.warning(t('Admin.data.survey.errQuestion'));
				return;
			}
			for (const question of questionList) {
				if (question?.questionType !== 'openText') {
					if (!question.optionList && !isEdit) {
						message.warning(t('Admin.data.survey.errOption'));
						return;
					}
					if (
						question.optionList?.length === 0 &&
						question.questionType != 'rate'
					) {
						message.warning(t('Admin.data.survey.errOption'));
						return;
					} else if (
						question.optionList?.length != 10 &&
						question.optionList?.some(
							option =>
								option.option != '' ||
								(question?.scored && isNaN(option.score)),
						) &&
						question.questionType === 'rate'
					) {
						message.warning(t('Admin.data.survey.errRate'));
						return;
					} else if (!question.optionList) {
						if (question.questionType != 'rate')
							message.warning(t('Admin.data.survey.errOption'));
						else message.warning(t('Admin.data.survey.errRate'));

						return;
					}
				}
			}
		}
		isEdit ? handleEditSurvey() : handleCreateSurvey();
	};

	const handleCreateSurvey = async () => {
		setIsLoading(true);
		const payload: CreateSurveyPayload = {
			userId: selectedUser?.id,
			physioterapistId: user?.id,
			title: surveyTitle,
			image: survey?.image ? survey?.image : '',
			clinicallyValidated: survey?.clinicallyValidated || false,
			description: surveyDescription,
			instructions: surveyInstructions,
			resultFeedback: surveyResultFeedback,
			questionList: {
				create: questionList?.map((question, index) => {
					return {
						title: question?.title,
						description: question?.description,
						questionType: question?.questionType,
						scored: question?.scored || false,
						order: index + 1,
						optionList: {
							create:
								question?.optionList?.map((option, index) => {
									return {
										option: option?.option,
										...(question?.scored && { score: option?.score }),
										order: index + 1,
									};
								}) || [],
						},
					};
				}),
			},
		};
		try {
			const data = await dispatch(
				createSurvey({
					surveyData: payload,
					images: imgFile ?? [],
				}),
			);
			setIsLoading(false);

			// Check if the action was rejected
			if (data.meta.requestStatus === 'rejected') {
				// Error message is in data.payload when using rejectWithValue
				const errorMessage =
					(data.payload as string) || t('Admin.data.survey.surveyError');
				message.error(errorMessage);
			} else if (data.meta.requestStatus === 'fulfilled') {
				message.success(t('Admin.data.survey.surveySuccess'));
				setRefresh(!refresh);
				handleClearSelectedSurvey();
				setSaveTemplate(false);
				if (isSaveTemplate) {
					handleCreateSurveyTemplate();
				}
				onOk();
			}
		} catch (error: unknown) {
			setIsLoading(false);
			// Fallback for unexpected errors
			const errorMessage =
				(error as unknown)?.response?.data?.message ||
				(error as unknown)?.response?.data?.error ||
				(error as unknown)?.message ||
				t('Admin.data.survey.surveyError');
			message.error(errorMessage);
		}
	};

	const handleCreateSurveyTemplate = async () => {
		setIsLoading(true);
		const payload: CreateSurveyPayload = {
			title: surveyTitle,
			description: surveyDescription,
			instructions: surveyInstructions,
			resultFeedback: surveyResultFeedback,
			image: survey?.image ? survey?.image : '',
			surveyTemplateQuestion: {
				create: questionList?.map(question => {
					return {
						title: question?.title,
						description: question?.description,
						questionType: question?.questionType,
						scored: question?.scored,
						optionList: {
							create:
								question?.optionList?.map(option => {
									return {
										option: option?.option,
										...(question?.scored && {
											score: option?.score,
										}),
									};
								}) || [],
						},
					};
				}),
			},
		};
		try {
			const data = await dispatch(
				createSurveyTemplate({
					surveyTemplateData: payload,
					images: imgFile ?? [],
				}),
			);
			setIsLoading(false);

			// Check if the action was rejected
			if (data.meta.requestStatus === 'rejected') {
				// Error message is in data.payload when using rejectWithValue
				const errorMessage =
					(data.payload as string) || t('Admin.data.survey.templateError');
				message.error(errorMessage);
			} else if (data.meta.requestStatus === 'fulfilled') {
				message.success(t('Admin.data.survey.templateSuccess'));
				setRefresh(!refresh);
				handleClearSelectedSurvey();
				onOk();
			}
		} catch (error: unknown) {
			setIsLoading(false);
			// Fallback for unexpected errors
			const errorMessage =
				(error as unknown)?.response?.data?.message ||
				(error as unknown)?.response?.data?.error ||
				(error as unknown)?.message ||
				t('Admin.data.survey.templateError');
			message.error(errorMessage);
		}
	};

	const handleEditSurvey = async () => {
		setIsLoading(true);
		const create: SurveyQuestionPayload[] = [],
			update: SurevyEdit[] = [];
		questionList.map((question, index) => {
			if (question?.id?.length > 10) {
				const updateList: SurevyEdit = {
					id: question?.id,
					title: question?.title,
					description: question?.description ?? '',
					questionType: question?.questionType ?? 'singleSelect',
					order: index + 1,
					optionList: (() => {
						const create1: SurveyOptionPayload[] = [];
						const update1: SurveyOptionPayload[] = [];
						let orderCounter = 1;

						question?.optionList?.forEach(option => {
							if ((option?.id?.length ?? 0) < 10) {
								create1.push({
									option: option.option,
									score: option.score,
									order: orderCounter++,
								});
							} else {
								update1.push({
									id: option.id,
									option: option.option,
									score: option.score,
									order: orderCounter++,
								});
							}
						});
						return {
							create: create1,
							update: update1,
							delete: question?.deletedOptionList || [],
						};
					})(),
				};
				update.push(updateList);
			} else {
				const createList: SurveyQuestionPayload = {
					title: question?.title,
					description: question?.description,
					questionType: question?.questionType,
					scored: question?.scored,
					optionList: {
						create:
							question?.optionList?.map((option, index) => {
								return {
									option: option?.option,
									...(question?.scored && {
										score: option?.score,
									}),
									order: index + 1,
								};
							}) || [],
					},
				};
				create.push(createList);
			}
		});
		const payload = {
			userId: selectedUser?.id,
			title: surveyTitle,
			description: surveyDescription,
			instructions: surveyInstructions,
			resultFeedback: surveyResultFeedback,
			questionList: {
				create: create,
				update: update,
				delete: deletedQuestionIdsList,
			},
		};
		if (!survey?.id) {
			setIsLoading(false);
			message.error(t('Admin.data.survey.surveyIdMissing'));
			return;
		}
		try {
			const data = await dispatch(
				updateSurvey({ surveyId: survey.id, surveyData: payload }),
			);
			setIsLoading(false);

			// Check if the action was rejected
			if (data.meta.requestStatus === 'rejected') {
				// Error message is in data.payload when using rejectWithValue
				const errorMessage =
					(data.payload as string) || t('Admin.data.survey.surveyUpdateError');
				message.error(errorMessage);
			} else if (data.meta.requestStatus === 'fulfilled') {
				message.success(t('Admin.data.survey.surveyUpdated'));
				setRefresh(!refresh);
				handleClearSelectedSurvey();
				if (isSaveTemplate) {
					handleCreateSurveyTemplate();
				}
				onOk();
			}
		} catch (error: unknown) {
			setIsLoading(false);
			// Fallback for unexpected errors
			const errorMessage =
				(error as unknown)?.response?.data?.message ||
				(error as unknown)?.response?.data?.error ||
				(error as unknown)?.message ||
				t('Admin.data.survey.surveyUpdateError');
			message.error(errorMessage);
		}
	};

	const handleQuestionTitle = (index: number, title: string) => {
		setQuestionList(prevQuestionList => {
			const updatedQuestionList = [...(prevQuestionList || [])];
			const updatedQuestion = { ...updatedQuestionList[index], title: title };
			updatedQuestionList[index] = updatedQuestion;
			return updatedQuestionList;
		});
		message.success(t('Admin.data.survey.questionUpdated'));
	};

	const handleQuestionDelete = (index: number) => {
		if (questionList[index]?.id && questionList[index]?.id?.length > 10) {
			setDeletedQuestionIdsList([
				...deletedQuestionIdsList,
				{
					id: questionList[index]?.id,
				},
			]);
		}
		setQuestionList(questionList?.filter((_, i) => i != index));
		message.success(t('Admin.data.survey.questionDeleted'));
	};

	const addRatingOptionByIndex = (index: number, ratingOptions: string[]) => {
		setQuestionList(prevQuestionList => {
			const updatedQuestionList = [...prevQuestionList];
			const updatedQuestion = {
				...updatedQuestionList[index],
				ratingOptions: ratingOptions,
			};
			updatedQuestionList[index] = updatedQuestion;
			return updatedQuestionList;
		});
	};

	const updateOptionByIndex = (
		questionIndex: number,
		options: SurveyQuestionOptions[],
	) => {
		setQuestionList(prevQuestionList => {
			const updatedQuestionList = [...prevQuestionList];
			const updatedQuestion = {
				...updatedQuestionList[questionIndex],
				optionList: options,
			};
			updatedQuestionList[questionIndex] = updatedQuestion;
			return updatedQuestionList;
		});
	};

	const addOptionsByIndex = (index: number, options: SurveyQuestionOptions) => {
		setQuestionList(prevQuestionList => {
			const updatedQuestionList = [...prevQuestionList];
			const updatedQuestion = {
				...updatedQuestionList[index],
				optionList: [...(updatedQuestionList[index].optionList || []), options],
			};
			updatedQuestionList[index] = updatedQuestion;
			return updatedQuestionList;
		});
	};

	const updateOptionTitle = (
		questionIndex: number,
		optionIndex: number,
		title: string,
		score: number,
	) => {
		setQuestionList(prevQuestionList => {
			const targetQuestion = prevQuestionList[questionIndex];
			const updatedOptionList = [...(targetQuestion.optionList || [])];
			const updatedOption = {
				...updatedOptionList[optionIndex],
				option: title,
				score: score,
			};
			updatedOptionList[optionIndex] = updatedOption;
			const updatedQuestionList = [...prevQuestionList];
			const updatedQuestion = {
				...updatedQuestionList[questionIndex],
				optionList: updatedOptionList,
			};
			updatedQuestionList[questionIndex] = updatedQuestion;

			return updatedQuestionList;
		});
		message.success(t('Admin.data.survey.optionUpdated'));
	};

	const deleteOptionByIndex = (index: number, optionIndex: number) => {
		setQuestionList(prevQuestionList => {
			const targetQuestion = prevQuestionList[index];
			const updatedOptionList = [...(targetQuestion.optionList || [])];
			const [deletedOption] = updatedOptionList.splice(optionIndex, 1);

			const updatedDeletedOptionList = targetQuestion.deletedOptionList
				? [...targetQuestion.deletedOptionList]
				: [];
			if (deletedOption.id) {
				updatedDeletedOptionList.push({ id: deletedOption.id });
			}

			const updatedQuestionList = [...prevQuestionList];
			const updatedQuestion = {
				...updatedQuestionList[index],
				optionList: updatedOptionList,
				deletedOptionList: updatedDeletedOptionList,
			};
			updatedQuestionList[index] = updatedQuestion;

			return updatedQuestionList;
		});
		message.success(t('Admin.data.survey.optionDeleted'));
	};

	const checkChanges = () => {
		if (
			survey ||
			surveyTitle ||
			surveyDescription ||
			questionList.length > 0 ||
			(imgFile?.length ?? 0) > 0
		) {
			if (
				survey?.title !== surveyTitle ||
				survey?.description !== surveyDescription
			) {
				return true;
			}

			const surveyQuestions = survey?.questionList;
			if (surveyQuestions?.length !== questionList.length) {
				return true;
			}

			for (let i = 0; i < surveyQuestions.length; i++) {
				const surveyQuestion = surveyQuestions[i];
				const question = questionList[i];

				if (
					surveyQuestion.id !== question.id ||
					surveyQuestion.title !== question.title ||
					surveyQuestion.description !== question.description ||
					surveyQuestion.questionType !== question.questionType ||
					surveyQuestion.order !== question.order ||
					!compareOptionLists(
						surveyQuestion?.optionList ?? [],
						question?.optionList ?? [],
					)
				) {
					return true;
				}
			}
		}
		return false;
	};

	const compareOptionLists = (
		optionList1: SurveyQuestionOptions[],
		optionList2: SurveyQuestionOptions[],
	) => {
		if (optionList1?.length !== optionList2?.length) {
			return false;
		}
		for (let i = 0; i < optionList1.length; i++) {
			const option1 = optionList1[i];
			const option2 = optionList2[i];
			if (
				option1.id !== option2.id ||
				option1.option !== option2.option ||
				option1.score !== option2.score ||
				option1.order !== option2.order
			) {
				return false;
			}
		}
		return true;
	};

	return (
		<div className="select-none add-survey-popup" style={{ marginTop: 10 }}>
			<div className="header-template-div">
				{survey?.clinicallyValidated && (
					<Paragraph className="template-button-container">
						{t('Admin.data.survey.clinicallyValidatedSurvey')}
					</Paragraph>
				)}
			</div>
			<div className="suvey-form-container">
				<SurveyPopUpForm
					isEdit={isEdit}
					setImgFile={setImgFile}
					imgFile={imgFile}
					surveyTitle={surveyTitle}
					setSurveyTitle={setSurveyTitle}
					questionType={questionType}
					surveyDescription={surveyDescription}
					questionValue={questionValue}
					setQuestionValue={setQuestionValue}
					setQuestionType={setQuestionType}
					setQuestionList={setQuestionList}
					questionList={questionList}
					surveyInstructions={surveyInstructions}
					setSurveyInstructions={setSurveyInstructions}
					surveyResultFeedback={surveyResultFeedback}
					setSurveyResultFeedback={setSurveyResultFeedback}
					survey={survey}
					setSurveyDescription={setSurveyDescription}
				/>
				<DndContext
					sensors={sensors}
					collisionDetection={closestCorners}
					onDragEnd={event =>
						handleDragEnd({
							activeId: event.active.id as string,
							overId: (event.over?.id ?? null) as string,
						})
					}>
					<SortableContext
						items={questionList}
						strategy={verticalListSortingStrategy}>
						{(questionList?.length ?? 0) > 0 &&
							questionList?.map((question, index: number) => {
								return (
									<SurveyQuestionItem
										survey={survey ?? ({} as Survey)}
										question={question}
										index={index}
										updateOptionTitle={updateOptionTitle}
										handleQuestionTitle={handleQuestionTitle}
										handleQuestionDelete={handleQuestionDelete}
										addOptionsByIndex={addOptionsByIndex}
										deleteOptionByIndex={deleteOptionByIndex}
										addRatingOptionByIndex={addRatingOptionByIndex}
										updateOptionByIndex={updateOptionByIndex}
									/>
								);
							})}
					</SortableContext>
				</DndContext>
				{questionList?.length === 0 && (
					<div className="empty">
						<Empty
							className="empty-image"
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								<span className="empty-template-label">
									{t('Admin.data.survey.noQuestionAdded')}
								</span>
							}
						/>
					</div>
				)}
			</div>
			<div className="template-checkbox">
				<Checkbox
					id={'selectSaveTemplate'}
					checked={isSaveTemplate}
					onClick={() => {
						setSaveTemplate(!isSaveTemplate);
					}}
				/>
				<span className="template-checkbox-text">
					{t('Admin.data.menu.patientDetail.aiAssistantPrograms.saveTemplate')}
				</span>
			</div>
			<Button onClick={validateSurvey} type="primary" loading={isLoading} block>
				{isLoading ? null : <UntitledIcon name="check" size="medium" />}&nbsp;
				{survey?.clinicallyValidated
					? t('patient.activity.send')
					: t('admin.menu.patientDetail.aiAssistantPrograms.save')}
			</Button>
		</div>
	);
};
