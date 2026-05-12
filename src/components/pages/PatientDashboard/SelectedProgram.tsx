import { UntitledIcon } from '@atoms/Icon';
import { useBlockNavigation } from '@atoms/BlockNavigation';
import { showCustomModal } from '@atoms/CustomModalInfo';
import { Target04 } from '@vitalflow-icons/general/target04';
import { router } from '@routers/routers';
import { ACTIVETAB, INTAKE_STEPS } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import {
	createProgram,
	selectExercise,
	selectProgram} from '@stores/shared/patientDetail/program';
import type {
	IProgramExercise,
	SelectedProgram,
	SelectedProgramProps} from '@types';
import {
	Button,
	Card,
	Col,
	Divider,
	Popover,
	Row,
	Typography,
	message} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const { Paragraph, Title, Text } = Typography;

const SelectedProgram = ({ state: customState }: SelectedProgramProps) => {
	const location = useLocation();
	const state = customState || location;
	const { t } = useTranslation();
	const [showAllExercises, setShowAllExercises] = useState(false);
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();
	const { clearNavigation } = useBlockNavigation();

	const activeTab = useTypedSelector(
		state => state.patientDetail.patientDetail.activeTab,
	);
	const user = useTypedSelector(state => state.user);

	useEffect(() => {
		if (activeTab !== ACTIVETAB.HOME) dispatch(setActiveTab(ACTIVETAB.HOME));
	}, [activeTab, dispatch]);

	useEffect(() => {
		if (state?.state?.domain !== INTAKE_STEPS.STEP_PROGRAM)
			window.scrollTo(0, 0);
	}, [state?.state?.domain]);

	const handleEnroll = async (item: SelectedProgram) => {
		const exercises = (item?.exercises ?? []).map((exercise, index) => ({
			strapiExerciseId:
				typeof exercise?.strapiExerciseId === 'object' &&
				exercise?.strapiExerciseId !== null &&
				'id' in exercise.strapiExerciseId
					? String(exercise.strapiExerciseId.vitalflowId ?? '')
					: String(exercise?.strapiExerciseId || ''),
			exerciseLibraryId: exercise.exerciseLibraryId || '',
			weeklyReps: exercise.weeklyReps,
			dailyReps: exercise.dailyReps,
			sets: exercise.sets,
			reps: exercise.reps,
			order: index + 1,
		}));

		const formData = new FormData();
		formData.append('name', item?.name);
		formData.append('duration', String(item?.duration));
		formData.append('durationType', item?.durationType);
		formData.append('description', item?.description);
		formData.append(
			'thumbnail',
			typeof item?.thumbnail === 'object' && 'url' in item.thumbnail
				? item.thumbnail.url
				: item?.thumbnail,
		);
		if (!user?.id) return;
		formData.append('userId', String(user.id));
		formData.append('strapiProgramTemplateId', item?.id);

		exercises.forEach((exercise, i) =>
			Object.entries(exercise).forEach(
				([key, value]) =>
					value &&
					formData.append(`exercises[create][${i}][${key}]`, String(value)),
			),
		);

		const data = await dispatch(createProgram(formData));
		if (data?.payload?.id) {
			message.success(t('patient.dashboard.new.enrolled'));
		} else {
			const errorMessage = data?.payload;
			message.destroy();
			message.error(errorMessage);
		}
	};

	const startProgramSession = (item: { exercises: IProgramExercise[] }) => {
		dispatch(selectProgram(item));
		dispatch(selectExercise(item?.exercises ?? []));
		clearNavigation();
		navigate(`/${user.id}${router.AIASSISTANT_PROGRAM_START}`);
		dispatch(setActiveTab(''));
	};

	const selected = state?.state?.selectedProgram;
	const exercisesToShow = showAllExercises
		? selected?.exercises
		: (selected?.exercises ?? []).slice(0, 5);

	const popoverContent = (
		<div>
			<Title level={5}>
				<Target04 width={17} height={17} color="stroke-gray-700" />{' '}
				{t('patient.dashboard.new.functionalGoals')}
			</Title>
			<Divider />
			<ul style={{ paddingLeft: 'var(--spacing-4)' }}>
				{(selected?.functional_goals ?? []).map(goal => (
					<li key={goal.name}>{goal.name}</li>
				))}
			</ul>
		</div>
	);

	return (
		<div style={{ padding: 24 }}>
			{/* Header Section */}
			<Row gutter={[24, 24]} align="middle">
				<Col xs={24} md={10}>
					<Card bordered={false}>
						<img
							src={
								selected?.thumbnail?.url ||
								selected?.thumbnail ||
								selected?.exercises?.[0]?.image
							}
							alt={selected?.name}
							style={{
								width: '100%',
								height: 280,
								objectFit: 'cover',
								borderRadius: 8,
							}}
						/>
					</Card>
				</Col>

				<Col xs={24} md={14}>
					<Text style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<UntitledIcon name="calendar" size={14} /> {selected?.duration} {selected?.durationType}
					</Text>

					<Title level={3} style={{ marginTop: 12 }}>
						{selected?.name}
					</Title>

					<div style={{ marginBottom: 8 }}>
						{(selected?.functional_goals ?? []).slice(0, 2).map(goal => (
							<Text key={goal.name} style={{ display: 'block' }}>
								• {goal.name}
							</Text>
						))}
						{(selected?.functional_goals?.length ?? 0) > 2 && (
							<Popover content={popoverContent} trigger="hover">
								<Button type="link" style={{ padding: 0 }}>
									{t('patient.dashboard.new.showAll')}
								</Button>
							</Popover>
						)}
					</div>

					<Popover
						content={selected?.description}
						overlayInnerStyle={{ maxWidth: '50vw', whiteSpace: 'normal' }}>
						<Paragraph ellipsis={{ rows: 3, expandable: false }}>
							{selected?.description}
						</Paragraph>
					</Popover>

					{state?.state?.domain !== INTAKE_STEPS.STEP_PROGRAM && (
						<Button
							type="primary"
							size="large"
							style={{ width: 200, marginTop: 16 }}
							onClick={e => {
								e.stopPropagation();
								state?.state?.domain === INTAKE_STEPS.SUGGESTED
									? handleEnroll(selected)
									: startProgramSession(selected);
							}}>
							{state?.state?.domain === INTAKE_STEPS.SUGGESTED
								? t('patient.dashboard.new.enroll')
								: t('patient.progress.rehab.startSession')}
						</Button>
					)}
				</Col>
			</Row>

			{/* Exercises Section */}
			<Divider />
			<Title level={4} style={{ marginBottom: 16 }}>
				{(selected?.exercises?.length ?? 0) > 1
					? t('patient.dashboard.new.exercises')
					: t('patient.dashboard.new.exercise')}
			</Title>

			{exercisesToShow?.map((item, index) => (
				<Card
					key={index}
					style={{ marginBottom: 16 }}
					bodyStyle={{ padding: 16 }}>
					<Row gutter={[16, 16]} align="middle">
						<Col span={1}>
							<Title level={5}>{index + 1}</Title>
						</Col>
						<Col span={3}>
							<div
								style={{
									position: 'relative',
									cursor: 'pointer',
									display: 'inline-block',
								}}
								onMouseEnter={e => {
									const overlay = e.currentTarget.querySelector('.overlay');
									if (overlay) overlay.style.opacity = '1';
								}}
								onMouseLeave={e => {
									const overlay = e.currentTarget.querySelector('.overlay');
									if (overlay) overlay.style.opacity = '0';
								}}
								onClick={() =>
									showCustomModal({
										video:
											item?.assets?.[0]?.video?.url ||
											item?.strapiExerciseId?.exercise_video?.[0]?.url,
										name: item?.strapiExerciseId?.name || item?.name,
										description:
											item?.strapiExerciseId?.description || item?.description,
									})
								}>
								<img
									src={
										item?.assets?.[0]?.image?.url ||
										item?.strapiExerciseId?.exercise_image?.[0]?.url ||
										selected?.thumbnail?.url
									}
									alt={item?.name}
									style={{
										width: 100,
										height: 100,
										borderRadius: 8,
										objectFit: 'cover',
										display: 'block',
									}}
								/>
								<div
									className="overlay"
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: '100%',
										borderRadius: 8,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										opacity: 0,
										transition: 'opacity 0.3s ease',
										zIndex: 2,
									}}>
									<UntitledIcon
									name="playCircle"
									size={40}
										style={{
											fontSize: 40,
											color: 'var(--stroke-default-white)',
											pointerEvents: 'none',
										}}
									/>
								</div>
							</div>
						</Col>
						<Col span={20}>
							<Title level={5} style={{ marginBottom: 4 }}>
								{item?.strapiExerciseId?.name || item?.name}
							</Title>
							<Text>
								{t('Patient.data.rehab.weekly')} {item?.weeklyReps}×{' '}
								{t('Patient.data.rehab.daily')} {item?.dailyReps}×{' '}
								{t('Patient.data.rehab.sets')} {item?.sets}×{' '}
								{t('Patient.data.rehab.reps')} {item?.reps}×
							</Text>
							<Paragraph style={{ marginTop: 8 }}>
								{item?.strapiExerciseId?.description || item?.description}
							</Paragraph>
						</Col>
					</Row>
				</Card>
			))}

			{!showAllExercises && (selected?.exercises?.length ?? 0) > 5 && (
				<div style={{ textAlign: 'center', marginTop: 16 }}>
					<Button shape="circle" onClick={() => setShowAllExercises(true)}>
						<UntitledIcon name="chevronDown" size={14} />
					</Button>
				</div>
			)}
		</div>
	);
};

export default SelectedProgram;
