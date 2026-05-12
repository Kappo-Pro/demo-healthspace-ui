import { ProgramTemplate } from '@types';
import { Button, Card, Col, Row } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProgramCard from './ProgramCard'; // adjust import as needed

type Props = {
	recommendations: ProgramTemplate[];
};

const MAX_VISIBLE = 4;

const RecommendedPrograms: React.FC<Props> = ({ recommendations }) => {
	const { t } = useTranslation();
	const [visibleCount, setVisibleCount] = useState(MAX_VISIBLE);

	const handleLoadMore = () => {
		setVisibleCount(prev =>
			Math.min(prev + MAX_VISIBLE, recommendations.length),
		);
	};

	if (!recommendations || recommendations.length === 0) return null;

	return (
		<Card
			style={{ marginTop: 16 }}
			className="programs-section"
			title={
				<div
					className="programs-header"
					style={{
						background: `linear-gradient(to right, var(--color-info-500), var(--brand-secondary))`,
						color: 'var(--text-on-brand)',
						padding: 'var(--spacing-2-5) var(--spacing-3)',
						borderRadius: 'var(--spacing-2)',
					}}>
					{t('Patient.data.postures.RecommendedPrograms')}
				</div>
			}
			bordered={false}>
			<Row gutter={[16, 16]}>
				{recommendations.slice(0, visibleCount).map((item, index) => (
					<Col key={item.id} xs={24} sm={24} md={24} lg={24} xl={12}>
						<ProgramCard program={item} index={index} />
					</Col>
				))}
			</Row>
			{visibleCount < recommendations.length && (
				<div style={{ textAlign: 'center', marginTop: 18 }}>
					<Button type="primary" onClick={handleLoadMore}>
						{t('Patient.data.postures.loadMore')}
					</Button>
				</div>
			)}
		</Card>
	);
};

export default RecommendedPrograms;
