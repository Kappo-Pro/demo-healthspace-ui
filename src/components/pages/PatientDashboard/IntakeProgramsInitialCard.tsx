import { Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const InitialCard = () => {
	const { t } = useTranslation();
	return (
		// <Card className="intake-programs">
		<Flex justify="space-between" align="center" className="h-full">
			<Flex justify="space-between" vertical>
				<Flex vertical gap="small">
					<Title level={2} style={{ marginBottom: 0 }}>
						{t('Admin.data.intakeProcess.letsExperience')}
					</Title>
					<Text
						style={{
							fontSize: 24,
							maxWidth: 600,
						}}>
						{t('Admin.data.intakeProcess.answerQuestions')}
					</Text>
				</Flex>
				{/* <Button onClick={() => handleGetStep('body-selection')}>
					Get Started
				</Button> */}
			</Flex>
		</Flex>
		// </Card>
	);
};

export default InitialCard;
