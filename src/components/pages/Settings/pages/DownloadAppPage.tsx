/**
 * DownloadAppPage - Settings Download App section
 *
 * Standalone page component for /settings/download-app route
 * Displays QR codes and download links for mobile apps
 */

import { UntitledIcon } from '@atoms/Icon';
import { useTypedSelector } from '@stores/index';
import { Flex, QRCode, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DownloadAppPage() {
	const [inviteCode, setInviteCode] = useState('');
	const { t } = useTranslation();
	const { user } = useTypedSelector(state => ({
		user: state.user,
	}));

	useEffect(() => {
		if (user) {
			setInviteCode(user?.client?.inviteCode);
		}
	}, [user]);

	const handleCopyInviteCode = () => {
		navigator.clipboard.writeText(inviteCode);
		message.success(t('Admin.data.menu.setting.openAi.copied') || 'Copied!');
	};

	const handleOpenAppStore = () => {
		window.open(
			'https://apps.apple.com/in/app/vitalflowai/id6450214866',
			'_blank',
			'noopener,noreferrer',
		);
	};

	const handleOpenPlayStore = () => {
		window.open(
			'https://play.google.com/store/apps/details?id=com.nexturn.vitalflowai',
			'_blank',
			'noopener,noreferrer',
		);
	};

	return (
		<div className="total-patient-main-div">
			<div className="flex flex-col items-center justify-center text-gray-800 gap-4 p-6">
				<div className="w-full text-center">
					<h1 className="text-3xl">
						<span className="text-left">
							<span className="font-bold">
								{t('Patient.data.dashboardInvite.careSpace')}
							</span>{' '}
							{t('Patient.data.dashboardInvite.improveMobility')}
						</span>
					</h1>

					<div
						className="p-3 rounded-2xl flex items-center justify-between"
						style={{ background: 'var(--color-gray-alpha-10)' }}>
						<span className="font-semibold text-left">
							{t('Patient.data.dashboardInvite.inviteCode')}:
						</span>
						<span className="leading-[24.2px] text-left flex items-center">
							{inviteCode}
							<span
								className="ml-2 cursor-pointer"
								onClick={handleCopyInviteCode}
								role="button"
								tabIndex={0}
								aria-label="Copy invite code">
								<UntitledIcon name="copy" size="small" />
							</span>
						</span>
					</div>

					<div>
						<p className="text-left">
							{t('Patient.data.dashboardInvite.downloadApp')}
						</p>
						<Flex
							gap="middle"
							justify="space-between"
							style={{
								padding: 'var(--spacing-6)',
								background: 'var(--color-gray-alpha-10)',
								borderRadius: 'var(--radius-2xl)',
								justifyContent: 'space-around',
							}}>
							<Flex gap="middle" vertical justify="center" align="center">
								<QRCode
									value="https://apps.apple.com/in/app/vitalflowai/id6450214866"
									size={192}
									style={{ backgroundColor: 'transparent' }}
								/>
								<img
									src="/images/dashboard/app-store.png"
									alt="Download on App Store"
									onClick={handleOpenAppStore}
								/>
							</Flex>
							<Flex gap="middle" vertical justify="center" align="center">
								<QRCode
									value="https://play.google.com/store/apps/details?id=com.nexturn.vitalflowai"
									size={192}
									style={{ backgroundColor: 'transparent' }}
								/>
								<img
									src="/images/dashboard/btn-android.png"
									alt="Download on Google Play"
									onClick={handleOpenPlayStore}
								/>
							</Flex>
						</Flex>
					</div>
				</div>
			</div>
		</div>
	);
}
