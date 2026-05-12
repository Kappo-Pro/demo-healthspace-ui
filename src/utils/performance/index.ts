/**
 * Performance Utilities Module
 * Exports performance measurement tools
 */

export { measureModalLoad, measureTabSwitch } from './measureModalLoad';
export { performanceMonitor, PerformanceMonitor } from './PerformanceMonitor';
export { initWebVitals, collectWebVitals, WEB_VITALS_THRESHOLDS } from './webVitals';
export {
	markPerformanceStart,
	getBenchmarkResults,
	getAllBenchmarks,
	clearBenchmark,
	clearAllBenchmarks,
	logBenchmarks,
	checkPerformanceBudget,
	PERFORMANCE_BUDGETS,
} from './benchmark';
