import { useState, useCallback } from 'react';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	getActivityStreamByDate,
	getActivityUpdateStream,
} from '@stores/activity/activityStream/activityStream';
import {
	selectAllActivities,
	selectIsLoading,
	selectError,
	selectPagination,
	selectHasNextPage,
} from '@stores/activity/activityStream/selectors';
import type { ActivityStreamData } from '@types';
import { USER_ROLES } from '@stores/constants';

interface UseActivityStreamDataOptions {
	/** Optional user ID override - if not provided, will use current user or selected user */
	userId?: string;
	/** Number of days to look back for initial fetch (default: 90) */
	lookbackDays?: number;
}

interface UseActivityStreamDataReturn {
	/** All activity stream data from Redux store */
	data: ActivityStreamData[];
	/** Loading state from Redux */
	loading: boolean;
	/** Error state from Redux */
	error: string | null;
	/** Whether there are more pages to load */
	hasNextPage: boolean;
	/** Fetch initial data or filter by date range */
	fetchData: (date: Date, isDateSelected: boolean) => Promise<void>;
	/** Load more data (pagination) */
	fetchMore: () => Promise<void>;
	/** Refetch current date range */
	refetch: () => Promise<void>;
}

/**
 * Custom hook for managing ActivityStream data fetching and pagination
 *
 * This hook encapsulates all data fetching logic for the ActivityStream component,
 * including initial load, date filtering, and pagination.
 *
 * @example
 * ```tsx
 * const { data, loading, fetchData, fetchMore } = useActivityStreamData();
 *
 * // Initial fetch on mount
 * useEffect(() => {
 *   fetchData(new Date(), false);
 * }, []);
 *
 * // Filter by specific date
 * const handleDateChange = (date: Date) => {
 *   fetchData(date, true);
 * };
 * ```
 */
export function useActivityStreamData(
	options: UseActivityStreamDataOptions = {},
): UseActivityStreamDataReturn {
	const { lookbackDays = 90 } = options;

	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);

	// Redux selectors
	const data = useTypedSelector(selectAllActivities);
	const loading = useTypedSelector(selectIsLoading);
	const error = useTypedSelector(selectError);
	const pagination = useTypedSelector(selectPagination);
	const hasNextPage = useTypedSelector(selectHasNextPage);

	// Track current date range for refetch
	const [currentDateRange, setCurrentDateRange] = useState<{
		startDate: string;
		endDate: string;
	} | null>(null);

	// Determine the user ID to fetch data for
	const id: string =
		options.userId ||
		(user.isPhysioterapist || user.profile.role === USER_ROLES.SUPER_ADMIN
			? selectedUser?.id
			: user.id);

	/**
	 * Format date to YYYY-MM-DD
	 */
	const formatDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	/**
	 * Fetch activity stream data for a given date range
	 *
	 * @param newDate - The end date for the range
	 * @param isDateSelected - If true, fetches only the specific date; if false, fetches lookbackDays range
	 */
	const fetchData = useCallback(
		async (newDate: Date, isDateSelected: boolean) => {
			const today = newDate;
			const start = new Date(today);
			const oneDayMilliseconds = 24 * 60 * 60 * 1000;
			const tomorrowDate = new Date(newDate.getTime() + oneDayMilliseconds);

			start.setDate(
				isDateSelected ? today.getDate() : today.getDate() - lookbackDays,
			);

			const startDate = formatDate(start);
			const endDate = formatDate(tomorrowDate);

			// Store current date range for refetch
			setCurrentDateRange({ startDate, endDate });

			await dispatch(getActivityStreamByDate({ id, startDate, endDate }));
		},
		[dispatch, id, lookbackDays],
	);

	/**
	 * Load more data using pagination (append to existing data)
	 */
	const fetchMore = useCallback(async () => {
		if (!hasNextPage || !pagination?.endCursor) {
			return;
		}

		const today = new Date();
		const startDate = new Date(today);
		startDate.setDate(today.getDate() - lookbackDays);

		const formattedToday = formatDate(today);
		const formattedStartDate = formatDate(startDate);
		const endCursor = pagination.endCursor;

		await dispatch(
			getActivityUpdateStream({
				id,
				formattedToday,
				formattedStartDate,
				endCursor,
			}),
		);
	}, [dispatch, id, hasNextPage, pagination, lookbackDays]);

	/**
	 * Refetch the current date range
	 */
	const refetch = useCallback(async () => {
		if (!currentDateRange) {
			// If no date range is set, fetch default range
			await fetchData(new Date(), false);
			return;
		}

		await dispatch(
			getActivityStreamByDate({
				id,
				startDate: currentDateRange.startDate,
				endDate: currentDateRange.endDate,
			}),
		);
	}, [dispatch, id, currentDateRange, fetchData]);

	return {
		data,
		loading,
		error,
		hasNextPage,
		fetchData,
		fetchMore,
		refetch,
	};
}
