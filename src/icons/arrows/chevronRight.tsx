import { SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {
  width?: number,
  height?: number,
  color?: StrokeColors
}

const ChevronRight = ({ width = 24, height = 24, color = 'stroke-white'}: Props) => (
  <svg
    className={color}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 18L15 12L9 6"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export { ChevronRight };
