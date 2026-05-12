import {
	setIsBlocked,
	setNavigation} from '@stores/shared/patientDetail/program';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useBlockNavigation = (shouldBlock?: boolean, message?: string) => {
	const navigate = useNavigate();
	const dispatch = useTypedDispatch();
	const { config, nextLocation, callBack } = useTypedSelector(
		state => state.patientDetail.program.blockNavigation,
	);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (shouldBlock) {
				e.preventDefault();
				e.returnValue = message;
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [shouldBlock, message]);

	const handleNavigation = (
		path: string,
		config?: unknown,
		callBack?: () => void,
	) => {
		if (shouldBlock) {
			dispatch(
				setNavigation({
					config: config,
					nextLocation: path,
					callBack: callBack,
				}),
			);
			dispatch(setIsBlocked(true));
		} else {
			navigate(path, config);
			dispatch(setIsBlocked(false));
			clearNavigation();
		}
	};

	const confirmNavigation = () => {
		if (nextLocation) {
			navigate(nextLocation, config ?? undefined);
			if (callBack) callBack();
		}
		dispatch(setIsBlocked(false));
	};

	const cancelNavigation = () => {
		dispatch(setIsBlocked(false));
		dispatch(setNavigation({ config: null, nextLocation: null }));
	};

	const clearNavigation = () => {
		dispatch(setIsBlocked(false));
		dispatch(setNavigation({ config: null, nextLocation: null }));
	};

	return {
		handleNavigation,
		confirmNavigation,
		cancelNavigation,
		clearNavigation,
	};
};
