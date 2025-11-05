/**
 * External dependencies
 */
import { type SeriesData } from '@automattic/charts';
import { type ReportDataMap } from '@next-woo-analytics/data';
import type { OrderMetricKey } from '@next-woo-analytics/widgets-toolkit';

/**
 * Internal dependencies
 */
import { buildTimeSeriesChartData } from '../shared/utils/build-time-series-chart-data';

type ReportsOrdersByDateResponse = ReportDataMap[ 'orders' ];

type BuildOrdersLineChartSeriesProps = {
	orders: ReportsOrdersByDateResponse;
	comparison?: ReportsOrdersByDateResponse;
	metricKey: OrderMetricKey;
};

export function buildOrdersLineChartSeries( {
	orders,
	comparison,
	metricKey,
}: BuildOrdersLineChartSeriesProps ): SeriesData[] {
	return buildTimeSeriesChartData( {
		primary: orders,
		comparison,
		metricKey,
		emptyDataFallback: 'empty-array',
	} );
}
