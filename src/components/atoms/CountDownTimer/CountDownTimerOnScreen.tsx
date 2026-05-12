import { Typography } from 'antd';

interface ICountDownTimerProps {
	timeLeft: number;
}

const CountDownTimerOnScreen = (props: ICountDownTimerProps) => {
	const { timeLeft } = props;

	return (
		<Typography.Text className="countdown-font-size">
			{timeLeft}
		</Typography.Text>
	);
};

export default CountDownTimerOnScreen;
