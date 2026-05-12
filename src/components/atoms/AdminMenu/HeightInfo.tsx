import { measurementTypes } from '@pages/PatientOnboard/Constants';
import { useTranslation } from 'react-i18next';

interface UserProps {
	userDetails: {
		profile: {
			birthDate: Date;
			gender: string;
			measurementSystem: string;
			height: {
				imperialHeight?: string;
				metricHeight?: string;
			};
		};
	};
}

const HeightInfo = (props: UserProps) => {
	const { userDetails } = props;
	const { t } = useTranslation();
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

	const formatBirthdate = (birthdate: Date) => {
		if (!birthdate) return 'N/A';
		const birthdateDate = new Date(birthdate);
		const age = calculateAge(birthdateDate);
		return (
			<span>
				{`${age}`} {t('admin.patient.yearsOld')}
			</span>
		);
	};

	const formatHeight = (
		height: { imperialHeight?: string; metricHeight?: string },
		measurementSystem: string,
	) => {
		if (!height?.imperialHeight && !height?.metricHeight) {
			return `${t('admin.patient.na')}`;
		}

		return measurementSystem === measurementTypes.IMPERIAL
			? `${height?.imperialHeight} ${measurementTypes?.FEET}`
			: `${height?.metricHeight} ${measurementTypes?.CENTIMETER}`;
	};

	return (
		<div style={{ fontSize: 'var(--font-size-sm)' }}>
			<span style={{ marginTop: '-1px', textTransform: 'capitalize' }}>
				{userDetails?.profile?.gender || 'N/A'},{' '}
			</span>
			<span>{formatBirthdate(userDetails?.profile?.birthDate)}, </span>
			<span>
				{formatHeight(
					userDetails?.profile,
					userDetails?.profile?.measurementSystem,
				)}{' '}
				{t('admin.patient.height')}
			</span>
		</div>
	);
};

export default HeightInfo;
