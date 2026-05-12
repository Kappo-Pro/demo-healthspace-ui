// FilterLines.tsx
import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
	width?: number;
	height?: number;
	color?: string; // accept any CSS color
}

const FilterLines = ({
	width = 20,
	height = 20,
	color = 'currentColor',
	className,
	...rest
}: Props) => (
	<svg
		width={width}
		height={height}
		viewBox="0 0 24 24"
		fill="none"
		style={{ color }}
		className={className}
		xmlns="http://www.w3.org/2000/svg"
		{...rest}>
		<path
			d="M6 12H18M3 6H21M9 18H15"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export { FilterLines };
