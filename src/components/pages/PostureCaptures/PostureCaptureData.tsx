import { lazy, Suspense, useState } from 'react';
import { Empty, Flex, Segmented, Spin } from 'antd';
import moment from 'moment';
import PostureCaptureScreenshots from './PostureCaptureScreenshots';
import { Posture } from '@types';
import { useTypedSelector } from '@stores/index';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@providers/ThemeProvider';

// Lazy load the heavy chart library (@ant-design/plots v2 API)
const Line = lazy(() => import('@ant-design/plots').then(m => ({ default: m.Line })));

// Helper function to resolve CSS variables to actual color values
const getCSSVariableValue = (variable: string): string => {
	if (typeof window === 'undefined') return variable;
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(variable.replace('var(', '').replace(')', ''))
		.trim();
	return value || variable;
};

const bodyParts = [
	{ key: 'ear', value: 'Ears', color: 'var(--chart-body-ear)' },
	{ key: 'shoulder', value: 'Shoulders', color: 'var(--chart-body-shoulder)' },
	{ key: 'elbow', value: 'Elbows', color: 'var(--chart-body-elbow)' },
	{ key: 'hip', value: 'Hips', color: 'var(--chart-body-hip)' },
	{ key: 'knee', value: 'Knees', color: 'var(--chart-body-knee)' },
	{ key: 'ankle', value: 'Ankles', color: 'var(--chart-body-ankle)' },
];

// Interface for chart data point
interface ChartDataPoint {
	date: string;
	dateTimestamp: number;
	value: number;
	bodyPart: string;
	image: string;
	angle: string;
}

// Transform posture data into chart data
const transformToChartData = (
	postureData: Posture[],
	side: string,
): ChartDataPoint[] => {
	const chartData: ChartDataPoint[] = [];

	postureData
		?.filter(item => item.postureAnalytics?.some(data => data.view === side))
		?.forEach(item => {
			const dateUtc = moment(item.createdAt).local().format('LLL');
			const dateTimestamp = moment(item.createdAt).valueOf();
			const index = item.postureAnalytics?.findIndex(data => data.view === side) ?? -1;

			if (index >= 0) {
				bodyParts.forEach(part => {
					const rawValue = item.postureAnalytics?.[index]?.[part.key] ?? 0;
					const clampedValue = rawValue <= -40 ? -40 : rawValue >= 40 ? 40 : rawValue;

					chartData.push({
						date: dateUtc,
						dateTimestamp,
						value: clampedValue,
						bodyPart: part.value,
						image: item.postureAnalytics?.[index]?.screenshot || '',
						angle: side,
					});
				});
			}
		});

	// Sort by date
	chartData.sort((a, b) => a.dateTimestamp - b.dateTimestamp);

	return chartData;
};

