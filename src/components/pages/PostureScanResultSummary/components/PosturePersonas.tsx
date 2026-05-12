import { Card, Col, Flex, Row, Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getPersonas } from '../constants';
const { Title, Text } = Typography;

type Props = {
	score: number;
};

const PosturePersonas: React.FC<Props> = ({ score }) => {
	const { t } = useTranslation();
	const personas = getPersonas(t);
	const activePersonaId = personas.find(
		p => score >= p.range[0] && score <= p.range[1],
	)?.id;

	return (
		<Card style={{ padding: '24px 0' }} className="mt-6">
			<h3 className={`inter-bold-text mb-6`}>
				{t('Patient.data.postures.posturePersona')}
			</h3>

			<Row gutter={[0, 16]}>
				{personas.map(persona => {
					const isActive = persona.id === activePersonaId;

					return (
						<Col span={24} key={persona.id}>
							<Card
								style={{
									background: isActive
										? 'linear-gradient(135deg, var(--brand-primary), var(--color-info-600))'
										: 'var(--surface-secondary)',
									borderRadius: 16,
									boxShadow: isActive
										? '0 0 0 3px var(--brand-primary), 0 0 15px var(--brand-primary-light)'
										: undefined,
									transform: isActive ? 'scale(1.02)' : undefined,
									transition: 'all 0.3s ease',
									border: !isActive ? '2px solid' : undefined,
								}}
								bodyStyle={{
									padding: 24,
								}}>
								<Flex align="center">
									<img
										src={persona.image}
										alt={persona.title}
										style={{
											height: 320,
											marginRight: 24,
											flexShrink: 0,
											opacity: isActive ? 1 : 0.85,
										}}
									/>
									<div>
										<Title
											level={5}
											style={{
												margin: 0,
												color: isActive
													? 'var(--surface-primary)'
													: 'var(--text-primary)',
												fontWeight: isActive ? 700 : 600,
												fontSize: 18,
											}}>
											{persona.title}
										</Title>
										<Text
											className="block"
											style={{
												marginBottom: 8,
												fontSize: 14,
												color: isActive
													? 'var(--surface-primary)'
													: 'var(--text-primary)',
											}}>
											{persona.subtitle}
										</Text>
										<Text
											style={{
												fontSize: 14,
												color: isActive
													? 'var(--surface-primary)'
													: 'var(--text-primary)',
												lineHeight: 1.6,
											}}>
											{persona.description}
										</Text>
									</div>
								</Flex>
							</Card>
						</Col>
					);
				})}
			</Row>
		</Card>
	);
};

export default PosturePersonas;
