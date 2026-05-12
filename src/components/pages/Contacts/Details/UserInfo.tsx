import { Target04 } from '@vitalflow-icons/general/target04';
import { USER_ROLES } from '@stores/constants';
import { getFunctionalGoals } from '@stores/clinical/functionalGoals';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { Popover, Flex, Typography } from 'antd';

const { Paragraph } = Typography;
import moment from 'moment';
import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const UserInfo = (props: unknown) => {
	const { userDetails, functionalData } = props;
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const isAdmin = user.profile.role === USER_ROLES.ADMIN;
	const FunctionalGoals = useTypedSelector(
		state => state.functionalGoals.functionalGoals,
	);
	const dispatch = useTypedDispatch();

	const fetchingFunctionalGoalData = useCallback(async () => {
		await dispatch(getFunctionalGoals());
	}, [dispatch]);

	useEffect(() => {
		fetchingFunctionalGoalData();
	}, [fetchingFunctionalGoalData]);

	const popoverContent = (
		<div className="text-white select-none">
			{functionalData ? (
				FunctionalGoals?.data
					?.filter(item =>
						Array.isArray(functionalData)
							? functionalData.includes(item.id)
							: item.id === functionalData,
					)
					.map(filteredItem => (
						<Flex key={filteredItem.id} gap={8} className="mb-1">
							<p className="rounded-full bg-white text-black h-2 w-2 mt-2"></p>
							<Paragraph>{filteredItem?.attributes?.name}</Paragraph>
						</Flex>
					))
			) : (
				<Paragraph>{t('Admin.data.managePatient.noFunctionalGoals')}</Paragraph>
			)}
		</div>
	);

	const formatBirthdate = (birthdate: Date) => {
		if (!birthdate) return 'N/A';
		const birthdateDate = new Date(birthdate);
		const formattedBirthdate = moment(birthdate).format('MMMM DD, YYYY');
		const age = calculateAge(birthdateDate);
		return `${formattedBirthdate} (Age: ${age})`;
	};

	const calculateAge = (birthdate: Date) => {
		const today = new Date();
		const birthdateDate = new Date(birthdate);
		let age = today.getFullYear() - birthdateDate.getFullYear();
		const monthDiff = today.getMonth() - birthdateDate.getMonth();
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthdateDate.getDate())
		) {
			age--;
		}
		return age;
	};

	const formatHeight = (height: number) => {
		if (!height) return 'N/A';
		// const feet = Math.floor(height / 12);
		// const inches = height % 12;
		return `${height}`;
	};

	const formatWeight = (weight: number) => {
		if (!weight) return 'N/A';
		// const lbs = weight * 2.20462;
		// const roundedLbs = Math.round(lbs);
		return `${weight}lb`;
	};

	const getPopupContainer = () =>
		document.getElementById('blackPopoverContainer') || document.body;

	return (
		<Flex gap={isAdmin ? 44 : 56}>
			<Flex gap={isAdmin ? 44 : 56}>
				<li>
					<Paragraph className="text-xs font-regular">
						{t('Admin.data.managePatient.birthdate')}
					</Paragraph>
					<Paragraph className="text-sm font-semibold mt-1">
						{formatBirthdate(userDetails?.profile?.birthDate)}
					</Paragraph>
				</li>
				<li>
					<Paragraph className="text-xs font-regular">
						{t('Admin.data.managePatient.weight')}
					</Paragraph>
					<Paragraph className="text-sm font-semibold mt-1">
						{formatWeight(
							userDetails?.profile?.imperialWeight ||
								userDetails?.profile?.metricWeight,
						)}
					</Paragraph>
				</li>
				<li>
					<Paragraph className="text-xs font-regular">
						{t('Admin.data.managePatient.height')}
					</Paragraph>
					<Paragraph className="text-sm font-semibold mt-1">
						{formatHeight(
							userDetails?.profile?.imperialHeight ||
								userDetails?.profile?.metricHeight,
						)}
					</Paragraph>
				</li>
				<li>
					<Paragraph className="text-xs font-regular">
						{t('Admin.data.managePatient.gender')}
					</Paragraph>
					<p
						className="text-sm font-semibold mt-1"
						style={{ textTransform: 'capitalize' }}>
						{userDetails?.profile?.gender || 'N/A'}
					</p>
				</li>
				{userDetails?.profile?.patientId && (
					<li>
						<Paragraph className="text-xs font-regular">
							{t('Admin.data.managePatient.patientId')}
						</Paragraph>
						<Paragraph className="text-sm font-semibold mt-1">
							{userDetails?.profile?.patientId || 'N/A'}
						</Paragraph>
					</li>
				)}
			</Flex>
			<ul>
				<div id="blackPopoverContainer" className="cursor-pointer mt-1">
					<Popover
						placement="bottomRight"
						content={<div>{popoverContent}</div>}
						trigger="click"
						getPopupContainer={getPopupContainer}
						overlayInnerStyle={{
							backgroundColor: 'var(--surface-overlay)',
							paddingLeft: 'var(--spacing-5)',
							paddingRight: 'var(--spacing-5)',
						}}>
						<li className="border border-gray-300 rounded-md p-2">
							<Flex gap={8}>
								<Target04 width={17} height={17} color="stroke-gray-700" />
								<Paragraph className="text-sm font-semibold text-gray-700 -mt-[2px]">
									{t('Admin.data.managePatient.functionalGoals')}
								</Paragraph>
							</Flex>
						</li>
					</Popover>
				</div>
			</ul>
		</Flex>
	);
};
export default UserInfo;
