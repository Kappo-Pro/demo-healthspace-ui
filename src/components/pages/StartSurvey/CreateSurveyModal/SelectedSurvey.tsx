import { Survey } from '@types';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

const SelectedSurvey = (selectedSurvey: { selectedSurvey: Survey }) => {
	const { t } = useTranslation();

	return (
		<>
			{
				<>
					<p className="header-title typing ai-subtitle">
						{selectedSurvey?.selectedSurvey?.title}
					</p>
					<p className="header-description ai-description">
						{selectedSurvey?.selectedSurvey?.description}
					</p>
				</>
			}
		</>
	);
};

export default SelectedSurvey;
