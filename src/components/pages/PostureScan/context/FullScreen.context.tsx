import {
	createContext,
	useContext,
	useRef,
	useEffect,
	useState,
	useMemo,
	useCallback,
	PropsWithChildren,
} from 'react';
import { topbarHeight, videoSize } from '../constants';

interface FullScreenContextData {
	ref: React.MutableRefObject<HTMLDivElement | null> | null;
	sizes: {
		width: string;
		height: string;
	};
	isFullScreen: boolean;
	onFullScreen: () => void;
}

const FullScreenContext = createContext<FullScreenContextData>({
	ref: null,
	sizes: {
		width: `${videoSize.width}px`,
		height: `${videoSize.height}px`,
	},
	isFullScreen: false,
	onFullScreen: () => {},
});

export function FullScreenProvider({ children }: Readonly<PropsWithChildren>) {
	const [fullscreen, setFullscreen] = useState<boolean>(false);
	const [sizes, setSizes] = useState({
		width: `${videoSize.width}px`,
		height: `${videoSize.height}px`,
	});
	const ref = useRef<HTMLDivElement | null>(null);

	const onFullScreen = useCallback(async () => {
		if (ref.current) {
			fullscreen
				? await document.exitFullscreen()
				: await ref.current.requestFullscreen();

			setSizes({
				width: fullscreen ? `${videoSize.width}px` : '100vw',
				height: fullscreen
					? `${videoSize.height}px`
					: `calc(100vh - ${topbarHeight})`,
			});
		}
	}, [fullscreen]);

	useEffect(() => {
		const onFullscreenChange = () =>
			setFullscreen(Boolean(document.fullscreenElement));

		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () => {
			setFullscreen(false);
			document.removeEventListener('fullscreenchange', onFullscreenChange);
		};
	}, []);

	const values = useMemo(
		() => ({ ref, isFullScreen: fullscreen, onFullScreen, sizes }),
		[ref, fullscreen, onFullScreen, sizes],
	);

	return (
		<FullScreenContext.Provider value={values}>
			{children}
		</FullScreenContext.Provider>
	);
}

export function UseFullScreen() {
	return useContext(FullScreenContext);
}
