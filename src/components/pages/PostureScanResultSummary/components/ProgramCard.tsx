import { router } from '@routers/routers';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { ProgramTemplate } from '@types';
import {
	Button,
	Card,
	Col,
	Divider,
	Flex,
	QRCode,
	Row,
	Typography,
	message,
} from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// REMOVED: import { stringify } from 'qs';
import { createProgram } from '@stores/shared/patientDetail/program';

const { Title, Text, Paragraph } = Typography;

interface ProgramCardProps {
	program: ProgramTemplate;
}

function ProgramCard({ program }: ProgramCardProps) {
	const navigate = useNavigate();
	const [expanded, setExpanded] = useState(false);
	const [loading, setLoading] = useState(false);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const description = program?.description || '';
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();

	const locationLoad = () => {
		if (user?.isPhysioterapist) {
			return `${window.location.origin}/${user?.isPhysioterapist ? selectedUser?.id : user?.id}${router.PATIENTVIEW}`;
		} else {
			return `${window.location.origin}`;
		}
	};

	const handleEnroll = async (item: ProgramTemplate) => {
		setLoading(true);

		try {
			const exercises: {
				strapiExerciseId: string;
				weeklyReps: number;
				dailyReps: number;
				sets: number;
				reps: number;
				order: number;
			}[] = [];

			item?.exercises?.forEach((exercise, index: number) => {
				const tempExercise = {
					strapiExerciseId: String(
						typeof exercise?.strapiExerciseId === 'object'
							? exercise?.strapiExerciseId?.id
							: exercise?.strapiExerciseId || '',
					),
					weeklyReps: exercise.weeklyReps,
					dailyReps: exercise.dailyReps,
					sets: exercise.sets,
					reps: exercise.reps,
					order: index + 1,
				};
				exercises.push(tempExercise);
			});

			const formData = new FormData();
			formData.append('name', item?.name);
			formData.append('duration', item?.duration.toString());
			formData.append('durationType', item?.durationType);
			formData.append('description', item?.description as string);
			formData.append(
				'thumbnail',
				typeof item?.thumbnail === 'string'
					? item?.thumbnail
					: item?.thumbnail?.url || '',
			);
			if (user.isPhysioterapist ? selectedUser?.id : user?.id) {
				formData.append(
					'userId',
					String(user.isPhysioterapist ? selectedUser?.id : user?.id),
				);
			} else {
				return;
			}
			formData.append('strapiProgramTemplateId', item?.id);
			exercises?.forEach((exercise, index) => {
				Object.keys(exercise).forEach(key => {
					if (exercise[key as keyof typeof exercise]) {
						formData.append(
							`exercises[create][${index}][${key}]`,
							exercise[key as keyof typeof exercise] as string,
						);
					}
				});
			});

			const data = await dispatch(createProgram(formData));
			if (data?.payload?.id) {
				if (user?.isPhysioterapist) {
					navigate(
						`/${user.isPhysioterapist ? selectedUser?.id : user?.id}${router.PATIENTVIEW}`,
					);
				} else {
					navigate(router.ROOT);
				}
				message.success(t('Patient.data.newDashboard.enrolled'));
			}
		} catch (error) {
			message.error(
				'There was an error enrolling in the program. Please try again later.',
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className={'card-margin-top'}>
			<Row
				gutter={16}
				style={{
					backgroundColor: 'var(--surface-secondary)',
					borderRadius: 8,
					padding: 16,
					border: '2px solid',
				}}>
				<Col span={18}>
					<Title level={5}>{program?.name}</Title>
					<Text type="secondary">
						{program?.duration} {program?.durationType}
					</Text>
					<Divider style={{ margin: '8px 0' }} />
					<Paragraph
						ellipsis={
							!expanded
								? {
										rows: 3,
										expandable: false,
									}
								: false
						}>
						{description}
					</Paragraph>
					{description.length > 200 && (
						<Button type="link" onClick={() => setExpanded(prev => !prev)}>
							{expanded
								? t('Patient.data.postures.readLess')
								: t('Patient.data.postures.readMore')}
						</Button>
					)}
				</Col>
				<Col span={6}>
					<Flex vertical align="center">
						<QRCode size={100} value={locationLoad()} />
						<Button
							loading={loading}
							disabled={loading}
							type="primary"
							onClick={() => {
								handleEnroll(program);
							}}
							style={{ marginTop: 8, background: 'var(--color-success-500)' }}>
							{t('patient.dashboard.new.enroll')}
						</Button>
					</Flex>
				</Col>
			</Row>
		</Card>
	);
}

export default ProgramCard;
