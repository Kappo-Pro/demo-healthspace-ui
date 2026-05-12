import { useEffect, useState } from 'react';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import './style.css';
import { Breadcrumb, Dropdown, Avatar, Flex, Typography } from 'antd';
import type { MenuProps } from 'antd';

const { Paragraph } = Typography;
import { useNavigate } from 'react-router-dom';
import { setActiveTab, setProgramModal } from '@stores/shared/patientDetail/patientDetail';
import { useAdminMenuConstants } from '@atoms/AdminMenu/AdminMenuLists';
import { ADMIN_KEYS, ROUTE_KEYS, USER_ROLES } from '@stores/constants';
import { UntitledIcon } from '@atoms/Icon';
import ToggleMenu from '@atoms/ToggleMenu';
import { useTranslation } from 'react-i18next';
import { getPlansByUserId } from '@stores/shared/settings/settings';
import { PatientDetailTabs } from '@types';
import { setSessionClicked } from '@stores/shared/patientDetail/program';
import { router } from '@routers/routers';

const { Item } = Breadcrumb;

export default function BreadCrumbTab() {
	const [selectedMenu, setSelectedMenu] = useState('');
	const [selectedSubMenu, setSelectedSubMenu] = useState('');
	const activeTab = useTypedSelector(
		state => state.patientDetail.patientDetail.activeTab,
	);
	const navigate = useNavigate();
	const dispatch = useTypedDispatch();
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const user  = useTypedSelector(state => state.user);
	const userProfile =
		user?.profile?.role === USER_ROLES.USER ? user : selectedUser;
	const { menuUser, menuMapping } = useAdminMenuConstants();
	const {t} = useTranslation()
	
		useEffect(() => {
		if (activeTab === PatientDetailTabs.postureResult) {
			setSelectedSubMenu(PatientDetailTabs.postureSummary);
			setSelectedMenu(menuMapping[PatientDetailTabs.postureSummary] || "");
		} else if (activeTab === PatientDetailTabs.romResult) {
			setSelectedSubMenu(PatientDetailTabs.romSummary);
			setSelectedMenu(menuMapping[PatientDetailTabs.romSummary] || "");
		} else {
			setSelectedSubMenu(activeTab);
			setSelectedMenu(menuMapping[activeTab] || "");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab]); // menuMapping is stable from hook

	const selectedItem = menuUser.find(item => item.key === selectedMenu);
	const subMenuItems = selectedItem?.options || [];
	const selectedSubItem =
		subMenuItems.find(item => item.key === selectedSubMenu) || subMenuItems[0];

	const mainMenuItems: MenuProps['items'] = menuUser.map(item =>
		item.options?.length ? {
			key: item.key,
			label: (
				<Flex justify="space-between" align="center" className="w-[150px]">
					<Flex gap={8} align="center">
						{item.icon}
						<span style={{ color: item.key === menuMapping[activeTab] ? 'var(--tab-text-color)' : 'var(--text-primary)' }}>{item.label}</span>
					</Flex>
					<UntitledIcon name="chevronRight" size={16} style={{ color: 'var(--gray-400)' }} />
				</Flex>
			),
			children: item.options.map(subItem => ({
				key: subItem.key,
				label: (
					<Flex gap={8} align="center">
						{subItem.icon}
						<span style={{ color: subItem.key === activeTab ? 'var(--tab-text-color)' : 'var(--text-primary)' }}>{subItem.name}</span>
					</Flex>
				),
				onClick: () => {
					setSelectedMenu(item.key);
					setSelectedSubMenu(subItem.key);
					setTimeout(() => dispatch(setActiveTab(subItem.key)), 0);
					subItem.key === 'generateProgram' && dispatch(setProgramModal(true))
					subItem.key === 'listSessions' && dispatch(setSessionClicked(false))
					if (subItem.key === 'romSummary') {
						navigate(`/${userProfile?.id}${router.AIASSISTANT_ROM_SUMMARY}`);
						dispatch(setActiveTab('romSummary'));
					}
				},
			})),
		} : {
			key: item.key,
			label: (
				<Flex gap={8} align="center">
					{item.icon}
					<span style={{ color: item.key === menuMapping[activeTab] ? 'var(--tab-text-color)' : 'var(--text-primary)' }}>{item.label}</span>
				</Flex>
			),
			onClick: () => {
				const menuItem = menuUser.find(i => i.key === item.key);
				if (menuItem?.key) {
					setSelectedMenu(menuItem.key === ADMIN_KEYS.USERACTIVITY ? ADMIN_KEYS.ACTIVITY : menuItem.key);
					setSelectedSubMenu('');
					dispatch(setActiveTab(menuItem.key === ADMIN_KEYS.USERACTIVITY ? ADMIN_KEYS.ACTIVITY : menuItem.key));
					if (menuItem.key === ADMIN_KEYS.USERACTIVITY || menuItem.key === ADMIN_KEYS.PATIENT_VIEW) {
						document.body.click();
					}
				}
			},
		}
	);

	const subMenuItemsList: MenuProps['items'] = subMenuItems.map(item => ({
		key: item.key,
		label: (
			<Flex gap={8} align="center">
				{item.icon}
				<span style={{ color: item.key === activeTab ? 'var(--tab-text-color)' : 'var(--text-primary)' }}>{item.name}</span>
			</Flex>
		),
		onClick: () => {
			setSelectedSubMenu(item.key);
			dispatch(setActiveTab(item.key));
			item.key === 'generateProgram' && dispatch(setProgramModal(true))
			item.key === 'listSessions' && dispatch(setSessionClicked(false))
			if (item.key === 'romSummary') {
				navigate(`/${userProfile?.id}${router.AIASSISTANT_ROM_SUMMARY}`);
				dispatch(setActiveTab('romSummary'));
			}
		},
	}));

	const handleClick = async () => {
		const id = user.isPhysioterapist ? selectedUser?.id : user?.id;
    await dispatch(getPlansByUserId(id));
	}

	return (
		<div className="aitab-menu-container">
			<Breadcrumb>
					{
							<div style={{marginRight:'var(--spacing-2)'}}><ToggleMenu /></div>
					}
				{selectedItem?.label && (
					<Item onClick={() => navigate('/')} className="cursor-pointer">
						<Paragraph>{t('Admin.data.menu.home.home')}</Paragraph>
					</Item>
				)}
				{!location.pathname.includes(ROUTE_KEYS.DOWNLOAD_APP) && !location.pathname.includes(ADMIN_KEYS.SETTINGS) && <>
				{user.profile.role != USER_ROLES.USER && (
					<Item
						onClick={() => {
							setSelectedMenu('userActivity');
							setSelectedSubMenu('activity');
							dispatch(setActiveTab('activity'));
						}}
						className="cursor-pointer">
						<>
							{userProfile?.profile?.imageUrl ? (
								<Avatar
									src={userProfile?.profile?.imageUrl}
									alt="avatar"
									size="small"
								/>
							) : (
								<Avatar
									style={{
										backgroundColor:
											userProfile?.profile?.avatarColor || 'var(--brand-primary)',
										color: 'var(--text-on-brand)',
										fontSize: 'var(--font-size-sm)',
										border: 'none',
									}}
									alt="avatar"
									size="small">
									{userProfile?.profile?.firstName
										? userProfile?.profile?.firstName?.charAt(0)?.toUpperCase()
										: 'U'}
								</Avatar>
							)}
						</>
						<span className="ml-2">
							{userProfile?.profile?.firstName} {userProfile?.profile?.lastName}
						</span>
					</Item>
				)}
				<Item>
					<Dropdown
						menu={{
							items: mainMenuItems,
							selectedKeys: [selectedMenu],
							className: 'main-menu-dropdown ai-tab-dropdown'
						}}
						trigger={['click']}>
						<a className="ant-dropdown-link" onClick={(e) => {e.preventDefault(); handleClick();}}>
							{selectedItem?.label || 'Home'}{' '}
							<UntitledIcon name="chevronDown" size={16} style={{ color: 'var(--gray-400)' }} />
						</a>
					</Dropdown>
				</Item>
				{selectedSubItem && subMenuItems.length > 0 && (
					<Item>
						<Dropdown
							menu={{
								items: subMenuItemsList,
								selectedKeys: [selectedSubMenu],
								className: 'ai-tab-dropdown'
							}}
							trigger={['click']}>
							<a
								className="ant-dropdown-link"
								onClick={e => e.preventDefault()}>
								{selectedSubItem?.name || ''}{' '}
								<UntitledIcon name="chevronDown" size={16} style={{ color: 'var(--gray-400)' }} />
							</a>
						</Dropdown>
					</Item>
				)}
				</>}
			</Breadcrumb>
		</div>
	);
}
