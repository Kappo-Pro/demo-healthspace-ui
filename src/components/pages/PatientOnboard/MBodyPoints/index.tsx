import { UntitledIcon } from '@atoms/Icon';
import Loading from '@atoms/Loading';
import { EvaluationData, PainAssessments } from '@pages/Home/interface';
import { painAssessmentInfoAction } from '@stores/clinical/painAssessment';
import { myLibraryInfoAction } from '@stores/content/library';
import {
	getBodyPointStrapi,
	getOptionsData,
} from '@stores/content/myLibrary/myLibrary';
import { useTypedDispatch } from '@stores/index';
import { Button, Card, Col, Row, Select, Slider, Tooltip, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BODY_POINTS } from './bodyPoint_constants';
import {
	BodyPointDropdownOption,
	BodyPointOption,
	TBodyOptionType,
	TFormDataType,
	TOptionFormatedType,
	TStrapiBodyPoints,
} from './interface';
import { BODY_POINTS_OPTION, OPTION_LABEL } from './options';
import './style.css';

interface TBodyPointType {
	assessmentData: PainAssessments[];
	savedEvaluationData?: EvaluationData;
	setSavedEvaluationData: (value: EvaluationData) => void;
	isLoading: boolean;
	setIsLoading: (value: boolean) => void;
}

