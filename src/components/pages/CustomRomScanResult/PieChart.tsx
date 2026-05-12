import { Pie } from '@ant-design/plots';
import { useTheme } from '@providers/ThemeProvider';
import { CustomRomSession } from '@types';
import { Card, Empty, Flex } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { evalScore } from './jointsTemplateData';

interface PieChartProps {
	selectedRom: CustomRomSession | null;
	persona: {
		color: string;
	};
	isPdf?: boolean;
}

const PieChart = (props: PieChartProps) => {
	const { selectedRom, isPdf } = props;
	const { t } = useTranslation();
	const { isDark } = useTheme();
	const [resolvedColors, setResolvedColors] = useState<Record<string, string>>(
		{},
	);
	const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(
		new Set(),
	);

	// Resolve CSS variables to actual colors once on mount
	useEffect(() => {
		const root =
			typeof document !== 'undefined' ? document.documentElement : null;
		if (!root) return;

		const colors: Record<string, string> = {};
		const cssVars = [
			'--color-success-600',
			'--color-success-400',
			'--color-warning-600',
			'--color-warning-500',
			'--color-error-500',
			'--color-error-600',
			'--text-primary',
			'--text-secondary',
			'--text-tertiary',
			'--tooltip-bg',
			'--tooltip-text',
			'--font-family-primary',
		];

		cssVars.forEach(varName => {
			const value = getComputedStyle(root).getPropertyValue(varName).trim();
			colors[varName] = value;
		});

		setResolvedColors(colors);
	}, []);

	// Flatten data with left/right splitting (matches vitalflow-admin HTML logic)
	const flattenDataSource = selectedRom?.romPatientResults?.flatMap((item: any) => {
		return item?.results?.flatMap((result: any) => {
			const rawScore = item?.validatedScorePt ?? item?.validatedScore ?? result?.score ?? 0;
			const rawValue = item?.validatedValuePt ?? item?.validatedValue ?? result?.value ?? 0;
			const baseTitle = item?.title || '';
			const hasLeftRight = /left|right/i.test(baseTitle);

			// Helper to check if value is left/right object
			const isLeftRightObject = (val: any) => {
				return val && typeof val === 'object' && !Array.isArray(val) && ('left' in val || 'right' in val);
			};

			// If score/value is left/right object and title doesn't have left/right, split it
			if ((isLeftRightObject(rawScore) || isLeftRightObject(rawValue)) && !hasLeftRight) {
				return ['left', 'right'].map(side => ({
					...item,
					...result,
					title: baseTitle + ` (${side.charAt(0).toUpperCase() + side.slice(1)})`,
					validatedScore: isLeftRightObject(rawScore) ? rawScore[side] : rawScore,
					validatedValue: isLeftRightObject(rawValue) ? rawValue[side] : rawValue,
					score: isLeftRightObject(rawScore) ? rawScore[side] : result?.score,
				}));
			}

			// Regular case: merge item and result
			return { ...item, ...result };
		}) || [];
	});

	const getCategoryName = (score: number) => {
		if (score >= 90) return t('Patient.data.vitalscan-rom.optimalMobility');
		if (score >= 75) return t('Patient.data.vitalscan-rom.functionalMobility');
		if (score >= 60) return t('Patient.data.vitalscan-rom.moderateRestriction');
		if (score >= 40) return t('Patient.data.vitalscan-rom.restrictedMobility');
		if (score >= 20) return t('Patient.data.vitalscan-rom.severelyRestricted');
		return t('Patient.data.vitalscan-rom.criticallyImpaired');
	};

	const categorizedData = flattenDataSource?.map(record => {
		const rawScore = evalScore(record);
		const score =
			rawScore !== undefined
				? Number(rawScore) >= 100
					? 100
					: Number(rawScore)
				: evalScore(record);
		const name = getCategoryName(Number(score));
		return {
			...record,
			category: name ? name : 'Uncategorized',
			score,
		};
	});

	// Theme-aware gradient colors for pie chart slices
	// Pattern: vibrant color → light shade (light) or dark shade (dark)
	// Consistent stops: 0.22 and 0.59
	const categories = useMemo(
		() => [
			{
				name: t('Patient.data.vitalscan-rom.optimalMobility'),
				// Polar Green
				color: isDark
					? 'l(222) 0.22:#60E561 0.59:#2B672C'
					: 'l(222) 0.2243:#95E89A 0.5868:#60E561',
				legendColor: '#60E561',
				scoreRange: [90, 100],
			},
			{
				name: t('Patient.data.vitalscan-rom.functionalMobility'),
				// Daybreak Blue
				color: isDark
					? 'l(218) 0.34:#15325B 0.74:#1668DC'
					: 'l(218) 0.34:#69B1FF 0.74:#1668DC',
				legendColor: '#1668DC',
				scoreRange: [75, 89],
			},
			{
				name: t('Patient.data.vitalscan-rom.moderateRestriction'),
				// Calendula Gold
				color: isDark
					? 'l(326) 0.32:#8C540B 0.71:#FFB624'
					: 'l(326) 0.3188:#FFD666 0.7137:#FFB624',
				legendColor: '#FFB624',
				scoreRange: [60, 74],
			},
			{
				name: t('Patient.data.vitalscan-rom.restrictedMobility'),
				// Volcano
				color: isDark
					? 'l(318) 0.29:#DA4A23 0.68:#8D1F0C'
					: 'l(318) 0.29:#FFBB96 0.68:#DA4A23',
				legendColor: '#DA4A23',
				scoreRange: [40, 59],
			},
			{
				name: t('Patient.data.vitalscan-rom.severelyRestricted'),
				// Dust Red
				color: isDark
					? 'l(230) 0.30:#D64545 0.70:#AC3B3B'
					: 'l(230) 0.30:#FF7875 0.70:#D64545',
				legendColor: '#D64545',
				scoreRange: [20, 39],
			},
			{
				name: t('Patient.data.vitalscan-rom.criticallyImpaired'),
				// Magenta
				color: isDark
					? 'l(230) 0.30:#C41E7F 0.70:#520339'
					: 'l(230) 0.30:#FF85C0 0.70:#C41E7F',
				legendColor: '#C41E7F',
				scoreRange: [0, 19],
			},
		],
		[isDark, t],
	);

	const groupedData = categories?.map(category => {
		const filteredData = categorizedData?.filter(
			record => record?.category === category?.name,
		);
		return {
			categoryName: category?.name,
			categoryColor: category?.color,
			legendColor: category?.legendColor,
			data: filteredData,
		};
	});

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
				const merged = { ...item, ...data };
				const score = evalScore(merged) || 0;

				if (!joints[joint]) {
					joints[joint] = { total: 0, count: 0 };
				}
				joints[joint].total += Number(score);
				joints[joint].count += 1;
			});
		});

		return Object.keys(joints).map(joint => ({
			joint,
			score: (joints[joint].total / joints[joint].count).toFixed(2),
		}));
	};

	const averageScores = calculateAverageScoresByJointAndSide();

	const _filteredData = useMemo(() => {
		const filtered = averageScores.filter(
			item => parseFloat(item.score) > 0.49,
		);
		return filtered;
	}, [averageScores]);

	// Calculate average score from flattened categorizedData (matches HTML logic)
	const filteredAvgScore = useMemo(() => {
		if (!categorizedData || categorizedData.length === 0) return 0;
		const allScores = categorizedData.map(record => Math.round(record.score || 0));
		const sum = allScores.reduce((a, b) => a + b, 0);
		const avg = Math.round(sum / allScores.length);
		return avg;
	}, [categorizedData]);

	const rawPieData = groupedData
		.filter(group => group.data && group.data.length > 0)
		.map(group => {
			const avgValue =
				group && group.data && group.data.length > 0
					? group.data.reduce(
							(sum, item) => sum + (Math.round(Number(item.score)) || 0),
							0,
						) / group.data.length
					: 0;

			return {
				type: group.categoryName,
				rawValue: Math.round(avgValue),
				color: group.categoryColor,
				legendColor: group.legendColor,
			};
		});

	const total = rawPieData.reduce((sum, item) => sum + item.rawValue, 0);

	const pieDataFromGrouped = useMemo(() => {
		if (rawPieData.length === 0 || total === 0) return [];

		const withPercentages = rawPieData.map(item => ({
			...item,
			exactPercent: (item.rawValue / total) * 100,
		}));

		let totalRounded = 0;
		const roundedData = withPercentages.map(item => {
			const rounded = Math.floor(item.exactPercent);
			totalRounded += rounded;
			return { ...item, roundedPercent: rounded };
		});

		const remaining = 100 - totalRounded;

		const sortedByRemainder = [...withPercentages]
			.map((item, i) => ({
				index: i,
				remainder: item.exactPercent - Math.floor(item.exactPercent),
			}))
			.sort((a, b) => b.remainder - a.remainder);

		for (let i = 0; i < remaining && i < sortedByRemainder.length; i++) {
			const index = sortedByRemainder[i]?.index;
			if (index !== undefined && roundedData[index]) {
				roundedData[index].roundedPercent += 1;
			}
		}

		return roundedData
			.map(item => ({
				type: item.type,
				value: item.roundedPercent,
				color: item.color,
				legendColor: item.legendColor,
			}))
			.filter(item => item.value > 0);
	}, [rawPieData, total]);

	// Legend data = same as chart data (categories with slices)
	const legendData = pieDataFromGrouped;

	// Map CSS variable names to resolved colors
	const getResolvedColor = (cssVar: string): string => {
		const varName = cssVar.replace('var(', '').replace(')', '');
		return resolvedColors[varName] || cssVar;
	};

	// Filter data for chart based on hidden categories
	const visiblePieData = pieDataFromGrouped.filter(
		item => !hiddenCategories.has(item.type),
	);

	// Toggle category visibility
	const toggleCategory = (category: string) => {
		setHiddenCategories(prev => {
			const newSet = new Set(prev);
			if (newSet.has(category)) {
				newSet.delete(category);
			} else {
				newSet.add(category);
			}
			return newSet;
		});
	};

	const memoizedConfig = useMemo(
		() => ({
			data: visiblePieData,
			angleField: 'value',
			colorField: 'type',
			autoFit: true,
			height: 400,
			radius: 0.7,
			innerRadius: 0.5,
			label: false,
			style: {
				inset: 3,
				radius: 10,
				fill: (datum: { type: string }) => {
					const item = visiblePieData.find(d => d.type === datum.type);
					return item?.color || '#ccc';
				},
			},
			animation: {
				appear: {
					animation: 'wave-in',
					duration: 1000,
				},
			},
			tooltip: {
				items: [
					(datum: { type: string; value: number }) => {
						const item = visiblePieData.find(d => d.type === datum.type);
						return {
							name: datum.type,
							value: datum.value,
							color: item?.legendColor || '#ccc',
						};
					},
				],
			},
			annotations: !isPdf
				? [
						{
							type: 'text',
							style: {
								text: Math.round(Number(filteredAvgScore)).toString(),
								x: '50%',
								y: '48%',
								textAlign: 'center',
								fontSize: 50,
								fill: resolvedColors['--text-primary'],
							},
						},
						{
							type: 'text',
							style: {
								text: t('Patient.data.vitalscan-rom.score', 'Score'),
								x: '50%',
								y: '59%',
								textAlign: 'center',
								fontSize: 18,
								fill: resolvedColors['--text-secondary'],
							},
						},
					]
				: [],
			appendPadding: [20, 20, 20, 20],
			legend: false,
			responsive: true,
			interactions: [{ type: 'element-active' }],
		}),
		[visiblePieData, filteredAvgScore, isPdf, t, resolvedColors, isDark],
	);

	return (
		<Card
			className="pie-card"
			style={{ height: 'auto', width: '100%', border: 'none' }}>
			{pieDataFromGrouped.length === 0 ? (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<span>{t('Admin.data.addToReports.noData')}</span>}
				/>
			) : (
				<>
					{isPdf && (
						<Flex className={isPdf ? 'pdf-margin' : ''}>
							Total : {Math.round(Number(filteredAvgScore)).toString()}
						</Flex>
					)}
					<Pie {...memoizedConfig} />
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(2, auto)',
							justifyContent: 'center',
							gap: '8px 32px',
							marginTop: 16,
							fontFamily: resolvedColors['--font-family-primary'],
						}}>
						{legendData.map(item => {
							const isHidden = hiddenCategories.has(item.type);
							return (
								<div
									key={item.type}
									onClick={() => toggleCategory(item.type)}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										cursor: 'pointer',
										opacity: isHidden ? 0.4 : 1,
										transition: 'opacity 0.2s',
									}}>
									<span
										style={{
											width: 10,
											height: 10,
											borderRadius: '50%',
											backgroundColor: item.legendColor,
											flexShrink: 0,
										}}
									/>
									<span
										style={{
											color: resolvedColors['--text-tertiary'],
											fontSize: 12,
											whiteSpace: 'nowrap',
											textDecoration: isHidden ? 'line-through' : 'none',
										}}>
										{item.type}
									</span>
								</div>
							);
						})}
					</div>
				</>
			)}
		</Card>
	);
};

export default PieChart;
