/**
 * External dependencies
 */
import { type SeriesData } from '@automattic/charts';
import { formatOrderMetric } from '@next-woo-analytics/widgets-toolkit';

type MetricKey = Parameters< typeof formatOrderMetric >[ 0 ];

export function isEmptyChartData( series: SeriesData[] ): boolean {
	const isEmptyData = series.every( ( s ) =>
		s.data.every( ( point ) => point.value === 0 )
	);

	return isEmptyData;
}

export function getExtraPropsForEmptyComparativeChart(
	metricKey: MetricKey | 'visitors' | 'booking-cancellations-over-time',
	tickFormat: ( value: number ) => string
) {
	// The Y-axis domain always spans from 0 to a multiple of 4.
	// This ensures the chart renders 5 evenly spaced ticks (0 plus 4 distinct values),
	// which aligns nicely with the chart library’s preferred tick count, that matches with design.

	let domain: [ number, number ] = [ 0, 4000 ];

	if ( metricKey === 'orders_no' || metricKey === 'visitors' ) {
		domain = [ 0, 80 ];
	} else if (
		metricKey === 'orders_value_net' ||
		metricKey === 'profit_margin' ||
		metricKey === 'orders_value_gross' ||
		metricKey === 'total_sales'
	) {
		domain = [ 0, 4000 ];
	} else if ( metricKey === 'average_order_value' ) {
		domain = [ 0, 400 ];
	} else if ( metricKey === 'avg_items' || metricKey === 'coupons' ) {
		domain = [ 0, 8 ];
	} else if ( metricKey === 'booking-cancellations-over-time' ) {
		domain = [ 0, 40 ];
	}

	return {
		chartOptions: { yScale: { domain } },

		// For some reason, when providing a fixed domain, the chart library
		// does not adjust the left margin accordingly, so we do it manually.
		// This is a rough estimate, not perfect, but good enough for our use case.
		margin: { left: tickFormat( domain[ 1 ] ).length * 10 },
	};
}
