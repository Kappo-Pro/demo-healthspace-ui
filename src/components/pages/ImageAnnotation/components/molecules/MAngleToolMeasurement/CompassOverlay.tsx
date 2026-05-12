import React, { useRef, useState, useEffect } from 'react';
import { theme } from 'antd';

interface ICompassOverlay {
	angleEnd: number;
	setAngleEnd: (value: number) => void;
	angleStart: number;
	setAngleStart: (value: number) => void;
}

const CompassOverlay: React.FC<ICompassOverlay> = ({
	angleEnd,
	setAngleEnd,
	angleStart,
	setAngleStart,
}) => {
	const { token } = theme.useToken();
	const containerRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ x: 100, y: 100 });
	const [size, setSize] = useState(280);
	const [rotation, setRotation] = useState(0);

	const [mode, setMode] = useState<
		'drag' | 'rotate' | 'resize' | 'start-handle' | 'end-handle' | null
	>(null);

	const dragStart = useRef<{ x: number; y: number; angle: number }>({
		x: 0,
		y: 0,
		angle: 0,
	});
	const initialState = useRef({
		position,
		rotation,
		size,
		angleStart,
		angleEnd,
	});

	const getCenter = () => ({
		x: position.x + size / 2,
		y: position.y + size / 2,
	});

	const getAngle = (x: number, y: number) => {
		const center = getCenter();
		return (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI;
	};

	const onMouseDown = (e: React.MouseEvent, type: typeof mode) => {
		e.stopPropagation();
		e.preventDefault();
		const angleAtClick = getAngle(e.clientX, e.clientY);
		dragStart.current = { x: e.clientX, y: e.clientY, angle: angleAtClick };
		initialState.current = { position, rotation, size, angleStart, angleEnd };
		setMode(type);
	};

	const onMouseMove = (e: MouseEvent) => {
		if (!mode) return;

		const dx = e.clientX - dragStart.current.x;
		const dy = e.clientY - dragStart.current.y;
		const center = getCenter();
		const angle = getAngle(e.clientX, e.clientY);

		if (mode === 'drag') {
			setPosition({
				x: initialState.current.position.x + dx,
				y: initialState.current.position.y + dy,
			});
		} else if (mode === 'rotate') {
			const initialAngle = getAngle(dragStart.current.x, dragStart.current.y);
			setRotation(initialState.current.rotation + (angle - initialAngle));
		} else if (mode === 'resize') {
			const initialDist = Math.hypot(
				dragStart.current.x - center.x,
				dragStart.current.y - center.y,
			);
			const currentDist = Math.hypot(
				e.clientX - center.x,
				e.clientY - center.y,
			);
			const delta = currentDist - initialDist;
			setSize(Math.max(100, initialState.current.size + delta * 2));
		} else if (mode === 'start-handle') {
			setAngleStart((angle - rotation + 360) % 360);
		} else if (mode === 'end-handle') {
			const angleAtStart = dragStart.current.angle;
			let delta = angle - angleAtStart;

			if (delta > 180) delta -= 360;
			if (delta < -180) delta += 360;

			let newEnd = initialState.current.angleEnd + Math.round(delta);
			newEnd = (newEnd + 360) % 360;

			setAngleEnd(newEnd);
		}
	};

	const onMouseUp = () => {
		setMode(null);
	};

	useEffect(() => {
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};
	}, [mode]);

	const angleToCoords = (angle: number, rOffset = 0) => {
		const rad = ((angle + rotation) * Math.PI) / 180;
		const radius = size / 2 + rOffset;
		return {
			x: size / 2 + radius * Math.cos(rad),
			y: size / 2 + radius * Math.sin(rad),
		};
	};

	return (
		<div
			ref={containerRef}
			style={{
				position: 'absolute',
				left: position.x,
				top: position.y,
				width: size,
				height: size,
				transform: `rotate(${rotation}deg)`,
				transformOrigin: 'center',
				cursor: 'default',
				userSelect: 'none',
				zIndex: 999,
			}}>
			<svg width={size} height={size} style={{ overflow: 'visible' }}>
				{/* Main Circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={size / 2 - 1}
					stroke={token.colorText}
					strokeWidth="2"
					fill="none"
				/>

				{/* Tick Marks */}
				{Array.from({ length: 72 }).map((_, i) => {
					const angle = i * 5;
					const isMajor = angle % 45 === 0;
					const isMedium = angle % 15 === 0;
					const inner = angleToCoords(angle, isMajor ? -6 : isMedium ? -6 : -3);
					const outer = angleToCoords(angle, isMajor ? 6 : isMedium ? 6 : 3);
					return (
						<line
							key={`tick-${angle}`}
							x1={inner.x}
							y1={inner.y}
							x2={outer.x}
							y2={outer.y}
							stroke={token.colorText}
							strokeWidth={isMajor ? 1.5 : isMedium ? 1.5 : 1}
						/>
					);
				})}

				{/* Degree Labels */}
				{Array.from({ length: 24 }).map((_, i) => {
					const angle = i * 15;
					const pos = angleToCoords(angle, 15);
					return (
						<text
							key={`label-${angle}`}
							x={pos.x}
							y={pos.y}
							fontSize="10"
							textAnchor="middle"
							dominantBaseline="middle"
							transform={`rotate(${-rotation}, ${pos.x}, ${pos.y})`}>
							{angle}
						</text>
					);
				})}

				{/* Light Green Arc Sector */}
				<path
					d={
						(() => {
							const start = angleToCoords(angleStart);
							const end = angleToCoords(angleEnd);
							const radius = size / 2;
							const largeArcFlag =
								((angleEnd - angleStart + 360) % 360) > 180 ? 1 : 0;
							return `M ${size / 2} ${size / 2}
								L ${start.x} ${start.y}
								A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
								Z`;
						})()
					}
					fill={token.colorSuccessBg}
					opacity={0.6}
				/>

				{/* Start Line (Red) */}
				<line
					x1={size / 2}
					y1={size / 2}
					x2={angleToCoords(angleStart).x}
					y2={angleToCoords(angleStart).y}
					stroke={token.colorError}
					strokeWidth="3"
				/>

				{/* End Line (Green) */}
				<line
					x1={size / 2}
					y1={size / 2}
					x2={angleToCoords(angleEnd).x}
					y2={angleToCoords(angleEnd).y}
					stroke={token.colorSuccess}
					strokeWidth="3"
				/>

				{/* End Handle */}
				<circle
					cx={angleToCoords(angleEnd).x}
					cy={angleToCoords(angleEnd).y}
					r={8}
					fill={token.colorBgContainer}
					stroke={token.colorBorder}
					style={{ cursor: 'pointer' }}
					onMouseDown={e => onMouseDown(e, 'end-handle')}
				/>

				{/* Drag Handle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={8}
					fill={token.colorBgContainer}
					stroke={token.colorBorder}
					style={{ cursor: 'move' }}
					onMouseDown={e => onMouseDown(e, 'drag')}
				/>

				{/* Rotate Handle */}
				<circle
					cx={size - 10}
					cy={10}
					r={10}
					fill={token.colorBgContainer}
					stroke={token.colorBorder}
					onMouseDown={e => onMouseDown(e, 'rotate')}
					style={{ cursor: 'grab' }}
				/>
				<text
					x={size - 10}
					y={12}
					textAnchor="middle"
					dominantBaseline="middle"
					fontSize="12"
					fill={token.colorText}
					pointerEvents="none">
					⟳
				</text>

				{/* Resize Handle */}
				<circle
					cx={10}
					cy={12}
					r={12}
					fill={token.colorBgContainer}
					stroke={token.colorBorder}
					onMouseDown={e => onMouseDown(e, 'resize')}
					style={{ cursor: 'nwse-resize' }}
				/>
				<text
					x={10}
					y={14}
					textAnchor="middle"
					dominantBaseline="middle"
					fontSize="12"
					fill={token.colorText}
					pointerEvents="none">
					⤡
				</text>
			</svg>
		</div>
	);
};

export default CompassOverlay;
