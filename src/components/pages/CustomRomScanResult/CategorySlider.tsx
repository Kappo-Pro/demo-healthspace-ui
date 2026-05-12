import { Typography } from 'antd';
import './CategorySlider.css';

const { Text } = Typography;

interface CategorySliderProps {
	score: number; // 0-100
	categoryIndex: number; // 0-5, index of the category
	showScoreBadge?: boolean;
	scoreBadgeLabel?: string;
}

// Category definitions with score ranges and colors (matching rom-persona-card gradients)
// Order: lowest to highest (critical to optimal)
const categories = [
	{ name: 'determined', range: [0, 19], color: 'var(--persona-determined)' },
	{ name: 'resilient', range: [20, 39], color: 'var(--persona-resilient)' },
	{ name: 'steady', range: [40, 59], color: 'var(--persona-steady)' },
	{ name: 'functional', range: [60, 74], color: 'var(--persona-functional)' },
	{ name: 'agile', range: [75, 89], color: 'var(--persona-agile)' },
	{ name: 'limitless', range: [90, 100], color: 'var(--persona-limitless)' },
];

// Inactive segment colors (theme-aware: gray/white with increasing transparency)
const inactiveColors = [
	'var(--category-slider-segment-1)',
	'var(--category-slider-segment-2)',
	'var(--category-slider-segment-3)',
	'var(--category-slider-segment-4)',
	'var(--category-slider-segment-5)',
	'var(--category-slider-segment-6)',
];

const CategorySlider = ({
	score,
	categoryIndex,
	showScoreBadge = true,
	scoreBadgeLabel = 'Score',
}: CategorySliderProps) => {

	// Convert categoryIndex (0=Optimal, 5=Critical) to segment index (0=Critical, 5=Optimal)
	const activeSegmentIndex = 5 - categoryIndex;

	// Calculate thumb position to center on active segment (6 segments total)
	const thumbPosition = ((activeSegmentIndex + 0.5) / 6) * 100;

	return (
		<div className="category-slider">
			<div className="category-slider__track">
				<div className="category-slider__segments">
					{categories.map((category, index) => (
						<div
							key={category.name}
							className={`category-slider__segment ${
								index === activeSegmentIndex ? 'category-slider__segment--active' : ''
							}`}
							style={{
								backgroundColor:
									index === activeSegmentIndex
										? category.color
										: inactiveColors[index],
							}}
						/>
					))}
				</div>
				<div
					className="category-slider__thumb"
					style={{
						left: `${thumbPosition}%`,
					}}
				>
					{showScoreBadge && (
						<div className="category-slider__badge">
							<Text className="category-slider__badge-label">{scoreBadgeLabel}</Text>
							<Text className="category-slider__badge-value">{Math.round(score)}</Text>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CategorySlider;
