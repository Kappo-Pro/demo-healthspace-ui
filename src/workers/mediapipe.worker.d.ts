// Type declarations for Web Worker imports
// Enables TypeScript support for worker instantiation via URL constructor pattern

declare module '*?worker' {
	const workerConstructor: {
		new (): Worker;
	};
	export default workerConstructor;
}

declare module '*.worker.ts' {
	const workerConstructor: {
		new (): Worker;
	};
	export default workerConstructor;
}
