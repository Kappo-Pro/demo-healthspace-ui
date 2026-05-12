/**
 * ContentImageCard Component
 *
 * A clickable card that displays content with:
 * - Image/thumbnail
 * - Title
 * - Description/subtitle
 *
 * Used in Settings > Content Library for managing editable content cards
 */

import { UntitledIcon } from '@atoms/Icon';
import { ResponsiveImage } from '@atoms/ResponsiveImage';
import { Card, Flex, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

export interface ContentImageCardProps {
	title: string;
	description?: string;
	thumbnail?: string;
	onClick?: () => void;
	loading?: boolean;
}

export const ContentImageCard: React.FC<ContentImageCardProps> = ({
	title,
	description,
	thumbnail,
	onClick,
	loading = false,
}) => {
	return (
		<Card
			hoverable={!!onClick}
			onClick={onClick}
			loading={loading}
			style={{
				cursor: onClick ? 'pointer' : 'default',
				height: '100%',
			}}
			styles={{
				body: { padding: 'var(--spacing-0)' },
			}}>
			<Flex vertical gap={0}>
				{/* Image Section */}
				<div
					className="content-image-card-image"
					style={{
						width: '100%',
						height: '200px',
						borderRadius: '8px',
						backgroundColor: 'var(--gray-100)',
						position: 'relative',
						overflow: 'hidden',
						textAlign: 'center',
						marginTop: 'var(--spacing-4)',
					}}>
					{thumbnail ? (
						<ResponsiveImage
							src={thumbnail}
							alt={title}
							style={{
								height: '100%',
								borderRadius: '8px',
							}}
						/>
					) : (
						<Flex
							align="center"
							justify="center"
							style={{
								width: '100%',
								height: '100%',
								backgroundColor: 'var(--gray-100)',
							}}>
							<UntitledIcon
								name="image"
								size="xlarge"
								color="var(--gray-400)"
							/>
						</Flex>
					)}
					{/* Hover Overlay with Edit Icon */}
					{onClick && (
						<div className="content-image-card-overlay">
							<UntitledIcon
								name="edit"
								size="large"
								color="white"
								aria-label="Edit content"
							/>
						</div>
					)}
				</div>

				{/* Content Section */}
				<div style={{ padding: 'var(--spacing-4)' }}>
					<Title
						level={5}
						style={{
							margin: 0,
							marginBottom: 'var(--spacing-2)',
							color: 'var(--text-color-root)',
							textAlign: 'center',
						}}>
						{title}
					</Title>
				</div>
			</Flex>
		</Card>
	);
};

export default ContentImageCard;
