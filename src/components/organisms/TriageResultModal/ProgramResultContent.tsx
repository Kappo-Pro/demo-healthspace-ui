/**
 * ProgramResultContent - Displays program/rehab summary in triage modal
 *
 * Shows accordion collapse with session header and content from ant-collapse-content-box
 */

import { UntitledIcon } from '@atoms/Icon';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import VideoPlayer from '@atoms/VideoPlayer';
import { getProgramActivityStreamByData } from '@stores/activity/activityStream/activityStream';
import { useTypedDispatch } from '@stores/index';
import {
	ProgramSession,
	ProgramSessionResult,
	Session,
	UserWithSession,
} from '@types';
import { Collapse, Empty, Flex, Image, Tag, Typography } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

// Pain level icons and colors
const painLevelData: Record<number, { color: string; iconName: string }> = {
	0: { color: 'var(--color-success-400)', iconName: 'faceHappy' },
	1: { color: 'var(--color-success-600)', iconName: 'faceWink' },
	2: { color: 'var(--color-success-500)', iconName: 'faceSmile' },
	3: { color: 'var(--color-success-300)', iconName: 'faceSmile' },
	4: { color: 'var(--color-warning-300)', iconName: 'faceNeutral' },
	5: { color: 'var(--color-warning-400)', iconName: 'faceNeutral' },
	6: { color: 'var(--color-warning-500)', iconName: 'faceNeutral' },
	7: { color: 'var(--color-warning-600)', iconName: 'faceSad' },
	8: { color: 'var(--color-error-400)', iconName: 'faceSad' },
	9: { color: 'var(--color-error-500)', iconName: 'faceFrown' },
	10: { color: 'var(--color-error-600)', iconName: 'faceFrown' },
};

interface ProgramResultContentProps {
	user: UserWithSession;
	session: Session;
}

export const ProgramResultContent: React.FC<ProgramResultContentProps> = ({
	user: _user, // Prefixed to indicate intentionally unused for now
	session,
}) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [loading, setLoading] = useState(true);
	const [programSessions, setProgramSessions] = useState<ProgramSession[]>([]);

	// Fetch program session data
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const result = await dispatch(
					getProgramActivityStreamByData(session.id),
				);
				const data = result.payload;
				// Handle both single session and array of sessions
				if (Array.isArray(data)) {
					setProgramSessions(data);
				} else if (data) {
					setProgramSessions([data as ProgramSession]);
				}
			} catch (error) {
				console.error('[ProgramResultContent] Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};

		if (session?.id) {
			fetchData();
		}
	}, [dispatch, session?.id]);

	// Get pain level display
	const getPainLevelDisplay = (painLevel: number) => {
		const level = painLevelData[painLevel] || painLevelData[5];
		return (
			<Flex align="center" gap={4} className="program-pain-indicator">
				<UntitledIcon
					name={
						level.iconName as
							| 'faceHappy'
							| 'faceWink'
							| 'faceSmile'
							| 'faceNeutral'
							| 'faceSad'
							| 'faceFrown'
					}
					size={20}
					style={{ color: level.color }}
				/>
				<Text
					style={{
						color: level.color,
						fontWeight: 'var(--font-weight-medium)',
					}}>
					{painLevel}/10
				</Text>
			</Flex>
		);
	};

	// Get status tag color
	const getStatusTagColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'completed':
				return 'success';
			case 'in_progress':
			case 'inprogress':
				return 'processing';
			case 'pending':
				return 'warning';
			default:
				return 'default';
		}
	};

	if (loading) {
		return <ActivityFeedSkeleton count={5} />;
	}

	if (!programSessions.length) {
		return (
			<Flex
				justify="center"
				align="center"
				style={{ padding: 'var(--spacing-8)' }}>
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={t(
						'Admin.data.triage.noProgramData',
						'No program data available',
					)}
				/>
			</Flex>
		);
	}

	// Build collapse items
	const collapseItems = programSessions.map((programSession, index) => ({
		key: programSession.id || String(index),
		label: (
			<div className="program-collapse-header">
				<div className="program-session-info">
					<Text strong>{programSession.title || `Session ${index + 1}`}</Text>
					<Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
						{programSession.createdAt
							? moment(programSession.createdAt).format(
									'MMM DD, YYYY - hh:mm A',
								)
							: ''}
					</Text>
					{typeof programSession.painLevel === 'number' &&
						getPainLevelDisplay(programSession.painLevel)}
				</div>
				<Tag
					color={getStatusTagColor(programSession.status)}
					className="program-status-tag">
					{programSession.status || 'Completed'}
				</Tag>
			</div>
		),
		children: (
			<div className="program-session-content">
				{/* Exercise Results */}
				{programSession.results?.map(
					(result: ProgramSessionResult, resultIndex: number) => (
						<div
							key={result.id || resultIndex}
							className="program-exercise-item">
							<Flex gap={16} align="start">
								{/* Exercise Thumbnail */}
								{result.exercise?.thumbnail && (
									<Image
										src={result.exercise.thumbnail}
										alt={result.exercise.name || 'Exercise'}
										width={120}
										height={80}
										style={{
											borderRadius: 'var(--radius-md)',
											objectFit: 'cover',
										}}
										preview={false}
									/>
								)}
								<Flex vertical gap={8} style={{ flex: 1 }}>
									<Text strong>
										{result.exercise?.name || `Exercise ${resultIndex + 1}`}
									</Text>
									{result.exercise?.description && (
										<Text
											type="secondary"
											style={{ fontSize: 'var(--font-size-sm)' }}>
											{result.exercise.description}
										</Text>
									)}
									<Flex gap={16}>
										{result.sets && (
											<Text type="secondary">
												{t('Admin.data.triage.sets', 'Sets')}: {result.sets}
											</Text>
										)}
										{result.reps && (
											<Text type="secondary">
												{t('Admin.data.triage.reps', 'Reps')}: {result.reps}
											</Text>
										)}
										{result.duration && (
											<Text type="secondary">
												{t('Admin.data.triage.duration', 'Duration')}:{' '}
												{result.duration}s
											</Text>
										)}
									</Flex>
								</Flex>
							</Flex>
						</div>
					),
				)}

				{/* Video Recording if available */}
				{programSession.videoUrl && (
					<div style={{ marginTop: 'var(--spacing-4)' }}>
						<VideoPlayer src={programSession.videoUrl} />
					</div>
				)}

				{/* Notes */}
				{programSession.notes && (
					<div style={{ marginTop: 'var(--spacing-4)' }}>
						<Text type="secondary">
							{t('Admin.data.triage.notes', 'Notes')}:
						</Text>
						<Text style={{ display: 'block', marginTop: 4 }}>
							{programSession.notes}
						</Text>
					</div>
				)}
			</div>
		),
	}));

	return (
		<div className="program-result-wrapper">
			<Collapse
				items={collapseItems}
				defaultActiveKey={programSessions[0]?.id || '0'}
				expandIconPosition="end"
			/>
		</div>
	);
};

export default ProgramResultContent;