// Create chart configuration (@ant-design/plots v2 API)
const createChartConfig = (
	chartData: ChartDataPoint[],
	capturedImageText: string,
	isDark: boolean,
) => {
	// Resolve CSS variables to actual color values
	const resolvedBodyParts = bodyParts.map(part => ({
		...part,
		resolvedColor: getCSSVariableValue(part.color),
	}));

	// Use white text in dark mode for better visibility
	const sliderTextColor = isDark
		? getCSSVariableValue('var(--color-white)')
		: getCSSVariableValue('var(--text-color-root)');
	const textColor = getCSSVariableValue('var(--text-color-root)');
	const gridColor = getCSSVariableValue('var(--border-default)');

	// Create color mapping
	const colorMap: Record<string, string> = {};
	bodyParts.forEach((part, index) => {
		colorMap[part.value] = resolvedBodyParts[index].resolvedColor;
	});

	return {
		data: chartData,
		xField: 'date',
		yField: 'value',
		colorField: 'bodyPart',
		shapeField: 'smooth',
		autoFit: true,
		theme: {
			slider: {
				label: {
					fill: sliderTextColor,
				},
			},
		},
		scale: {
			y: {
				domain: [-40, 40],
				tickCount: 9,
			},
			color: {
				range: resolvedBodyParts.map(p => p.resolvedColor),
			},
		},
		axis: {
			x: {
				label: false,
				line: true,
				tick: false,
			},
			y: {
				title: false,
				labelFormatter: (v: number) => `${v}°`,
				labelFill: textColor,
			},
		},
		style: {
			lineWidth: 2,
			stroke: (d: ChartDataPoint) => colorMap[d.bodyPart] || resolvedBodyParts[0].resolvedColor,
		},
		point: {
			shapeField: 'circle',
			sizeField: 5,
			style: {
				lineWidth: 1,
				stroke: getCSSVariableValue('var(--color-white)'),
				fill: (d: ChartDataPoint) => colorMap[d.bodyPart] || resolvedBodyParts[0].resolvedColor,
			},
		},
		interaction: {
			tooltip: {
				render: (
					_event: unknown,
					{
						title,
						items,
					}: {
						title: string;
						items: Array<{
							value: number;
							name: string;
							color: string;
							data?: ChartDataPoint;
						}>;
					},
				) => {
					if (!items || items.length === 0) return '';

					const tooltipData = items
						.map(item => item.data)
						.filter((d): d is ChartDataPoint => d !== undefined);

					const dataToUse = tooltipData.length > 0
						? tooltipData
						: chartData.filter(d => d.date === title);

					const firstData = dataToUse[0];
					const imageUrl = firstData?.image;

					const bodyPartRows = bodyParts
						.map(part => {
							const item = dataToUse.find(d => d.bodyPart === part.value);
							if (!item) return '';
							return `
								<div class="tooltip-exercise-row">
									<span class="tooltip-exercise-name">${part.value}:</span>
									<span class="tooltip-exercise-value">${Math.round(item.value)}°</span>
								</div>
							`;
						})
						.join('');

					return `
						<div class="chart-tool-tip">
							${imageUrl ? `<div class="image"><img src="${imageUrl}" alt="${capturedImageText}" /></div>` : ''}
							<div class="date">${title}</div>
							${bodyPartRows}
						</div>
					`;
				},
			},
		},
		slider: {
			x: {
				values: [0, 1],
			},
		},
		legend: {
			color: {
				position: 'top',
				layout: {
					justifyContent: 'center',
				},
				itemLabelFill: textColor,
				itemMarker: 'circle',
			},
		},
		animate: { enter: { type: 'waveIn' } },
		annotations: [-40, -20, 0, 20, 40].map(value => ({
			type: 'lineY',
			yField: value,
			style: {
				stroke: gridColor,
				lineWidth: 1,
				lineDash: [4, 4],
			},
		})),
	};
};

export const PostureCaptureData = ({ side }: { side: string }) => {
	const { t } = useTranslation();
	const { isDark } = useTheme();
	const [activeTab, setActiveTab] = useState<string | number>('chart');
	const postureData = useTypedSelector(state => state.postures.postures.data);

	// Transform posture data for chart
	const chartData = transformToChartData(postureData, side);

	// Create chart config
	const chartConfig = createChartConfig(
		chartData,
		t('Patient.data.postures.capturedImage'),
		isDark,
	);

	const handleTabChange = (value: string | number) => {
		setActiveTab(value);
	};

	const hasData = chartData.length > 0;

	return (
		<div className="posture-capture-data">
			<div style={{ backgroundColor: 'var(--collapse-bg-color)', borderRadius: 'var(--radius-lg)' }}>
				<Flex justify="flex-start" className="mb-4">
					<Segmented
						value={activeTab}
						onChange={handleTabChange}
						options={[
							{
								label: t('Patient.data.myProgress.omniRom.chart'),
								value: 'chart',
							},
							{
								label: t('Patient.data.myProgress.omniRom.screenshots'),
								value: 'screenshots',
							},
						]}
						size="large"
					/>
				</Flex>

				{activeTab === 'chart' ? (
					<div className="posture-capture-chart">
						{hasData ? (
							<Suspense
								fallback={
									<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
										<Spin size="large" />
									</div>
								}>
								<Line key={`posture-chart-${side}`} {...chartConfig} style={{ height: 400 }} />
							</Suspense>
						) : (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={<span>{t('Admin.data.addToReports.noData')}</span>}
							/>
						)}
					</div>
				) : (
					<PostureCaptureScreenshots angle={side} />
				)}
			</div>
		</div>
	);
};

export default PostureCaptureData;
