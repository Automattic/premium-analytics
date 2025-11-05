/**
 * External dependencies
 */
import { type SeriesData } from '@automattic/charts';
import { type ReportDataMap } from '@next-woo-analytics/data';

/**
 * Internal dependencies
 */
import { buildTimeSeriesChartData } from '../shared/utils/build-time-series-chart-data';

type ReportsBookingsByDateResponse = ReportDataMap[ 'bookings' ];

type BuildBookingCancellationsLineChartSeriesProps = {
	bookings: ReportsBookingsByDateResponse;
	comparison?: ReportsBookingsByDateResponse;
};

export function buildBookingCancellationsLineChartSeries( {
	bookings,
	comparison,
}: BuildBookingCancellationsLineChartSeriesProps ): SeriesData[] {
	return buildTimeSeriesChartData( {
		primary: bookings,
		comparison,
		metricKey: 'status_cancelled',
		emptyDataFallback: 'empty-array',
	} );
}
