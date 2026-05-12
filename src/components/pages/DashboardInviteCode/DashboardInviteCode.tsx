import ToggleMenu from '@atoms/ToggleMenu';
import { Copy07 } from '@vitalflow-icons/general/copy07';
import { useTypedSelector } from '@stores/index';
import { message, QRCode, Flex, Typography } from 'antd';
import { ResponsiveImage } from '@atoms/ResponsiveImage';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

const { Paragraph } = Typography;
import { useEffect, useState } from 'react';

export default function DashboardInviteCode() {
	const [inviteCode, setInviteCode] = useState('');
	const { t } = useTypedTranslation();
	const { user } = useTypedSelector(state => ({
		user: state.user,
	}));

	useEffect(() => {
		if (user) {
			setInviteCode(user?.client?.inviteCode);
		}
	}, [user]);

	return (
		<>
			<div className="cursor-pointer p-2"><ToggleMenu /></div>
			<Flex
				vertical
				gap={16}
				align="center"
				justify="center"
				className="md:flex-row text-gray-800 p-6 md:p-12"
			>
				<div className="md:w-1/2 w-full space-y-6 text-center md:text-left">
					<h1 className="text-3xl">
						<span className="text-gray-600 font-inter text-[30px] leading-[45.99px] text-left">
							<span className="text-gray-700 font-bold">
								{t('patient.dashboard.invite.careSpace')}
							</span>{' '}
							{t('patient.dashboard.invite.improveMobility')}
						</span>
					</h1>
					<Flex justify="space-between" align="center" className="bg-gray-100 p-3 rounded-2xl">
						<span className="text-gray-700 font-inter text-[14px] font-semibold leading-[16.94px] text-left">
							{t('patient.dashboard.invite.inviteCode')} :
						</span>
						<Flex gap={8} align="center" className="text-gray-700 font-inter text-[20px] font-normal leading-[24.2px] text-left">
							{inviteCode}
							<span
								className="cursor-pointer"
								onClick={() => {
									navigator.clipboard.writeText(inviteCode);
									message.success(t('Admin.data.menu.setting.openAi.copied'));
								}}>
								<Copy07 color="stroke-gray-700" />
							</span>
						</Flex>
					</Flex>
					<div className="space-y-2">
						<Paragraph className="text-gray-600 font-inter text-[20px] font-normal leading-[37.52px] text-left">
							{t('patient.dashboard.invite.downloadApp')}
						</Paragraph>
						<Flex
							gap="middle"
							justify="space-between"
							style={{
								padding: '25px',
								background: 'var(--color-gray-100)',
								borderRadius: 'var(--radius-2xl)',
							}}>
							<Flex gap="middle" vertical justify="center" align="center">
								<QRCode
									value={
										'https://apps.apple.com/in/app/vitalflowai/id6450214866'
									}
									size={192}
									style={{ backgroundColor: 'none' }}
								/>
								<ResponsiveImage
									src="/images/dashboard/app-store.png"
									alt={t('patient.dashboard.invite.appleStoreAlt')}
									className="h-16 w-48 inline cursor-pointer"
									loading="eager"
									onClick={() => {
										window.open(
											'https://apps.apple.com/in/app/vitalflowai/id6450214866',
											'_blank',
											'noopener,noreferrer',
										);
									}}
								/>
							</Flex>
							<Flex gap="middle" vertical justify="center" align="center">
								<QRCode
									value={
										'https://play.google.com/store/apps/details?id=com.nexturn.vitalflowai'
									}
									size={192}
									style={{ backgroundColor: 'none' }}
								/>
								<ResponsiveImage
									src="/images/dashboard/btn-android.png"
									alt={t('patient.dashboard.invite.googlePlayStoreAlt')}
									className="h-16 w-48 inline cursor-pointer"
									loading="eager"
									onClick={() => {
										window.open(
											'https://play.google.com/store/apps/details?id=com.nexturn.vitalflowai',
											'_blank',
											'noopener,noreferrer',
										);
									}}
								/>
							</Flex>
						</Flex>
					</div>
				</div>

				<Flex justify="center" className="md:w-1/2 w-full mt-8 md:mt-0">
					<ResponsiveImage
						src="/images/dashboard/invite-dashboard.png"
						alt={t('patient.dashboard.invite.appPreviewAlt')}
						className="max-w-md w-full"
					/>
				</Flex>
			</Flex>
		</>
	);
}
