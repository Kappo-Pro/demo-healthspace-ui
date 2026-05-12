import { useCallback, useEffect, useRef, useState } from 'react';
import { PosturalAnalytics } from '../context/Controls.context';

export const useControls = (
	initialArray: Partial<PosturalAnalytics>[] = [],
	onPositionsChange?: (positions: Partial<PosturalAnalytics>[]) => void,
) => {
	const [array, setArray] = useState<Partial<PosturalAnalytics>[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const isInitializedRef = useRef(false);

	const isCompleted = !!array.length && array.every(item => item.completed);

	// Only initialize once when data first arrives (empty -> non-empty)
	// Prevents resetting completed statuses when parent updates positions
	useEffect(() => {
		if (initialArray.length === 0) return;
		if (isInitializedRef.current) return;

		isInitializedRef.current = true;
		setArray(
			initialArray?.map(item => ({
				...item,
				completed: false,
			})),
		);
		setCurrentIndex(0);
	}, [initialArray]);

	const onNext = useCallback((startIndex?: number): Partial<PosturalAnalytics> | null => {
		let index = currentIndex;

		if (array.length === 0) return null;

		if (startIndex) {
			index = startIndex;
			setCurrentIndex(index);
		}

		while (index < array.length && array[index].completed) {
			index++;
		}

		if (index < array.length) {
			setCurrentIndex(index);
			return array[index];
		} else {
			return null;
		}
	}, [array, currentIndex]);

	const onMarkAsCompleted = useCallback(() => {
		if (currentIndex >= 0 && currentIndex < array.length) {
			const newArray = [...array];
			newArray[currentIndex] = { ...newArray[currentIndex], completed: true };
			setArray(newArray);
			// Notify parent of position updates
			onPositionsChange?.(newArray);
		}
	}, [array, currentIndex, onPositionsChange]);

	const onReset = () => {
		const resetArray = array.map(item => ({
			...item,
			completed: false,
		}));
		setArray(resetArray || []);
		setCurrentIndex(0);
		// Allow re-initialization if reset is called
		isInitializedRef.current = false;
	};

	const onGetCurrent = (
		isReturnIndex = false,
	): number | Partial<PosturalAnalytics> => {
		if (isReturnIndex) return currentIndex;

		return array[currentIndex];
	};

	return { onNext, onReset, onGetCurrent, onMarkAsCompleted, isCompleted };
};
