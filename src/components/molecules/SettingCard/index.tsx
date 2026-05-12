import { Card, Flex, Spin, Typography } from 'antd';
import React, { useId } from 'react';

const { Title, Paragraph } = Typography;

export interface SettingCardProps {
	label: string;
	description?: string;
	helpLink?: string;
	helpLinkText?: string;
	loading?: boolean;
	className?: string;
	children: React.ReactNode;
}

interface SettingDescriptionProps {
	description?: string;
	helpLink?: string;
	helpLinkText?: string;
	id?: string;
}

const SettingDescription: React.FC<SettingDescriptionProps> = ({
	description,
	helpLink,
	helpLinkText = 'Learn more',
	id,
}) => {
	if (!description && !helpLink) return null;

	return (
		<Paragraph
			id={id}
			style={{ marginBottom: 0, color: 'var(--text-secondary)' }}>
			{description}
			{helpLink && (
				<>
					{' '}
					<a href={helpLink} target="_blank" rel="noopener noreferrer">
						{helpLinkText}
					</a>
				</>
			)}
		</Paragraph>
	);
};

export const SettingCard: React.FC<SettingCardProps> = ({
	label,
	description,
	helpLink,
	helpLinkText,
	loading = false,
	className,
	children,
}) => {
	const cardId = useId();
	const descriptionId =
		description || helpLink ? `${cardId}-description` : undefined;

	return (
		<Card
			className={className}
			role="region"
			aria-labelledby={cardId}
			aria-describedby={descriptionId}
			style={{ marginBottom: 24 }}>
			<Flex vertical gap={16}>
				{/* Header with Label and Badge */}
				<Flex align="center" gap={8}>
					<Title id={cardId} level={4} style={{ margin: 0 }}>
						{label}
					</Title>
				</Flex>

				{/* Description */}
				<SettingDescription
					description={description}
					helpLink={helpLink}
					helpLinkText={helpLinkText}
					id={descriptionId}
				/>

				{/* Content */}
				{loading ? (
					<Flex justify="center" align="center" style={{ minHeight: 100 }}>
						<Spin />
					</Flex>
				) : (
					children
				)}
			</Flex>
		</Card>
	);
};

export default SettingCard;
