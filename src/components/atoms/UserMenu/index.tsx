import HeightInfo from '@atoms/AdminMenu/HeightInfo';
import UserDetails from '@atoms/AdminMenu/UserDetails';
import { useBlockNavigation } from '@atoms/BlockNavigation';
import { UntitledIcon } from '@atoms/Icon';
import { Edit02 } from '@vitalflow-icons/general/edit02';
import { Logomark } from '@vitalflow-icons/Logo/logomark';
import { PlayCircle } from '@vitalflow-icons/media/playCircle';
import { UseAuth } from '@contexts/AuthContext';
import { status } from '@pages/PatientOnboard/Constants';
import ProfileModal from '@pages/Profile/ProfileModal';
import ThemeSelector from '@pages/Themes/ThemeSelector';
import { router } from '@routers/routers';
import { getFunctionalGoals } from '@stores/clinical/functionalGoals';
import {
	ADMIN_MENU_CLICK,
	navigationConfig,
	PLANS,
	ROUTE_KEYS,
	USER_ROLES
} from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setActiveTab, setStartSession } from '@stores/shared/patientDetail/patientDetail';
import {
	getProgramListApproved,
	selectExercise,
	selectProgram
} from '@stores/shared/patientDetail/program';
import { getUser } from '@stores/shared/user';
import { MenuAdminProps } from '@types';
import type { MenuProps } from 'antd';
import { Avatar, Button, Dropdown, Flex, Layout, Popover, Typography } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './style.css';
import { useMenuConstants } from './UserMenuLists';

const { Paragraph } = Typography;

import { useAdminMenuConstants } from '@atoms/AdminMenu/AdminMenuLists';
import { ACTIVETAB } from '../../../stores/constants';

