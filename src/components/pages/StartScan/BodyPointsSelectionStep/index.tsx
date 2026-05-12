import { UntitledIcon } from '@atoms/Icon';
import { BODY_POINTS } from '@pages/PatientOnboard/MBodyPoints/bodyPoint_constants';
import { TStrapiBodyPoints } from '@pages/PatientOnboard/MBodyPoints/interface';
import {
	nextSequence,
	updateOmniRomRecordConsult,
} from '@stores/clinical/rehab/main';
import { fetchExercises } from '@stores/clinical/rom/results';
import { saveOmniRomPhysioterapistVideo } from '@stores/clinical/rom/romTemplates';
import { getBodyPointStrapi } from '@stores/content/myLibrary/myLibrary';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { ExercisePoints, RehabVideoState, SimplifiedPoints } from '@types';
import {
	Button,
	Card,
	Col,
	Flex,
	Form,
	Input,
	Row,
	Select,
	Space,
	Tooltip,
	Typography,
	message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BodyPointOptionsRightMockData } from './BodyPointOptionsRightMockData';
import './style.css';

const { Title } = Typography;

interface IRomImageModal {
	setVideoState: (value: RehabVideoState | undefined) => void;
}

export default function BodypointsSelectionStep(props: IRomImageModal) {
	const { setVideoState } = props;
	const { t } = useTranslation();
	const [activeRightName, setActiveRightName] = useState('');
	const [bodyPointData, setBodyPointData] = useState<TStrapiBodyPoints[]>([]);
	const [selectedBodyPoint, setSelectedBodyPoint] = useState<number | null>(
		null,
	);
	const [savedBodyPoints, setSavedBodyPoints] = useState<unknown[]>([]);
	const [exerciseData, setExerciseData] = useState<unknown[]>([]);
	const [formDataRight, setFormDataRight] = useState({
		normal: 0,
		wfl: 0,
		min: 0,
		max: 0,
		kinematics: '',
		pointsToCalculateAngle: {},
		pointsToValidatePosition: {},
		function: '',
	});
	const [form] = Form.useForm();
	const [isSaveClick, setIsSaveClick] = useState(false);
	const [errorObject, setErrorObject] = useState<string[]>([]);
	const [combinedName, setCombinedName] = useState('');
	const [kinematicsValue, setKinematicsValue] = useState('');

	const dispatch = useTypedDispatch();
	const { isOmniRomRecord, sequence } = useTypedSelector(
		state => state.rehab.main,
	);
	const { romUploadDetails } = useTypedSelector(
		state => state.rom.romTemplates,
	);
	const user = useTypedSelector(state => state.user);

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const simplifyPoints = (points: ExercisePoints): SimplifiedPoints => {
		return {
			a: {
				value: points?.a?.value,
				name: points?.a?.name,
			},
			b: {
				value: points?.b?.value,
				name: points?.b?.name,
			},
			c: {
				value: points?.c?.value,
				name: points?.c?.name,
			},
		};
	};

	useEffect(() => {
		if (selectedBodyPoint !== null && activeRightName && combinedName) {
			if (combinedName.includes('Spine')) {
				setCombinedName(combinedName.replace('Spine', 'Lumbar'));
			}

			const selectedExercise = exerciseData.find(
				exercise =>
					exercise?.name?.trim().toLowerCase() ===
					combinedName?.trim().toLowerCase(),
			);

			if (selectedExercise) {
				const value =
					selectedExercise.reference?.name?.includes(kinematicsValue);
				setFormDataRight(() => ({
					strapiOmniRomExerciseId: selectedExercise?.id,
					function: selectedExercise?.function,
					pointsToCalculateAngle: simplifyPoints(
						selectedExercise?.pointsToCalculateAngle,
					),
					pointsToValidatePosition: simplifyPoints(
						selectedExercise?.pointsToValidatePosition,
					),
					normal: selectedExercise.reference?.normal,
					wfl: selectedExercise.reference?.wfl,
					min: selectedExercise.reference?.min,
					max: selectedExercise.reference?.normal,
					kinematics: value,
				}));
			}
		}
	}, [
		activeRightName,
		selectedBodyPoint,
		exerciseData,
		combinedName,
		kinematicsValue,
	]);

	useEffect(() => {
		setFormDataRight({
			pointsToCalculateAngle: '',
			pointsToValidatePosition: '',
			function: '',
			normal: 0,
			wfl: 0,
			min: 0,
			max: 0,
			kinematics: '',
		});
		setCombinedName('');
		setKinematicsValue('');
		form.resetFields();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeRightName]);

	useEffect(() => {
		form.setFieldsValue(formDataRight);
	}, [formDataRight, form]);

	const fetchData = async () => {
		const data = await dispatch(getBodyPointStrapi());
		const strapiData = data.payload;
		const temp_data: TStrapiBodyPoints[] = strapiData.map(
			(item: TStrapiBodyPoints) => ({
				...item,
				romStyle: BODY_POINTS.find(
					(point: TStrapiBodyPoints) => point.id === item.id,
				)?.romStyle,
			}),
		);
		setBodyPointData(temp_data);
		const exercises = await dispatch(fetchExercises());
		setExerciseData(exercises.payload);
	};

	const onBodyPoint = (bodyPoint: TStrapiBodyPoints) => {
		setSelectedBodyPoint(bodyPoint.id);
		setActiveRightName(bodyPoint.name);
	};

	const closeRight = () => {
		setActiveRightName('');
	};

	const onSelectBack = (name: string) => (value: string | string[]) => {
		setErrorObject(prevErrors =>
			prevErrors.filter((item: string) => item !== name),
		);
		setKinematicsValue(value);
		setFormDataRight(prevFormData => ({ ...prevFormData, kinematics: value }));

		const combinedExerciseName = `${activeRightName} ${Array.isArray(value) ? value.join(' ') : value}`;
		setCombinedName(combinedExerciseName);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormDataRight(prevFormData => ({
			...prevFormData,
			[name]: parseInt(value) || 0,
		}));
	};

	const handleSaveButton = () => {
		setIsSaveClick(true);

		const newBodyPoint = {
			...formDataRight,
			name: activeRightName,
			kinematics: kinematicsValue,
		};
		setSavedBodyPoints(prevBodyPoints => {
			const existingIndex = prevBodyPoints.findIndex(
				point => point.name === activeRightName,
			);
			if (existingIndex !== -1) {
				const updatedPoints = [...prevBodyPoints];
				updatedPoints[existingIndex] = {
					...prevBodyPoints[existingIndex],
					...newBodyPoint,
				};
				return updatedPoints;
			}
			return [...prevBodyPoints, newBodyPoint];
		});

		setBodyPointData(prevData =>
			prevData.map(point =>
				point.name === activeRightName ? { ...point, isSaved: true } : point,
			),
		);

		message.success(t('Patient.data.vitalscan-rom.savedMsg'));
		closeRight();
	};

	const handleNextButton = async () => {
		if (savedBodyPoints.length === 0) {
			message.error(t('Patient.data.vitalscan-rom.bodyPointErr'));
			return;
		}
		if (isOmniRomRecord) {
			dispatch(nextSequence(sequence?.next));
			dispatch(updateOmniRomRecordConsult(savedBodyPoints));
			setVideoState(RehabVideoState.START);
		} else {
			dispatch(nextSequence({ value: 'resultRecordScreen', next: null }));

			const form = new FormData();
			form.append('physioterapistId', user.id);
			const videos = romUploadDetails.videos
				? [...romUploadDetails.videos]
				: [];
			videos.forEach(video => {
				form.append('video', video);
			});

			savedBodyPoints?.forEach((exercise, index: number) => {
				form.append(
					`exercises[create][${index}][strapiOmniRomExerciseId]`,
					exercise?.strapiOmniRomExerciseId || 0,
				);
				form.append(`exercises[create][${index}][normal]`, exercise?.normal);
				form.append(`exercises[create][${index}][wfl]`, exercise?.wfl);
				form.append(`exercises[create][${index}][min]`, exercise?.min);
				form.append(`exercises[create][${index}][max]`, exercise?.max);
			});

			for (const [key, value] of Object.entries(romUploadDetails)) {
				if (key !== 'videos') {
					form.append(key, value || '');
				}
			}
			try {
				await dispatch(saveOmniRomPhysioterapistVideo(form));
				message.success(t('Patient.data.vitalscan-rom.saveSuccess'));
			} catch (error) {
				// Error saving video - user already notified via Redux error state
				message.error(t('Patient.data.vitalscan-rom.saveError'));
			}
		}
	};

	const deleteBodyPoint = () => {
		setSavedBodyPoints(prevPoints =>
			prevPoints.filter(point => point.name !== activeRightName),
		);
		setBodyPointData(prevData =>
			prevData.map(point =>
				point.name === activeRightName ? { ...point, isSaved: false } : point,
			),
		);
		message.success(t('Patient.data.vitalscan-rom.bodyPointDeleted'));
		closeRight();
	};

	return (
		<Flex
			vertical
			style={{
				width: '100%',
				height: '100%',
				maxHeight: '100%',
				overflow: 'hidden',
			}}>
			<Title
				level={3}
				style={{ margin: 0, marginBottom: 'var(--spacing-3)', flexShrink: 0 }}>
				{t('Patient.data.vitalscan-rom.selectBodyParts')}:
			</Title>
			<Flex
				gap={16}
				style={{
					flex: 1,
					minHeight: 0,
					overflow: 'auto',
					width: '100%',
				}}>
				{savedBodyPoints.length > 0 && (
					<Card className="antd-custom-card-css">
						<Title level={5} className="extra-margin">
							📋 {t('Patient.data.vitalscan-rom.savedBodyPoints')}
						</Title>
						<ul>
							{savedBodyPoints.map((item, index) => (
								<li key={index}>
									<strong>{item.name}</strong> - {item.kinematics}
								</li>
							))}
						</ul>
					</Card>
				)}
				<div>
					<Card>
						<div className="body-shape-front-css">
							<img
								src="/assets/front_view.png"
								width={240}
								alt={t('Patient.data.vitalscan-rom.bodyFrontAlt')}
							/>
							{bodyPointData
								.filter(val => val.position === 'front')
								.map((hotspot, index) => (
									<>
										<Tooltip title={hotspot.name} placement="top">
											<div
												key={index}
												style={hotspot.romStyle}
												className={
													hotspot.name === activeRightName
														? 'hotspot-circle-selection active'
														: hotspot.isSaved
															? 'hotspot-circle-selection saved'
															: 'hotspot-circle-selection'
												}
												onClick={e => {
													e.preventDefault();
													onBodyPoint(hotspot);
												}}
											/>
										</Tooltip>
									</>
								))}
						</div>
						<Button onClick={handleNextButton} block>
							<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								{isOmniRomRecord
									? t('Patient.data.vitalscan-rom.next')
									: t('Patient.data.vitalscan-rom.save')}
								<UntitledIcon name="arrowRight" size={20} />
							</span>
						</Button>
					</Card>
				</div>
				{activeRightName && (
					<Card className="antd-custom-card-css">
						<Flex
							vertical
							gap={16}
							style={{
								padding: 'var(--spacing-4)',
							}}>
							<Flex justify="space-between" align="center">
								<Title
									level={5}
									style={{
										margin: 0,
									}}>
									{activeRightName.toUpperCase()}
								</Title>
								<Flex gap={8} align="center">
									{savedBodyPoints.some(
										point => point.name === activeRightName,
									) && (
										<span
											style={{ cursor: 'pointer', display: 'flex' }}
											onClick={deleteBodyPoint}>
											<UntitledIcon name="delete" />
										</span>
									)}
									<span
										style={{ cursor: 'pointer', display: 'flex' }}
										onClick={closeRight}>
										<UntitledIcon name="close" />
									</span>
								</Flex>
							</Flex>
							<Form
								form={form}
								layout="vertical"
								onFinish={handleSaveButton}
								initialValues={formDataRight}>
								<Form.Item
									name="kinematics"
									label={activeRightName.toUpperCase()}>
									<Space direction="vertical" className="w-full">
										<Select
											size="large"
											placeholder={t(
												'Patient.data.virtualEvaluation.painAssesment.selectAnOption',
											)}
											value={kinematicsValue}
											onChange={onSelectBack(
												BodyPointOptionsRightMockData.find(
													item => item.name === activeRightName,
												)?.key || '',
											)}
											className="w-full"
											options={
												BodyPointOptionsRightMockData.find(
													item => item.name === activeRightName,
												)?.options
											}
											showSearch={false}
											status={
												errorObject.includes(
													BodyPointOptionsRightMockData?.find(
														item => item?.name === activeRightName,
													)?.key,
												) && isSaveClick
													? 'error'
													: ''
											}
										/>
									</Space>
								</Form.Item>
								<Row gutter={24} className="mt-2">
									<Col span={12}>
										<Form.Item
											label={t('Patient.data.vitalscan-rom.labelNormal')}
											name="normal">
											<Input
												type="number"
												name="normal"
												defaultValue={formDataRight.normal}
												onChange={handleInputChange}
												placeholder={t('Patient.data.vitalscan-rom.enterNormal')}
											/>
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											label={t('Patient.data.vitalscan-rom.labelWFL')}
											name="wfl">
											<Input
												type="number"
												name="wfl"
												defaultValue={formDataRight.wfl}
												onChange={handleInputChange}
												placeholder={t('Patient.data.vitalscan-rom.enterWFL')}
											/>
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											label={t('Patient.data.vitalscan-rom.labelMin')}
											name="min">
											<Input
												type="number"
												name="min"
												defaultValue={formDataRight.min}
												onChange={handleInputChange}
												placeholder={t('Patient.data.vitalscan-rom.enterMin')}
											/>
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											label={t('Patient.data.vitalscan-rom.labelMax')}
											name="max">
											<Input
												type="number"
												name="max"
												defaultValue={formDataRight.max}
												onChange={handleInputChange}
												placeholder={t('Patient.data.vitalscan-rom.enterMax')}
											/>
										</Form.Item>
									</Col>
								</Row>
								<Button htmlType="submit" block>
									{t('Patient.data.vitalscan-rom.save')}
								</Button>
							</Form>
						</Flex>
					</Card>
				)}
			</Flex>
		</Flex>
	);
}
