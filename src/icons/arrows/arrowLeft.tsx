import { SVGProps } from "react";
interface Props extends SVGProps<SVGSVGElement> {
  width?: number,
  height?: number,
  color?: StrokeColors
}
const ArrowLeft = ({ width = 24, height = 24, color = 'stroke-white'}: Props) => (
  <svg
    className={color}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export { ArrowLeft };
