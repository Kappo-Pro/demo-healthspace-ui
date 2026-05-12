import React from 'react';

interface HotspotIconProps {
	active?: boolean;
	className?: string;
	style?: React.CSSProperties;
}

export const HotspotIcon: React.FC<HotspotIconProps> = ({ active, className, style }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="39"
		height="40"
		viewBox="0 0 39 40"
		fill="none"
		className={className}
		style={style}>
		<foreignObject x="17.826" y="-1.55338" width="22.4862" height="28.9036">
			<div
				style={{
					backdropFilter: 'blur(0.78px)',
					clipPath: 'url(#bgblur_0_hotspot_clip_path)',
					height: '100%',
					width: '100%',
				}}
			/>
		</foreignObject>
		<g data-figma-bg-blur-radius="1.55338">
			<mask id="path-1-inside-1_hotspot" fill="white">
				<path d="M19.3793 0C22.4376 3.70875e-08 25.4524 0.736067 28.1774 2.14802C30.9023 3.55997 33.2599 5.60772 35.0575 8.12384C36.8551 10.64 38.0416 13.553 38.5201 16.6248C38.9985 19.6966 38.7552 22.84 37.8102 25.7978L19.3793 19.7078V0Z" />
			</mask>
			<path
				d="M19.3793 0C22.4376 3.70875e-08 25.4524 0.736067 28.1774 2.14802C30.9023 3.55997 33.2599 5.60772 35.0575 8.12384C36.8551 10.64 38.0416 13.553 38.5201 16.6248C38.9985 19.6966 38.7552 22.84 37.8102 25.7978L19.3793 19.7078V0Z"
				stroke="url(#paint0_radial_hotspot)"
				strokeWidth="0.388345"
				mask="url(#path-1-inside-1_hotspot)"
			/>
		</g>
		<path
			d="M19.3789 0.194336C29.9715 0.194336 38.5645 8.92784 38.5645 19.708C38.5643 30.4881 29.9714 39.2217 19.3789 39.2217C8.78657 39.2214 0.19445 30.4879 0.194336 19.708C0.194336 8.92799 8.78649 0.194568 19.3789 0.194336Z"
			fill="black"
			fillOpacity="0.15"
			stroke="var(--color-vf-gray-1)"
			strokeWidth="0.388345"
		/>
		<circle
			cx="19.0507"
			cy="19.7079"
			r="6.56926"
			fill={active ? 'var(--color-green-dark-6)' : 'var(--color-vf-gray-1)'}
		/>
		<defs>
			<clipPath id="bgblur_0_hotspot_clip_path" transform="translate(-17.826 1.55338)">
				<path d="M19.3793 0C22.4376 3.70875e-08 25.4524 0.736067 28.1774 2.14802C30.9023 3.55997 33.2599 5.60772 35.0575 8.12384C36.8551 10.64 38.0416 13.553 38.5201 16.6248C38.9985 19.6966 38.7552 22.84 37.8102 25.7978L19.3793 19.7078V0Z" />
			</clipPath>
			<radialGradient
				id="paint0_radial_hotspot"
				cx="0"
				cy="0"
				r="1"
				gradientUnits="userSpaceOnUse"
				gradientTransform="translate(19.3793 19.7078) rotate(90) scale(19.7078 19.3793)">
				<stop stopColor="white" stopOpacity="0.5" />
				<stop offset="0.83" stopColor="white" stopOpacity="0" />
			</radialGradient>
		</defs>
	</svg>
);

export default HotspotIcon;
