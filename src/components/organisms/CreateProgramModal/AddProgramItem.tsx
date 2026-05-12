import { DatePicker } from '@atoms/DatePicker';
import { UntitledIcon } from '@atoms/Icon';
import {
	Button,
	Checkbox,
	Col,
	Flex,
	Input,
	Row,
	Select,
	Space,
	Spin,
	Typography,
	message,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCorners,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';

import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AddProgramItemProps, IProgramExercise } from '@types';
import { useRef } from 'react';
import { AddExerciseItem } from './AddExerciseItem';

const { Paragraph } = Typography;
const { Option } = Select;

export default function AddProgramItem(props: AddProgramItemProps) {
	const {
		selectedExercises,
		isSaveTemplateVisible,
		isSaveTemplate,
		setSelectedExercises,
		validateProgram,
		handleRemoveExercise,
		setSaveTemplate,
		SetLibraryModalVisible,
		programName,
		setProgramName,
		setProgramStartDate,
		programStartDate,
		duration,
		setDuration,
		setDurationType,
		durationType,
		programDescription,
		setProgramDescription,
		setImgFile,
		previewImage,
		setPreviewImage,
		previewUnSplashedImage,
		setPreviewUnSplashedImage,
		isSaving
	} = props;
	const { t } = useTranslation();
	const currentDate = dayjs().format('YYYY-MM-DD');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const getTaskPos = (id: string) =>
		selectedExercises?.findIndex(exercise => exercise.id === id);

	const handleDragEnd = (event: {
		active: IProgramExercise;
		over: IProgramExercise;
	}) => {
		const { active, over } = event;
		if (active.id === over.id) return;
		const originalPos = getTaskPos(active.id);
		const newPos = getTaskPos(over.id);
		const newArray = [...selectedExercises];
		[newArray[originalPos], newArray[newPos]] = [
			newArray[newPos],
			newArray[originalPos],
		];
		setSelectedExercises(newArray);
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.type.startsWith('image/')) {
				const fileUrl = URL.createObjectURL(file);
				setImgFile(file);
				setPreviewImage(fileUrl);
				setPreviewUnSplashedImage(null);
			} else {
				message.error(
					t(
						'Admin.data.menu.patientDetail.aiAssistantPrograms.imageRequirement',
					),
				);
			}
		}
	};

	const updatePropertyAtIndex = (
		index: number,
		newReps: number,
		property: string,
	) => {
		setSelectedExercises(
			selectedExercises.map((exercise, idx) => {
				if (idx === index) {
					return {
						...exercise,
						[property]: newReps,
					};
				}
				return exercise;
			}),
		);
	};

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	return (
		<>
			<Row gutter={[16, 16]} style={{ marginBottom: 'var(--spacing-4)' }}>
				<Col xs={24} sm={24} md={6} lg={5}>
					<div
						className="program-cover-image-container"
						onClick={() => fileInputRef.current?.click()}>
						{previewImage &&
						previewImage !== 'null' &&
						previewImage !== 'undefined' ? (
							<img
								src={previewImage}
								alt={t(
									'Admin.data.menu.patientDetail.aiAssistantPrograms.preview',
								)}
								className="cover-image-preview"
							/>
						) : previewUnSplashedImage &&
						  previewUnSplashedImage !== 'null' &&
						  previewUnSplashedImage !== 'undefined' ? (
							<img
								src={previewUnSplashedImage}
								alt={t(
									'Admin.data.menu.patientDetail.aiAssistantPrograms.preview',
								)}
								className="cover-image-preview"
							/>
						) : (
							<Flex
								vertical
								align="center"
								justify="center"
								className="cover-image-empty">
								<UntitledIcon
									name="image"
									size={50}
									color="var(--border-secondary)"
								/>
								<Typography.Text
									style={{
										fontSize: 'var(--font-size-sm)',
										color: 'var(--text-tertiary)',
										marginTop: 'var(--spacing-2)',
									}}>
									{t('Admin.data.survey.uploadImage')}
								</Typography.Text>
							</Flex>
						)}
						<div
							className="cover-image-overlay"
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
							}}>
							<div>
								<UntitledIcon name="upload" size={30} />
							</div>
							<Typography.Text className="cover-image-overlay-text">
								{previewImage
									? t('Admin.data.survey.changeImage')
									: t('Admin.data.survey.upload')}
							</Typography.Text>
						</div>
					</div>
					<input
						type="file"
						ref={fileInputRef}
						style={{ display: 'none' }}
						accept="image/*"
						onChange={handleFileChange}
					/>
				</Col>
				<Col xs={24} sm={24} md={18} lg={19}>
					<Space direction="vertical" size="middle" style={{ width: '100%' }}>
						<Row gutter={[16, 16]}>
							<Col xs={24} sm={24} md={12}>
								<Space
									direction="vertical"
									size="small"
									style={{ width: '100%' }}>
									<Typography.Text className="form-label">
										{t(
											'Admin.data.menu.patientDetail.aiAssistantPrograms.titleLabel',
										)}
										<span style={{ color: 'var(--color-error-500)' }}>*</span>
									</Typography.Text>
									<Input
										size="large"
										placeholder={t(
											'Admin.data.menu.patientDetail.aiAssistantPrograms.titleLabel',
										)}
										value={programName}
										onChange={e => setProgramName(e.target.value)}
									/>
								</Space>
							</Col>
							<Col xs={24} sm={12} md={6}>
								<Space
									direction="vertical"
									size="small"
									style={{ width: '100%' }}>
									<Typography.Text className="form-label">
										{t(
											'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.startDate',
										)}
										<span style={{ color: 'var(--color-error-500)' }}>*</span>
									</Typography.Text>
									<DatePicker
										size="large"
										style={{ width: '100%' }}
										onChange={date =>
											setProgramStartDate(
												date ? dayjs(date).format('YYYY-MM-DD') : '',
											)
										}
										format="YYYY-MM-DD"
										value={
											programStartDate ? dayjs(currentDate, 'YYYY-MM-DD') : null
										}
										disabledDate={(current: Dayjs) =>
											current.isBefore(dayjs(), 'day')
										}
									/>
								</Space>
							</Col>
							<Col xs={24} sm={12} md={6}>
								<Space
									direction="vertical"
									size="small"
									style={{ width: '100%' }}>
									<Typography.Text className="form-label">
										{t(
											'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.duration',
										)}
										<span style={{ color: 'var(--color-error-500)' }}>*</span>
									</Typography.Text>
									<Space.Compact style={{ width: '100%' }}>
										<Input
											type="number"
											size="large"
											style={{ width: '40%' }}
											onClick={e => e.stopPropagation()}
											value={duration || undefined}
											onChange={e => setDuration(parseInt(e.target.value))}
											placeholder={t(
												'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.duration',
											)}
										/>
										<Select
											size="large"
											style={{ width: '60%' }}
											onChange={value => setDurationType(value)}
											value={durationType || undefined}
											className="duration-type-select theme-select-dropdown"
											dropdownClassName="plan-option-class"
											placeholder={t(
												'Admin.data.menu.patientDetail.aiAssistantPrograms.durationType',
											)}
											allowClear>
											<Option value="days">
												{t(
													'Admin.data.menu.patientDetail.aiAssistantPrograms.days',
												)}
											</Option>
											<Option value="weeks">
												{t(
													'Admin.data.menu.patientDetail.aiAssistantPrograms.weeks',
												)}
											</Option>
											<Option value="months">
												{t(
													'Admin.data.menu.patientDetail.aiAssistantPrograms.months',
												)}
											</Option>
											<Option value="years">
												{t(
													'Admin.data.menu.patientDetail.aiAssistantPrograms.years',
												)}
											</Option>
										</Select>
									</Space.Compact>
								</Space>
							</Col>
						</Row>
						<Space direction="vertical" size="small" style={{ width: '100%' }}>
							<Typography.Text className="form-label">
								{t(
									'Admin.data.menu.patientDetail.aiAssistantPrograms.descriptionLabel',
								)}
								<span style={{ color: 'var(--color-error-500)' }}>*</span>
							</Typography.Text>
							<Input.TextArea
								size="large"
								rows={3}
								placeholder={t(
									'Admin.data.menu.patientDetail.aiAssistantPrograms.descriptionLabel',
								)}
								value={programDescription}
								onChange={e => setProgramDescription(e.target.value)}
								style={{ resize: 'none' }}
							/>
						</Space>
					</Space>
				</Col>
			</Row>
			<Button
				type="dashed"
				size="large"
				block
				icon={<UntitledIcon name="plus" size={20} />}
				onClick={() => SetLibraryModalVisible(true)}
				style={{
					marginTop: 'var(--spacing-3)',
					marginBottom: 'var(--spacing-3)',
					height: 'var(--spacing-12)',
					fontSize: 'var(--font-size-md)',
					color: 'var(--text-tertiary)',
					borderColor: 'var(--border-secondary)',
					borderWidth: 'var(--spacing-0-5)',
				}}>
				{t('Admin.data.menu.patientDetail.aiAssistantPrograms.addExercises')}
			</Button>
			<div className="exercises-list-container">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCorners}
					onDragEnd={handleDragEnd}>
					<SortableContext
						items={selectedExercises}
						strategy={verticalListSortingStrategy}>
						{selectedExercises?.map((item, index) => (
							<AddExerciseItem
								key={item.id}
								handleRemoveExercise={handleRemoveExercise}
								index={index}
								id={item.id}
								exercise={item}
								length={selectedExercises?.length}
								updatePropertyAtIndex={updatePropertyAtIndex}
							/>
						))}
					</SortableContext>
				</DndContext>
			</div>
			{!isSaveTemplateVisible && (
				<Space
					align="center"
					size="small"
					style={{
						display: 'flex',
						justifyContent: 'center',
						marginTop: 'var(--spacing-3)',
					}}>
					<Checkbox
						id="selectSaveTemplate"
						checked={isSaveTemplate}
						onChange={() => setSaveTemplate(!isSaveTemplate)}
					/>
					<Typography.Text
						style={{
							fontSize: 'var(--font-size-md)',
							color: 'var(--text-primary)',
						}}>
						{t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.saveTemplate',
						)}
					</Typography.Text>
				</Space>
			)}
			<div
  className={`save-program-button ${isSaving ? 'disabled' : ''}`}
  onClick={() => {
    if (!isSaving) validateProgram();
  }}
>

				{isSaving ? (
  <Spin />
) : (
  <UntitledIcon name="check" color="var(--text-on-brand)" />
)}
				<Typography.Text
					style={{
						fontSize: 'var(--font-size-md)',
						color: 'inherit',
						fontWeight: 'var(--font-weight-semibold)',
					}}>
					{t('Admin.data.menu.patientDetail.aiAssistantPrograms.save')}
				</Typography.Text>
			</div>
		</>
	);
}
