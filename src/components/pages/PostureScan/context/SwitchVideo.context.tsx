import {
	PropsWithChildren,
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

interface SwitchVideoContextData {
	isSwitchMode: boolean;
	cameraId: string | null;
	onSwitchCamera: () => void;
	permissionGranted: boolean;
	setPermissionGranted: (value: boolean) => void;
}

const SwitchVideoContext = createContext<SwitchVideoContextData>({
	isSwitchMode: false,
	cameraId: null,
	onSwitchCamera: () => {},
	permissionGranted: false,
	setPermissionGranted: () => {},
});

export function SwitchVideoProvider({ children }: Readonly<PropsWithChildren>) {
	const [switchMode, setSwitchMode] = useState(false);
	const [cameraId, setCameraId] = useState<string | null>(null);
	const [permissionGranted, setPermissionGranted] = useState(false);

	const onSwitchCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: true,
			});
			setPermissionGranted(true);
			// STOP THE STREAM IMMEDIATELY to prevent leak
			stream.getTracks().forEach(track => track.stop());
		} catch {
			setPermissionGranted(false);
			return;
		}

		const devices = await navigator.mediaDevices.enumerateDevices();
		const cameras = devices.filter(device => device.kind === 'videoinput');
		setSwitchMode(cameras.length > 1);

		if (cameras.length > 0) {
			const currentCameraIndex =
				cameras.findIndex(camera => camera.deviceId === cameraId) || 0;

			const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
			const nextCamera = cameras[nextCameraIndex];

			if (nextCamera.deviceId !== '') {
				return setCameraId(nextCamera.deviceId);
			}

			setTimeout(() => onSwitchCamera(), 1000);
		}
	};

	useEffect(() => {
		navigator.mediaDevices
			?.enumerateDevices?.()
			.then(devs => {
				const granted = devs?.some(d => d.kind === 'videoinput' && d.label);
				if (granted) setPermissionGranted(true);
			})
			.catch(() => {});
		onSwitchCamera();
		return () => {
			setSwitchMode(false);
			setCameraId(null);
		};
	}, []);

	useEffect(() => {
		onSwitchCamera();
		return () => {
			setSwitchMode(false);
			setCameraId(null);
		};
	}, []);

	const values = useMemo(
		() => ({ isSwitchMode: switchMode, cameraId, permissionGranted }),
		[switchMode, cameraId, permissionGranted],
	);

	return (
		<SwitchVideoContext.Provider value={{ ...values, onSwitchCamera, setPermissionGranted }}>
			{children}
		</SwitchVideoContext.Provider>
	);
}

export function UseSwitchVideo() {
	return useContext(SwitchVideoContext);
}
