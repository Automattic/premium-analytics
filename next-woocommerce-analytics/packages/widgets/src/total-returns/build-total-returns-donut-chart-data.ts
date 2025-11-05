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
import { COLOR_GRAY_100 as salesColor } from '../shared/chart-theme';

/**
 * Derive the chart data type from PieChart's expected data structure
 */
type PieChartData = ComponentProps< typeof PieChart >[ 'data' ];

export interface TotalReturnsChartData {
	chartData: PieChartData;
	total: number;
	comparisonTotal: number;
	legendData: LegendItem[];
}

export function buildTotalReturnsDonutChartData(
	orders: ReportDataMap[ 'orders' ] | null | undefined,
	comparisonOrders: ReportDataMap[ 'orders' ] | null | undefined
): TotalReturnsChartData {
	if ( ! orders?.data ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: 0,
			legendData: [],
		};
	}

	const refundsAmount = orders.summary.refunds;
	const totalSales = orders.summary.total_sales;

	// Calculate comparison totals
	const comparisonTotalRefunds = comparisonOrders?.summary.refunds || 0;

	// For the donut chart, we want to show refunds vs remaining sales
	// But if there are no refunds or sales, we should show appropriate messaging
	if ( totalSales === 0 ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: comparisonTotalRefunds,
			legendData: [],
		};
	}

	// Create donut chart data showing refunds vs remaining sales
	const salesAmount = Math.max( 0, totalSales - refundsAmount ); // Net sales

	// Calculate comparison values
	const comparisonTotalSales = comparisonOrders?.summary.total_sales || 0;
	const comparisonSalesAmount = Math.max(
		0,
		comparisonTotalSales - comparisonTotalRefunds
	);

	const chartData: PieChartData = [
		{
			label: '', // Hide labels in the chart, use legend instead
			value: refundsAmount,
			percentage:
				totalSales > 0 ? ( refundsAmount / totalSales ) * 100 : 0,
		},
		{
			label: '', // Hide labels in the chart, use legend instead
			value: salesAmount,
			percentage: totalSales > 0 ? ( salesAmount / totalSales ) * 100 : 0,
			color: salesColor,
		},
	];
	const legendData: LegendItem[] = [
		{
			label: __( 'Refunds', 'woocommerce-analytics' ),
			value: refundsAmount,
			formattedValue: formatMetricValue( refundsAmount, 'currency', {
				useMultipliers: true,
			} ),
			comparison: comparisonTotalRefunds,
		},
		{
			label: __( 'Total sales', 'woocommerce-analytics' ),
			value: salesAmount,
			formattedValue: formatMetricValue( salesAmount, 'currency', {
				useMultipliers: true,
			} ),
			comparison: comparisonSalesAmount,
		},
	];

	// If we only have refunds (unusual case), we should show only refunds
	if ( refundsAmount > 0 && salesAmount === 0 ) {
		chartData[ 0 ].percentage = 100;
		chartData.splice( 1, 1 );
	} else if ( refundsAmount === 0 && totalSales > 0 ) {
		chartData[ 1 ].percentage = 100;
		chartData.splice( 0, 1 );
	}

	return {
		chartData,
		total: refundsAmount, // The main metric we're tracking
		comparisonTotal: comparisonTotalRefunds,
		legendData,
	};
}
