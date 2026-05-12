import { Typography } from 'antd';

const { Paragraph } = Typography;
import { useEffect, useRef, useState } from 'react';
import Days from './Days';
import { EvaluationItem } from '@types';
import './style.css';
interface monthsListType {
	month: string;
	count: number;
	year: number;
}

type TCalendarProps = {
	onChange: (date: Date) => void;
	selectedMonthAndYear: Date;
	isMonthOpen?: boolean;
	activityStreamData: EvaluationItem[];
};

const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

const ScrollableCalendar = (props: TCalendarProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const previousScrollTop = useRef<number>(0);
	const {
		onChange,
		selectedMonthAndYear,
		isMonthOpen = false,
		activityStreamData,
	} = props;
	const [monthsList, setMonthsList] = useState<monthsListType[]>([]);

	useEffect(() => {
		createMonthArray();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMonthAndYear, isMonthOpen]);
	// Note: createMonthArray is intentionally not in dependencies to avoid infinite loop
	// The function is stable and only uses selectedMonthAndYear which IS in dependencies

	const createMonthArray = () => {
		const date: Date = selectedMonthAndYear;
		const currentYear = date.getFullYear();
		const currentMonth = date.getMonth();
		const prevMonth = currentMonth - 1 >= 0 ? currentMonth - 1 : 11;
		const previousYear = currentMonth - 1 >= 0 ? currentYear : currentYear - 1;
		const nextMonth = currentMonth + 1 < 12 ? currentMonth + 1 : 0;
		const nextYear = currentMonth + 1 < 12 ? currentYear : currentYear + 1;
		const monthsListData = [];
		monthsListData.push(
			{ month: months[prevMonth], count: prevMonth, year: previousYear },
			{ month: months[currentMonth], count: currentMonth, year: currentYear },
			{ month: months[nextMonth], count: nextMonth, year: nextYear },
		);
		setMonthsList(monthsListData);
		setTimeout(() => {
			if (containerRef.current) {
				containerRef.current.scrollTop = 50;
			}
		}, 10);
	};

	const handleScroll = () => {
		if (containerRef.current) {
			const scrollTop = containerRef.current.scrollTop;
			const isScrollingUp = scrollTop < previousScrollTop.current;
			if (isScrollingUp && scrollTop < 50 && monthsList.length > 0) {
				addPreviousMonth();
				containerRef.current.scrollTop = 200;
			} else if (
				containerRef.current.scrollHeight -
					(scrollTop + containerRef.current.clientHeight) <
				200
			) {
				addNextMonth();
			}
			previousScrollTop.current = scrollTop;
		}
	};

	const addPreviousMonth = () => {
		const monthHeight = 200;
		if (containerRef.current) {
			containerRef.current.scrollTop -= monthHeight;
		}
		let previousCount: number = monthsList[0].count;
		previousCount = previousCount - 1;
		const previousYear: number = monthsList[0].year;
		const monthNumber = previousCount === -1 ? 11 : previousCount;
		const year = previousCount === -1 ? previousYear - 1 : previousYear;
		setMonths(monthNumber, year, false);
	};

	const addNextMonth = () => {
		const monthsCount = monthsList.length - 1;
		let nextCount: number = monthsList[monthsCount].count;
		nextCount = nextCount + 1;
		const nextYear: number = monthsList[monthsCount].year;
		const month = nextCount === 12 ? 0 : nextCount;
		const year = nextCount === 12 ? nextYear + 1 : nextYear;
		setMonths(month, year, true);
	};

	const setMonths = (monthNumber: number, year: number, next: boolean) => {
		let temp_list: monthsListType[] = [];
		temp_list.push({
			month: months[monthNumber],
			count: monthNumber,
			year: year,
		});
		if (next) {
			temp_list = monthsList.concat(temp_list);
		} else {
			temp_list = temp_list.concat(monthsList);
		}
		setMonthsList(temp_list);
	};
	const handleDayClick = (date: Date) => {
		onChange(date);
	};
	return (
		<div
			className="scrollable-calendar"
			onScroll={handleScroll}
			ref={containerRef}>
			<div className="scrollable-calendar-container">
				{monthsList?.map((item: monthsListType, index: number) => {
					return (
						<div key={index}>
							<header>
								<Paragraph className="scrollable-calendar-monthly-year">
									{item.month} {item.year}
								</Paragraph>
							</header>
							<div className="scrollable-calendar-days">
								<Days
									count={item.count}
									year={item.year}
									onChange={handleDayClick}
									selectedMonthAndYear={selectedMonthAndYear}
									activityStreamData={activityStreamData}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default ScrollableCalendar;
