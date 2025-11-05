/**
 * External dependencies
 */
import {
	normalizeReportParams,
	useReportOrders,
	AnalyticsQueryClientProvider,
} from '@next-woo-analytics/data';
import {
	buildOrdersLineChartSeries,
	chartTheme,
} from '@next-woo-analytics/widgets';
import {
	MetricComparisonWidget,
	type ReportParamsFieldAttributes,
	getFormatByMetricKey,
} from '@next-woo-analytics/widgets-toolkit';
import { GlobalChartsProvider } from '@automattic/charts';
import '@automattic/charts/style.css';

type OrdersOverTimeRenderProps = {
	attributes: ReportParamsFieldAttributes;
};

function OrdersOverTimeContent( { attributes }: OrdersOverTimeRenderProps ) {
	const metricKey = 'orders_no';
	const normalized = normalizeReportParams( attributes.reportParams );

	const { primary, comparison } = useReportOrders( normalized, false );

	if ( ! primary.data ) {
		return null;
	}

	const series = buildOrdersLineChartSeries( {
		orders: primary.data,
		comparison: comparison.data,
		metricKey,
	} );

	return (
		<MetricComparisonWidget
			value={ primary.data.summary[ metricKey ] }
			comparisonValue={ comparison.data?.summary[ metricKey ] }
			series={ series }
			dataFormat={ getFormatByMetricKey( metricKey ) }
		/>
	);
}

export default function OrdersOverTimeRender( {
	attributes,
}: OrdersOverTimeRenderProps ) {
	return (
		<AnalyticsQueryClientProvider>
			<GlobalChartsProvider theme={ chartTheme }>
				<OrdersOverTimeContent attributes={ attributes } />
			</GlobalChartsProvider>
		</AnalyticsQueryClientProvider>
	);
}
