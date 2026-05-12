import { CardGridSkeleton } from '@atoms/Skeletons';
import {
	getSurvey,
	getSurveyTemplate,
	updateSurvey,
} from '@stores/content/survey/survey';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setSurveyModal } from '@stores/shared/patientDetail/patientDetail';
import { SurevyEdit, Survey, SurveyQuestion } from '@types';
import { Empty, Pagination, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { CreateSurveyModal } from './CreateSurveyModal';
import { EditSurveyCard } from './EditSurveyCard';
import './style.css';

export const AiAssistantStartSurvey = () => {
	const { t } = useTranslation();
	const [isLoading, setLoading] = useState<boolean>(true);
	const [refresh, setRefresh] = useState(false);
	const survey = useTypedSelector(state => state.survey.survey.survey);
	const [isModalVisible, setModalVisible] = useState(false);
	const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
	const [previousQuestion, setPreviousQuestion] = useState<SurveyQuestion[]>(
		[],
	);
	const [surveyEdit, setSurveyEdit] = useState(false);
	const [openSurveyModal, setOpenSurveyModal] = useState(false);
	const [surveyData, setSurveyData] = useState<Survey[] | null>(survey?.data);
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const { state } = useLocation();
	const surveyModal = useTypedSelector(
		state => state.patientDetail.patientDetail.surveyModal,
	);

	useEffect(() => setSurveyData(survey?.data), [survey, refresh]);

	useEffect(() => {
		setOpenSurveyModal(state?.openSurveyModal || false);
	}, [state]);

	useEffect(() => {
		setOpenSurveyModal(surveyModal);
	}, [surveyModal]);

	const fetchHomeData = useCallback(
		async (pageNumber: number) => {
			const payload = {
				userId: user.isPhysioterapist ? selectedUser.id : user.id,
				limit: 10,
				page: pageNumber,
			};
			await dispatch(getSurvey(payload));
			setLoading(false);
			 
		},
		[user.isPhysioterapist, user.id, selectedUser.id],
	); // dispatch is stable from Redux

	useEffect(() => {
		fetchHomeData(1);
	}, [user, selectedUser, refresh]);

	const fetchData = (pageNumber: number, searchValue: string) => {
		const payload = {
			limit: 10,
			page: pageNumber,
			search: searchValue ? searchValue : '',
		};
		dispatch(getSurveyTemplate(payload)).then(() => setLoading(false));
	};

	const handleCancel = () => {
		setOpenSurveyModal(false);
		setSelectedSurvey(null);
		setModalVisible(false);
	};

	const handleApproveSurvey = async (survey: Survey, value: boolean) => {
		const surveyData: SurevyEdit = {
			userId: selectedUser?.id,
			physioterapistId: user?.id,
			active: value,
			status: value ? 'approved' : 'draft',
		};
		try {
			const data = await dispatch(
				updateSurvey({
					surveyId: survey?.id,
					surveyData: surveyData,
				}),
			);

			// Check if the action was rejected
			if (data.meta.requestStatus === 'rejected') {
				// Error message is in data.payload when using rejectWithValue
				const errorMessage =
					(data.payload as string) || t('Admin.data.survey.surveyUpdateError');
				message.error(errorMessage);
			} else if (data.meta.requestStatus === 'fulfilled') {
				value
					? message.success(t('Admin.data.survey.surveyApprove'))
					: message.success(t('Admin.data.survey.surveyDisapprove'));
				setRefresh(!refresh);
			}
		} catch (error: unknown) {
			// Fallback for unexpected errors
			const errorMessage =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				error?.message ||
				t('Admin.data.survey.surveyUpdateError');
			message.error(errorMessage);
		}
	};

	return (
		<div className="ai-assistant-start-survey">
			{user.isPhysioterapist && (
				<div
					className="create-survey-button"
					onClick={() => {
						setSurveyEdit(false);
						setOpenSurveyModal(true);
					}}>
					{t('Admin.data.survey.createSurvey')}
				</div>
			)}
			<CreateSurveyModal
				isVisible={openSurveyModal}
				onCancel={() => {
					setOpenSurveyModal(false);
					setRefresh(!refresh);
					dispatch(setSurveyModal(false));
				}}
				fetchData={fetchData}
				refresh={refresh}
				setRefresh={setRefresh}
				previousQuestion={previousQuestion}
				setPreviousQuestion={setPreviousQuestion}
				fetchHomeData={fetchHomeData}
				selectedSurvey={selectedSurvey || ({} as Survey)}
				setSelectedSurvey={setSelectedSurvey}
				surveyEdit={surveyEdit}
				setSurveyEdit={setSurveyEdit}
			/>
			{isLoading ? (
				<CardGridSkeleton count={6} columns={3} />
			) : (
				<>
					<div>
						{survey?.data?.length == 0 ? (
							<Empty
								className="empty"
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={
									<span style={{}}>{t('Admin.data.survey.noSurvey')}</span>
								}
							/>
						) : (
							<div className="card-list">
								{surveyData?.map((item: Survey) => {
									return (
										<EditSurveyCard
											surveyEdit={surveyEdit}
											setSurveyEdit={setSurveyEdit}
											survey={survey}
											fetchHomeData={fetchHomeData}
											item={item}
											setSelectedSurvey={setSelectedSurvey}
											setModalVisible={setModalVisible}
											handleApproveSurvey={handleApproveSurvey}
										/>
									);
								})}
							</div>
						)}
						{survey?.data?.length != 0 && (
							<div>
								<Pagination
									current={survey?.pagination?.currentPage}
									showSizeChanger={false}
									onChange={fetchHomeData}
									total={survey?.pagination?.totalCount}
								/>
							</div>
						)}
					</div>
				</>
			)}
			{isModalVisible && selectedSurvey && (
				<CreateSurveyModal
					isEdit={true}
					onOk={() => {
						setModalVisible(false);
						handleCancel();
						fetchData(1, '');
						setRefresh(!refresh);
					}}
					refresh={refresh}
					setRefresh={setRefresh}
					isVisible={isModalVisible}
					onCancel={() => setModalVisible(false)}
					selectedSurvey={selectedSurvey}
					setSelectedSurvey={setSelectedSurvey}
					surveyEdit={surveyEdit}
					setSurveyEdit={setSurveyEdit}
					fetchData={fetchData}
					previousQuestion={previousQuestion}
					setPreviousQuestion={setPreviousQuestion}
					fetchHomeData={fetchHomeData}
				/>
			)}
		</div>
	);
};
