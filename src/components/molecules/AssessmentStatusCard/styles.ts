import styled from 'styled-components';
import { Card } from 'antd';

export const StyledCard = styled(Card)`
	.ant-card-body {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
	}

	.ant-card-meta-title {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-2);
	}

	.ant-card-meta-description {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	button {
		width: 100%;
		min-height: 44px; /* WCAG touch target requirement */
	}
`;