const UserMenu = () => {
	const { t } = useTranslation();
	const { handleNavigation } = useBlockNavigation(
		location.pathname.includes(ROUTE_KEYS.PROGRAM_START),
		t('admin.menu.patientDetail.aiAssistantListSessions.unsavedChanges'),
	);
	const [isPlanOne, setIsplan] = useState<boolean>(false);
	const savedUserPlans = useTypedSelector(state => state.settings.plans.savedUserPlans);
	const navigate = useNavigate();
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);
	const program = useTypedSelector(
		state => state.patientDetail.program.programApproved,
	);
	const [collapsed, setCollapsed] = useState(false);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const isSuperAdmin = user?.profile?.role === USER_ROLES.SUPER_ADMIN;
	const currentLocation = window.location.pathname;
	const isCorrectLocation = currentLocation.includes(ROUTE_KEYS.PROGRAM_START);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [policyModalOpen, setPolicyModalOpen] = useState(false);
	const [functionalData, setFunctionalData] = useState();
	const [profileData, setProfileData] = useState({});
	const [isProgramAvailable, setProgramAvailable] = useState(false);
	const [activeMenu, setActiveMenu] = useState(
		currentLocation.replace('/', ''),
	);
	const { menuMapping } = useAdminMenuConstants();

	const buttonStyle = {
		color: 'var(--button-text-color)',
		border: 'inherit',
		width: '100%',
		margin: 'var(--spacing-2-5) 0',
	};
	const { mainMenu, menuUser, avatarMenus } = useMenuConstants();
	const { credentials, onLogout } = UseAuth();

	const activeTab = useTypedSelector(
		state => state.patientDetail.patientDetail.activeTab,
	);

	const logout = () => {
		onLogout();
	};
	const handleClick = () => handleNavigation(router.ROOT);

	useEffect(() => {
		user?.id && fetchProgramData(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]); // fetchProgramData changes on every render - should be wrapped in useCallback if needed frequently

	useEffect(() => {
		activeTab != '' && setActiveMenu('tools');
		currentLocation === '/' && setActiveMenu('');
	}, [activeTab, currentLocation]);

	const fetchProgramData = async (pageNumber: number) => {
		const payload = {
			userId: user?.id,
			limit: 10,
			page: pageNumber,
			searchValue: '',
			status: status.APPROVED,
		};
		const data = await dispatch(getProgramListApproved(payload));
		// TODO: Consider using length ?? defaultValue or length?.property instead of length!
		if (data?.payload?.(data?.length ?? 0) > 0) {
			setProgramAvailable(true);
		} else {
			setProgramAvailable(false);
		}
	};

	const popoverContent = (item: string) => {
		return <span className="user-popup-label-capitalize">{item}</span>;
	};

	const fetchingData = async () => {
		const data = await dispatch(getFunctionalGoals());
		setFunctionalData(data?.payload?.data);
	};

	useEffect(() => {
		if (!isSuperAdmin && !user?.isPhysioterapist) {
			fetchingData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSuperAdmin, user?.isPhysioterapist]); // dispatch is stable, fetchingData changes on every render

	const getUserData = async () => {
		if (credentials?.sub) {
			const user = await dispatch(getUser(credentials.sub));
			setProfileData(user.payload);
		}
	};

	useEffect(() => {
		setProfileData(user);
	}, [user]);

	useEffect(() => {
		if (!isSuperAdmin && !user?.isPhysioterapist) {
			getUserData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Intentionally empty - mount-only effect for initial user data fetch

	const handleStartSession = () => {
		if (program.data?.length == 1) {
			dispatch(selectProgram(program.data[0]));
			dispatch(selectExercise(program.data[0].exercises));
			navigate(`/${user.id}${router.AIASSISTANT_PROGRAM_START}`);
			dispatch(setActiveTab(''));
			dispatch(setStartSession(false));
		// TODO: Consider using length ?? defaultValue or length?.property instead of length!
		} else if ((program.data?.length ?? 0) > 1) {
			dispatch(setActiveTab(ACTIVETAB.PROGRAMS));
			dispatch(setStartSession(true));
			handleNavigation(`/${user?.id}${router.AIASSISTANT_PROGRAMS}`);
		}
	};

	const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
	const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

	useEffect(() => {
		setIsplan(savedUserPlans?.planType === PLANS?.SCREENING);
	}, [savedUserPlans]);

	const getMenuItems = (options: unknown[], parentKey: string): MenuProps['items'] =>
		options?.map((option, idx) => ({
			key: idx,
			title: '',
			label: (
				<Flex align="center" gap={8} className="p-1 hover:bg-slate-100 hover:rounded-lg">
					{option.icon}{' '}
					{option.key != ADMIN_MENU_CLICK.THEME_SELECTOR ? (
						<span
							style={{
								color:
									option.key === activeTab
										? 'var(--tab-text-color)'
										: 'var(--text-primary)',
							}}>
							{option.name || option.label}
						</span>
					) : (
						<ThemeSelector />
					)}
				</Flex>
			),
			onClick: () => {
				if (
					option.key != ADMIN_MENU_CLICK.THEME_SELECTOR &&
					option?.key != ADMIN_MENU_CLICK.SETTINGS &&
					option.key != ADMIN_MENU_CLICK.LOGOUT
				) {
					navigate(`/${user?.id}${navigationConfig[option.key].path}`);
					setActiveMenu(parentKey);
				}
			},
		})) || [];

	return (
		<>
			<Layout className="min-h-screen">
				<Sider width={100} style={{ background: 'var(--mainmenu-bg-color)' }}>
					<ul className="user-menu">
						<li
							className="li-logo"
							onClick={() => {
								handleClick();
								setActiveMenu('');
							}}>
							<Logomark />
						</li>
						{mainMenu?.map((item: MenuAdminProps, index) => {
							if (item.key === '') {
								return (
									<Popover
										key={index}
										content={popoverContent(item.label)}
										title=""
										placement="right">
										<li
											className={`menu-item ${activeMenu === item.key ? 'menu-item-active' : ''}`}
											onClick={() => {
												handleClick();
												setActiveMenu('');
											}}
											key={index}
											title={item.key}>
											{item.icon}
										</li>
									</Popover>
								);
							} else if (item.key === ADMIN_MENU_CLICK.TOOLS) {
								return (
									<Popover
										key={index}
										content={
											<div>
												{menuUser.map(menuItem => (
													<div key={menuItem.key} className="relative">
														<Dropdown
															menu={{
																items: getMenuItems(menuItem.options, item.key),
																onMouseLeave: () => {
																	setDropdownVisible(false);
																	setToolsMenuOpen(false);
																},
																className: 'custom-space-dropdown',
															}}
															className={`p-2`}
															placement="right"
															trigger={['hover']}
															onOpenChange={visible => {
																setDropdownVisible(visible);
															}}
															overlayStyle={{
																position: 'absolute',
																left: '220px',
															}}
															dropdownRender={(menu) => (
																<Flex align="center" justify="center" className="custom-dropdown-menu-sidebar">
																	<div
																		style={{
																			right: '95.9%',
																			position: 'absolute',
																		}}>
																		{menuItem.options?.length > 0 && <UntitledIcon name="chevronLeft" size={16} />}
																	</div>
																	{menu}
																</Flex>
															)}>
															<Flex
																align="center"
																gap={8}
																className="cursor-pointer hover:bg-slate-100 hover:rounded-lg"
																style={{
																	color:
																		menuItem.key === menuMapping[activeTab]
																			? 'var(--tab-text-color)'
																			: 'var(--text-primary)',
																}}
																onClick={() => {
																	if (menuItem?.key === 'activity') {
																		navigate(
																			`/${user?.id}${navigationConfig[menuItem.key].path}`,
																		);
																		setDropdownVisible(false);
																		setToolsMenuOpen(false);
																	}
																}}>
																{menuItem.icon} {menuItem.label}
															</Flex>
														</Dropdown>
													</div>
												))}
											</div>
										}
										placement="right"
										open={toolsMenuOpen}
										onOpenChange={visible => {
											if (visible) {
												setToolsMenuOpen(visible);
											} else {
												!dropdownVisible && setToolsMenuOpen(visible);
											}
										}}>
										<li
											className={`menu-item ${activeMenu === item.key ? 'menu-item-active' : ''}`}
											onClick={() => setToolsMenuOpen(prev => !prev)}>
											{item.icon}
										</li>
									</Popover>
								);
							}
						})}
					</ul>
					<ul style={{ bottom: '25px', left: '44px', position: 'absolute' }}>
						<Popover
							content={
								<>
									{avatarMenus.map(menuItem => (
										<Flex
											key={menuItem.key}
											align="center"
											gap={8}
											className="cursor-pointer p-2 hover:bg-slate-100 hover:rounded-lg"
											onClick={() => {
												if (
													menuItem.key != 'theme-selector' &&
													menuItem.key != 'logout'
												) {
													navigate(
														`/${user?.id}${navigationConfig[menuItem.key].path}`,
													);
													setActiveMenu('tools');
												} else if (menuItem.key === 'logout') {
													logout();
												}
												if (menuItem.key != 'theme-selector') {
													setProfileMenuOpen(false);
												}
											}}>
											{menuItem?.key === 'theme-selector' ? (
												<ThemeSelector setProfileMenuOpen={setProfileMenuOpen} />
											) : (
												menuItem.label
											)}
										</Flex>
									))}
								</>
							}
							placement="right"
							open={profileMenuOpen}
							onOpenChange={setProfileMenuOpen}>
							<Flex align="center" className="cursor-pointer">
								<>
									{user?.profile?.imageUrl ? (
										<Avatar
											src={user?.profile?.imageUrl}
											alt="avatar"
											size={30}
										/>
									) : (
										<Avatar
											style={{
												backgroundColor:
													user?.profile?.avatarColor || 'var(--brand-primary)',
												color: 'var(--text-on-brand)',
												fontSize: '22px',
												border: '2px solid var(--surface-primary)',
											}}
											alt="avatar"
											size={30}>
											{user.profile?.firstName.charAt(0).toUpperCase()}
										</Avatar>
									)}
								</>
							</Flex>
						</Popover>
					</ul>
				</Sider>

				<Sider
					width={320}
					collapsible
					collapsed={collapsed}
					onCollapse={setCollapsed}
					trigger={null}>
					{!collapsed && (
						<ul className="user-menu-content">
							<li style={{ position: 'relative', padding: 'var(--spacing-4)' }}>
								<div className="avatar-container">
									<>
										{user?.profile?.imageUrl ? (
											<Avatar
												src={user?.profile?.imageUrl}
												alt="avatar"
												size={100}
											/>
										) : (
											<Avatar
												style={{
													backgroundColor:
														user?.profile?.avatarColor || 'var(--brand-primary)',
													color: 'var(--text-on-brand)',
													fontSize: '52px',
													border: '4px solid var(--surface-primary)',
													display: 'inline-flex',
													alignItems: 'center',
												}}
												alt="avatar"
												size={100}>
												{user.profile?.firstName.charAt(0).toUpperCase()}
											</Avatar>
										)}
									</>
									<div
										className="edit-image-icon"
										style={{
											backgroundColor: 'var(--button-color-primary)',
											height: '30px',
											width: '30px',
											textAlign: 'center',
										}}
										onClick={() => {
											setIsModalOpen(true);
										}}>
										<div className="mt-1">
											<Edit02 width={20} height={20} />
										</div>
									</div>
									{isModalOpen && (
										<ProfileModal
											isModalOpen={isModalOpen}
											setIsModalOpen={setIsModalOpen}
											setPolicyModalOpen={setPolicyModalOpen}
											policyModalOpen={policyModalOpen}
											closable={true}
											onEdit={true}
										/>
									)}
									<p
										className="first-name-label-text"
										style={{ lineHeight: '0.9' }}>
										{user?.profile?.firstName} {user?.profile?.lastName}
									</p>
									<Paragraph className="email-label-text">{user?.profile?.email}</Paragraph>
									<HeightInfo userDetails={profileData} />
									{!isCorrectLocation && isProgramAvailable && !isPlanOne && (
										<Button
											className="start-session-css"
											style={buttonStyle}
											icon={
												<PlayCircle
													height={18}
													width={18}
													color="var(--button-text-color)"
												/>
											}
											onClick={e => {
												e.stopPropagation();
												handleStartSession();
											}}>
											{t('patient.progress.rehab.startSession')}
										</Button>
									)}
								</div>
								<UserDetails
									userDetails={user}
									functionalData={functionalData}
								/>
							</li>
						</ul>
					)}
				</Sider>
			</Layout>
		</>
	);
};

export default UserMenu;
