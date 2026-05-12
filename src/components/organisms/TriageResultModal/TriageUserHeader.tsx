/**
 * TriageUserHeader - Reusable user header for triage result modals
 *
 * Displays user avatar, name, email, demographic badges and QR code.
 * Used across all triage result types (Evaluation, ROM, Rehab, Survey).
 */

import { UserWithSession } from '@types';
import { Avatar, Flex, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import './TriageUserHeader.css';

const { Text } = Typography;

export interface TriageUserHeaderProps {
	/** The user to display */
	user: UserWithSession;
}

export const TriageUserHeader: React.FC<TriageUserHeaderProps> = ({ user }) => {
	const { t } = useTranslation();
	const { profile } = user;

	// Format user name
	const userName =
		profile?.fullName ||
		`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() ||
		'User';

	// Get initials for avatar fallback
	const initials = profile?.firstName?.charAt(0)?.toUpperCase() || 'U';

	// QR code value
	const qrValue = `USER-ID: ${user.id}\nName: ${userName}`;

	// Calculate age from date of birth
	const calculateAge = (dob: string | Date | undefined): number | null => {
		if (!dob) return null;
		const birthDate = new Date(dob);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}
		return age;
	};

	// Format height (convert cm to feet if needed)
	const formatHeight = (
		height: number | string | undefined,
		unit?: string,
	): string | null => {
		if (!height) return null;
		const heightNum = typeof height === 'string' ? parseFloat(height) : height;
		if (isNaN(heightNum)) return null;

		// If unit is cm or height > 100, assume it's in cm and convert to feet
		if (unit === 'cm' || heightNum > 100) {
			const feet = heightNum / 30.48;
			return `${feet.toFixed(1)} Ft`;
		}
		// Otherwise assume it's already in feet
		return `${heightNum.toFixed(1)} Ft`;
	};

	// Format weight
	const formatWeight = (
		weight: number | string | undefined,
		unit?: string,
	): string | null => {
		if (!weight) return null;
		const weightNum = typeof weight === 'string' ? parseFloat(weight) : weight;
		if (isNaN(weightNum)) return null;

		const displayUnit = unit || 'Kg';
		return `${weightNum} ${displayUnit}`;
	};

	// Get gender display
	const getGenderDisplay = (gender: string | undefined): string | null => {
		if (!gender) return null;
		// Capitalize first letter
		return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
	};

	// Extract user data
	const age = calculateAge(profile?.dateOfBirth);
	const gender = getGenderDisplay(profile?.gender);
	const height = formatHeight(profile?.height, profile?.heightUnit);
	const weight = formatWeight(profile?.weight, profile?.weightUnit);

	// Check if we have any demographic data to show
	const hasDemographicData = gender || age || height || weight;

	return (
		<div className="triage-user-header">
			<div className="triage-user-header__content">
				<div className="triage-user-header__info">
					<Avatar
						size={48}
						src={profile?.imageUrl}
						style={{
							backgroundColor: profile?.avatarColor || 'var(--brand-primary)',
							flexShrink: 0,
						}}>
						{initials}
					</Avatar>
					<Flex vertical gap={2} className="triage-user-header__details">
						<Flex gap={8} wrap="wrap">
							<Text strong className="triage-user-header__name">
								{userName}
							</Text>
							{gender && (
								<Tag className="triage-user-header__badge">{gender}</Tag>
							)}
						</Flex>
						<Text type="secondary" className="triage-user-header__email">
							{profile?.email}
						</Text>
					</Flex>
				</div>

				{hasDemographicData && (
					<Flex gap={8} wrap="wrap" className="triage-user-header__badges">
						{age !== null && (
							<Tag className="triage-user-header__badge">
								{age} {t('common.yearsOld', 'Years Old')}
							</Tag>
						)}
						{height && (
							<Tag className="triage-user-header__badge">
								{height} {t('common.height', 'Height')}
							</Tag>
						)}
						{weight && (
							<Tag className="triage-user-header__badge">
								{weight} {t('common.weight', 'Weight')}
							</Tag>
						)}
					</Flex>
				)}
			</div>
		</div>
	);
};

export default TriageUserHeader;
