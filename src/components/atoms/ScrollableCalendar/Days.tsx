import { EvaluationItem } from '@types';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import './Days.css';

type TDayProps = {
	onChange: (date: Date) => void;
	count: number;
	selectedMonthAndYear?: Date;
	year: number;
	activityStreamData: EvaluationItem[];
};

type weekObjectType = {
	[key: string]: number;
};

const weekDayObject: weekObjectType = {
	Mon: 0,
	Tue: 1,
	Wed: 2,
	Thu: 3,
	Fri: 4,
	Sat: 5,
	Sun: 6,
};

const weekDayArray = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Days = (props: TDayProps) => {
	const { onChange, count, year, activityStreamData } = props;
	const [days, setDays] = useState<JSX.Element[]>([]);

	const firstDayOflastWeek = (year: number, month: number) => {
		const lastDayOfMonth = new Date(year, month, 0).getDate();
		const lastDateOfMonth = new Date(year, month - 1, lastDayOfMonth);
		const lastDayOfWeek = lastDateOfMonth.getDay();
		const firstDayOfLastWeek = new Date(lastDateOfMonth);
		firstDayOfLastWeek.setDate(lastDateOfMonth.getDate() - lastDayOfWeek);
		return firstDayOfLastWeek;
	};

	const getFirstDayNameOfMonth = (year: number, month: number) => {
		const firstDayOfMonth = new Date(year, month, 1);
		const firstDayName = new Intl.DateTimeFormat('en-US', {
			weekday: 'short',
		}).format(firstDayOfMonth);
		return firstDayName;
	};

	const createCalendar = useCallback(() => {
		const today = new Date();
		const currentYear = year || today.getFullYear();
		const lastDateOfMonth = new Date(currentYear, count + 1, 0).getDate();
		const lastDateOfPrevMonth = new Date(currentYear, count, 0).getDate();
		const daysElement: JSX.Element[] = [];
		const lastWeekStart = firstDayOflastWeek(currentYear, count);
		let lastWeekDate = lastDateOfPrevMonth - lastWeekStart.getDate();
		lastWeekDate = lastDateOfPrevMonth - lastWeekDate;
		const firstDayName = getFirstDayNameOfMonth(currentYear, count);
		const findDayIndex = weekDayObject[firstDayName];

		for (let i = lastWeekDate; i <= lastDateOfPrevMonth; i++) {
			const dayName: string =
				weekDayArray[(findDayIndex + i - lastWeekDate) % 7];
			const hasEvent = findEvent(
				moment(new Date(currentYear, count - 1, i)).format('MM/DD/YYYY'),
			);
			const css = getStyle(
				'block text-base text-black-700 w-10 h-10 leading-10 rounded-full',
				hasEvent,
				false,
			);
			daysElement.push(setElement(dayName, i, css));
		}

		for (let i = 1; i <= lastDateOfMonth; i++) {
			let isToday = false;
			const hasEvent = findEvent(
				moment(new Date(currentYear, count, i)).format('MM/DD/YYYY'),
			);
			if (
				count === today.getMonth() &&
				currentYear === today.getFullYear() &&
				i === today.getDate()
			) {
				isToday = true;
			}
			const dayName: string = weekDayArray[(findDayIndex + i - 1) % 7];
			const css = getStyle(
				'block text-base text-black-700 w-10 h-10 leading-10 rounded-full',
				hasEvent,
				isToday,
			);
			daysElement.push(
				<li
					className={`mt-auto z-10 cursor-pointer w-11 ${isToday ? 'text-primary-700' : ''}`}
					onClick={() => onChange(new Date(currentYear, count, i))}>
					<span className={`block text-base text-grey-500`}>{dayName}</span>
					<span className={`${css} bg-gray-300 cursor-pointer`}>{i}</span>
				</li>,
			);
		}

		setDays(daysElement);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activityStreamData, count, year]);

	useEffect(() => {
		if (year !== undefined && count !== undefined) {
			createCalendar();
		}
	}, [count, year, createCalendar]);

	const getStyle = (style: string, hasEvent: boolean, isToday: boolean) => {
		if (isToday) {
			return `${style} ${hasEvent ? 'bg-primary-300' : 'bg-gray-200'} bg-primary-700 text-white`;
		} else {
			return `${style} ${hasEvent ? 'bg-primary-200' : 'bg-gray-200'}`;
		}
	};

	const setElement = (dayname: string, dayNumber: number, css: string) => {
		return (
			<li className="w-11 text-gray-300 cursor-none mt-auto">
				<span className="block text-base text-light-grey-500">{dayname}</span>
				<span className={css}>{dayNumber}</span>
			</li>
		);
	};

	const findEvent = (day: string) => {
		let hasEvent = false;
		activityStreamData?.forEach((item: EvaluationItem) => {
			const eventDate = item?.data?.createdAt
				? moment(item?.data?.createdAt).format('MM/DD/YYYY')
				: null;
			if (eventDate === day) {
				hasEvent = true;
			}
		});
		return hasEvent;
	};

	return (
		<div>
			<ul className="days grid grid-cols-7 gap-3">{days}</ul>
		</div>
	);
};

export default Days;
