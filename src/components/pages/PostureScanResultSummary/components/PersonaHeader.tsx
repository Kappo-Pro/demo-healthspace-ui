import { Card, Col, Flex, Row, Typography } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getPersonas } from '../constants';

const { Paragraph } = Typography;

type Props = {
	score: number;
};

export default function PersonaHeader({ score }: Props) {
	const { t } = useTranslation();
	const personas = useMemo(() => getPersonas(t), [t]);
	const persona = personas.find(
		p => score >= p.range[0] && score <= p.range[1],
	);

	if (!persona) return null;

	return (
		<Row gutter={[16, 16]} className="card-margin-top">
			<Col xs={24} sm={24} md={24} lg={24} xl={24}>
				<Card
					style={{
						height: '100%',
						borderRadius: 12,
					}}
					bodyStyle={{
						padding: 16,
					}}>
					<Flex align="center">
						<img
							src={persona.image}
							alt={persona.title}
							style={{ height: 250, marginRight: 16 }}
						/>
						<div>
							<h3
								style={{ color: 'var(--brand-primary)' }}
								className="inter-bold-text">
								{persona.title}
							</h3>
							<p className="inter-text-regular text-gray-500">
								<span style={{ color: 'var(--text-secondary)' }}>
									{persona.subtitle.split('with')[0]}
								</span>{' '}
								<b style={{ color: 'var(--text-secondary)' }}>
									{persona.subtitle.split('with')[1] || ''}
								</b>
							</p>
							<Paragraph className="inter-text-regular mt-6">
								{persona.description}
							</Paragraph>
						</div>
					</Flex>
				</Card>
			</Col>
		</Row>
	);
}
