import { useEffect, useState, useCallback } from 'react';
import RightArrow from './RightArrow';
import LeftArrow from './LeftArrow';
import { isSameDay } from 'date-fns';
import { EvaluationItem } from '@types';
import { CalendarHeart02 } from '@vitalflow-icons/time/calendarHeart02';
import { useTranslation } from 'react-i18next';
import './style.css';

type weekArrayType = {
  dateNumber: number,
  currentDate: boolean,
  event: boolean,
  year: number,
  month: number,
  monthName: string
}

type THorizontalCalendarProps = {
  onMonthClick: (value: Date) => void
  setSelectedDate: (value: Date) => void
  onClick: (value: Date) => void
  selectedDate: Date
  activityStreamData: EvaluationItem[]
  isFilter: boolean
  clearFilter: () => void
}

const WeeklyCalendar = (props: THorizontalCalendarProps) => {

  const { onMonthClick, onClick, selectedDate, setSelectedDate, activityStreamData, isFilter, clearFilter } = props;
  const { t } = useTranslation()
  const [weekDays, setWeekDays] = useState<weekArrayType[]>([
    { dateNumber: 0, currentDate: false, event: false, year: 0, month: 0, monthName: '' }
  ])
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [weekStartDay, setWeekStartDay] = useState(new Date);

  useEffect(() => {
    getWeekArray(selectedDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getWeekArray is stable
  }, [selectedDate])
  useEffect(() => {
    setWeekDays((prevWeekDays) => {
      return prevWeekDays.map((date) => ({
        ...date,
        event: getEvent(date.year, date.month, new Date(date.year, date.month, date.dateNumber)),
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getEvent is stable
  }, [activityStreamData]);
  const getWeekArray = (dateNum: Date) => {
    const selectedDate = dateNum;
    const today = new Date;
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    const startingDate = new Date(year, month, day - selectedDate.getDay());
    setWeekArray(startingDate, year, month, today);
  }
  const onClickWeekDay = (newDay: weekArrayType) => {
    const selectedDate = new Date(newDay.year, newDay.month, newDay.dateNumber);
    onClick(selectedDate);
  };
  const setWeekArray = (startingDate: Date, year: number, month: number, today: Date) => {
    const weekArray: weekArrayType[] = [];
    for (let i = 0; i < 21; i++) {
      const date = new Date(startingDate.getFullYear(), startingDate.getMonth(), startingDate.getDate() + i);
      const isEventDate = getEvent(year, month, date);
      weekArray.push({
        dateNumber: date.getDate(),
        currentDate: (date.toDateString() === today.toDateString()),
        event: isEventDate,
        year: date.getFullYear(),
        month: date.getMonth(),
        monthName: date.toLocaleString('default', { month: 'short' }),
      })
    }

    setWeekStartDay(new Date(weekArray[0].year, weekArray[0].month, weekArray[0].dateNumber))
    setWeekDays(weekArray);
  }

  // Memoize the event checking function for better performance
  const getEvent = useCallback((year: number, month: number, date: Date) => {
    if (!activityStreamData || activityStreamData.length === 0) {
      return false;
    }

    return activityStreamData.some((item: EvaluationItem) => {
      if (!item?.data?.createdAt) return false;
      const eventDate = new Date(item.data.createdAt);
      return isSameDay(eventDate, date);
    });
  }, [activityStreamData]);

  const handleNextWeek = () => {
    const currentWeekEnd: weekArrayType = weekDays[20]
    let month = currentWeekEnd.month;
    const getDate: Date = new Date(currentWeekEnd.year, currentWeekEnd.month, currentWeekEnd.dateNumber);
    const lastDay = getLastDayOfTheMonth(getDate)
    if (currentWeekEnd.dateNumber === lastDay) {
      month = month + 1
    }
    const nextWeekStart: Date = new Date(currentWeekEnd.year, month, currentWeekEnd.dateNumber + 1);
    getWeekArray(nextWeekStart);
  };

  const getLastDayOfTheMonth = (nextWeekStart: Date) => {
    const currentDate = new Date(nextWeekStart);
    currentDate.setMonth(currentDate.getMonth() + 1, 1);
    currentDate.setDate(currentDate.getDate() - 1);
    const lastDayOfMonth = currentDate.getDate();
    return lastDayOfMonth;
  }

  const handlePreviousWeek = () => {
    const currentWeekEnd: weekArrayType = weekDays[0]
    currentWeekEnd.dateNumber
    const now = new Date(currentWeekEnd.year, currentWeekEnd.month, currentWeekEnd.dateNumber);
    const newStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21)
    getWeekArray(new Date(newStart))
  };

  return (
    <>
      <nav className='weekly-container' aria-label={t('patient.activity.calendarNavigation')}>
        <button
          className="weekly-div"
          onClick={() => onMonthClick(weekStartDay)}
          aria-label={t('patient.activity.selectMonth', { month: weekStartDay.toLocaleString('default', { month: 'long', year: 'numeric' }) })}
        >
          {weekStartDay.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </button>
        <div className={`weekly-icon ${isFilter ? "custom-w-15" : "custom-w-3"}`}>
          <LeftArrow onPreviousWeek={handlePreviousWeek} />
          <RightArrow onNextWeek={handleNextWeek} />
          {isFilter && (
            <button
              className="weekly-today"
              onClick={() => { clearFilter(); setSelectedDate(new Date()); }}
              aria-label={t('patient.activity.returnToToday')}
            >
              <CalendarHeart02 color='stroke-primary-700' height={18} width={18} />
              {t('patient.activity.today')}
            </button>
          )}
        </div>
      </nav>
      <ul className='weekly-main-container' role="list" aria-label={t('patient.activity.dateList')}>
        {
          weekDays.map((date: weekArrayType, i) => {

            const css = [
              'custom-class-css-week',
              date.currentDate ? 'custom-css-current-date' : '',
              date.event && !date.currentDate ? 'custom-css-event-current-date' : '',
              !date.event && !date.currentDate ? 'custom-bg-gray-week' : '',
              selectedDate && selectedDate.getTime() === new Date(date.year, date.month, date.dateNumber).getTime()
                ? 'custom-bg-primary-week'
                : ''
            ].filter(Boolean).join(' ');

            const isSelected = selectedDate && selectedDate.getTime() === new Date(date.year, date.month, date.dateNumber).getTime();
            const ariaLabel = `${t('patient.activity.selectDate')} ${date.monthName} ${date.dateNumber}${date.event ? `, ${t('patient.activity.hasEvents')}` : ''}${date.currentDate ? `, ${t('patient.activity.today')}` : ''}`;

            return <li className='custom-w-full' key={i}>
              <span
                className={
                  `custom-block-text-base ${date.currentDate || (date.event && !date.currentDate) ? 'custom-week-date-css' : ''
                  } ${!date.event && !date.currentDate ? 'custom-week-date-gray-css' : ''
                  } ${isSelected ? 'custom-week-date-css' : ''}`
                }
                aria-hidden="true"
              >
                {date.currentDate ? 'Today' : days[i % 7]}
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label={ariaLabel}
                aria-current={date.currentDate ? 'date' : undefined}
                aria-pressed={isSelected}
                onClick={() => onClickWeekDay(date)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClickWeekDay(date);
                  }
                  // Arrow key navigation
                  if (e.key === 'ArrowLeft' && i > 0) {
                    e.preventDefault();
                    const prevDate = weekDays[i - 1];
                    onClickWeekDay(prevDate);
                  }
                  if (e.key === 'ArrowRight' && i < weekDays.length - 1) {
                    e.preventDefault();
                    const nextDate = weekDays[i + 1];
                    onClickWeekDay(nextDate);
                  }
                }}
                className={css}
              >
                {date.dateNumber}
              </span>
            </li>;
          })
        }
      </ul>
    </>
  );
};

export default WeeklyCalendar;
