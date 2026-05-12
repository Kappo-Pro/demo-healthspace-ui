import { useEffect, useRef, useState } from 'react';

type PreloadState = 'idle' | 'loading' | 'ready' | 'error';

export function useVideoPreloader(url?: string) {
	const [src, setSrc] = useState<string | undefined>(undefined);
	const [state, setState] = useState<PreloadState>('idle');
	const abortRef = useRef<AbortController | null>(null);
	const objUrlRef = useRef<string | null>(null);

	useEffect(() => {
		abortRef.current?.abort();
		if (objUrlRef.current) {
			URL.revokeObjectURL(objUrlRef.current);
			objUrlRef.current = null;
		}
		setSrc(undefined);
		setState('idle');

		if (!url) return;

		const ctrl = new AbortController();
		abortRef.current = ctrl;

		(async () => {
			try {
				setState('loading');
				const res = await fetch(url, {
					mode: 'cors',
					credentials: 'omit',
					signal: ctrl.signal,
				});
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const blob = await res.blob();
				const objUrl = URL.createObjectURL(blob);
				objUrlRef.current = objUrl;
				setSrc(objUrl);
				setState('ready');
			} catch (e) {
				setSrc(url);
				setState('error');
			}
		})();

		return () => {
			ctrl.abort();
			if (objUrlRef.current) {
				URL.revokeObjectURL(objUrlRef.current);
				objUrlRef.current = null;
			}
		};
	}, [url]);

	return { src, state };
}
