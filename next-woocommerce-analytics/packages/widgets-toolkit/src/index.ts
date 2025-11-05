/**
 * Core atomic components for displaying metrics
 */
export { MetricDelta } from './metric-delta';
export { MetricValue } from './metric-value';

/**
 * Composite components that combine atomic components
 */
export { MetricWithComparison } from './metric-with-comparison';

/**
 * Chart components for data visualization
 */
export { ComparativeLineChart } from './comparative-line-chart';

/**
 * Widget edit fields
 */
export {
	ReportParamsField,
	type ReportParamsFieldAttributes,
	MetricsField,
	DEFAULT_METRICS,
} from './fields';

/**
 * Helpers and utilities
 */
export {
	formatOrderMetric,
	type OrderMetricKey,
	type OrderMetrics,
	type OrdersSummary,
	getFormatByMetricKey,
} from './helpers';

/**
 * Widget components
 */
export { MetricComparisonWidget } from './metric-comparison-widget';
