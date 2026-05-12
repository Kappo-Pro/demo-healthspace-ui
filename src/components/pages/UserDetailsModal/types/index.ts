import { AdminDashboardPatient } from '@types';

export interface UserDetailsModalProps {
	open: boolean;
	onClose: () => void;
	afterClose?: () => void;
	userId: string;
	userData: AdminDashboardPatient;
	onRefresh?: () => void;
	isRegistered?: boolean;
}

export interface UserHeaderProps {
	userData: AdminDashboardPatient;
}

export interface UserInfoGridProps {
	userData: AdminDashboardPatient;
}

export interface UserActionTabsProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
}

export interface CommandPaletteProps {
	userId: string;
	userData: AdminDashboardPatient;
	onRefresh?: () => void;
}

export interface ActionCard {
	key: string;
	icon: React.ReactNode;
	title: string;
	description: string;
	buttonText: string;
	buttonType: 'primary' | 'default' | 'dashed' | 'danger';
	action: () => void;
	disabled?: boolean;
	requiredRole?: string[];
}

export interface InfoItem {
	label: string;
	value: string | number | React.ReactNode;
	span?: number;
}
