import moment from 'moment';
import { ArrowLeft } from '@vitalflow-icons/arrows/arrowLeft';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Empty, Flex, Popover, Typography } from 'antd';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';

const { Paragraph } = Typography;

const { Title } = Typography;
import { useNavigate } from 'react-router-dom';
import { InboxDataMessage, SelectedUser } from '@types';
import { router } from '@routers/routers';

interface IAdminMenuActivityDataProps {
	selectedItem: SelectedUser | null;
	inboxLoading: boolean;
	inboxData: InboxDataMessage[];
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	handleInboxChange: (selected: SelectedUser) => void;
}

export default function AdminMenuActivityData(
	props: IAdminMenuActivityDataProps,
) {
	const {
		selectedItem,
		inboxLoading,
		inboxData,
		searchQuery,
		setSearchQuery,
		handleInboxChange,
	} = props;
	const navigate = useNavigate();
	const { t } = useTranslation();

	const filteredPatientList = inboxData?.filter(item => {
		const firstName = item.profile.firstName ?? '';
		const email = item.profile.email ?? '';

		return (
			firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			email.toLowerCase().includes(searchQuery.toLowerCase())
		);
	});

	const handleClick = (url: string) => {
		navigate(url);
		setSearchQuery('');
	};

	return (
		<>
			<div>
				{selectedItem && (
					<div className="activity-container">
						<Popover
							title=""
							content={t('admin.menu.back')}
							placement="left"
							className="inline-block">
							<Button
								className="logout-button"
								shape="circle"
								icon={<ArrowLeft />}
								type="text"
								onClick={() => handleClick(router.ADMINDASHBOARD)}
							/>
						</Popover>
					</div>
				)}

				<Flex
					align="center"
					justify="space-between"
					className="flex-container-message">
					<Title level={3}> {t('admin.inbox.title')}</Title>
					<Button
						onClick={() => handleClick(router.SELECTUSER)}
						ghost={true}
						size="small">
						{t('admin.inbox.newMessage')}
					</Button>
				</Flex>
				{inboxLoading ? (
					<ActivityFeedSkeleton count={8} />
				) : (
					<div className="scroll-messagebox">
						{filteredPatientList?.length > 0 ? (
							filteredPatientList.map(
								(item: InboxDataMessage, index: number) => (
									<Flex
										vertical
										key={index}
										gap={8}
										style={{ borderWidth: '0px' }}>
										<Flex
											justify="space-between"
											align="center"
											style={{
												cursor: 'pointer',
											}}
											onClick={() => {
												handleInboxChange(item.id.toString());
											}}>
											<div className="inbox-item-info">
												<Paragraph className="name-label">
													{item.profile.firstName} {item.profile.lastName}
												</Paragraph>
												<p
													className="email-label"
													style={{
														textOverflow: 'ellipsis',
														overflow: 'hidden',
														maxWidth: '170px',
													}}>
													{item.profile.email}
												</p>
											</div>
											<div className="inbox-item-time">
												<p
													className="name-label"
													style={{
														color: 'var(--text-on-dark)',
														textAlign: 'right',
													}}>
													{moment(item.lastMessage).local().format('LT')}
												</p>
												<Flex align="center" justify="flex-end" gap={4}>
													<Badge count={item.unread} className="custom-badge" />
												</Flex>
											</div>
										</Flex>
										<hr
											style={{
												borderTopWidth: '1px',
												backgroundColor:
													'rgb(214 187 251 / var(--tw-border-opacity))',
											}}
										/>
									</Flex>
								),
							)
						) : (
							<Flex
								align="center"
								justify="center"
								style={{ color: 'var(--text-on-dark)' }}>
								<Empty
									image="/images/emptyMessages.svg"
									imageStyle={{
										height: 65,
										display: 'inline-block',
										marginTop: '10%',
									}}
									description={
										<>
											<p style={{ color: 'var(--text-on-dark)' }}>{t('admin.inbox.niceWork')}</p>
											<p style={{ color: 'var(--text-on-dark)' }}>
												{t('admin.inbox.allCaughtUp')}
											</p>
										</>
									}></Empty>
							</Flex>
						)}
					</div>
				)}
			</div>
		</>
	);
}
