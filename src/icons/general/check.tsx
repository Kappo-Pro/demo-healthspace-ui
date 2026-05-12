import { SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {
  width?: number,
  height?: number,
  color?: StrokeColors
}

const Check = ({ width = 24, height = 24, color = 'stroke-white'}: Props) => (
  <svg
    className={color}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 6L9 17L4 12"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export { Check };
