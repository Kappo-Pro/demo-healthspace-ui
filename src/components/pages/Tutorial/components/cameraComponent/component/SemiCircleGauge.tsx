import { UseFullScreen } from '@pages/PostureScan/context/FullScreen.context';

export function SemiCircleGauge({
	value,
	color = '#' + '7a5cff',
	track = 'rgb' + 'a(255,255,255,0.55)',
	segments = 24,
	size = 340,
	thickness = 14,
	label,
	rightOffset = '35%',
}: {
	value: number;
	color?: string;
	track?: string;
	segments?: number;
	size?: number;
	thickness?: number;
	label?: string;
	rightOffset?: number | string;
}) {
	const outerRadius = size * 0.5 * 0.92;
	const innerRadius = outerRadius - thickness * 2;
	const { isFullScreen } = UseFullScreen();

	const active = Math.round(
		(segments * Math.max(0, Math.min(value, 100))) / 100,
	);

	const cx = size / 2;
	const cy = size * 0.6;
	const ticks = Array.from({ length: segments }, (_, i) => {
		const t = i / (segments - 1);
		const ang = Math.PI * t;
		const cos = Math.cos(ang);
		const sin = Math.sin(ang);

		const x1 = cx + innerRadius * cos;
		const y1 = cy - innerRadius * sin;
		const x2 = cx + outerRadius * cos;
		const y2 = cy - outerRadius * sin;

		const on = i < active;
		return (
			<line
				key={i}
				x1={x1}
				y1={y1}
				x2={x2}
				y2={y2}
				stroke={on ? color : track}
				strokeWidth={thickness}
				strokeLinecap="round"
			/>
		);
	});

	return (
		<div
			style={{
				position: 'absolute',
				bottom: isFullScreen ? '-8%' : '-12%',
				right: isFullScreen ? '43%' : rightOffset,
				transform: 'translateY(-50%)',
				width: size,
				pointerEvents: 'none',
				zIndex: 1002,
			}}>
			<div
				style={{
					position: 'relative',
					borderRadius: 24,
					padding: 18,
					background: 'rgb' + 'a(255,255,255,0.35)',
					backdropFilter: 'blur(12px)',
					boxShadow:
						'0 10px 30px rgb' +
						'a(0,0,0,0.18), inset 0 0 0 1px rgb' +
						'a(255,255,255,0.25)',
				}}>
				<svg
					viewBox={`0 0 ${size} ${size * 0.66}`}
					width="100%"
					height="auto"
					style={{ display: 'block', overflow: 'visible' }}
					aria-hidden>
					{ticks}
				</svg>

				{!!label && (
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: 10,
							textAlign: 'center',
							fontWeight: 'var(--font-weight-extrabold)',
							fontSize: 'clamp(24px, 4vw, 42px)',
							color: '#' + '1a1a1a',
						}}>
						{label}
					</div>
				)}
			</div>
		</div>
	);
}
