import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import './MobilityOverview.css';

const { Paragraph } = Typography;

const { Title } = Typography;

interface IMobilityOverView {
	isPdf: boolean;
	persona: {
		color: string;
	};
}

const MobilityOverview = (props: IMobilityOverView) => {
	const { persona: _persona, isPdf } = props;
	const { t } = useTranslation();
	return (
		<div className={`overview-grid ${isPdf ? 'pdf-section' : ''}`}>
			<div className="overview-card">
				<Title level={3} className="inter-bold-text">
					{t('patient.reports.mobility.mobilityOverview')}
				</Title>
				<Paragraph className="inter-text-regular text-gray-500">
					{t('patient.reports.mobility.mobilityOverviewDescription')}
				</Paragraph>
			</div>

			<div className="overview-card">
				<Title level={3} className="inter-bold-text">
					{t('patient.reports.mobility.didYouKnow')}
				</Title>
				<Paragraph className="inter-text-regular text-gray-500">
					{t('patient.reports.mobility.didYouKnowDescription')}
				</Paragraph>
			</div>

			<div className="overview-card">
				<h3 className={`inter-bold-text ${isPdf ? 'pdf-margin' : ''}`}>
					{t('patient.reports.mobility.whatThisMeans')}
				</h3>
				<div className="overview-cards">
					<Card>
						<p className={`${isPdf ? 'pdf-margin' : ''}`}>
							{t('patient.reports.mobility.list1')}
						</p>
					</Card>
					<Card>
						<p className={`${isPdf ? 'pdf-margin' : ''}`}>
							{t('patient.reports.mobility.list2')}
						</p>
					</Card>
					<Card>
						<p className={`${isPdf ? 'pdf-margin' : ''}`}>
							{t('patient.reports.mobility.list3')}
						</p>
					</Card>
					<Card>
						<p className={`${isPdf ? 'pdf-margin' : ''}`}>
							{t('patient.reports.mobility.list4')}
						</p>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default MobilityOverview;
