import { Card, Flex } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getPostureBenefits } from '../constants';

const GoodPostureSupport = () => {
	const { t } = useTranslation();

	const benefits = useMemo(() => getPostureBenefits(t), [t]);
	return (
		<Card className="card-margin-top">
			<h3 className={`inter-bold-text`} style={{ padding: 15 }}>
				{t('Patient.data.postures.goodPostureTitle')}
			</h3>

			<Flex vertical gap={12}>
				{benefits.map((item, index) => (
					<div
						key={index}
						style={{
							borderRadius: 'var(--spacing-2-5)',
							padding: 'var(--spacing-3) var(--spacing-4)',
						}}>
						<div className="overview-item font-text-semibold">
							<p>
								<strong>{item.label} </strong>
								{item.description}
							</p>
						</div>
					</div>
				))}
			</Flex>
		</Card>
	);
};

export default GoodPostureSupport;
