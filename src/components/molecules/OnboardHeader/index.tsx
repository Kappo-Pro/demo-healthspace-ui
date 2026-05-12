import { LogOut04 } from '@vitalflow-icons/general/logOut04';
import { UseAuth } from '@contexts/AuthContext';
import { useTheme } from '@providers/ThemeProvider';
import { useTypedSelector } from '@stores/index';
import { Avatar, Popover, Steps } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import './style.css';

export interface OnboardHeaderProps {
	title: string;
	description?: React.ReactNode;
	currentStep: number;
	onBack?: () => void;
	showBack?: boolean;
	className?: string;
}

// Map internal 9-step flow to 6 visible stepper items
const STEPPER_ITEMS = [
	{ key: 'profile', titleKey: 'Patient.data.onboard.stepper.completeProfile', steps: [1] },
	{ key: 'path', titleKey: 'Patient.data.onboard.stepper.choosePath', steps: [2] },
	{ key: 'conditions', titleKey: 'Patient.data.onboard.stepper.preExistingConditions', steps: [3, 4, 5] },
	{ key: 'goals', titleKey: 'Patient.data.onboard.stepper.functionalGoals', steps: [6] },
	{ key: 'day', titleKey: 'Patient.data.onboard.stepper.howSpendDay', steps: [7] },
	{ key: 'onboarding', titleKey: 'Patient.data.onboard.stepper.onboarding', steps: [8, 9] },
];

const getStepperIndex = (currentStep: number): number => {
	const index = STEPPER_ITEMS.findIndex(item => item.steps.includes(currentStep));
	return index >= 0 ? index : 0;
};

export const OnboardHeader = ({
	title,
	description,
	currentStep,
	onBack,
	showBack = true,
	className = '',
}: OnboardHeaderProps) => {
	const { onLogout } = UseAuth();
	const { isDark } = useTheme();
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const selectedUser = useTypedSelector(state => state.contacts.main.selectedUser);
	const profileDetails = useTypedSelector(state => state.onBoard.onBoard.profileDetails);

	const stepperIndex = getStepperIndex(currentStep);
	const stepItems = STEPPER_ITEMS.map((item, index) => ({
		title: t(item.titleKey) || `Step ${index + 1}`,
	}));

	const logoSrc = isDark
		? '/brand/logo/full/horizontal/color/logo-horizontal-color-dark.svg'
		: '/brand/logo/full/horizontal/color/logo-horizontal-color-light.svg';

	const popoverContent = (
		<div>
			<div className="text-left">
				<h3 style={{ fontSize: 'var(--font-size-base)' }}>
					{profileDetails
						? `${profileDetails?.profile?.firstName} ${profileDetails?.profile?.lastName}`
						: `${user?.profile?.firstName} ${user?.profile?.lastName}`}
				</h3>
				<p style={{ color: 'var(--text-tertiary)' }}>{user?.profile?.email}</p>
			</div>
			<hr style={{ margin: 'var(--spacing-2) 0' }} />
			<div className="onboard-nav-logout" onClick={() => onLogout()}>
				<span>{t('Admin.data.menu.logout')}</span>
				<LogOut04 color="stroke-purple-700" width={20} height={20} />
			</div>
		</div>
	);

	return (
		<div className="onboard-nav">
			<div className="onboard-nav-top">
				<div className="onboard-nav-left">
					{showBack && onBack && (
						<button
							className="onboard-nav-back"
							onClick={onBack}
							aria-label="Go back">
							<UntitledIcon name="arrowLeft" size="medium" />
						</button>
					)}
				</div>

				<div className="onboard-nav-center">
					<img src={logoSrc} alt="VitalFlow" width={150} />
				</div>

				<div className="onboard-nav-right">
					<Popover content={popoverContent} trigger="hover" placement="leftBottom">
						<div className="onboard-nav-avatar">
							{selectedUser?.profile?.imageUrl || user?.profile?.imageUrl ? (
								<Avatar
									src={
										user?.isPhysioterapist
											? selectedUser?.profile?.imageUrl
											: user?.profile?.imageUrl
									}
									alt="avatar"
									size={32}
								/>
							) : (
								<Avatar
									style={{
										backgroundColor: user?.isPhysioterapist
											? selectedUser?.profile?.avatarColor
											: user?.profile?.avatarColor,
									}}
									alt="avatar"
									size={32}>
									{user?.isPhysioterapist
										? selectedUser?.profile?.firstName?.charAt(0)?.toUpperCase()
										: user?.profile?.firstName?.charAt(0)?.toUpperCase()}
								</Avatar>
							)}
						</div>
					</Popover>
				</div>
			</div>

			<div className="onboard-nav-stepper">
				<Steps
					current={stepperIndex}
					items={stepItems}
					size="small"
					className="onboard-stepper"
				/>
			</div>

			<div className={`onboard-page-header ${className}`}>
				<h1 className="onboard-page-header-title">{title}</h1>
				{description && <p className="onboard-page-header-description">{description}</p>}
			</div>
		</div>
	);
};

export default OnboardHeader;