const MBodyPoints = (props: TBodyPointType) => {
	const {
		isLoading,
		setIsLoading,
		assessmentData,
		savedEvaluationData,
		setSavedEvaluationData,
	} = props;

	const defaultFormData: TFormDataType = {
		painLevel: 5,
		strapiBodyPointId: 0,
		strapiAggravatingFactorsIds: [],
		strapiRelievingFactorsIds: [],
		strapiPainCausesIds: [],
		strapiPainDurationId: 0,
		strapiPainFrequencyId: 0,
		strapiPainStatusId: 0,
		notes: '',
		userId: '',
	};
	const dispatch = useTypedDispatch();
	const [activeLeftName, setActiveLeftName] = useState('');
	const [activeRightName, setactiveRightName] = useState('');
	const [bodyPointOptionsLeft, setBodyPointOptionsLeft] = useState<
		BodyPointDropdownOption[]
	>([]);
	const [bodyPointOptionsRight, setBodyPointOptionsRight] = useState<
		BodyPointDropdownOption[]
	>([]);
	const [formDataLeft, setFormDataLeft] = useState(defaultFormData);
	const [formDataRight, setFormDataRight] = useState(defaultFormData);
	const [savedData, setSavedData] = useState<PainAssessments[]>([]);
	const [isUpdateFront, setIsUpdateFront] = useState(false);
	const [isUpdateBack, setIsUpdateBack] = useState(false);
	const [bodyPointData, setBodypointData] = useState<TStrapiBodyPoints[]>([]);
	const [isSaveClick, setIsSaveClick] = useState(false);
	const [errorObject, setErrorObject] = useState<string[]>([]);
	const [selectedBodyPiont, setSelectedBodyPoint] = useState(0);

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedEvaluationData]); // fetchData intentionally excluded - function redefined on every render

	const fetchData = async () => {
		const data = await dispatch(getBodyPointStrapi());
		const strapiData = data.payload;
		dispatch(painAssessmentInfoAction.bodyPointStrapiInfo(strapiData));
		dispatch(
			myLibraryInfoAction.painAssessmentSavedBodyPointInfo(assessmentData),
		);
		const temp_data: TStrapiBodyPoints[] = [];
		strapiData.forEach((item: TStrapiBodyPoints) => {
			const new_item = { ...item };
			const find = BODY_POINTS.find(
				(strapi: TStrapiBodyPoints) => strapi.id == item.id,
			);
			new_item.romStyle = find?.romStyle;
			savedEvaluationData?.painAssessments?.some(assessment =>
				assessment.strapiBodyPointId == item.id
					? (new_item.isSaved = true)
					: (new_item.isSaved = false),
			);
			temp_data.push(new_item);
		});

		setBodypointData(temp_data);
		setSavedData(assessmentData);
		dispatch(painAssessmentInfoAction.painAssessmentInfo(assessmentData));
		setIsLoading(false);
	};

	const onBodyPoint = async (bodyPoint: TStrapiBodyPoints) => {
		setSelectedBodyPoint(bodyPoint.id);
		bodyPoint.isSaved ? setIsUpdateFront(true) : setIsUpdateFront(false);
		setIsSaveClick(false);
		setActiveLeftName(bodyPoint.name);
		getOptionList(bodyPoint.position, bodyPoint?.id);
		setFormDataLeft(getFormData(bodyPoint.id));
	};

	const filterSelectedOptions = (
		allOptions: TOptionFormatedType[],
		selected: number | number[] | undefined,
	) => {
		const validIds = allOptions.map(opt => opt.value);
		if (Array.isArray(selected)) {
			return selected.filter(id => validIds.includes(id));
		} else {
			return validIds.includes(selected as number) ? selected : undefined;
		}
	};

	const getOptionList = async (position: string, id: number) => {
		if (id) {
			if (position == 'front') {
				setBodyPointOptionsLeft([]);
			} else {
				setBodyPointOptionsRight([]);
			}
			const data = await dispatch(getOptionsData({ id }));
			const apiData = data.payload;
			dispatch(painAssessmentInfoAction.optionsInfo(apiData));
			const temp_data: BodyPointDropdownOption[] = [];
			if (apiData) {
				BODY_POINTS_OPTION?.forEach((item: BodyPointOption) => {
					const name = item?.name;
					const key = item?.key;
					const options: BodyPointDropdownOption = {
						name: name,
						options: [],
						key: key ?? '',
						selectedOption: [],
					};
					const find = savedData?.find(
						(saved: PainAssessments) => saved.strapiBodyPointId == id,
					);
					if (name === OPTION_LABEL.AGGRAVATING_FACTORS) {
						options.options = createOptions(apiData?.aggravatingFactors);
						options.selectedOption = filterSelectedOptions(
							options.options,
							find?.strapiAggravatingFactorsIds,
						);
					} else if (name === OPTION_LABEL.RELIEVING_FACTORS) {
						options.options = createOptions(apiData?.relievingFactors);
						options.selectedOption = filterSelectedOptions(
							options.options,
							find?.strapiRelievingFactorsIds,
						);
					} else if (name === OPTION_LABEL.CAUSES) {
						options.options = createOptions(apiData?.painCauses);
						options.selectedOption = filterSelectedOptions(
							options.options,
							find?.strapiPainCausesIds,
						);
					} else if (name === OPTION_LABEL.DURATION) {
						options.options = createOptions(apiData?.painDurations);
						options.selectedOption = filterSelectedOptions(
							options.options,
							find?.strapiPainDurationId,
						);
					} else if (name === OPTION_LABEL.FREQUENCY) {
						options.options = createOptions(apiData?.painFrequencies);
						options.selectedOption = filterSelectedOptions(
							options.options,
							find?.strapiPainFrequencyId,
						);
					} else if (name === OPTION_LABEL.STATUS) {
						options.options = createOptions(apiData?.painStatuses);
						options.selectedOption = filterSelectedOptions(
							options.options,
							find?.strapiPainStatusId,
						);
					}
					if (find?.id) {
						if (position == 'front') {
							setIsUpdateFront(true);
						} else {
							setIsUpdateBack(true);
						}
					}
					temp_data.push(options);
				});
			}
			if (position == 'front') {
				setBodyPointOptionsLeft(temp_data);
			} else {
				setBodyPointOptionsRight(temp_data);
			}
		}
	};

	const createOptions = (data: TBodyOptionType[]) => {
		const tempData: TOptionFormatedType[] = [];
		data.forEach((item: TBodyOptionType) => {
			tempData.push({
				label: item.name,
				value: item.id,
			});
		});
		return tempData;
	};

	const setActivePointRight = async (bodyPoint: TStrapiBodyPoints) => {
		setSelectedBodyPoint(bodyPoint.id);
		bodyPoint.isSaved ? setIsUpdateBack(true) : setIsUpdateBack(false);
		setIsSaveClick(false);
		setactiveRightName(bodyPoint.name);
		getOptionList(bodyPoint.name, bodyPoint?.id);
		setFormDataRight(getFormData(bodyPoint.id));
	};

	const getFormData = (bodyPointId: number) => {
		const foundData = savedEvaluationData?.painAssessments?.find(
			element => element.strapiBodyPointId === bodyPointId,
		);
		if (foundData) {
			const {
				painLevel,
				strapiBodyPointId,
				strapiAggravatingFactorsIds,
				strapiRelievingFactorsIds,
				strapiPainCausesIds,
				strapiPainDurationId,
				strapiPainFrequencyId,
				strapiPainStatusId,
			} = foundData;
			const temp_data = {
				painLevel,
				strapiBodyPointId,
				strapiAggravatingFactorsIds,
				strapiRelievingFactorsIds,
				strapiPainCausesIds,
				strapiPainDurationId,
				strapiPainFrequencyId,
				strapiPainStatusId,
				notes: foundData.notes || '',
			};
			return temp_data;
		} else {
			const temp_data = { ...defaultFormData };
			temp_data.strapiBodyPointId = bodyPointId;
			return temp_data;
		}
	};

	const onSelect =
		(name: string) =>
		(value: string | number | string[] | number[] | undefined) => {
			const filteredErrorObject = errorObject.filter(
				(item: string) => item != name,
			);
			setErrorObject(filteredErrorObject);
			setFormDataLeft({
				...formDataLeft,
				...{ [name]: value },
			});
		};

	const onSelectBack =
		(name: string) =>
		(value: string | number | string[] | number[] | undefined) => {
			const filteredErrorObject = errorObject.filter(
				(item: string) => item != name,
			);
			setErrorObject(filteredErrorObject);
			setFormDataRight({
				...formDataRight,
				...{ [name]: value },
			});
		};

	const onClickSaveLeft = async () => {
		saveData({ ...formDataLeft, userId: formDataLeft.userId || '' }, 'left');
		setBodypointData(
			bodyPointData.map(element => {
				if (element.id === selectedBodyPiont) {
					return {
						...element,
						isSaved: true,
					};
				}
				return element;
			}),
		);
	};

	const onClickUpdateLeft = async () => {
		updateData({ ...formDataLeft, userId: formDataLeft.userId || '' }, 'left');
	};

	const saveData = (payload: PainAssessments, position: string) => {
		const temp_data = savedEvaluationData?.painAssessments || [];
		const filterdData = temp_data.filter(
			item => item.strapiBodyPointId != payload.strapiBodyPointId,
		);
		filterdData.push(payload);
		const saved_temp_data = { ...savedEvaluationData };
		saved_temp_data.painAssessments = filterdData;

		setIsSaveClick(true);
		const isValid = formValidation(payload);
		if (!isValid) {
			message.error(
				t(
					'Patient.data.virtualEvaluation.painAssesment.pleaseFillAllTheRequiredFields',
				),
			);
			setIsSaveClick(false);
			return;
		}
		if (position === 'left') {
			setIsUpdateFront(true);
			setActiveLeftName('');
		} else if (position === 'back') {
			setIsUpdateBack(true);
			setactiveRightName('');
		}
		setSavedData(saved_temp_data.painAssessments);
		setSavedEvaluationData(saved_temp_data);
		message.success(t('Patient.data.dataNotifications.dataSave'));
		setIsSaveClick(false);
	};

	const updateData = (payload: PainAssessments, position: string) => {
		const updatedData = savedEvaluationData?.painAssessments || [];
		const indexToUpdate = updatedData.findIndex(
			item => item.strapiBodyPointId == payload.strapiBodyPointId,
		);
		if (indexToUpdate !== -1) {
			const updatedArray = [...updatedData];
			updatedArray[indexToUpdate] = payload;
			const updatedSavedEvaluationData = {
				...savedEvaluationData,
				painAssessments: updatedArray,
			};
			setSavedEvaluationData(updatedSavedEvaluationData);
			setSavedData(updatedSavedEvaluationData.painAssessments);
		}

		if (position === 'left') {
			setFormDataLeft(payload);
			setActiveLeftName('');
		} else if (position === 'back') {
			setFormDataRight(payload);
			setactiveRightName('');
		}
		message.success(t('Patient.data.dataNotifications.dataUpdate'));
		setIsSaveClick(false);
	};

	const formValidation = (payload: TFormDataType) => {
		const error_data: string[] = [];
		if (payload.strapiAggravatingFactorsIds.length === 0) {
			error_data.push('strapiAggravatingFactorsIds');
		}
		if (payload.strapiPainCausesIds.length === 0) {
			error_data.push('strapiPainCausesIds');
		}
		if (payload.strapiRelievingFactorsIds.length === 0) {
			error_data.push('strapiRelievingFactorsIds');
		}
		if (payload.strapiPainDurationId === 0 || !payload.strapiPainDurationId) {
			error_data.push('strapiPainDurationId');
		}
		if (payload.strapiPainFrequencyId === 0 || !payload.strapiPainFrequencyId) {
			error_data.push('strapiPainFrequencyId');
		}
		if (payload.strapiPainStatusId === 0 || !payload.strapiPainStatusId) {
			error_data.push('strapiPainStatusId');
		}
		setErrorObject(error_data);
		if (error_data.length > 0) {
			return false;
		} else {
			return true;
		}
	};

	const deleteRecord = (position: string) => {
		const temp_data = [...(savedEvaluationData?.painAssessments ?? [])];
		const filterdData = temp_data.filter(
			item => item.strapiBodyPointId != selectedBodyPiont,
		);
		const saved_temp_data = { ...savedEvaluationData };
		saved_temp_data.painAssessments = filterdData;
		setSavedEvaluationData(saved_temp_data);
		setSavedData(saved_temp_data.painAssessments);
		setBodypointData(
			bodyPointData.map(element => {
				if (element.id === selectedBodyPiont) {
					return {
						...element,
						isSaved: false,
					};
				}
				return element;
			}),
		);
		message.success(t('Patient.data.dataNotifications.dataDelete'));
		if (position == 'left') setActiveLeftName('');
		else setactiveRightName('');
	};
	const closeLeft = () => {
		setActiveLeftName('');
	};

	const closeRight = () => {
		setactiveRightName('');
	};

	const onClickSaveRight = () => {
		saveData({ ...formDataRight, userId: formDataRight.userId || '' }, 'back');
		setBodypointData(
			bodyPointData.map(element => {
				if (element.id === selectedBodyPiont) {
					return {
						...element,
						isSaved: true,
					};
				}
				return element;
			}),
		);
	};
	const { t } = useTranslation();
	const onClickUpdateRight = () => {
		updateData(
			{ ...formDataRight, userId: formDataRight.userId || '' },
			'back',
		);
	};

	const handleSliderLeftChange = (value: number) => {
		setFormDataLeft(prev => ({
			...prev,
			painLevel: value,
		}));
	};

	const handleSliderRightChange = (value: number) => {
		setFormDataRight(prev => ({
			...prev,
			painLevel: value,
		}));
	};

	return (
		<div className="pain-assessment-wrapper">
			<Row className="pain-assesment-inner-div">
				<Col span={6} className="pain-col">
					{activeLeftName ? (
						<Card
							size="small"
							variant="borderless"
							title={activeLeftName}
							extra={
								<div style={{ display: 'flex' }}>
									{isUpdateFront && (
										<Tooltip
											placement="topRight"
											title={t(
												'Patient.data.virtualEvaluation.painAssesment.delete',
											)}
											showArrow={false}>
											<span
												className="icon-pointer icon-spacing-css"
												onClick={() => deleteRecord('left')}>
												<UntitledIcon name="delete" size={16} />
											</span>
										</Tooltip>
									)}
									<span className="icon-pointer" onClick={closeLeft}>
										<UntitledIcon name="close" size={16} />
									</span>
								</div>
							}>
							<>
								<div className="label-text">
									{t('Patient.data.onboard.painLevel')}
								</div>
								<div className="slider-container">
									<span className="slider-label">0</span>
									<div className="slider-wrapper">
										<Slider
											min={0}
											max={10}
											defaultValue={
												(formDataLeft && formDataLeft?.painLevel) || 0
											}
											value={formDataLeft && formDataLeft?.painLevel}
											onChange={handleSliderLeftChange}
										/>
									</div>
									<span className="slider-label">10</span>
								</div>
								{bodyPointOptionsLeft.map(
									(item: BodyPointDropdownOption, i: number) => {
										const multiple =
											item.key != 'strapiPainDurationId' &&
											item.key != 'strapiPainFrequencyId' &&
											item.key != 'strapiPainStatusId';
										return (
											<div className="select-container" key={i}>
												<div className="text-gray-700 font-semibold">
													{item.name}
												</div>
												<Select
													mode={multiple ? 'multiple' : undefined}
													size="small"
													style={{ minHeight: 'var(--spacing-10)' }}
													placeholder={t(
														'Patient.data.virtualEvaluation.painAssesment.selectAnOption',
													)}
													defaultValue={item.selectedOption}
													onChange={onSelect(item.key)}
													className="w-full body-point-select theme-select-dropdown"
													options={item.options}
													showSearch={false}
													status={
														errorObject.includes(item.key) && isSaveClick
															? 'error'
															: ''
													}
												/>
											</div>
										);
									},
								)}
								<div className="button-wrapper">
									<Button
										type="primary"
										size="large"
										block
										style={{ borderRadius: 'var(--radius-full)' }}
										onClick={
											isUpdateFront ? onClickUpdateLeft : onClickSaveLeft
										}>
										{isUpdateFront
											? t('Patient.data.virtualEvaluation.painAssesment.update')
											: t('Patient.data.virtualEvaluation.painAssesment.save')}
									</Button>
								</div>
							</>
						</Card>
					) : (
						<div className="empty-div-css"></div>
					)}
				</Col>
				<Col span={12} className="pain-col">
					{isLoading ? (
						<Loading />
					) : (
						<div className="custom-container-content">
							<div className="main-conatiner-div">
								<div className="body-shape-front">
									<img src={'/images/rom/front.png'} width={240} alt="" />
									{bodyPointData
										.filter(
											(val: TStrapiBodyPoints) => val.position === 'front',
										)
										.map((hotspot: TStrapiBodyPoints, index: number) => (
											<div
												key={index}
												style={
													hotspot.romStyle
														? Object.fromEntries(
																Object.entries(hotspot.romStyle).filter(
																	([_, value]) => value !== null,
																),
															)
														: undefined
												}
												className={
													hotspot?.name === activeLeftName
														? 'hotspot-circle active'
														: hotspot.isSaved
															? 'hotspot-circle saved'
															: 'hotspot-circle'
												}
												onClick={e => {
													e.preventDefault();
													onBodyPoint(hotspot);
												}}>
												<span className="tooltiptext">{hotspot?.name}</span>
											</div>
										))}
								</div>
								<div className="body-shape-back">
									<img src={'/images/rom/back.png'} width={240} alt="" />
									{bodyPointData
										.filter((val: TStrapiBodyPoints) => val.position === 'back')
										.map((hotspot: TStrapiBodyPoints, index: number) => (
											<div
												key={index}
												style={
													hotspot.romStyle
														? Object.fromEntries(
																Object.entries(hotspot.romStyle).filter(
																	([_, value]) => value !== null,
																),
															)
														: undefined
												}
												className={
													hotspot.name === activeRightName
														? 'hotspot-circle active'
														: hotspot.isSaved
															? 'hotspot-circle saved'
															: 'hotspot-circle'
												}
												onClick={e => {
													e.preventDefault();
													setActivePointRight(hotspot);
												}}>
												<span className="tooltiptext">{hotspot.name}</span>
											</div>
										))}
								</div>
							</div>
						</div>
					)}
				</Col>
				<Col span={6} className="pain-col">
					{activeRightName ? (
						<Card
							size="small"
							variant="borderless"
							title={activeRightName}
							extra={
								<div style={{ display: 'flex' }}>
									{isUpdateBack && (
										<Tooltip
											placement="topRight"
											title={t(
												'Patient.data.virtualEvaluation.painAssesment.delete',
											)}
											showArrow={false}>
											<span
												className="icon-pointer icon-spacing-css"
												onClick={() => deleteRecord('right')}>
												<UntitledIcon name="delete" size={16} />
											</span>
										</Tooltip>
									)}
									<span className="icon-pointer" onClick={closeRight}>
										<UntitledIcon name="close" size={16} />
									</span>
								</div>
							}>
							<>
								<div className="label-text">
									{t('Patient.data.onboard.painLevel')}
								</div>
								<div className="slider-container">
									<span className="slider-label">0</span>
									<div className="slider-wrapper">
										<Slider
											min={0}
											max={10}
											defaultValue={5}
											value={formDataRight.painLevel}
											onChange={handleSliderRightChange}
										/>
									</div>
									<span className="slider-label">10</span>
								</div>
								{bodyPointOptionsRight.map(
									(item: BodyPointDropdownOption, i: number) => {
										const multiple =
											item.key != 'strapiPainDurationId' &&
											item.key != 'strapiPainFrequencyId' &&
											item.key != 'strapiPainStatusId';
										return (
											<div className="select-container" key={i}>
												<div className="text-gray-700 font-semibold">
													{item.name}
												</div>
												<Select
													mode={multiple ? 'multiple' : undefined}
													size="small"
													placeholder={t(
														'Patient.data.virtualEvaluation.painAssesment.selectAnOption',
													)}
													defaultValue={item.selectedOption}
													onChange={onSelectBack(item.key || '')}
													className="w-full body-point-select theme-select-dropdown"
													options={item.options}
													showSearch={false}
													style={{ minHeight: 'var(--spacing-10)' }}
													status={
														errorObject.includes(item.key) && isSaveClick
															? 'error'
															: ''
													}
												/>
											</div>
										);
									},
								)}
								<div className="button-wrapper">
									<Button
										type="primary"
										size="large"
										block
										style={{ borderRadius: 'var(--radius-full)' }}
										onClick={
											isUpdateBack ? onClickUpdateRight : onClickSaveRight
										}>
										{isUpdateBack
											? t('Patient.data.virtualEvaluation.painAssesment.update')
											: t('Patient.data.virtualEvaluation.painAssesment.save')}
									</Button>
								</div>
							</>
						</Card>
					) : (
						<div className="empty-div-css"></div>
					)}
				</Col>
			</Row>
		</div>
	);
};

export default MBodyPoints;
