import { DashboardSkeleton } from '@atoms/Skeletons';
import { UseAuth } from '@contexts/AuthContext';
import MainMenu from '@molecules/MainMenu';
import NewPatientOnboardDashboard from '@pages/NewPatientOnboardDashboard';
import PatientOnboard from '@pages/PatientOnboard';
import { activityKeys, PLANS, ROUTE_KEYS, USER_ROLES } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setCollapsible } from '@stores/shared/patientDetail/patientDetail';
import { getPlansByUserId } from '@stores/shared/settings/settings';
import { WholeDayActivity } from '@types';
import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const MLayout = () => {
	const { user } = useTypedSelector((state) => ({
		user: state.user,
	}));
	const currentLocation = window.location.pathname
	const { credentials } = UseAuth();
	const isCollapsible = useTypedSelector(state => state.patientDetail.patientDetail.isCollapsible)
	const dispatch = useTypedDispatch()
	const role = credentials?.roles ? credentials.roles[0] : undefined;
	const [isLoading, setLoading] = useState(true)
	const [isUserDataPresent, setIsUserDataPresent] = useState(false);
	const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
	const savedUserPlans = useTypedSelector(state => state.settings.plans.savedUserPlans);
	const [isPlanOne, setIsplan] = useState<boolean>(false);
		const onBoardCompletion = useTypedSelector(
			state => state.onBoard.onBoard.onBoardCompletion,
		);
	useEffect(() => {
		if(user.id){ getPlan(user.id)}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},[user])

	useEffect(() => {
		setIsplan(savedUserPlans?.planType === PLANS?.SCREENING)
	},[savedUserPlans])

	const getPlan = async(id:string) => {
		await dispatch(getPlansByUserId(id));
	}

	useEffect(() => {
		if (user?.profile?.role == USER_ROLES.USER || role == USER_ROLES.USER) {
			const isWeight =
				(user?.profile?.imperialWeight || user?.profile?.metricWeight) ||
				(user?.profile?.weight?.[0]?.imperialWeight || user?.profile?.weight?.[0]?.metricWeight);

			const userDataCheck = (
				user?.profile?.firstName &&
				user?.profile?.lastName &&
				user?.profile?.email &&
				user?.profile?.birthDate &&
				(user?.profile?.imperialHeight || user?.profile?.metricHeight) &&
				isWeight &&
				user?.profile?.gender &&
				user?.profile?.consentPolicyRead && (isPlanOne || getTotalHours(user?.dailyActivityDistribution))
			)
			setIsUserDataPresent(userDataCheck);
		} else {
			setIsUserDataPresent(true);
		}
		user?.id && setLoading(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, isPlanOne]);

	const getTotalHours = (data: WholeDayActivity): number => {
		if (!data) return 0;

		const total = activityKeys
			.map(key => data[key as keyof WholeDayActivity] || 0)
			.reduce((sum, value) => sum + (typeof value === "number" ? value : 0), 0);
		return total;
	};

	const handleOnboardingComplete = () => {
		setIsOnboardingComplete(true);
	};

	useEffect(() => {
		if (
			currentLocation.includes(ROUTE_KEYS.DOWNLOAD_APP) &&
			(user?.profile?.role === USER_ROLES.ADMIN ||
				user?.profile?.role === USER_ROLES.SUPER_ADMIN)
		) {
			dispatch(setCollapsible(true));
		} else if(currentLocation.includes(ROUTE_KEYS.PROGRAM_START) || currentLocation.includes(ROUTE_KEYS.POSTURE_SCAN) || currentLocation.includes(ROUTE_KEYS.ROM_SCAN) || currentLocation.includes(ROUTE_KEYS.ADD_EXERCISE)) {
			dispatch(setCollapsible(true));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentLocation]);

	if (isLoading) {
		return <DashboardSkeleton />;
	}

	return (
		<Layout>
			{!isUserDataPresent && !isOnboardingComplete && !onBoardCompletion ? (
				<PatientOnboard onComplete={handleOnboardingComplete} />
			) : (
				<>
					<Sider
						collapsed={isCollapsible}
						width="400px"
						className="min-h-screen">
						<MainMenu user={user} />
					</Sider>
					<Layout style={{ zIndex: 1, backgroundColor: 'var(--layout-bg-color)' }}>
						<Content>
							{!isUserDataPresent ? (
								<NewPatientOnboardDashboard />
							) : (
								<Outlet />
							)}
						</Content>
					</Layout>
				</>
			)}
		</Layout>
	);
};

export default MLayout;
