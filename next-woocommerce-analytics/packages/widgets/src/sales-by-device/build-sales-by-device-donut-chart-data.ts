/**
 * External dependencies
 */
import { formatMetricValue } from '@next-woo-analytics/formatters';
import type { ComponentProps } from 'react';
import type { PieChartUnresponsive as PieChart } from '@automattic/charts';
import { useReportOrderAttribution } from '@next-woo-analytics/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { LegendItem } from '../shared';

// Derive the chart data type from PieChart's expected data structure
type PieChartData = ComponentProps< typeof PieChart >[ 'data' ];

// Extract the data type from the hook's return type
type OrderAttributionData = NonNullable<
	ReturnType< typeof useReportOrderAttribution >[ 'primary' ][ 'data' ]
>;

type BuildSalesByDeviceDonutChartDataProps = {
	orderAttribution: OrderAttributionData;
	useComparison?: boolean;
};

type DonutChartResult = {
	chartData: PieChartData;
	total: number;
	comparisonTotal: number;
	legendData: LegendItem[];
};

/**
 * Map order attribution items to donut chart data
 *
 * @param data          - The order attribution data items
 * @param useComparison - Whether to use comparison period data
 * @return Processed donut chart data
 */
function mapAttributionToDonutData(
	data: OrderAttributionData[ 'data' ],
	useComparison = false
): DonutChartResult {
	if ( ! data || data.length === 0 ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: 0,
			legendData: [],
		};
	}

	// Calculate totals
	const total = data.reduce(
		( acc, item ) => acc + item.current_period.value,
		0
	);

	const comparisonTotal = useComparison
		? data.reduce( ( acc, item ) => acc + item.previous_period.value, 0 )
		: 0;

	// Build chart data from current period
	const chartData: PieChartData = data.map( ( item ) => ( {
		label: '', // TODO: use `item.item || ''` when we have to option to hide labels in the chart.
		value: item.current_period.value,
		formattedValue: formatMetricValue(
			item.current_period.value,
			'currency',
			{ useMultipliers: true }
		),
		percentage: total > 0 ? ( item.current_period.value / total ) * 100 : 0,
	} ) );

	// Build legend data
	const legendData: LegendItem[] = data.map( ( item ) => ( {
		label: item.item || __( 'Unassigned', 'woocommerce-analytics' ),
		value: item.current_period.value,
		formattedValue: formatMetricValue(
			item.current_period.value,
			'currency',
			{ useMultipliers: true }
		),
		comparison: useComparison ? item.previous_period.value : undefined,
	} ) );

	return {
		chartData,
		total,
		comparisonTotal,
		legendData,
	};
}

/**
 * Build donut chart data from order attribution response
 * Following the same pattern as buildOrdersLineChartSeries
 *
 * @param props                  - Order attribution data and configuration
 * @param props.orderAttribution - Order attribution data from API
 * @param props.useComparison    - Whether to include comparison data
 * @return Processed data ready for DonutChart component
 */
export function buildSalesByDeviceDonutChartData( {
	orderAttribution,
	useComparison = false,
}: BuildSalesByDeviceDonutChartDataProps ): DonutChartResult {
	if ( ! orderAttribution?.data ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: 0,
			legendData: [],
		};
	}

	return mapAttributionToDonutData( orderAttribution.data, useComparison );
}
