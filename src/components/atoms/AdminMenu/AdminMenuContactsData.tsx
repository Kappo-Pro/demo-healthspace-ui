import HeightInfo from '@atoms/AdminMenu/HeightInfo';
import { useBlockNavigation } from '@atoms/BlockNavigation';
import { Copy01 } from '@vitalflow-icons/general/copy01';
import { Edit02 } from '@vitalflow-icons/general/edit02';
import { PlayCircle } from '@vitalflow-icons/media/playCircle';
import { status } from '@pages/PatientOnboard/Constants';
import ProfileModal from '@pages/Profile/ProfileModal';
import { router } from '@routers/routers';
import { getUsers } from '@stores/activity/contacts/contacts';
import { PLANS, ROUTE_KEYS } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	setActiveTab,
	setStartSession
} from '@stores/shared/patientDetail/patientDetail';
import {
	getProgramListApproved,
	selectExercise,
	selectProgram
} from '@stores/shared/patientDetail/program';
import { ProgramResponse, SelectedUser, User, UserProfile } from '@types';
import { Avatar, Button, Flex, message, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Select, { components, StylesConfig } from 'react-select';
import AdminMenuContactsContent from './AdminMenuContactsContent';
import UserDetails from './UserDetails';

const { Paragraph } = Typography;

interface IAdminMenuContactsDataProps {
	setActiveMenu: (value: string) => void;
	handleSelectChange: (Selected: SelectedUser) => void;
	isModalOpen: boolean;
	setIsModalOpen: (value: boolean) => void;
	profileData: User;
	functionalData: [] | undefined;
	activeSubMenu: string;
	selectedItem: SelectedUser | null;
	onClick: (value: string) => void;
	activeSubPatients: string;
	setActiveSubPatients: (value: string) => void;
}

export default function AdminMenuContactsData(
	props: IAdminMenuContactsDataProps,
) {
	const {
		handleSelectChange,
		setIsModalOpen,
		isModalOpen,
		profileData,
		functionalData,
		selectedItem,
		onClick,
		activeSubPatients,
		setActiveSubPatients,
	} = props;
	const { t } = useTranslation();
	const { handleNavigation } = useBlockNavigation(
		location.pathname.includes(router.AIASSISTANT_PROGRAM_START),
		t('admin.patientDetail.sessions.unsavedChanges'),
	);
	const currentLocation = window.location.pathname;
	const [isPlanOne, setIsplan] = useState<boolean>(false);
	const savedUserPlans = useTypedSelector(state => state.settings.plans.savedUserPlans);
	const isCorrectLocation = currentLocation.includes(
		router.AIASSISTANT_PROGRAM_START,
	);
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();
	const user = useTypedSelector(state => state.user);
	const program = useTypedSelector(
		state => state.patientDetail.program.programApproved,
	);
	const programUpdate = useTypedSelector(
		state => state.patientDetail.program.latestUpdatedProgram,
	);
	const { selectedUser, userDropDownList } = useTypedSelector(
		state => state.contacts.main,
	);
	const [isProgramAvailable, setProgramAvailable] = useState(false);
	const [policyModalOpen, setPolicyModalOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleInputChange = (value: string) => {
		if (value.length >= 3) {
			dispatch(getUsers(value));
		} else {
			dispatch(getUsers(''));
		}
	};

	const isUserData =
		location?.pathname == router.PENDINGINVITES ||
		location?.pathname == router.REGISTEREDPATIENTS ||
		location?.pathname == router.UNASSIGNEDPATIENTS;

	const buttonStyle = {
		color: 'var(--button-text-color)',
		border: 'inherit',
		width: '100%',
		margin: 'var(--spacing-2-5) 0',
	};

	const customOption = (props: { profile: UserProfile; data: User }) => (
		<components.Option {...props}>
			<Flex align="center" gap={8}>
				{props?.profile?.imageUrl ? (
					<Avatar src={props?.data?.profile?.imageUrl} alt="avatar" size={35} />
				) : (
					<Avatar
						style={{
							backgroundColor:
								props?.data?.profile?.avatarColor || 'var(--brand-primary)',
							color: 'var(--text-on-brand)',
							fontSize: '22px',
						}}
						alt="avatar"
						size={35}>
						<Flex align="center" justify="center">
							{props?.data?.profile?.firstName
								? props?.data?.profile?.firstName?.charAt(0)?.toUpperCase()
								: 'U'}
						</Flex>
					</Avatar>
				)}
				<span>
					{props?.data?.profile?.firstName +
						' ' +
						props?.data?.profile?.lastName}
				</span>
			</Flex>
		</components.Option>
	);

	const handleClick = async () => {
		if (program.data?.length == 1) {
			dispatch(selectProgram(program.data[0]));
			dispatch(selectExercise(program.data[0].exercises));
			navigate(
				`/${user.isPhysioterapist ? selectedUser.id : user.id}${router.AIASSISTANT_PROGRAM_START}`,
			);
			dispatch(setActiveTab(''));
			dispatch(setStartSession(false));
		} else if ((program.data?.length ?? 0) > 1) {
			handleNavigation(
				`/${user?.isPhysioterapist ? selectedUser?.id : user?.id}${router.AIASSISTANT_PROGRAMS}`,
			);
			dispatch(setActiveTab('programs'));
			dispatch(setStartSession(true));
		}
	};

	const customStyles: StylesConfig<SelectedUser, false> = {
		control: provided => ({
			...provided,
			backgroundColor: 'var(--menu-item-active)',
			border: 'none',
		}),
		placeholder: provided => ({
			...provided,
			color: 'var(--text-on-dark)',
		}),
		input: provided => ({
			...provided,
			color: 'var(--text-on-dark)',
		}),
		singleValue: provided => ({
			...provided,
			color: 'var(--text-on-dark)',
		}),
		dropdownIndicator: (provided, state) => ({
			...provided,
			color: state.isFocused ? 'var(--text-on-dark)' : 'var(--text-on-dark)',
			'&:hover': {
				color: 'var(--text-on-dark)',
			},
		}),
		indicatorSeparator: () => ({
			display: 'none',
		}),
	};

	const fetchHomeData = async (pageNumber: number) => {
		const payload = {
			userId: selectedUser?.id,
			limit: 10,
			page: pageNumber,
			searchValue: '',
			status: status.APPROVED,
		};
		const response = (await dispatch(getProgramListApproved(payload))) as {
			payload: { data: ProgramResponse[] };
		};
		if (response?.payload?.data?.length > 0) {
			setProgramAvailable(true);
		} else {
			setProgramAvailable(false);
		}
	};

	useEffect(() => {
		if (selectedItem?.id) {
			fetchHomeData(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedItem?.id, programUpdate]);

	useEffect(() => {
		setIsplan(savedUserPlans?.planType === PLANS?.SCREENING);
	}, [savedUserPlans]);

	const handleCopyEmail = () => {
		if (selectedUser?.profile?.email) {
			navigator.clipboard.writeText(selectedUser.profile.email);
			setCopied(true);
			// TODO: Consider using clipboard ?? defaultValue or clipboard?.property instead of clipboard!
			message.success('Email copied to clipboard!');
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<div>
			{!selectedItem ? (
				<AdminMenuContactsContent
					onClick={onClick}
					activeSubPatients={activeSubPatients}
					setActiveSubPatients={setActiveSubPatients}
				/>
			) : (
				<>
					{!location.pathname.includes(ROUTE_KEYS.PROGRAM_START) && (
						<Select
							className="select-container"
							options={userDropDownList}
							value={selectedItem}
							onChange={handleSelectChange}
							getOptionLabel={(item: SelectedUser) => {
								return item?.profile?.firstName + ' ' + item?.profile?.lastName;
							}}
							getOptionValue={(item: SelectedUser) => item.id.toString()}
							placeholder={t('admin.menu.selectPatient')}
							onInputChange={(value: string) => handleInputChange(value)}
							noOptionsMessage={() => t('admin.noUser')}
							components={{ Option: customOption }}
							styles={customStyles}
						/>
					)}
					<div className="user-main-container">
						<div className="user-container">
							<>
								{selectedUser?.profile?.imageUrl ? (
									<Avatar
										src={selectedUser?.profile?.imageUrl}
										alt="avatar"
										size={100}
									/>
								) : (
									<Avatar
										style={{
											backgroundColor:
												selectedUser?.profile?.avatarColor ||
												'var(--brand-primary)',
											color: 'var(--text-on-brand)',
											fontSize: '52px',
											border: '4px solid var(--surface-primary)',
										}}
										alt="avatar"
										size={100}>
										<Flex align="center" justify="center">
											{selectedItem?.profile?.firstName
												? selectedItem?.profile?.firstName
														?.charAt(0)
														?.toUpperCase()
												: 'U'}
										</Flex>
									</Avatar>
								)}
							</>
							{!location.pathname.includes(ROUTE_KEYS.PROGRAM_START) && (
								<div
									className="edit-container"
									style={{
										backgroundColor: 'var(--button-color-primary)',
										width: '30px',
										height: '30px',
										textAlign: 'center',
									}}
									onClick={() => {
										setIsModalOpen(true);
									}}>
									<Edit02 width={24} height={16} />
								</div>
							)}
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
							<p className="user-name-contact" style={{ lineHeight: '0.9' }}>
								{selectedUser?.profile?.firstName}{' '}
								{selectedUser?.profile?.lastName}
							</p>
							<Flex align="center" gap={8} className="my-1.5">
								<Paragraph className="user-email-contact">
									{selectedUser?.profile?.email}
								</Paragraph>
								// TODO: Consider using Copied ?? defaultValue or
								Copied?.property instead of Copied!
								<Tooltip
									title={copied ? 'Copied!' : 'Copy email'}
									placement="right">
									<Flex
										align="center"
										onClick={handleCopyEmail}
										style={{
											cursor: 'pointer',
											padding: 'var(--spacing-1)',
										}}>
										<Copy01 width={20} height={20} color="stroke-white" />
									</Flex>
								</Tooltip>
							</Flex>
							<HeightInfo userDetails={profileData} />
							{isProgramAvailable && !isCorrectLocation && !isPlanOne && (
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
										handleClick();
									}}>
									{t('patient.progress.rehab.startSession')}
								</Button>
							)}
						</div>
						{!isUserData && (
							<UserDetails
								userDetails={profileData}
								functionalData={functionalData}
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}
