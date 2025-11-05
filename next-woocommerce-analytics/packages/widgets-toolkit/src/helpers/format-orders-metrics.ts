/**
 * External dependencies
 */
import { formatMetricValue } from '@next-woo-analytics/formatters';

/**
 * Internal dependencies
 */
import type { MetricKey } from './types';

type FormatMetricOptions = NonNullable<
	Parameters< typeof formatMetricValue >[ 2 ]
>;

type MetricType = NonNullable< Parameters< typeof formatMetricValue >[ 1 ] >;

const metricFormatMap: Record<
	MetricKey,
	{ metricType: MetricType; format?: FormatMetricOptions }
> = {
	orders_no: {
		metricType: 'number',
	},
	total_sales: {
		metricType: 'currency',
	},
	average_order_value: {
		metricType: 'currency',
	},
	avg_items: {
		metricType: 'average',
	},
	orders_value_net: {
		metricType: 'currency',
	},
	orders_value_gross: {
		metricType: 'currency',
	},
	coupons: {
		metricType: 'currency',
	},
	profit_margin: {
		metricType: 'currency',
	},
	visitors: {
		metricType: 'number',
		format: {
			useMultipliers: true,
			decimals: 0,
		},
	},
};

export function formatOrderMetric(
	metricKey: MetricKey,
	options?: FormatMetricOptions
) {
	return ( value: number ) =>
		formatMetricValue(
			value,
			metricFormatMap[ metricKey ].metricType,
			options ?? {}
		);
}

export function getFormatByMetricKey( metricKey: MetricKey ) {
	const config = metricFormatMap[ metricKey ];
	return {
		type: config.metricType,
		options: config.format,
	};
}
