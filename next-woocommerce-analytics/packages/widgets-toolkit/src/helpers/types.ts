/**
 * External dependencies
 */
import type { ReportDataMap } from '@next-woo-analytics/data';

export type OrdersSummary = ReportDataMap[ 'orders' ][ 'summary' ];

export type OrderMetrics = Pick<
	OrdersSummary,
	| 'orders_no'
	| 'total_sales'
	| 'average_order_value'
	| 'avg_items'
	| 'orders_value_net'
	| 'orders_value_gross'
	| 'coupons'
	| 'profit_margin'
>;

export type OrderMetricKey = keyof OrderMetrics;

export type VisitorsMetricKey = 'visitors';

export type MetricKey = OrderMetricKey | VisitorsMetricKey;
