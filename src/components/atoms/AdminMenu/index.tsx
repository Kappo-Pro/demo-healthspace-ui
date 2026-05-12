/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// NOTE: AdminMenu is dead code (only imported by unused MMainMenu component)
// Kept temporarily for reference. Will be removed in future cleanup.
import React, { useEffect, useState } from 'react';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getUserById, getUsers } from '@stores/activity/contacts/contacts';
import { useNavigate, useLocation } from 'react-router-dom';
import {
	SelectedUser,
	AdminMenuProps,
	InboxDataMessage} from '@types';
import {
	ACTIVETAB,
	ADMIN_KEYS,
	ADMIN_MENU,
	ROUTE_KEYS} from '@stores/constants';
import { USER_ROLES } from '@stores/constants';
import { painAssessmentInfoAction } from '@stores/clinical/painAssessment';
import { getSelectedUser } from '@stores/shared/user';
import { getFunctionalGoals } from '@stores/clinical/functionalGoals';
import AdminMenuContent from './AdminMenuContent';
import './style.css';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { getAllAdmin, getStats } from '@stores/patients/admin/adminPatient';
import { useBlockNavigation } from '@atoms/BlockNavigation';
import { router } from '@routers/routers';
import { getPlansByUserId } from '@stores/shared/settings/settings';

