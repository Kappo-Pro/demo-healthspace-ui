import { UntitledIcon } from '@atoms/Icon';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { useTheme } from '@providers/ThemeProvider';
import { getRomSessionList } from '@stores/clinical/rom/results';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { CustomRom, CustomRomExercise, StrapiOmniRomExercises } from '@types';
import { Collapse, Empty, Flex, Pagination, Segmented, Spin } from 'antd';
import moment from 'moment';
import {
	Suspense,
	lazy,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import CustomCaptureScreenshots from './CustomCaptureScreenshots';
import './style.css';

// Lazy load the heavy chart library (@ant-design/plots v2 API)
const Line = lazy(() =>
	import('@ant-design/plots').then(m => ({ default: m.Line })),
);

// Extended type for API response data (includes romResults not in base type)
interface RomResultItem {
	id?: string;
	value: number;
	normal?: number;
	createdAt: string;
	romPatientResult?: {
		screenshot: string;
		createdAt: string;
	};
}

interface ExtendedRomProgramExercise {
	id: string;
	normal?: number;
	strapiOmniRomExercise?: StrapiOmniRomExercises;
	romResults?: RomResultItem[];
}

interface ExtendedCustomRomExercise
	extends Omit<CustomRomExercise, 'exercises'> {
	exercises?: ExtendedRomProgramExercise[];
}

// Helper function to resolve CSS variables to actual color values
const getCSSVariableValue = (variable: string): string => {
	if (typeof window === 'undefined') return variable;
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(variable.replace('var(', '').replace(')', ''))
		.trim();
	return value || variable;
};

// Color codes for different exercise lines
const colorCodes = [
	'var(--color-info-500)',
	'var(--color-success-400)',
	'var(--color-warning-300)',
	'var(--color-warning-600)',
	'var(--color-info-400)',
	'var(--color-success-300)',
	'var(--color-purple-400)',
	'var(--color-orange-500)',
	'var(--color-info-300)',
	'var(--color-warning-500)',
	'var(--color-error-600)',
	'var(--color-info-600)',
	'var(--color-success-600)',
	'var(--color-purple-500)',
];

// Calculate ROM score as a percentage of normal range
const evalScore = (value: number, normal: number): number => {
	if (value === -1) return 0;
	if (normal === 0) return Math.max(100 - value, 0);
	if (value >= normal) return 100;
	return parseFloat(((value / normal) * 100).toFixed(2));
};

// Interface for aggregated chart data
interface ChartDataPoint {
	date: string;
	dateTimestamp: number;
	score: number;
	value: number;
	normal: number;
	exerciseName: string;
	seriesKey: string;
	sessionTitle: string;
	screenshot: string;
	isProjected: boolean;
}

// Interface for aggregated screenshot data
interface ScreenshotDataPoint {
	id: string;
	screenshot: string;
	value: number;
	score: number;
	normal: number;
	exerciseName: string;
	sessionTitle: string;
	createdAt: string;
}

// Extended CustomRom type for API response
interface ExtendedCustomRom extends Omit<CustomRom, 'exercises'> {
	exercises?: ExtendedCustomRomExercise[];
}

// Transform sessions data into aggregated chart data grouped by exercise
const transformToChartData = (
	sessions: ExtendedCustomRom[],
): { chartData: ChartDataPoint[]; exerciseNames: string[] } => {
	const exerciseNamesSet = new Set<string>();
	const exerciseDataMap = new Map<string, ChartDataPoint[]>();

	sessions?.forEach(session => {
		const sessionDate = moment(session.createdAt).local();
		const sessionTitle = session.title || sessionDate.format('LL');

		session.exercises?.forEach(exercise => {
			exercise.exercises?.forEach(programExercise => {
				const exerciseName =
					programExercise.strapiOmniRomExercise?.name ||
					exercise.name ||
					exercise.title ||
					'Unknown Exercise';

				// Track unique exercise names for legend ordering
				exerciseNamesSet.add(exerciseName);

				programExercise.romResults?.forEach(result => {
					const value = result.value ?? 0;
					const normal = programExercise.normal ?? result.normal ?? 180;
					const score = evalScore(value, normal);

					const point: ChartDataPoint = {
						date: moment(result.createdAt).local().format('LLL'),
						dateTimestamp: moment(result.createdAt).valueOf(),
						score,
						value,
						normal,
						exerciseName,
						seriesKey: exerciseName,
						sessionTitle,
						screenshot: result.romPatientResult?.screenshot || '',
						isProjected: false,
					};

					if (!exerciseDataMap.has(exerciseName)) {
						exerciseDataMap.set(exerciseName, []);
					}
					exerciseDataMap.get(exerciseName)!.push(point);
				});
			});
		});
	});

	// Sort each exercise's data by date and mark last segment as projected
	const chartData: ChartDataPoint[] = [];

	exerciseDataMap.forEach((points, exerciseName) => {
		// Sort points by date
		points.sort((a, b) => a.dateTimestamp - b.dateTimestamp);

		if (points.length >= 2) {
			// Add all points except the last as solid
			for (let i = 0; i < points.length - 1; i++) {
				chartData.push({
					...points[i],
					seriesKey: exerciseName,
					isProjected: false,
				});
			}
			// Duplicate second-to-last point as projected (start of dashed segment)
			const secondToLast = points[points.length - 2];
			chartData.push({
				...secondToLast,
				seriesKey: `${exerciseName}_projected`,
				isProjected: true,
			});
			// Add last point as projected (end of dashed segment)
			const last = points[points.length - 1];
			chartData.push({
				...last,
				seriesKey: `${exerciseName}_projected`,
				isProjected: true,
			});
		} else {
			// Only one point, just add it
			points.forEach(p =>
				chartData.push({ ...p, seriesKey: exerciseName, isProjected: false }),
			);
		}
	});

	// Sort all by date
	chartData.sort((a, b) => a.dateTimestamp - b.dateTimestamp);

	const exerciseNames = Array.from(exerciseNamesSet);

	return { chartData, exerciseNames };
};

// Transform sessions data into aggregated screenshots
const transformToScreenshotData = (
	sessions: ExtendedCustomRom[],
): ScreenshotDataPoint[] => {
	const screenshots: ScreenshotDataPoint[] = [];

	sessions?.forEach(session => {
		const sessionDate = moment(session.createdAt).local();
		const sessionTitle = session.title || sessionDate.format('LL');

		session.exercises?.forEach(exercise => {
			exercise.exercises?.forEach(programExercise => {
				const exerciseName =
					programExercise.strapiOmniRomExercise?.name ||
					exercise.name ||
					exercise.title ||
					'Unknown Exercise';

				programExercise.romResults?.forEach(result => {
					if (result.romPatientResult?.screenshot) {
						const value = result.value ?? 0;
						const normal = programExercise.normal ?? result.normal ?? 180;
						const score = evalScore(value, normal);

						screenshots.push({
							id: result.id || `${session.id}-${result.createdAt}`,
							screenshot: result.romPatientResult.screenshot,
							value,
							score,
							normal,
							exerciseName,
							sessionTitle,
							createdAt: result.createdAt,
						});
					}
				});
			});
		});
	});

	// Sort by date (newest first for gallery)
	screenshots.sort(
		(a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf(),
	);

	return screenshots;
};

// Get color for an exercise by index
const getExerciseColor = (
	exerciseName: string,
	exerciseNames: string[],
): string => {
	const resolvedColors = colorCodes.map(c => getCSSVariableValue(c));
	const index = exerciseNames.indexOf(exerciseName);
	return resolvedColors[index >= 0 ? index % resolvedColors.length : 0];
};

// Create chart configuration (@ant-design/plots v2 API)
const createChartConfig = (
	chartData: ChartDataPoint[],
	exerciseNames: string[],
	visibleSeries: string[],
	capturedImageText: string,
	isDark: boolean,
) => {
	// Use white text in dark mode for better visibility on dark slider background
	const sliderTextColor = isDark
		? getCSSVariableValue('var(--color-white)')
		: getCSSVariableValue('var(--text-color-root)');
	const textColor = getCSSVariableValue('var(--text-color-root)');
	const gridColor = getCSSVariableValue('var(--border-default)');
	const resolvedColors = colorCodes.map(c => getCSSVariableValue(c));

	// Create color mapping for both solid and projected series
	const colorMap: Record<string, string> = {};
	exerciseNames.forEach((name, index) => {
		const color = resolvedColors[index % resolvedColors.length];
		colorMap[name] = color;
		colorMap[`${name}_projected`] = color;
	});

	// Filter chart data based on visible series
	const filteredData = chartData.filter(point => {
		const baseName = point.seriesKey.replace('_projected', '');
		return visibleSeries.includes(baseName);
	});

	return {
		data: filteredData,
		xField: 'date',
		yField: 'score',
		colorField: 'seriesKey',
		shapeField: 'smooth',
		theme: {
			slider: {
				label: {
					fill: sliderTextColor,
				},
			},
		},
		scale: {
			y: {
				domain: [0, 100],
				tickCount: 6,
			},
			color: {
				range: Object.values(colorMap),
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
				labelFormatter: (v: number) => `${v}%`,
				labelFill: textColor,
			},
		},
		style: {
			lineWidth: 2,
			lineDash: (d: ChartDataPoint) =>
				d.seriesKey?.endsWith('_projected') ? [6, 4] : undefined,
			stroke: (d: ChartDataPoint) => colorMap[d.seriesKey] || resolvedColors[0],
		},
		point: {
			shapeField: 'circle',
			sizeField: 5,
			style: {
				lineWidth: 0,
				stroke: getCSSVariableValue('var(--color-white)'),
				fill: (d: ChartDataPoint) => colorMap[d.seriesKey] || resolvedColors[0],
				fillOpacity: (d: ChartDataPoint) => (d.isProjected ? 0 : 1),
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

					// Get data from items or fallback to filtered data
					const tooltipData = items
						.map(item => item.data)
						.filter((d): d is ChartDataPoint => d !== undefined);

					// If no data in items, try to find from filteredData
					const dataToUse =
						tooltipData.length > 0
							? tooltipData
							: filteredData.filter(d => d.date === title);

					const uniqueExercises = new Map<string, ChartDataPoint>();
					dataToUse.forEach(item => {
						if (!uniqueExercises.has(item.exerciseName) || !item.isProjected) {
							uniqueExercises.set(item.exerciseName, item);
						}
					});

					const firstData = dataToUse[0];
					const imageUrl = firstData?.screenshot;

					return (
						<div className="chart-tool-tip">
							{imageUrl && (
								<div className="image">
									<img src={imageUrl} alt={capturedImageText} />
								</div>
							)}
							<div className="date">{title}</div>
							<div className="session-title">{firstData?.sessionTitle || ''}</div>
							{Array.from(uniqueExercises.values()).map(item => (
								<div
									key={item.exerciseName}
									className="tooltip-exercise-row"
								>
									<span className="tooltip-exercise-name">
										{item.exerciseName}:
									</span>
									<span className="tooltip-exercise-value">
										{Math.round(item.value)}°
									</span>
								</div>
							))}
						</div>
					);
				},
			},
		},
		slider: {
			x: {
				values: [0, 1],
			},
			className: 'custom-chart-slider',
		},
		legend: false,
		animate: { enter: { type: 'waveIn' } },
		annotations: [0, 20, 40, 60, 80, 100].map(value => ({
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

const SCREENSHOTS_PER_PAGE = 20;

export const CustomCaptures = () => {
	const { t } = useTranslation();
	const { isDark } = useTheme();
	const dispatch = useTypedDispatch();
	const [activeTab, setActiveTab] = useState<string | number>('chart');
	const [screenshotPage, setScreenshotPage] = useState(1);
	const [visibleSeries, setVisibleSeries] = useState<string[]>([]);
	const [legendCollapsed, setLegendCollapsed] = useState(false);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const { romSessionListData } = useTypedSelector(state => state.rom.results);
	const id = user.isPhysioterapist ? selectedUser?.id : user?.id;
	const [loading, setLoading] = useState(false);

	// Fetch all data for both chart and screenshots
	const fetchAllData = useCallback(async () => {
		await dispatch(getRomSessionList({ patientId: id, page: 1, limit: 1000 }));
	}, [dispatch, id]);

	useEffect(() => {
		const loadInitialData = async () => {
			setLoading(true);
			await fetchAllData();
			setLoading(false);
		};
		loadInitialData();
	}, [fetchAllData]);

	// Handle screenshot pagination (client-side)
	const onScreenshotPageChange = (pageNumber: number) => {
		setScreenshotPage(pageNumber);
	};

	// When switching tabs
	const handleTabChange = (value: string | number) => {
		setActiveTab(value);
		if (value === 'screenshots') {
			setScreenshotPage(1); // Reset to first page
		}
	};

	// Transform data for chart and screenshots
	const { chartData, exerciseNames } = useMemo(() => {
		if (!romSessionListData?.data) {
			return { chartData: [], exerciseNames: [] };
		}
		// Cast to extended type since API returns romResults which isn't in base type
		return transformToChartData(romSessionListData.data as ExtendedCustomRom[]);
	}, [romSessionListData?.data]);

	// Initialize visible series when exercise names change
	useEffect(() => {
		if (exerciseNames.length > 0 && visibleSeries.length === 0) {
			setVisibleSeries(exerciseNames);
		}
	}, [exerciseNames, visibleSeries.length]);

	// Toggle series visibility
	const toggleSeriesVisibility = (seriesName: string) => {
		setVisibleSeries(prev => {
			if (prev.includes(seriesName)) {
				// Don't allow hiding all series
				if (prev.length === 1) return prev;
				return prev.filter(s => s !== seriesName);
			}
			return [...prev, seriesName];
		});
	};

	// Show all series
	const showAllSeries = () => {
		setVisibleSeries(exerciseNames);
	};

	// Hide all series except one
	const hideAllSeries = () => {
		if (exerciseNames.length > 0) {
			setVisibleSeries([exerciseNames[0]]);
		}
	};

	// All screenshots (for pagination calculation)
	const allScreenshots = useMemo(() => {
		if (!romSessionListData?.data) {
			return [];
		}
		// Cast to extended type since API returns romResults which isn't in base type
		return transformToScreenshotData(
			romSessionListData.data as ExtendedCustomRom[],
		);
	}, [romSessionListData?.data]);

	// Paginated screenshots for current page
	const screenshotData = useMemo(() => {
		const startIndex = (screenshotPage - 1) * SCREENSHOTS_PER_PAGE;
		const endIndex = startIndex + SCREENSHOTS_PER_PAGE;
		return allScreenshots.slice(startIndex, endIndex);
	}, [allScreenshots, screenshotPage]);

	const chartConfig = useMemo(() => {
		return createChartConfig(
			chartData,
			exerciseNames,
			visibleSeries.length > 0 ? visibleSeries : exerciseNames,
			t('Patient.data.postures.capturedImage'),
			isDark,
		);
	}, [chartData, exerciseNames, visibleSeries, t, isDark]);

	const hasData =
		Array.isArray(romSessionListData?.data) &&
		romSessionListData.data.length > 0;

	return (
		<div className="custom-captures">
			{loading ? (
				<ActivityFeedSkeleton count={6} />
			) : (
				<>
					<div
						style={{
							backgroundColor: 'var(--collapse-bg-color)',
							borderRadius: 'var(--radius-lg)',
							padding: 'var(--spacing-4)',
						}}>
						{hasData ? (
							<>
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
									<div className="custom-capture-chart">
										{chartData.length > 0 ? (
											<div className="chart-with-legend">
												<div className="chart-area">
													<Suspense
														fallback={
															<div
																style={{
																	display: 'flex',
																	justifyContent: 'center',
																	alignItems: 'center',
																	height: 600,
																}}>
																<Spin size="large" />
															</div>
														}>
														<Line {...chartConfig} style={{ height: 600 }} />
													</Suspense>
												</div>

												{/* Floating Legend Panel */}
												{exerciseNames.length > 0 && (
													<div className="floating-legend">
														<Collapse
															activeKey={legendCollapsed ? [] : ['legend']}
															onChange={() =>
																setLegendCollapsed(!legendCollapsed)
															}
															expandIconPosition="end"
															items={[
																{
																	key: 'legend',
																	label: (
																		<div className="legend-header">
																			<span>
																				{t('Admin.data.addToReports.legends')}
																			</span>
																			<div
																				className="legend-header-actions"
																				onClick={e => e.stopPropagation()}>
																				<button
																					onClick={showAllSeries}
																					title={t(
																						'Admin.data.addToReports.showAll',
																					)}>
																					{t('Admin.data.addToReports.all')}
																				</button>
																				<button
																					onClick={hideAllSeries}
																					title={t(
																						'Admin.data.addToReports.hideAll',
																					)}>
																					{t('Admin.data.addToReports.none')}
																				</button>
																			</div>
																		</div>
																	),
																	children: (
																		<div>
																			{exerciseNames.map(name => {
																				const isVisible =
																					visibleSeries.includes(name);
																				return (
																					<div
																						key={name}
																						className={`legend-item ${!isVisible ? 'hidden' : ''}`}
																						onClick={() =>
																							toggleSeriesVisibility(name)
																						}>
																						<div
																							className="legend-marker"
																							style={{
																								backgroundColor:
																									getExerciseColor(
																										name,
																										exerciseNames,
																									),
																							}}
																						/>
																						<span
																							className="legend-name"
																							title={name}>
																							{name}
																						</span>
																						<span className="legend-toggle">
																							<UntitledIcon
																								name={
																									isVisible ? 'eye' : 'eyeOff'
																								}
																								size={16}
																							/>
																						</span>
																					</div>
																				);
																			})}
																		</div>
																	),
																},
															]}
														/>
													</div>
												)}
											</div>
										) : (
											<Empty
												image={Empty.PRESENTED_IMAGE_SIMPLE}
												description={
													<span>{t('Admin.data.addToReports.noData')}</span>
												}
											/>
										)}
									</div>
								) : (
									<>
										<CustomCaptureScreenshots screenshots={screenshotData} />
										{allScreenshots.length > 0 && (
											<Flex justify="center" className="p-4 mt-4">
												<Pagination
													current={screenshotPage}
													showSizeChanger={false}
													onChange={onScreenshotPageChange}
													total={allScreenshots.length}
													pageSize={SCREENSHOTS_PER_PAGE}
												/>
											</Flex>
										)}
									</>
								)}
							</>
						) : (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={<span>{t('Admin.data.addToReports.noData')}</span>}
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
};
