interface IBodyFrontProps {
	color: string;
	width: number;
}

function BodyFront({ color, width }: IBodyFrontProps) {
	return (
		<img
			src="/images/rom/front.png"
			alt="Body Front"
			style={{ height: '400px' }}
		/>
	);
}
export default BodyFront;
