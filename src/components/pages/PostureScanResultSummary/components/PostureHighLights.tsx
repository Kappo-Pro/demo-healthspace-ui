import { Col, Row, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

const { Title } = Typography;

const PostureHighLights = () => {
	const { t } = useTranslation();
	return (
		<Row gutter={[16, 16]} className="card-margin-top">
			<Col xs={24} sm={24} md={24} lg={24}>
				<div className="overview-card">
					<Title level={3} className="inter-bold-text">
						{t('Patient.data.mobilityReport.didYouKnow')}
					</Title>
					<Paragraph className="inter-text-regular text-gray-500">
						{t('Patient.data.mobilityReport.didYouKnowDescription')}
					</Paragraph>
				</div>
			</Col>
		</Row>
	);
};

export default PostureHighLights;
