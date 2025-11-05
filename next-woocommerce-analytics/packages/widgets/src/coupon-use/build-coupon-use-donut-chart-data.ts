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

export interface CouponUseChartData {
	chartData: PieChartData;
	total: number;
	comparisonTotal: number;
	legendData: LegendItem[];
}

export function buildCouponUseDonutChartData(
	coupons: ReportDataMap[ 'coupons' ] | null | undefined,
	comparisonCoupons: ReportDataMap[ 'coupons' ] | null | undefined
): CouponUseChartData {
	if ( ! coupons?.summary ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: 0,
			legendData: [],
		};
	}

	const totalDiscount = coupons.summary.total_discount_amount;
	const totalSales = coupons.summary.total_sales;
	const salesWithoutDiscount = totalSales - totalDiscount;

	// Pick comparison totals
	const comparisonTotalSales = comparisonCoupons?.summary.total_sales || 0;

	// If there are no sales, we should show appropriate messaging
	if ( totalSales === 0 ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: comparisonTotalSales,
			legendData: [],
		};
	}

	// Pick comparison discount
	const comparisonTotalDiscount =
		comparisonCoupons?.summary.total_discount_amount || 0;

	return {
		chartData: [
			{
				label: '', // Hide labels in the chart, use legend instead
				value: totalDiscount,
				percentage:
					totalSales > 0 ? ( totalDiscount / totalSales ) * 100 : 0,
			},
			{
				label: '', // Hide labels in the chart, use legend instead
				value: salesWithoutDiscount,
				percentage:
					totalSales > 0
						? ( salesWithoutDiscount / totalSales ) * 100
						: 0,
				color: salesColor,
			},
		],
		legendData: [
			{
				label: __( 'Coupons', 'woocommerce-analytics' ),
				value: totalDiscount,
				formattedValue: formatMetricValue( totalDiscount, 'currency', {
					useMultipliers: true,
				} ),
				comparison: comparisonTotalDiscount,
			},
			{
				label: __( 'Total sales', 'woocommerce-analytics' ),
				value: totalSales,
				formattedValue: formatMetricValue( totalSales, 'currency', {
					useMultipliers: true,
				} ),
				comparison: comparisonTotalSales,
			},
		],
		total: totalSales > 0 ? totalDiscount / totalSales : 0,
		comparisonTotal:
			comparisonTotalSales > 0
				? comparisonTotalDiscount / comparisonTotalSales
				: 0,
	};
}
