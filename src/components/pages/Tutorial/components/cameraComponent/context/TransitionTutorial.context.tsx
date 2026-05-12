import {
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export enum TransitionStates {
	INTRO = 'intro',
	CALIBRATION = 'calibration',
	READYSETGO = 'readySetGo',
	CLOSING = 'closing',
	RESULT = 'result',
	OPENNING = 'openning',
	INFO = 'info',
}

export type TransitionNode = {
	next: TransitionNode | null;
	value: TransitionStates;
};

interface TransitionContextData {
	transition: TransitionNode | null;
	onNextTransition: () => void;
	onResetTransition: () => void;
	setTransitionToState: (state: TransitionStates) => void;
}

const linkedListTransitions = () =>
	Object.values(TransitionStates).reduceRight(
		(next: TransitionNode | null, value) => ({ value, next }),
		null,
	);

const TransitionContext = createContext<TransitionContextData>({
	transition: linkedListTransitions(),
	onNextTransition: () => {},
	onResetTransition: () => {},
});

export function TransitionTutorialProvider({
	children,
}: Readonly<PropsWithChildren>) {
	const [transition, setTransition] = useState(linkedListTransitions());

	const onNextTransition = useCallback(async () => {
		setTransition(transition?.next ?? null);
	}, [transition, setTransition]);

	const setTransitionToState = useCallback((state: TransitionStates) => {
		let current = linkedListTransitions();
		while (current && current.value !== state) {
			current = current.next;
		}
		setTransition(current); // may be null if not found
	}, []);

	const onResetTransition = useCallback(async () => {
		setTransition(linkedListTransitions());
	}, [setTransition]);

	useEffect(() => {
		return () => {
			setTransition(linkedListTransitions());
		};
	}, []);

	const values = useMemo(
		() => ({
			transition,
			onNextTransition,
			onResetTransition,
			setTransitionToState,
		}),
		[transition, onNextTransition, onResetTransition, setTransitionToState],
	);

	return (
		<TransitionContext.Provider value={values}>
			{children}
		</TransitionContext.Provider>
	);
}

export function UseTransitionTutorial() {
	return useContext(TransitionContext);
}
