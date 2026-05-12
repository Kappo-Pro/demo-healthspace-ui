import { useTypedSelector } from '@stores/index';
import { User, PhysiotherapistPatientAssociation } from '@types';
import { useEffect, useState } from 'react';
import './style.css';
import MDMainMenu from '@organisms/MainMenu';
import AssignedPTModal from '@pages/Profile/AssignedPTModal';
import { useBlockNavigation } from '@atoms/BlockNavigation';
// REMOVED: import { router } from '@routers/routers';
import { ADMIN_MENU_CLICK, ROUTE_KEYS, USER_ROLES } from '@stores/constants';
import { UseAuth } from '@contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface IMainMenuProps {
	user: User;
}

function MainMenu({ user }: IMainMenuProps) {
	const { t } = useTranslation();
	const { handleNavigation } = useBlockNavigation(
		location.pathname.includes(ROUTE_KEYS.PROGRAM_START),
		t('Admin.data.menu.patientDetail.aiAssistantListSessions.unsavedChanges'),
	);
	const [openModal, setOpenModal] = useState(false);
	const currentPath = window.location.pathname;
	const userDetail = useTypedSelector(state => state.user);
	const isSuperAdmin = userDetail?.profile?.role === USER_ROLES.SUPER_ADMIN;
	const physiotherapistAssociation =
		userDetail?.physiotherapistPatientAssociationPatientIdRelation;
	const [showModal, setShowModal] = useState(false);
	const [PtDetails, setPtDetails] =
		useState<PhysiotherapistPatientAssociation | null>(null);
	const { onLogout } = UseAuth();

	useEffect(() => {
		const showPopupAssociation = physiotherapistAssociation?.find(
			(element: PhysiotherapistPatientAssociation) =>
				element.showPopup === true,
		);
		if (showPopupAssociation) {
			setShowModal(true);
			setPtDetails(showPopupAssociation);
		} else {
			setShowModal(false);
			setPtDetails(null);
		}
	}, [physiotherapistAssociation]);

	const onProfile = () => handleNavigation(`/profile/${user.id}`);

	const redirectTo = (path: string) => {
		handleNavigation(`/${path}`);
	};
	const toggleModal = () => {
		setOpenModal(!openModal);
	};

	useEffect(() => {
		setOpenModal(false);
	}, [currentPath]);

	const onClickAdminMenu = (key: string) => {
		switch (key) {
			case ADMIN_MENU_CLICK.PROFILE:
				onProfile();
				break;
			case ADMIN_MENU_CLICK.LOGOUT:
				onLogout();
				break;
			case ADMIN_MENU_CLICK.ASSESSMENT:
				toggleModal();
				break;
			default:
				redirectTo(key);
				break;
		}
	};

	return (
		<>
			<div
				className="mainmenu-container"
				style={{
					fontSize: 'var(--font-size-base)',
				}}>
				<MDMainMenu
					isAdmin={user.isPhysioterapist}
					onClick={onClickAdminMenu}
					toggleModal={toggleModal}
				/>
			</div>
			{!user.isPhysioterapist &&
				userDetail?.fusionAuthUserId &&
				!isSuperAdmin &&
				showModal &&
				PtDetails && (
					<AssignedPTModal
						setShowModal={setShowModal}
						PtDetails={PtDetails?.physiotherapist}
					/>
				)}
		</>
	);
}

export default MainMenu;
