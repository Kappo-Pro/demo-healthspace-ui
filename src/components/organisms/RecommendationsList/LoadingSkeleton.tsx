/**
 * LoadingSkeleton Component
 * EPIC-019-S6: Loading skeleton for recommendations list
 */

import React from 'react';
import { Row, Col, Card, Skeleton } from 'antd';

export interface LoadingSkeletonProps {
	count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 6 }) => {
	return (
		<Row gutter={[16, 16]}>
			{Array.from({ length: count }).map((_, index) => (
				<Col key={index} xs={24} sm={12} md={8} lg={8}>
					<Card
						cover={
							<Skeleton.Image
								active
								style={{ width: '100%', height: 200 }}
							/>
						}
					>
						<Skeleton active paragraph={{ rows: 3 }} />
					</Card>
				</Col>
			))}
		</Row>
	);
};

export default LoadingSkeleton;
