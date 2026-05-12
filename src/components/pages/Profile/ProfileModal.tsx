import { UseAuth } from '@contexts/AuthContext';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getSelectedUser, getUser } from '@stores/shared/user';
import { ProfileData, ProfileModalProps, TProfileData } from '@types';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import ProfileForm from './ProfileForm';
import './style.css';

const ProfileModal = (props: ProfileModalProps) => {
	const dispatch = useTypedDispatch();
	const {
		isModalOpen,
		setIsModalOpen,
		policyModalOpen,
		closable,
		setPolicyModalOpen,
		rowData
	} = props;
	const { user, selectedUser } = useTypedSelector(state => ({
		user: state.user,
		selectedUser: state.user.isPhysioterapist
			? state.contacts.main.selectedUser
			: state.user,
	}));
	const [functionalGoalsList, setFunctionalGoalsList] = useState<number[]>([]);
	const [userFormData, setUserFormData] = useState<TProfileData>({
		firstName: selectedUser.profile.firstName,
		lastName: selectedUser.profile.lastName,
		email: selectedUser.profile.email,
		imageUrl: selectedUser.profile?.imageUrl,
		birthDate: selectedUser.profile.birthDate,
		gender: selectedUser.profile?.gender,
		imperialHeight: selectedUser.profile?.imperialHeight,
		metricHeight: selectedUser.profile?.metricHeight,
		imperialWeight: selectedUser.profile?.imperialWeight,
		metricWeight: selectedUser.profile?.metricWeight,
		isPregnant: false,
		functionalGoals: !user.isPhysioterapist
			? user.functionalGoals?.[user.functionalGoals.length - 1]
					?.functionalGoalsIds
			: functionalGoalsList,
		consentPolicyRead: selectedUser.profile?.consentPolicyRead,
		patientId: selectedUser.profile?.patientId,
	});

	const [profileData, setProfileData] = useState<ProfileData | undefined>();
	const { credentials } = UseAuth();

	const getProfileData = async () => {
		if (user.isPhysioterapist) {
			const apiResponse = await dispatch(getSelectedUser());
			setProfileData(apiResponse.payload);
		} else {
			if (credentials?.sub) {
				const data = await dispatch(getUser(credentials?.sub));
				setProfileData(data.payload);
			}
		}
	};

	useEffect(() => {
		getProfileData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (
			profileData &&
			profileData.functionalGoals &&
			profileData.functionalGoals.length > 0
		) {
			if ((profileData?.functionalGoals?.length ?? 0) > 0) {
				const lastIndex = (profileData?.functionalGoals?.length ?? 1) - 1;
				const data =
					profileData?.functionalGoals?.[lastIndex]?.functionalGoalsIds ?? [];
				setFunctionalGoalsList(data);
				setUserFormData({
					...userFormData,
					...{ ['functionalGoals']: data },
				});
			} else {
				setFunctionalGoalsList([]);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profileData, selectedUser]);

	useEffect(() => {
		if (credentials?.sub) {
			dispatch(getUser(credentials?.sub));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [credentials?.sub]); // dispatch is stable from Redux

	return (
		<Modal
			open={isModalOpen}
			width={525}
			footer={null}
			closable={closable}
			maskClosable={false}
			onCancel={() => {
				setIsModalOpen(false);
				setPolicyModalOpen(false);
			}}
			style={{ top: 0 }}
			styles={{
				body: {
					overflowY: 'auto',
					userSelect: 'none',
					padding: 'var(--spacing-6)',
					background: 'var(--surface-primary)',
				},
			}}
			className={`${policyModalOpen ? 'modal-container' : ''}`}>
			<ProfileForm
				policyModalOpen={policyModalOpen}
				setPolicyModalOpen={setPolicyModalOpen}
				setIsModalOpen={setIsModalOpen}
				rowData={rowData}
			/>
		</Modal>
	);
};

export default ProfileModal;
