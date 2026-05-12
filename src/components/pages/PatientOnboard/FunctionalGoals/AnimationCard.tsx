import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { HtmlSanitizer } from '@services/security';
import { Image } from 'antd';
import React from 'react';
import { FEATURES_MOCK } from './FeaturesMock';

export interface FeatureProps {
	id: string;
	title?: string;
	imageSrc?: string;
	setProgressPercent?: (value: number) => void;
	setActiveStep?: (value: number) => void;
	backgroundStyle?: string;
	hoverBackgroundStyle?: string;
	handleCardSelection: (title: string) => void;
	isSelected: boolean;
	attributes?: {
		name: string;
		description: string;
		thumbnail: string;
	};
}

const AnimationCard: React.FC<FeatureProps> = ({
	id,
	attributes,
	handleCardSelection,
	isSelected,
}) => {
	const { t } = useTypedTranslation();
	const matchedMock = FEATURES_MOCK.find(item => item.id === Number(id));
	const personaModel = matchedMock?.personaImage || '/assets/struggler.png';
	const hasThumbnail = !!attributes?.thumbnail;

	const renderHtml = (str: string) => (
		<div
			dangerouslySetInnerHTML={{ __html: HtmlSanitizer.sanitizeRichText(str) }}
		/>
	);

	return (
		<div
			className={`slide-container ${isSelected ? 'selected' : 'unSelected'}`}
			onClick={() => handleCardSelection(attributes?.name || '')}>
			<div className="slide-container-image-div">
				{hasThumbnail ? (
					<Image
						src={attributes?.thumbnail ?? ''}
						alt={attributes?.name}
						style={{
							maxHeight: '100%',
							maxWidth: '100%',
							objectFit: 'cover',
							display: 'block',
							borderRadius: 'var(--radius-lg)',
						}}
						preview={{
							mask: <span style={{ fontSize: 14 }}>👁</span>,
						}}
					/>
				) : (
					<img
						src={personaModel}
						alt={attributes?.name}
						style={{
							height: '100%',
							width: '100%',
							objectFit: 'contain',
						}}
					/>
				)}
			</div>
			<div className="flex-1">
				<div className="functional-option-title">{attributes?.name}</div>
				<div className="functional-option-description">
					{renderHtml(attributes?.description || '')}
				</div>
			</div>
		</div>
	);
};

export default AnimationCard;
