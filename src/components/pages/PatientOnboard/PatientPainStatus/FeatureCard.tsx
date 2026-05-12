import { HtmlSanitizer } from '@services/security';

export interface FeatureCardProps {
	title: string;
	description: string;
	planType: string;
	imageSrc: string;
	isSelected: boolean;
	onSelect: (planType: string) => void;
}

const FeatureCard = (props: FeatureCardProps) => {
	const { title, description, planType, imageSrc, isSelected, onSelect } =
		props;

	const handleOptions = (str: string) => {
		const formattedStr = str
			.replace(/<Paragraph>/g, '<li>')
			.replace(/<\/Paragraph>/g, '</li>')
			.replace(/<p>/g, '<li>')
			.replace(/<\/p>/g, '</li>');

		// Sanitize HTML to prevent XSS attacks
		const sanitized = HtmlSanitizer.sanitizePlanDescription(formattedStr);

		return (
			<ul
				className="plan-card-list"
				dangerouslySetInnerHTML={{ __html: sanitized }}
			/>
		);
	};

	return (
		<div
			className={`plan-card ${isSelected ? 'plan-card-selected' : ''}`}
			onClick={() => onSelect(planType)}>
			<div
				className="plan-card-image"
				style={{ backgroundImage: `url(${imageSrc})` }}
			/>
			<div className="plan-card-overlay">
				<div className="plan-card-content">
					<div className="plan-card-inner">
						<h3 className="plan-card-title">{title}</h3>
						<div className="plan-card-description">
							{handleOptions(description)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FeatureCard;
