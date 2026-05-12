import { SVGProps } from "react";
interface Props extends SVGProps<SVGSVGElement> {
  width?: number,
  height?: number,
  color?: StrokeColors
}
const ArrowNarrowRight = ({ width = 24, height = 24, color = 'stroke-white'}: Props) => (
  <svg
    className={color}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 12H20M20 12L14 6M20 12L14 18"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export { ArrowNarrowRight };
