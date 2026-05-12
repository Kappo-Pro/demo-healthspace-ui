import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { useTypedSelector } from '@stores/index';
import { CreateSurveyModalProps, QuestionListPayload } from '@types';
import { Flex, Modal, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import './../style.css';
import { AddSurveyPopup } from './AddSurveyPopup';
import { TemplateSurvey } from './TemplateSurvey';
import './style.css';

export const CreateSurveyModal = (props: CreateSurveyModalProps) => {
	const {
		surveyEdit,
		setSurveyEdit,
		onOk,
		isEdit,
		isVisible,
		onCancel,
		setRefresh,
		refresh,
		fetchData,
		selectedSurvey,
		setSelectedSurvey,
	} = props;
	const { t } = useTranslation();
	const { state } = useLocation();
	const activeTab = useTypedSelector(
		state => state.patientDetail.patientDetail.activeTab,
	);
	const [activeKey, setActiveKey] = useState<string>('1');
	const [isModalVisible, setModalVisible] = useState(false);
	const [templateSearchValue, setTemplateSearchValue] = useState('');
	const [cancelTriggered, setCancelTriggered] = useState(false);
	// TODO: Consider using title ?? defaultValue or title?.property instead of title!
	const [surveyTitle, setSurveyTitle] = useState<string>(selectedSurvey?.title);
	// TODO: Consider using description ?? defaultValue or description?.property instead of description!
	const [surveyDescription, setSurveyDescription] = useState<string>(
		selectedSurvey?.description,
	);
	// TODO: Consider using instructions ?? defaultValue or instructions?.property instead of instructions!
	const [surveyInstructions, setSurveyInstructions] = useState<string>(
		selectedSurvey?.instructions,
	);
	const [questionList, setQuestionList] = useState<QuestionListPayload[]>([]);
	// TODO: Consider using resultFeedback ?? defaultValue or resultFeedback?.property instead of resultFeedback!
	const [surveyResultFeedback, setSurveyResultFeedback] = useState<string>(
		selectedSurvey?.resultFeedback || '',
	);
	const [imgFile, setImgFile] = useState<File[] | undefined>([]);

	const handleCancel = () => {
		setImgFile([]);
		setTemplateSearchValue('');
		setModalVisible(false);
		activeKey == '2' &&
		(surveyTitle ||
			surveyDescription ||
			surveyInstructions ||
			questionList.length > 0 ||
			surveyResultFeedback)
			? setCancelTriggered(true)
			: onCancel();
	};

	const handleOk = () => {
		setModalVisible(false);
		setTemplateSearchValue('');
		setSelectedSurvey(null);
		setModalVisible(false);
		onCancel();
		setRefresh(!refresh);
		setSurveyEdit(false);
	};

	useEffect(() => {
		if (isEdit) {
			setActiveKey('2');
		} else if (state?.isGenerate || activeTab === 'assignSurvey') {
			setActiveKey('1');
		} else {
			setActiveKey('2');
		}
	}, [state, activeTab]); // isEdit removed - not a valid dependency (outer scope variable, should likely be surveyEdit prop)

	useEffect(() => {
		if (cancelTriggered) {
			setCancelTriggered(false);
		}
	}, [cancelTriggered]);

	useEffect(() => {
		setTemplateSearchValue('');
	}, [activeKey]);

	const handleTabChange = (value: string) => {
		if (
			value === '1' &&
			(imgFile?.length > 0 ||
				surveyTitle ||
				surveyDescription ||
				surveyInstructions ||
				questionList.length > 0 ||
				surveyResultFeedback)
		) {
			Modal.confirm({
				title: t('Admin.data.survey.discardChangesTitle'),
				content: t('Admin.data.survey.discardChangesContent'),
				onOk: () => {
					setActiveKey(value);
					setSelectedSurvey(null);
					setImgFile([]);
					setSurveyTitle('');
					setSurveyDescription('');
					setSurveyInstructions('');
					setSurveyResultFeedback('');
					setQuestionList([]);
				},
			});
		} else {
			setActiveKey(value);
		}
	};

	return (
		<Modal
			title={
				<Flex align="center" gap={8} className="modal-title">
					<UntitledIcon name="edit" />
					<span className="titleStyle">
						{surveyEdit
							? t('Admin.data.survey.editSurvey')
							: t('Admin.data.survey.create')}
					</span>
				</Flex>
			}
			open={isVisible}
			style={{ top: 20 }}
			onCancel={handleCancel}
			footer={false}
			width={MODAL_SIZES.XLARGE}
			className="select-empty create-survey-modal">
			{!surveyEdit ? (
				<Tabs
					defaultActiveKey={activeKey}
					activeKey={activeKey}
					onChange={value => {
						handleTabChange(value);
					}}
					items={[
						{
							label: t('Admin.data.survey.titleTemplate'),
							key: '1',
							children: (
								<TemplateSurvey
									setActiveKey={setActiveKey}
									searchValue={templateSearchValue}
									setSearchValue={setTemplateSearchValue}
									setSelectedSurvey={setSelectedSurvey}
								/>
							),
						},
						{
							label: t('Admin.data.survey.titleCreateSurvey'),
							key: '2',
							children: (
								<AddSurveyPopup
									imgFile={imgFile}
									setImgFile={setImgFile}
									surveyTitle={surveyTitle}
									setSurveyTitle={setSurveyTitle}
									surveyResultFeedback={surveyResultFeedback}
									setSurveyResultFeedback={setSurveyResultFeedback}
									surveyDescription={surveyDescription}
									setSurveyDescription={setSurveyDescription}
									surveyInstructions={surveyInstructions}
									setSurveyInstructions={setSurveyInstructions}
									questionList={questionList}
									setQuestionList={setQuestionList}
									onOk={() => {
										handleOk();
										setActiveKey(activeTab === 'assignSurvey' ? '1' : '2');
									}}
									refresh={refresh}
									setRefresh={setRefresh}
									onCancel={() => {
										onCancel();
									}}
									survey={selectedSurvey}
									isEdit={isEdit}
									cancelTriggered={cancelTriggered}
									setSelectedSurvey={setSelectedSurvey}
								/>
							),
						},
					]}
				/>
			) : (
				<AddSurveyPopup
					setImgFile={setImgFile}
					imgFile={imgFile}
					surveyTitle={surveyTitle}
					setSurveyTitle={setSurveyTitle}
					surveyResultFeedback={surveyResultFeedback}
					setSurveyResultFeedback={setSurveyResultFeedback}
					surveyDescription={surveyDescription}
					setSurveyDescription={setSurveyDescription}
					surveyInstructions={surveyInstructions}
					setSurveyInstructions={setSurveyInstructions}
					questionList={questionList}
					setQuestionList={setQuestionList}
					onOk={() => {
						handleOk();
						setActiveKey(activeTab === 'assignSurvey' ? '1' : '2');
					}}
					refresh={refresh}
					setRefresh={setRefresh}
					onCancel={() => {
						onCancel();
					}}
					survey={selectedSurvey}
					isEdit={isEdit}
					cancelTriggered={cancelTriggered}
					setSelectedSurvey={setSelectedSurvey}
				/>
			)}
			{isModalVisible && (
				<AddSurveyPopup
					surveyTitle={surveyTitle}
					setSurveyTitle={setSurveyTitle}
					surveyResultFeedback={surveyResultFeedback}
					setSurveyResultFeedback={setSurveyResultFeedback}
					surveyDescription={surveyDescription}
					setSurveyDescription={setSurveyDescription}
					surveyInstructions={surveyInstructions}
					setSurveyInstructions={setSurveyInstructions}
					questionList={questionList}
					setQuestionList={setQuestionList}
					onOk={() => {
						setModalVisible(false);
						handleCancel();
						fetchData(1, '');
						setRefresh(!refresh);
					}}
					refresh={refresh}
					setRefresh={setRefresh}
					onCancel={() => setModalVisible(false)}
					survey={selectedSurvey}
					cancelTriggered={cancelTriggered}
					setImgFile={setImgFile}
					setSelectedSurvey={setSelectedSurvey}
				/>
			)}
		</Modal>
	);
};
