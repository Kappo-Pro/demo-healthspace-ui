import { UntitledIcon } from '@atoms/Icon';
import { OnboardWholeDaySkeleton } from '@atoms/Skeletons';
import { OnboardFooter } from '@molecules/OnboardFooter';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	getwholeDayActivity,
	patchwholeDayActivity,
	wholeDayActivity,
} from '@stores/shared/onBoard/onBoard';
import { WholeDayActivity } from '@types';
import { Segmented, Slider, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';

interface WholeDayActivityProps {
	setActiveStep: (value: number) => void;
	setProgressPercent: (value: number) => void;
	navigatorDirection: 'forward' | 'backward';
	setNavigatorDirection: (val: 'forward' | 'backward') => void;
}
interface SliderItem {
	color: string;
	img: string;
	key: string;
	name: string;
	value: number;
}

const WholeDayActivity = ({
	setActiveStep,
	setProgressPercent,
	navigatorDirection,
	setNavigatorDirection,
}: WholeDayActivityProps) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const userId = useTypedSelector(state => state.user.id);
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const [isWarningShown, setIsWarningShown] = useState(false);
	const savedActivityValues = useTypedSelector(
		state => state.onBoard.onBoard.savedActivityValues,
	);

	const defaultData = [
		{
			key: 'sitting',
			name: t('Patient.data.onboard.sitting'),
			value: 0,
			color: 'var(--brand-primary)',
			img: '/whole-day-activities/sitting.png',
		},
		{
			key: 'standing',
			name: t('Patient.data.onboard.standing'),
			value: 0,
			color: 'var(--brand-primary)',
			img: '/whole-day-activities/standing.png',
		},
		{
			key: 'bending',
			name: t('Patient.data.onboard.bending'),
			value: 0,
			color: 'var(--brand-primary)',
			img: '/whole-day-activities/bending.png',
		},
		{
			key: 'lifting',
			name: t('Patient.data.onboard.lifting'),
			value: 0,
			color: 'var(--brand-primary)',
			img: '/whole-day-activities/lifting.png',
		},
		{
			key: 'walking',
			name: t('Patient.data.onboard.walking'),
			value: 0,
			color: 'var(--brand-primary)',
			img: '/whole-day-activities/walking.png',
		},
		{
			key: 'sleeping',
			name: t('Patient.data.onboard.sleeping'),
			value: 0,
			color: 'var(--brand-primary)',
			img: '/whole-day-activities/sleeping.png',
		},
	];

	const initialData = defaultData.filter(activity =>
		['sitting', 'standing', 'sleeping'].includes(activity.key),
	);

	const [sliderData, setSliderData] = useState(initialData);
	const [activityData, setActivityData] = useState(defaultData); // Store ALL 6 activities
	const [totalHours, setTotalHours] = useState(0);
	const [tab, setTab] = useState('BASIC');

	useEffect(() => {
		if (tab === 'BASIC') {
			// Show only 3 activities in BASIC mode, but preserve all values in activityData
			const filteredData = activityData.filter(activity =>
				['sitting', 'standing', 'sleeping'].includes(activity.key),
			);
			setSliderData(filteredData);
		} else {
			// Show all 6 activities in ADVANCED mode
			setSliderData(activityData);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tab]); // activityData intentionally excluded - only trigger on tab change

	useEffect(() => {
		// Always calculate total from ALL activities (not just visible ones)
		setTotalHours(activityData.reduce((sum, item) => sum + item.value, 0));
	}, [activityData]);

	useEffect(() => {
		if (savedActivityValues) {
			// Load ALL saved values into ALL 6 activities
			const allActivitiesWithSavedValues = defaultData.map(activity => ({
				...activity,
				value: savedActivityValues[activity.key] || activity.value,
			}));

			// Update activityData with ALL values
			setActivityData(allActivitiesWithSavedValues);

			// Filter for display based on current tab
			const currentTabActivities =
				tab === 'BASIC'
					? allActivitiesWithSavedValues.filter(activity =>
							['sitting', 'standing', 'sleeping'].includes(activity.key),
						)
					: allActivitiesWithSavedValues;

			setSliderData(currentTabActivities);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedActivityValues]); // Only trigger when saved values load, not on tab change

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Mount-only effect - initial data fetch

	useEffect(() => {
		const warningKey = 'overAllTimeWarning';
		if (totalHours > 24 && !isWarningShown) {
			message.open({
				key: warningKey,
				type: 'warning',
				content: t('Patient.data.onboard.overAllTime'),
				duration: 0,
			});
			setIsWarningShown(true);
		} else if (totalHours <= 24) {
			setIsWarningShown(false);
			message.destroy(warningKey);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [totalHours]); // isWarningShown and t intentionally excluded - separate effect handles warning state

	const getData = async () => {
		await dispatch(getwholeDayActivity({ userId: userId }));
		setIsDataLoaded(true);
	};

	const handleNextClick = async () => {
		if (totalHours <= 0) {
			message.warning(t('Patient.data.onboard.hoursWarn'));
		} else {
			if (totalHours <= 24) {
				// Always save ALL 6 activities (including those not visible in BASIC mode)
				const payload: WholeDayActivity = activityData.reduce(
					(acc: WholeDayActivity, activity: SliderItem) => {
						acc[activity.key] = activity.value;
						return acc;
					},
					{},
				);
				savedActivityValues
					? await dispatch(
							patchwholeDayActivity({ userId: userId, body: payload }),
						)
					: await dispatch(wholeDayActivity({ userId: userId, body: payload }));
				setNavigatorDirection('forward');
				setActiveStep?.(8);
				setProgressPercent(80);
			}
		}
	};

	const handleSliderChange = (value: number, name: string) => {
		// Update ALL activities (not just visible ones)
		const updatedActivityData = activityData.map(activity =>
			activity.name === name ? { ...activity, value } : activity,
		);

		setActivityData(updatedActivityData);

		// Update visible sliders
		const updatedSliderData = sliderData.map(activity =>
			activity.name === name ? { ...activity, value } : activity,
		);
		setSliderData(updatedSliderData);
	};

	if (!isDataLoaded) {
		return <OnboardWholeDaySkeleton />;
	}

	return (
		<div className="activity-ring-chart-container">
			<div className="whole-day-content-wrapper">
				<Segmented
					options={[
						{ label: 'Basic', value: 'BASIC' },
						{ label: 'Advanced', value: 'ADVANCE' },
					]}
					value={tab}
					onChange={value => setTab(value as string)}
				/>

				<div
					className={tab === 'ADVANCE' ? 'activities-grid' : 'activities-list'}>
					{sliderData?.map(activity => (
						<div key={activity.key} className="activity-card">
							<img
								src={activity.img}
								alt={activity.name}
								className="activity-card-image"
							/>
							<div className="activity-card-content">
								<p className="activity-card-title">{activity.name}</p>
								<div className="activity-slider-row">
									<span className="activity-slider-label">0h</span>
									<div className="activity-slider-wrapper">
										<Slider
											min={0}
											max={24}
											value={activity.value}
											onChange={value =>
												handleSliderChange(value, activity.name)
											}
											tooltip={{ formatter: value => `${value}h` }}
										/>
									</div>
									<span className="activity-slider-label">24h</span>
								</div>
							</div>
						</div>
					))}
				</div>

				<div
					className={`total-hours-pill ${totalHours > 24 ? 'total-hours-error' : ''}`}>
					<UntitledIcon
						name="clock"
						size={18}
						color={
							totalHours > 24 ? 'var(--text-error)' : 'var(--text-secondary)'
						}
					/>
					<span className="total-hours-text">
						Total Hours: <span className="total-hours-value">{totalHours}</span>{' '}
						Hrs
					</span>
				</div>

				<OnboardFooter
					onContinue={handleNextClick}
					disabled={totalHours <= 0 || totalHours > 24}
				/>
			</div>
		</div>
	);
};

export default WholeDayActivity;
