import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import './style.css';

export interface OnboardFooterProps {
	onContinue: () => void;
	disabled?: boolean;
	loading?: boolean;
	label?: string;
	className?: string;
}

export const OnboardFooter = ({
	onContinue,
	disabled = false,
	loading = false,
	label,
	className = '',
}: OnboardFooterProps) => {
	const { t } = useTranslation();

	return (
		<div className={`onboard-footer ${className}`}>
			<Button
				type="primary"
				size="large"
				className="onboard-footer-btn"
				disabled={disabled}
				loading={loading}
				onClick={onContinue}>
				{label || t('Patient.data.onboard.continue')}
			</Button>
		</div>
	);
};

export default OnboardFooter;
