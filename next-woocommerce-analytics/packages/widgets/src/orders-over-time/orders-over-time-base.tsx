/**
 * External dependencies
 */
import {
	MetricComparisonWidget,
	getFormatByMetricKey,
	type OrderMetricKey,
} from '@next-woo-analytics/widgets-toolkit';

/**
 * Internal dependencies
 */
import { buildOrdersLineChartSeries } from './build-orders-line-chart-series';
import { WidgetCard, useWidgetLoading } from '../shared';

export type OrdersOverTimeBaseProps = {
	primary: {
		data: any;
	};
	comparison: {
		data: any;
	};
	metricKey: OrderMetricKey;
	title: string;
	description?: string;
	linkTo?: string;
	isLoading: boolean;
	isFetching: boolean;
	hasData: boolean;
	hasPreviousData: boolean;
};

export function OrdersOverTimeBase( {
	primary,
	comparison,
	metricKey,
	title,
	description,
	linkTo,
	isLoading,
	isFetching,
	hasData,
	hasPreviousData,
}: OrdersOverTimeBaseProps ) {
	const { data: orders } = primary;
	const { data: comparisonOrders } = comparison;

	const loadingState = useWidgetLoading( {
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
	} );

	const orderSeries = buildOrdersLineChartSeries( {
		orders: orders || {},
		comparison: comparisonOrders || {},
		metricKey,
	} );

	return (
		<WidgetCard
			title={ title }
			linkTo={ linkTo }
			description={ description }
			loadingState={ loadingState }
		>
			<MetricComparisonWidget
				value={ orders?.summary?.[ metricKey ] ?? 0 }
				comparisonValue={
					comparisonOrders?.summary?.[ metricKey ] ?? null
				}
				series={ orderSeries }
				dataFormat={ getFormatByMetricKey( metricKey ) }
			/>
		</WidgetCard>
	);
}
