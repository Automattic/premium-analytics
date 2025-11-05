/**
 * External dependencies
 */
import type { ComponentProps } from 'react';
import { PieChartUnresponsive as PieChart } from '@automattic/charts';
import { __ } from '@wordpress/i18n';
import type { ReportDataMap } from '@next-woo-analytics/data';
import { formatMetricValue } from '@next-woo-analytics/formatters';

/**
 * Internal dependencies
 */
import type { LegendItem } from '../shared';

/**
 * Derive the chart data type from PieChart's expected data structure
 */
type PieChartData = ComponentProps< typeof PieChart >[ 'data' ];

export interface RevenueByCustomerTypeChartData {
	chartData: PieChartData;
	total: number;
	comparisonTotal: number;
	legendData: LegendItem[];
}

export function buildRevenueByCustomerTypeDonutChartData(
	customers: ReportDataMap[ 'customers' ] | null | undefined,
	comparisonCustomers: ReportDataMap[ 'customers' ] | null | undefined
): RevenueByCustomerTypeChartData {
	if ( ! customers?.summary ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: 0,
			legendData: [],
		};
	}

	const newCustomerSales = customers.summary.new_customer_sales;
	const returningCustomerSales = customers.summary.returning_customer_sales;
	const totalSales = customers.summary.total_net_sales;

	// Calculate comparison totals
	const comparisonTotalSales =
		comparisonCustomers?.summary.total_net_sales || 0;

	// For the donut chart, we want to show new vs returning customer sales
	// But if there are no sales, we should show appropriate messaging
	if ( totalSales === 0 ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: comparisonTotalSales,
			legendData: [],
		};
	}

	// Calculate comparison values
	const comparisonNewCustomerSales =
		comparisonCustomers?.summary.new_customer_sales || 0;
	const comparisonReturningCustomerSales =
		comparisonCustomers?.summary.returning_customer_sales || 0;

	return {
		chartData: [
			{
				label: '', // Hide labels in the chart, use legend instead
				value: newCustomerSales,
				percentage:
					totalSales > 0
						? ( newCustomerSales / totalSales ) * 100
						: 0,
			},
			{
				label: '', // Hide labels in the chart, use legend instead
				value: returningCustomerSales,
				percentage:
					totalSales > 0
						? ( returningCustomerSales / totalSales ) * 100
						: 0,
			},
		],
		// TODO: This should be a temporary solution for legend configuration,
		// we should be able to use the internal donut chart legend configuration with theming
		legendData: [
			{
				label: __( 'New', 'woocommerce-analytics' ),
				value: newCustomerSales,
				formattedValue: formatMetricValue(
					newCustomerSales,
					'currency',
					{
						useMultipliers: true,
					}
				),
				comparison: comparisonNewCustomerSales,
			},
			{
				label: __( 'Returning', 'woocommerce-analytics' ),
				value: returningCustomerSales,
				formattedValue: formatMetricValue(
					returningCustomerSales,
					'currency',
					{
						useMultipliers: true,
					}
				),
				comparison: comparisonReturningCustomerSales,
			},
		],
		total: totalSales, // The main metric we're tracking
		comparisonTotal: comparisonTotalSales,
	};
}
