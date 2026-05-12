import { useState, useEffect, useRef } from 'react';
import { Typography } from 'antd';
interface ICountDownTimerProps {
	limit: number;
	isStartingTimer: boolean;
	endedTimer: () => void;
}

const formatTime = (milliseconds: number) => {
	const seconds = Math.floor((milliseconds / 1000) % 60);
	const minutes = Math.floor((milliseconds / 1000 / 60) % 60);

	return [
		minutes.toString().padStart(2, '0'),
		seconds.toString().padStart(2, '0'),
	].join(':');
};

const CountDownTimer = (props: ICountDownTimerProps) => {
	const { limit = 0, isStartingTimer, endedTimer } = props;

	const [milliseconds, setMilliseconds] = useState<number>(limit);

	const intervalRef = useRef<null | NodeJS.Timeout>(null);

	useEffect(() => {
		if (isStartingTimer) {
			intervalRef.current = setInterval(() => {
				setMilliseconds(milliseconds - 1000);
			}, 1000);

			if (milliseconds <= 0) {
				clearInterval(intervalRef.current);
				endedTimer();
			}
		} else {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
				setMilliseconds(limit);
			}
		}

		return () => {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
			}
		};
	}, [
		milliseconds,
		isStartingTimer,
		setMilliseconds,
		intervalRef,
		limit,
		endedTimer,
	]);

	return (
		<Typography.Text style={{ color: 'var(--text-on-dark)', marginLeft: 8 }}>
			{formatTime(milliseconds)}
		</Typography.Text>
	);
};

export default CountDownTimer;
