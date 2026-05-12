import {
	createContext,
	useContext,
	useState,
	useMemo,
	useCallback,
	PropsWithChildren,
} from 'react';

interface InstructionalVideoContextData {
	videoPaused: boolean;
	onTogglePause: () => void;
}

const InstructionalVideoContext = createContext<InstructionalVideoContextData>({
	videoPaused: false,
	onTogglePause: () => {},
});

export function InstructionalVideoProvider({
	children,
}: Readonly<PropsWithChildren>) {
	const [videoPaused, setVideoPaused] = useState(false);

	const onTogglePause = useCallback(async () => {
		setVideoPaused(!videoPaused);
	}, [videoPaused]);

	const values = useMemo(
		() => ({ videoPaused, onTogglePause }),
		[videoPaused, onTogglePause],
	);

	return (
		<InstructionalVideoContext.Provider value={values}>
			{children}
		</InstructionalVideoContext.Provider>
	);
}

export function UseInstructionalVideo() {
	return useContext(InstructionalVideoContext);
}
