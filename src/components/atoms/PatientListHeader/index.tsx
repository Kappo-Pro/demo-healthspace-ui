import { Flex, Typography, Tag } from 'antd';

const { Title } = Typography;

interface PatientListHeaderProps {
	/** Main title for the patient list page */
	title: string;
	/** Subtitle/description text */
	subtitle?: string;
	/** Count of items to display in the tag */
	count: number;
	/** Label for the count (defaults to "Users") */
	countLabel?: string;
	/** Tag color (defaults to "var(--color-purple)") */
	tagColor?: string;
}

/**
 * Standardized header component for patient list pages
 * Used across all /admin/patients/* routes for consistency
 */
const PatientListHeader = ({
	title,
	subtitle,
	count,
	countLabel = 'Users',
	tagColor = 'var(--color-purple)',
}: PatientListHeaderProps) => {
	return (
		<Flex className="mb-6" justify="space-between" align="flex-end">
			<Flex vertical gap={4}>
				<Title level={3} style={{ marginTop: 0 }}>
					{title}
				</Title>
				{subtitle && (
					<span style={{ color: 'var(--text-secondary)' }}>
						{subtitle}
					</span>
				)}
			</Flex>

			<Tag color={tagColor}>
				{count} {countLabel}
			</Tag>
		</Flex>
	);
};

export default PatientListHeader;
