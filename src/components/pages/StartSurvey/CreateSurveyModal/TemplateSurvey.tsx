import { UntitledIcon } from '@atoms/Icon';
import { CardGridSkeleton } from '@atoms/Skeletons';
import { IExerciseProps, Survey, SurveyPaginated } from '@types';
import {
	Col,
	Empty,
	Flex,
	Image,
	Input,
	Pagination,
	Row,
	Select,
	Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

import {
	getClinicalSurveyTemplate,
	getSurveyTemplate,
	getSystemSurveyTemplate,
} from '@stores/content/survey/survey';
import { useTypedDispatch } from '@stores/index';

const { Option } = Select;

export const TemplateSurvey = (props: IExerciseProps) => {
	const { setActiveKey, searchValue, setSearchValue, setSelectedSurvey } =
		props;
	const [templateType, setTemplateType] = useState<string>('systemTemplates');
	const [templateData, setTemplateData] = useState<SurveyPaginated | null>(
		null,
	);
	const [isGrid, setGrid] = useState(false);
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setGrid(false);
		if (templateType == 'myTemplates') {
			fetchMyTemplateData(1);
		} else if (templateType == 'systemTemplates') {
			fetchSystemTemplateData(1);
		} else if (templateType == 'medicalValidity') {
			fetchClinicalTemplateData(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templateType]);

	const onPageChange = (pageNumber: number) => {
		if (templateType == 'myTemplates') {
			fetchMyTemplateData(pageNumber);
		} else if (templateType == 'systemTemplates') {
			fetchSystemTemplateData(pageNumber);
		} else if (templateType == 'medicalValidity') {
			fetchClinicalTemplateData(pageNumber);
		}
	};

	const fetchMyTemplateData = async (page: number) => {
		setLoading(true);
		const payload = {
			page: page,
			limit: 10,
			search: searchValue,
		};
		const data = await dispatch(getSurveyTemplate(payload));
		if (data?.payload) {
			setTemplateData((data?.payload as SurveyPaginated) || null);
		}
		setLoading(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			if (templateType == 'myTemplates') {
				fetchMyTemplateData(1);
			} else if (templateType == 'systemTemplates') {
				fetchSystemTemplateData(1);
			} else if (templateType == 'medicalValidity') {
				fetchClinicalTemplateData(1);
			}
		}
	};

	const fetchSystemTemplateData = async (page: number) => {
		setLoading(true);
		const payload = {
			page: page,
			limit: 10,
			search: searchValue,
		};
		const data = await dispatch(getSystemSurveyTemplate(payload));
		if (data?.payload) {
			setTemplateData((data?.payload as SurveyPaginated) || null);
		}
		setLoading(false);
	};

	const fetchClinicalTemplateData = async (page: number) => {
		setLoading(true);
		const payload = {
			page: page,
			limit: 10,
			search: searchValue,
		};
		const data = await dispatch(getClinicalSurveyTemplate(payload));
		if (data?.payload) {
			setTemplateData((data?.payload as SurveyPaginated) || null);
		}
		setLoading(false);
	};

	return (
		<div className="template-survey">
			<div className="template-survey-header-container">
				<Select
					className="template-survey-select"
					bordered={false}
					onChange={value => {
						setSearchValue('');
						setTemplateType(value);
					}}
					value={templateType}>
					<Option value="systemTemplates">
						{t('Admin.data.survey.systemTemplatesSurvey')}
					</Option>
					<Option value="myTemplates">
						{t('Admin.data.survey.myTemplatesSurvey')}
					</Option>
					<Option value="medicalValidity">
						{t('Admin.data.survey.clinicallyValidatedSurvey')}
					</Option>
				</Select>
				<Input
					className="search-input theme-select-dropdown"
					placeholder={t(
						'Admin.data.menu.patientDetail.aiAssistantPrograms.search',
					)}
					value={searchValue}
					onKeyDown={e => handleKeyDown(e)}
					bordered={false}
					onChange={e => setSearchValue(e.target.value)}
				/>
				{!loading && (
					<Flex justify="flex-end">
						<div
							onClick={() => setGrid(false)}
							className={`view-toggle-button view-toggle-left ${!isGrid ? 'view-toggle-active' : ''}`}>
							<UntitledIcon
								name="list"
								size={24}
								color={isGrid ? 'var(--text-tertiary)' : 'var(--text-primary)'}
							/>
						</div>
						<div
							onClick={() => setGrid(true)}
							className={`view-toggle-button view-toggle-right ${isGrid ? 'view-toggle-active' : ''}`}>
							<UntitledIcon
								name="dashboard"
								size={20}
								color={isGrid ? 'var(--text-primary)' : 'var(--text-tertiary)'}
							/>
						</div>
					</Flex>
				)}
			</div>
			<div className="template-main-container">
				<div className="template-sub-container">
					{loading ? (
						<CardGridSkeleton count={6} columns={3} />
					) : (
						<>
							{templateData &&
							templateData?.data &&
							templateData?.data?.length > 0 ? (
								!isGrid ? (
									templateData?.data?.map((item: Survey) => {
										return (
											<div style={{ marginBottom: 16 }}>
												<div className={`card-style-grid-false`} key={item.id}>
													<div className="image">
														<Image
															src={
																typeof item?.image === 'string' &&
																item.image.trim() !== ''
																	? item.image
																	: typeof item?.image === 'object' &&
																		  item?.image !== null &&
																		  'url' in item.image &&
																		  typeof (item.image as unknown).url ===
																				'string' &&
																		  (item.image as unknown).url.trim() !== ''
																		? (item.image as { url: string }).url
																		: '/images/white-image.png'
															}
															className="image-not-found"
															alt={t('Admin.data.survey.noImage')}
															onError={e => {
																const target = e.target as HTMLImageElement;
																target.src = '/images/white-image.png';
															}}
															preview={{
																src:
																	typeof item?.image === 'string' &&
																	item.image.trim() !== ''
																		? item.image
																		: typeof item?.image === 'object' &&
																			  item?.image !== null &&
																			  'url' in item.image &&
																			  typeof (item.image as unknown).url ===
																					'string' &&
																			  (item.image as unknown).url.trim() !==
																					''
																			? (item.image as { url: string }).url
																			: '/images/white-image.png',
																mask: <UntitledIcon name="eye" size={18} />,
															}}
														/>
													</div>
													<div
														onClick={() => {
															setSelectedSurvey({
																...item,
																image:
																	typeof item?.image === 'object' &&
																	item?.image !== null &&
																	'url' in item.image
																		? (item.image as { url: string }).url
																		: item?.image ?? '',
																questionList:
																	item?.surveyTemplateQuestion ?? [],
															});
															setActiveKey('2');
														}}
														className="card-content">
														<div className="clinically-validated-label">
															{item?.clinicallyValidated && (
																<span className="template-button-container">
																	{t(
																		'Admin.data.survey.clinicallyValidatedSurvey',
																	)}
																</span>
															)}
														</div>
														<span className="card-title font-color-text">
															{item?.title}
														</span>
														<p
															className="question-count font-color-text"
															style={{ margin: 0 }}>
															{t('Admin.data.survey.questions')}:{' '}
															{item?.surveyTemplateQuestion?.length}
														</p>
														<span className="card-description font-color-text">
															{item?.description}
														</span>
													</div>
												</div>
											</div>
										);
									})
								) : (
									<Row gutter={[16, 16]}>
										{templateData?.data?.map((item: Survey) => (
											<Col xs={24} sm={12} md={8} lg={8} xl={8} key={item.id}>
												<div
													className="card-style-grid-true"
													onClick={() => {
														setSelectedSurvey({
															...item,
															image:
																typeof item?.image === 'object' &&
																item?.image !== null &&
																'url' in item.image
																	? (item.image as { url: string }).url
																	: item?.image ?? '',
															questionList: item?.surveyTemplateQuestion ?? [],
														});
														setActiveKey('2');
													}}>
													<div onClick={e => e.stopPropagation()}>
														<Image
															src={
																typeof item?.image === 'string' &&
																item?.image?.trim() !== ''
																	? item.image
																	: typeof item?.image === 'object' &&
																		  item?.image !== null &&
																		  'url' in item.image &&
																		  typeof (item.image as unknown).url ===
																				'string' &&
																		  (item.image as unknown).url.trim() !== ''
																		? (item.image as { url: string }).url
																		: '/images/white-image.png'
															}
															className="image-not-found"
															alt={t('Admin.data.survey.noImage')}
															onError={e => {
																const target = e.target as HTMLImageElement;
																target.src = '/images/white-image.png';
															}}
															preview={{
																src:
																	typeof item?.image === 'string' &&
																	item.image.trim() !== ''
																		? item.image
																		: typeof item?.image === 'object' &&
																			  item?.image !== null &&
																			  'url' in item.image &&
																			  typeof (item.image as unknown).url ===
																					'string' &&
																			  (item.image as unknown).url.trim() !==
																					''
																			? (item.image as { url: string }).url
																			: '/images/white-image.png',
																mask: <UntitledIcon name="eye" size={18} />,
															}}
														/>
													</div>
													<div className="card-content">
														<span className="card-title" title={item?.title}>
															{item?.title}
														</span>
														<span className="question-count-container">
															<span className="question-count font-color-text">
																{t('Admin.data.survey.questions')}:{' '}
																{item?.surveyTemplateQuestion?.length}
															</span>
														</span>
													</div>
												</div>
											</Col>
										))}
									</Row>
								)
							) : (
								<div className="empty">
									<Empty
										image={Empty.PRESENTED_IMAGE_SIMPLE}
										description={
											<span className="empty-template-label">
												{t('Admin.data.survey.noTemplate')}
											</span>
										}
									/>
								</div>
							)}
						</>
					)}
				</div>
				{!loading &&
					templateData &&
					templateData?.data &&
					templateData?.data?.length > 0 && (
						<Pagination
							current={
								templateType === 'systemTemplates'
									? templateData?.pagination?.currentPage
									: templateData?.pagination?.currentPage
							}
							style={{ marginTop: 8 }}
							showSizeChanger={false}
							onChange={onPageChange}
							total={
								templateType === 'systemTemplates'
									? templateData?.pagination?.totalCount
									: templateData?.pagination?.totalCount
							}
						/>
					)}
			</div>
		</div>
	);
};
