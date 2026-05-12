import { StatusNormalized } from '@stores/constants';
import { addReportId, deleteReportId } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { updateEvaluationSessionStatus as updateEvaluationSessionStatusEscalationRequired } from '@stores/patients/triage/escalationRequired';
import { updateEvaluationSessionStatus as updateEvaluationSessionStatusFollowUpRequired } from '@stores/patients/triage/followUpRequired';
import { updateEvaluationSessionStatus as updateEvaluationSessionStatusOutOfParams } from '@stores/patients/triage/outOfParams';
import { updateEvaluationSessionStatus as updateEvaluationSessionStatusPendingReview } from '@stores/patients/triage/pendingReview';
import { updateEvaluationSessionStatus as updateEvaluationSessionStatusReviewed } from '@stores/patients/triage/reviewed';
import {
	IstatusIcon,
	OnchangeStatus,
	Status,
	TDataProps,
	TPainAssessmentDataProps,
} from '@types';
import type { MenuProps } from 'antd';
import { Badge, Card, Checkbox, Dropdown, Flex, Space, message } from 'antd';
import moment from 'moment';
import './style.css';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const PainAssessmentProgressData = (props: TPainAssessmentDataProps) => {
	const {
		apiData,
		fetchData,
		perPage = 10,
		currentPage,
		onEvaluationClick,
	} = props;
	const [data, setData] = useState<TDataProps[]>(apiData.data);
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const evaluationSessionsIds = useTypedSelector(
		state => state.reports.reportIds.evaluationSessionsIds,
	);
	const [statusSave, setStatusSave] = useState('');

	useEffect(() => {
		setData(apiData.data);
	}, [apiData]);

	useEffect(() => {
		if (statusSave) {
			fetchData(perPage, currentPage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [statusSave]);

	// Badge component color props - these are semantic keys that map to design system tokens internally
	const statusIcons: IstatusIcon = {
		outOfParams: <Badge color="black" />, // eslint-disable-line vitalflow/no-hardcoded-colors
		pendingReview: <Badge color="yellow" />, // eslint-disable-line vitalflow/no-hardcoded-colors
		// eslint-disable-next-line vitalflow/no-hardcoded-colors
		reviewed: <Badge color="green" />,
		// eslint-disable-next-line vitalflow/no-hardcoded-colors
		escalationRequired: <Badge color="red" />,
		followUpRequired: <Badge color="orange" />, // eslint-disable-line vitalflow/no-hardcoded-colors
	};

	type IUpdateRomSessionStatus = Omit<Record<Status, unknown>, 'newPatients'>;

	const updateOmniRomSession: IUpdateRomSessionStatus = {
		outOfParams: updateEvaluationSessionStatusOutOfParams,
		pendingReview: updateEvaluationSessionStatusPendingReview,
		reviewed: updateEvaluationSessionStatusReviewed,
		escalationRequired: updateEvaluationSessionStatusEscalationRequired,
		followUpRequired: updateEvaluationSessionStatusFollowUpRequired,
	};

	const onChangeStatus = async (params: OnchangeStatus, item: unknown) => {
		const { sessionId, status } = params;
		message.loading({
			content: t('Admin.data.menu.patientDetail.aiAssistantRomSummary.saving'),
			key: sessionId,
		});
		await dispatch(
			updateOmniRomSession[item.status as keyof IUpdateRomSessionStatus]({
				sessionId,
				body: { status },
			}),
		);
		message.success({
			content: t(
				'Admin.data.menu.patientDetail.aiAssistantRomSummary.statusSuccess',
			),
			key: sessionId,
			duration: 3,
		});
		fetchData(perPage, currentPage);
	};

	const onClickSelectAll = (id: string, value: unknown) => {
		const { checked } = value.target;
		const selectedData = data?.map((item: TDataProps) => {
			if (item.id === id) {
				item = { ...item, isSelected: value };
				checked
					? dispatch(
							addReportId({
								id: item.id,
								type: 'evaluationSessionsIds',
							}),
						)
					: dispatch(
							deleteReportId({
								id: item.id,
								type: 'evaluationSessionsIds',
							}),
						);
			}
			return item;
		});
		setData(selectedData);
	};

	const healthStatus = item => {
		// Convert Menu JSX to items array for Ant Design 5.x
		const menuItems: MenuProps['items'] = Object.entries(StatusNormalized)
			.filter(([key]) => key !== item.status)
			.map(([status, label]) => ({
				key: status,
				label: (
					<Space>
						{statusIcons[status as keyof IstatusIcon]}
						<span>{label}</span>
					</Space>
				),
				onClick: () => {
					onChangeStatus(
						{ sessionId: item.id, status: status as Status },
						item,
					);
					setStatusSave(status);
				},
			}));

		return (
			<div
				style={{
					display: 'flex',
					backgroundColor: 'transparent',
					alignItems: 'center',
					gap: 'var(--spacing-2)',
				}}>
				<div>
					{user.isPhysioterapist ? (
						<Dropdown menu={{ items: menuItems }}>
							<a onClick={e => e.stopPropagation()}>
								{statusIcons[item.status as keyof IstatusIcon]}
							</a>
						</Dropdown>
					) : null}
				</div>
				<div
					onClick={event => {
						event.stopPropagation();
					}}>
					<Checkbox
						id={`${item.id}`}
						onChange={e => onClickSelectAll(item.id, e)}
						checked={evaluationSessionsIds?.includes(item.id)}
					/>
				</div>
			</div>
		);
	};

	// Handle card click - open modal
	const handleCardClick = (
		item: TDataProps,
		event: React.MouseEvent | React.KeyboardEvent,
	) => {
		// Don't trigger modal if clicking on dropdown or checkbox
		const target = event.target as HTMLElement;
		if (
			target.closest('.health-status-dropdown') ||
			target.closest('.ant-checkbox-wrapper') ||
			target.closest('.ant-dropdown')
		) {
			return;
		}

		if (!onEvaluationClick) {
			return;
		}

		onEvaluationClick(item);
	};

	// Handle keyboard navigation
	const handleKeyDown = (item: TDataProps) => (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCardClick(item, event);
		}
	};

	return (
		<Flex vertical gap={8}>
			{data?.map((item: TDataProps) => (
				<StyledCard
					key={item?.id}
					onClick={e => handleCardClick(item, e)}
					onKeyDown={handleKeyDown(item)}
					style={{
						cursor: 'pointer',
						padding: '8px 20px',
						border: 'none',
						borderRadius: 'var(--radius-xl)',
					}}>
					<CardHeader>
						<CardTimestamp>
							{moment(item.createdAt).local().format('LLL')}
						</CardTimestamp>
						<CardActions
							onClick={e => e.stopPropagation()}
							className="evaulation-checkbox">
							{healthStatus(item)}
						</CardActions>
					</CardHeader>
				</StyledCard>
			))}
		</Flex>
	);
};

// Styled components for card layout
const StyledCard = styled(Card)`
	.ant-card-body {
		padding: 0px !important;
	}
`;


const CardHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: var(--spacing-sm);
`;

const CardTimestamp = styled.span`
	margin: 0;
	font-size: var(--font-size-body-lg);
	font-weight: 400;
	color: var(--color-text-primary);
`;

const CardActions = styled.div`
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
`;

export default PainAssessmentProgressData;
