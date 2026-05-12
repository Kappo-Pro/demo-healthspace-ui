import { Typography, Avatar } from 'antd';

const { Title, Text } = Typography;
import { getMobilityData } from '@stores/constants';
import './MobilityPersonas.css';
import { useTranslation } from 'react-i18next';

interface IMobilityPersona {
	avgScore: number;
	isPdf: boolean;
}

const MobilityPersonas = (props: IMobilityPersona) => {
	const { avgScore, isPdf } = props;
	const { t } = useTranslation();
	const mobilityData = getMobilityData(Math.round(avgScore), t);

	return (
		<div className={`mobility-container ${isPdf ? 'pdf-section' : ''}`}>
			<Title level={5} style={{ margin: 0, marginBottom: 'var(--spacing-4)' }}>
				{t('patient.reports.mobility.mobilityPersonas')}
			</Title>
			<div className="mobility-persona-grid">
				{mobilityData.map((persona, index) => (
					<div
						key={index}
						className={`mobility-persona-card ${persona.active ? `mobility-persona-card--active mobility-persona-card--${persona.className}` : ''}`}>
						{/* Score badge for active card */}
						{persona.active && (
							<div className="mobility-persona-card__score">
								<Text className="mobility-persona-card__score-label">Score</Text>
								<Text className="mobility-persona-card__score-value">
									{Math.round(avgScore)}
								</Text>
							</div>
						)}

						{/* Icon */}
						<div className="mobility-persona-card__icon">
							<Avatar
								src={persona.active ? persona.selectedIcon : persona.icon}
								alt={persona.title}
								size={40}
							/>
						</div>

						{/* Title */}
						<Title
							level={5}
							className={`mobility-persona-card__title ${isPdf ? 'pdf-margin' : ''}`}>
							{persona.title}
						</Title>

						{/* Description */}
						<Text
							className={`mobility-persona-card__description ${isPdf ? 'pdf-margin' : ''}`}>
							{persona.description}
						</Text>
					</div>
				))}
			</div>
		</div>
	);
};

export default MobilityPersonas;
