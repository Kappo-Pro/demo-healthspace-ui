import { Radar } from '@ant-design/plots';
import { useTheme } from '@providers/ThemeProvider';
import { CustomRomSession } from '@types';
import { Card, Empty } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { evalScore } from './jointsTemplateData';

interface OldRadarChartProps {
	selectedRom: CustomRomSession | null;
	persona: {
		color: string;
	};
	avgScore: number;
	isPdf?: boolean;
}

const OldRadarChart = (props: OldRadarChartProps) => {
	const { selectedRom, persona, avgScore, isPdf } = props;
	const { t } = useTranslation();
	const { isDark } = useTheme();
	const [resolvedPersonaColor, setResolvedPersonaColor] =
		useState<string>('var(--error-500)');

	// Resolve persona color if it's a CSS variable
	useEffect(() => {
		const root =
			typeof document !== 'undefined' ? document.documentElement : null;
		if (!root || !persona?.color) return;

		if (persona.color.includes('var(')) {
			const varName = persona.color
				.replace('var(', '')
				.replace(')', '')
				.trim();
			const value = getComputedStyle(root).getPropertyValue(varName).trim();
			setResolvedPersonaColor(value || 'var(--error-500)');
		} else {
			setResolvedPersonaColor(persona.color);
		}
	}, [persona?.color, isDark]);

	const calculateAverageScoresByJointAndSide = () => {
		const joints: Record<string, { total: number; count: number }> = {};

		selectedRom?.romPatientResults?.forEach(item => {
			item?.results?.forEach(data => {
				const measure =
					data?.romProgramExercise?.strapiOmniRomExercise?.name ||
					data?.romProgramExercise?.exerciseLibrary?.title ||
					t('Patient.data.vitalscan-rom.noTitle');
				const joint = measure;

				// Merge item and result to access validatedScore from parent
				const mergedRecord = { ...item, ...data };
				const score = Number(evalScore(mergedRecord) || 0);

				if (!joints[joint]) {
					joints[joint] = { total: 0, count: 0 };
				}
				joints[joint].total += score;
				joints[joint].count += 1;
			});
		});

		return Object.keys(joints).map(joint => ({
			item: joint,
			type: 'score',
			score: Math.round(
				Math.min(100, joints[joint].total / joints[joint].count),
			),
		}));
	};

	const radarData = calculateAverageScoresByJointAndSide().filter(
		item => item.score > 0,
	);

	// Get resolved color values for chart grid
	const [resolvedColors, setResolvedColors] = useState({
		gridLight: 'rgba(0, 0, 0, 0.15)',
		gridDark: 'rgba(255, 255, 255, 0.15)',
		textLight: '#ffffff',
	});

	useEffect(() => {
		const root = typeof document !== 'undefined' ? document.documentElement : null;
		if (!root) return;

		const computed = getComputedStyle(root);

		// Parse gray-200 for light grid (fallback to rgba)
		const gray200 = computed.getPropertyValue('--gray-200').trim();
		const gridLight = gray200 ? `${gray200}26` : 'rgba(0, 0, 0, 0.15)'; // 15% opacity

		// Parse gray-700 for dark grid
		const gray700 = computed.getPropertyValue('--gray-700').trim();
		const gridDark = gray700 ? `${gray700}26` : 'rgba(255, 255, 255, 0.15)';

		// Parse white color for text
		const white = computed.getPropertyValue('--white').trim() || '#ffffff';

		setResolvedColors({
			gridLight,
			gridDark,
			textLight: white,
		});
	}, [isDark]);

	const gridColor = isDark ? resolvedColors.gridDark : resolvedColors.gridLight;

	const config = useMemo(
		() => ({
			data: radarData,
			xField: 'item',
			yField: 'score',
			colorField: 'type',
			coordinateType: 'polar',
			axis: {
				x: {
					grid: true,
					gridLineWidth: 1,
					gridStroke: gridColor,
					tick: false,
					gridLineDash: [0, 0],
					line: false,
					label: false,
				},
				y: {
					zIndex: 1,
					title: false,
					gridConnect: 'line',
					gridLineWidth: 1,
					gridStroke: gridColor,
					gridLineDash: [0, 0],
					label: false,
				},
			},
			area: {
				style: {
					fillOpacity: 0.5,
				},
			},
			point: {
				shapeField: 'point',
				sizeField: 4,
			},
			scale: {
				x: { padding: 0.5, align: 0 },
				y: { tickCount: 5, domainMin: 0, domainMax: 100 },
			},
			style: {
				lineWidth: 2,
			},
			color: [resolvedPersonaColor],
			legend: false,
			annotations: !isPdf
				? [
						{
							type: 'text',
							style: {
								text: Math.round(Number(avgScore)).toString(),
								x: '50%',
								y: '50%',
								textAlign: 'center',
								fontSize: 40,
								fontWeight: 'var(--font-weight-semibold)',
								fill: resolvedColors.textLight,
							},
						},
					]
				: [],
		}),
		[avgScore, radarData, gridColor, isPdf, resolvedPersonaColor, resolvedColors.textLight],
	);

	if (radarData.length === 0) {
		return (
			<Card
				className="radar-chart"
				style={{ height: '400px', width: '100%', border: 'none' }}>
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<span>{t('Admin.data.addToReports.noData')}</span>}
				/>
			</Card>
		);
	}

	return (
		<Card
			className="radar-chart"
			style={{
				height: '400px',
				width: '100%',
				border: 'none',
				position: 'relative',
			}}>
			<Radar {...config} />
		</Card>
	);
};

export default OldRadarChart;
