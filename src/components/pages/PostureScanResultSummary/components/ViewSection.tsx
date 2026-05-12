import { PostureData, PostureAlignment } from '@types';
import { Collapse, Empty, Image, Typography } from 'antd';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface ViewSectionProps {
	title: string;
	tags: string[];
	data: PostureData | null;
	strapiPostureReport?: PostureAlignment[] | null;
}

const getImageUrl = (view: string) => {
	switch (view) {
		case 'front':
			return '/assets/front_view.png';
		case 'back':
			return '/assets/back_view.png';
		case 'left':
			return '/assets/left_view.png';
		case 'right':
			return '/assets/right_view.png';
		default:
			return '/assets/front_view.png';
	}
};

function ViewSection({
	title,
	tags,
	data,
	strapiPostureReport,
}: ViewSectionProps) {
	const { t } = useTranslation();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);

	// Check if at least one of the 3 parts has data
	const hasScreenshot = !!data?.screenshot;
	const hasPurpleGuy = !!data?.screenshot; // Same condition as screenshot
	const hasAccordions = tags.length > 0;
	const hasAnyData = hasScreenshot || hasPurpleGuy || hasAccordions;

	// If none of the 3 parts have data, show single Empty
	if (!hasAnyData) {
		return (
			<div
				style={{
					background: 'var(--bg-page)',
					borderRadius: 'var(--radius-lg)',
					padding: 'var(--spacing-4)',
				}}>
				<h4
					style={{
						fontSize: 'var(--font-size-lg)',
						fontWeight: 'var(--font-weight-semibold)',
						margin: '0 0 5px',
						color: 'var(--text-primary)',
					}}>
					{title}
				</h4>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '400px',
						borderRadius: 'var(--radius-md)',
						padding: 'var(--spacing-8)',
					}}>
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description={t(
							'Admin.data.addToReports.noData',
							'No Data available',
						)}
					/>
				</div>
			</div>
		);
	}

	// Helper function to get issue data from Strapi
	const getIssueData = (tag: string) => {
		if (!strapiPostureReport || strapiPostureReport.length === 0) {
			return null;
		}

		// Normalize strings: lowercase and trim whitespace
		const normalizedTag = tag.toLowerCase().trim();

		// Find the matching alignment by name (case-insensitive with trim)
		const alignment = strapiPostureReport.find(
			item => item.name.toLowerCase().trim() === normalizedTag,
		);

		return alignment || null;
	};

	const getAffectedLines = (tags: string[]) => {
		return {
			shouldersTilted: tags.some(tag =>
				[
					'Rounded Shoulders',
					'Forward Head Posture',
					'Head Tilt',
					'Uneven Shoulders',
					'Kyphosis',
				].includes(tag),
			),
			hipTilted: tags.some(tag =>
				['Anterior Pelvic Tilt', 'Posterior Pelvic Tilt', 'Lordosis'].includes(
					tag,
				),
			),
			kneeIssue: tags.some(tag =>
				['Knee Valgus', 'Knee Varus', 'Knee Misalignment'].includes(tag),
			),
		};
	};

	const drawLines = () => {
		const canvas = canvasRef.current as HTMLCanvasElement | null;
		const image = imageRef.current as HTMLImageElement | null;

		if (!canvas || !image) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const { shouldersTilted, hipTilted, kneeIssue } = getAffectedLines(tags);

		canvas.width = image.clientWidth;
		canvas.height = image.clientHeight;

		const scaleX = canvas.width;
		const scaleY = canvas.height;

		// Get computed CSS custom property values
		const getComputedColor = (cssVar: string) => {
			if (typeof window === 'undefined') return '';
			const computed = getComputedStyle(document.documentElement)
				.getPropertyValue(cssVar)
				.trim();
			return computed;
		};

		const drawDot = (
			x: number,
			y: number,
			color = getComputedColor('--text-primary'),
			radius = 5,
		) => {
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI);
			ctx.fillStyle = color;
			ctx.fill();
		};

		const drawLineWithDots = (
			x1: number,
			y1: number,
			x2: number,
			y2: number,
			color = getComputedColor('--color-error-500'),
		) => {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.stroke();

			drawDot(x1, y1, color);
			drawDot(x2, y2, color);
		};

		// Base default coordinates for each view
		const defaultPoints = {
			front: {
				shoulderLeft: [0.21, 0.2],
				shoulderRight: [0.8, 0.2],
				hipLeft: [0.32, 0.453],
				hipRight: [0.69, 0.453],
				kneeLeft: [0.33, 0.72],
				kneeRight: [0.68, 0.72],
				footLeft: [0.3, 0.925],
				footRight: [0.7, 0.925],
			},
			back: {
				shoulderLeft: [0.21, 0.205],
				shoulderRight: [0.8, 0.205],
				hipLeft: [0.31, 0.453],
				hipRight: [0.68, 0.453],
				kneeLeft: [0.315, 0.74],
				kneeRight: [0.685, 0.74],
				footLeft: [0.3, 0.94],
				footRight: [0.7, 0.94],
			},
			left: {
				head: [0.66, 0.11],
				shoulder: [0.565, 0.2],
				hip: [0.55, 0.445],
				knee: [0.505, 0.71],
				ankle: [0.57, 0.94],
			},
			right: {
				head: [0.47, 0.11],
				shoulder: [0.46, 0.2],
				hip: [0.5, 0.445],
				knee: [0.48, 0.71],
				ankle: [0.44, 0.94],
			},
		};

		type ViewKey = 'front' | 'back' | 'left' | 'right';
		const view = title.toLowerCase() as ViewKey;

		// Define colors using CSS variables
		const colors = {
			yellow: getComputedColor('--color-warning-500'),
			orange: getComputedColor('--color-orange-500'),
			red: getComputedColor('--color-error-500'),
			blue: getComputedColor('--color-info-500'),
			green: getComputedColor('--color-success-500'),
		};

		switch (view) {
			case 'front':
			case 'back': {
				const basePoints = defaultPoints[view];
				const points = {
					...basePoints,
					shoulderRight: [
						basePoints.shoulderRight[0],
						shouldersTilted
							? basePoints.shoulderRight[1] + 0.02
							: basePoints.shoulderRight[1],
					],
					kneeRight: [
						basePoints.kneeRight[0],
						kneeIssue
							? basePoints.kneeRight[1] + 0.015
							: basePoints.kneeRight[1],
					],
					hipRight: [
						basePoints.hipRight[0],
						hipTilted ? basePoints.hipRight[1] - 0.02 : basePoints.hipRight[1],
					],
				};
				drawLineWithDots(
					points.shoulderLeft[0] * scaleX,
					points.shoulderLeft[1] * scaleY,
					points.shoulderRight[0] * scaleX,
					points.shoulderRight[1] * scaleY,
					colors.yellow,
				);

				drawLineWithDots(
					points.hipLeft[0] * scaleX,
					points.hipLeft[1] * scaleY,
					points.hipRight[0] * scaleX,
					points.hipRight[1] * scaleY,
					colors.orange,
				);

				drawLineWithDots(
					points.kneeLeft[0] * scaleX,
					points.kneeLeft[1] * scaleY,
					points.kneeRight[0] * scaleX,
					points.kneeRight[1] * scaleY,
					kneeIssue ? colors.red : colors.blue,
				);

				drawLineWithDots(
					points.footLeft[0] * scaleX,
					points.footLeft[1] * scaleY,
					points.footRight[0] * scaleX,
					points.footRight[1] * scaleY,
					colors.blue,
				);
				break;
			}

			case 'left': {
				const points = defaultPoints.left;
				drawDot(
					points.shoulder[0] * scaleX,
					points.shoulder[1] * scaleY,
					colors.blue,
				);
				drawDot(points.hip[0] * scaleX, points.hip[1] * scaleY, colors.orange);
				drawDot(points.knee[0] * scaleX, points.knee[1] * scaleY, colors.green);
				drawDot(
					points.ankle[0] * scaleX,
					points.ankle[1] * scaleY,
					colors.blue,
				);
				break;
			}
			case 'right': {
				const points = defaultPoints.right;
				drawDot(
					points.shoulder[0] * scaleX,
					points.shoulder[1] * scaleY,
					colors.blue,
				);
				drawDot(points.hip[0] * scaleX, points.hip[1] * scaleY, colors.orange);
				drawDot(points.knee[0] * scaleX, points.knee[1] * scaleY, colors.green);
				drawDot(
					points.ankle[0] * scaleX,
					points.ankle[1] * scaleY,
					colors.blue,
				);
				break;
			}

			default:
				console.warn('Unknown view for drawing lines:', view);
		}
	};

	return (
		<div
			style={{
				background: 'var(--bg-page)',
				borderRadius: 'var(--radius-lg)',
				padding: 'var(--spacing-4)',
			}}>
			<h4
				style={{
					fontSize: 'var(--font-size-lg)',
					fontWeight: 'var(--font-weight-semibold)',
					margin: '0 0 5px',
					color: 'var(--text-primary)',
				}}>
				{title}
			</h4>

			<div
				style={{
					display: 'flex',
					gap: 'var(--spacing-4)',
					alignItems: 'stretch',
					minHeight: '400px',
				}}>
				{/* Screenshot - 35% (only render if has data) */}
				{hasScreenshot && (
					<div
						style={{
							flex: '0 0 35%',
							overflow: 'hidden',
							borderRadius: 'var(--radius-md)',
							background: 'var(--surface-tertiary)',
							position: 'relative',
						}}>
						<Image
							src={data.screenshot}
							alt={`${title} view`}
							rootClassName="posture-screenshot-container"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								objectPosition: 'center center',
								display: 'block',
							}}
							preview={{
								src: data.screenshot,
							}}
						/>
					</div>
				)}

				{/* Purple Guy - 25% (only render if has data) */}
				{hasPurpleGuy && (
					<div
						style={{
							flex: '0 0 25%',
							position: 'relative',
							display: 'flex',
							alignItems: 'center',
						}}>
						<div style={{ position: 'relative', width: '100%' }}>
							<img
								src={getImageUrl(title.toLowerCase())}
								alt={`${title} diagram`}
								ref={imageRef}
								onLoad={drawLines}
								style={{
									width: '100%',
									height: 'auto',
									display: 'block',
								}}
							/>
							<canvas
								ref={canvasRef}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: '100%',
									pointerEvents: 'none',
								}}
							/>
						</div>
					</div>
				)}

				{/* Accordions - 40% (only render if has data) */}
				{hasAccordions && (
					<div style={{ flex: '1' }}>
						<Collapse
							accordion
							ghost
							expandIconPosition="end"
							style={{ background: 'transparent' }}>
							{tags.map((tag: string, index: number) => {
								const issueData = getIssueData(tag);

								return (
									<Collapse.Panel
										key={index}
										header={
											<Text strong style={{ color: 'var(--text-primary)' }}>
												{tag}
											</Text>
										}
										style={{
											marginBottom: 'var(--spacing-2)',
											background: 'var(--surface-tertiary)',
											borderRadius: 'var(--radius-md)',
											border: 'none',
										}}>
										<div style={{ paddingLeft: 'var(--spacing-2)' }}>
											{issueData?.whatMeans && (
												<>
													<Text
														strong
														style={{
															display: 'block',
															marginBottom: 'var(--spacing-1)',
															color: 'var(--text-primary)',
														}}>
														What this means:
													</Text>
													<Text
														type="secondary"
														style={{
															display: 'block',
															marginBottom: 'var(--spacing-3)',
															fontSize: 'var(--font-size-sm)',
														}}>
														{issueData.whatMeans}
													</Text>
												</>
											)}

											{issueData?.whatCause && (
												<>
													<Text
														strong
														style={{
															display: 'block',
															marginBottom: 'var(--spacing-1)',
															color: 'var(--text-primary)',
														}}>
														What it may cause:
													</Text>
													<Text
														type="secondary"
														style={{
															display: 'block',
															marginBottom: 'var(--spacing-3)',
															fontSize: 'var(--font-size-sm)',
														}}>
														{issueData.whatCause}
													</Text>
												</>
											)}

											{issueData?.whatHelps && (
												<>
													<Text
														strong
														style={{
															display: 'block',
															marginBottom: 'var(--spacing-1)',
															color: 'var(--text-primary)',
														}}>
														What helps:
													</Text>
													<Text
														type="secondary"
														style={{
															display: 'block',
															fontSize: 'var(--font-size-sm)',
														}}>
														{issueData.whatHelps}
													</Text>
												</>
											)}

											{!issueData && (
												<Text
													type="secondary"
													style={{ fontSize: 'var(--font-size-sm)' }}>
													No additional information available.
												</Text>
											)}
										</div>
									</Collapse.Panel>
								);
							})}
						</Collapse>
					</div>
				)}
			</div>
		</div>
	);
}

export default ViewSection;