const AdminMenu = (props: AdminMenuProps) => {
	const currentLocation = window.location.pathname;
	const [inboxLoading, setInboxLoading] = useState(false);
	const { handleNavigation } = useBlockNavigation();
	const [activeMenu, setActiveMenu] = React.useState(
		currentLocation.replace('/', ''),
	);
	const [activeSubMenu, setActiveSubMenu] = React.useState(
		currentLocation.replace('/', ''),
	);
	const [selectedItem, setSelectedItem] = React.useState<SelectedUser | null>(
		null,
	);
	const navigate = useNavigate();
	const location = useLocation();
	const user = useTypedSelector(state => state.user);
	const dispatch = useTypedDispatch();
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const [searchQuery, setSearchQuery] = useState('');
	const [inboxData, setInboxData] = useState<InboxDataMessage[]>([]);
	const [profileData, setProfileData] = useState({});
	const [functionalData, setFunctionalData] = useState<[] | undefined>(
		undefined,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeSubPatients, setActiveSubPatients] = useState(
		currentLocation.replace('/', ''),
	);
	const isSuperAdmin = user?.profile?.role === USER_ROLES.SUPER_ADMIN;
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		if (
			location.pathname === router.NEW_PATIENTS ||
			location.pathname === router.REVIEWED ||
			location.pathname === router.PENDINGREVIEW ||
			location.pathname === router.FOLLOWUPREQUIRED ||
			location.pathname === router.ESCALATIONREQUIRED ||
			location.pathname === router.OUTOFPARAMETERS
		) {
			setActiveMenu('');
			setSelectedItem(null);
		} else if (
			location.pathname === router.UNASSIGNEDPATIENTS ||
			location.pathname === router.PENDINGINVITES ||
			location.pathname === router.REGISTEREDPATIENTS ||
			location.pathname === router.CONSENTFORMPATIENTS
		) {
			setActiveMenu(ADMIN_KEYS.CONTACTS);
		}
	}, [location.pathname]);

	const isContactClick = useTypedSelector(
		state => state.painAssessment.isContactClick,
	);

	useEffect(() => {
		if (isContactClick) {
			setActiveMenu(ADMIN_KEYS.CONTACTS);
			handleSelectChange(selectedUser);
			dispatch(painAssessmentInfoAction.onContactClick(false));
		}
	}, [isContactClick]);

	const getUserData = async () => {
		const selectedUser = await dispatch(getSelectedUser());
		setProfileData(selectedUser.payload);
		setSelectedItem(selectedUser.payload);
	};

	useEffect(() => {
		if (isSuperAdmin || user?.isPhysioterapist) {
			getUserData();
		}
	}, [isModalOpen]);

	useEffect(() => {
		if (isSuperAdmin || user?.isPhysioterapist) {
			getUserData();
		}
	}, []);

	const fetchInboxData = async () => {
		setInboxLoading(true);
		const inboxData = await dispatch(getActivityStreamHistory());
		setInboxData(inboxData.payload);
		setInboxLoading(false);
	};
	const { users } = useTypedSelector(state => state.contacts.main);

	useEffect(() => {
		const urlRegex =
			/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\//;
		if (
			currentLocation.includes(ROUTE_KEYS.DOWNLOAD_APP) ||
			activeMenu === ACTIVETAB.DOWNLOAD_APP
		) {
			setActiveMenu(ACTIVETAB.DOWNLOAD_APP);
			navigate(`${user.id}${router.DOWNLOAD_APP}`);
			setActiveSubMenu('');
		}
		if (currentLocation === router.SELECTUSER) {
			setActiveMenu(ADMIN_KEYS.CONTACTS);
			setActiveSubPatients('');
			setSelectedItem(null);
		} else if (
			currentLocation === router.UNASSIGNEDPATIENTS ||
			currentLocation === router.PENDINGINVITES ||
			currentLocation === router.REGISTEREDPATIENTS ||
			currentLocation === router.CONSENTFORMPATIENTS
		) {
			setActiveMenu(ADMIN_KEYS.CONTACTS);
			setSelectedItem(null);
		} else if (
			activeMenu != ACTIVETAB.DOWNLOAD_APP &&
			urlRegex.test(currentLocation)
		) {
			setActiveMenu(ADMIN_KEYS.CONTACTS);
			setSelectedItem(selectedUser);
		} else if (currentLocation === '/') {
			setActiveMenu('');
		}
		if (currentLocation.includes(ADMIN_KEYS.ACTIVITY)) {
			dispatch(setActiveTab(ADMIN_KEYS.ACTIVITY));
		}
	}, [currentLocation, selectedItem, selectedUser]);

	useEffect(() => {
		if (
			activeMenu === ADMIN_MENU.NEW_PATIENTS ||
			activeMenu === ADMIN_MENU.REVIEWED ||
			activeMenu === ADMIN_MENU.PENDING_REVIEW ||
			activeMenu === ADMIN_MENU.FOLLOW_UP_REQUIRED ||
			activeMenu === ADMIN_MENU.ESCALATION_REQUIRED ||
			activeMenu === ADMIN_MENU.OUT_OF_PARAMETERS ||
			activeMenu === ADMIN_MENU.DEFAULT
		) {
			activeMenu != ADMIN_MENU.DEFAULT && handleNavigation(`/${activeMenu}`);
		}
	}, [activeMenu, currentLocation]);

	const handleSelectChange = async (selectedOption: SelectedUser) => {
		setProfileData(selectedOption);
		await dispatch(getUserById(selectedOption.id));
		setSelectedItem(selectedOption);
		if (location.pathname === router.OMNIROMADDEXERCISES) {
			navigate(router.OMNIROMADDEXERCISES);
		} else {
			navigate(`/${selectedOption?.id}/dashboard`);
			dispatch(setActiveTab(ADMIN_KEYS.ACTIVITY));
		}
		await initializePlans(selectedOption?.id);
	};

	const initializePlans = async (id: string) => {
		await dispatch(getPlansByUserId(id));
	};

	const handleInboxChange = async (selectOption: string) => {
		await dispatch(getUserById(selectOption));
		if (inboxData && selectOption) {
			const updatedInboxData = inboxData?.map((item: InboxDataMessage) => {
				return {
					...item,
					unread:
						item.id.toString() === selectOption.toString() ? 0 : item.unread,
				};
			});
			setInboxData(updatedInboxData);
		}
		if (selectOption) {
			navigate('/admin/dashboard');
		}
	};

	const onChangeHome = (value: string) => {
		if (value === '') {
			setActiveMenu('');
			setActiveSubMenu(ADMIN_MENU.NEW_PATIENTS);
			setActiveSubPatients('');
		} else {
			setActiveMenu(value);
		}
		props.onClick(value);
	};

	const getUsersStats = async () => {
		await dispatch(getStats());
	};

	useEffect(() => {
		getUsersStats();
		fetchDataAllAdmin(currentPage);
	}, []);

	const fetchDataAllAdmin = (page: number) => {
		const payload = {
			limit: 10,
			page: page,
			search: '',
		};
		dispatch(getAllAdmin(payload));
	};

	useEffect(() => {
		if (currentLocation === router.ROOT) {
			setActiveSubMenu(ADMIN_MENU.NEW_PATIENTS);
		}
	}, [location.state, selectedUser]);

	useEffect(() => {
		if (
			users?.length === 0 ||
			(users === null && (isSuperAdmin || user?.isPhysioterapist))
		) {
			dispatch(getUsers(''));
		}
	}, [users, dispatch]);

	useEffect(() => {
		if (isSuperAdmin || user?.isPhysioterapist) {
			if (activeMenu == ADMIN_KEYS.SUMMARY) {
				setActiveSubMenu(activeMenu);
			} else if (activeMenu == ADMIN_KEYS.ACTIVITY) {
				fetchInboxData();
			} else if (
				activeMenu == ADMIN_KEYS.CONTACTS &&
				user?.profile?.role === USER_ROLES.ADMIN
			) {
				getUsersStats();
			}
		}
	}, [activeMenu]);

	const getProfileData = async () => {
		if (user.isPhysioterapist) {
			const apiResponse = await dispatch(getSelectedUser());
			setProfileData(apiResponse.payload);
		}
	};

	const fetchingData = async () => {
		const data = await dispatch(getFunctionalGoals());
		setFunctionalData(data?.payload?.data);
	};

	useEffect(() => {
		if (selectedItem && !functionalData) {
			fetchingData();
		}
	}, [selectedItem]);

	useEffect(() => {
		if (selectedUser?.id && (isSuperAdmin || user?.isPhysioterapist)) {
			getProfileData();
		}
	}, [selectedUser, dispatch]);

	useEffect(() => {
		if (location.state?.activeMenu) {
			setActiveMenu('');
			setActiveSubPatients('');
		}
	}, [location.state?.activeMenu]);

	return (
		<div className="admin-menu-main-container">
			<AdminMenuContent
				inboxLoading={inboxLoading}
				selectedItem={selectedItem}
				activeMenu={activeMenu}
				setActiveMenu={setActiveMenu}
				handleSelectChange={handleSelectChange}
				setIsModalOpen={setIsModalOpen}
				isModalOpen={isModalOpen}
				setSearchQuery={setSearchQuery}
				profileData={profileData}
				functionalData={functionalData}
				handleInboxChange={handleInboxChange}
				searchQuery={searchQuery}
				activeSubMenu={activeSubMenu}
				setActiveSubMenu={setActiveSubMenu}
				inboxData={inboxData}
				onClick={props.onClick}
				activeSubPatients={activeSubPatients}
				setActiveSubPatients={setActiveSubPatients}
			/>
		</div>
	);
};

export default AdminMenu;
