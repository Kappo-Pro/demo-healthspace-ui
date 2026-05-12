import { Typography } from 'antd';

const { Paragraph } = Typography;

const { Title } = Typography;
import { useTranslation } from 'react-i18next';

const Suggestions = () => {
	const { t } = useTranslation();
	return (
		<div className={`overview-card-grid`}>
			<div className="overview-card">
				<h2
					style={{
						fontSize: 20,
						fontWeight: 'var(--font-weight-bold)',
					}}>
					{t('Patient.data.postures.suggestions.highlightsTitle')}
				</h2>

				<Paragraph className="inter-text-regular text-gray-500">
					{t('Patient.data.postures.suggestions.highlightsDescription')}
				</Paragraph>
			</div>

			<div className="overview-card">
				<Title level={3} className="inter-bold-text">
					{t('Patient.data.postures.suggestions.improvementTitle')}
				</Title>
				<Paragraph className="inter-text-regular text-gray-500">
					{t('Patient.data.postures.suggestions.improvementDescription')}
				</Paragraph>
			</div>
		</div>
	);
};

export default Suggestions;
