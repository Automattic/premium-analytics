/**
 * External dependencies
 */
import { type SeriesData } from '@automattic/charts';
import { type ReportDataMap } from '@next-woo-analytics/data';

/**
 * Internal dependencies
 */
import { buildTimeSeriesChartData } from '../shared/utils/build-time-series-chart-data';

type ReportsVisitorsByDateResponse = ReportDataMap[ 'visitors' ];

type BuildVisitorsLineChartSeriesProps = {
	visitors: ReportsVisitorsByDateResponse;
	comparison?: ReportsVisitorsByDateResponse;
	metricKey: 'visitors';
};

export function buildVisitorsLineChartSeries( {
	visitors,
	comparison,
	metricKey,
}: BuildVisitorsLineChartSeriesProps ): SeriesData[] {
	return buildTimeSeriesChartData( {
		primary: visitors,
		comparison,
		metricKey,
		emptyDataFallback: 'no-data-series',
	} );
}
