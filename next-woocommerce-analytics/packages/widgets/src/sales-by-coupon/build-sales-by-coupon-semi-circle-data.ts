/**
 * External dependencies
 */
import type { ComponentProps } from 'react';
import { PieSemiCircleChartUnresponsive as PieSemiCircleChart } from '@automattic/charts';
import type { ReportDataMap } from '@next-woo-analytics/data';
import { formatMetricValue } from '@next-woo-analytics/formatters';

/**
 * Internal dependencies
 */
import type { LegendItem } from '../shared';

/**
 * Derive the chart data type from PieSemiCircleChart's expected data structure
 */
type PieChartData = ComponentProps< typeof PieSemiCircleChart >[ 'data' ];

export interface SalesByCouponChartData {
	chartData: PieChartData;
	total: number;
	comparisonTotal: number;
	legendData: LegendItem[];
}

export function buildSalesByCouponSemiCircleData(
	coupons: ReportDataMap[ 'coupons' ] | undefined,
	comparisonCoupons: ReportDataMap[ 'coupons' ] | undefined,
	totalSegments = 3
): SalesByCouponChartData {
	if ( ! coupons?.summary ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: 0,
			legendData: [],
		};
	}

	const { items, summary } = coupons;
	const totalDiscount = summary.total_discount_amount;
	const comparisonTotalDiscount =
		comparisonCoupons?.summary?.total_discount_amount || 0;

	// If there are no discounts, return empty state
	if ( totalDiscount === 0 ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: comparisonTotalDiscount,
			legendData: [],
		};
	}

	// Create a map of comparison data by coupon code
	const comparisonMap = new Map< string, number >();
	if ( comparisonCoupons ) {
		comparisonCoupons.items.forEach( ( item ) => {
			comparisonMap.set( item.coupon_code, item.discount_amount );
		} );
	}

	// Process coupons and limit to totalSegments
	const topCoupons = items.slice( 0, totalSegments );

	// Build chart data
	const chartData: PieChartData = topCoupons.map( ( item ) => ( {
		label: item.coupon_code,
		key: item.coupon_code,
		value: item.discount_amount,
		percentage:
			totalDiscount > 0
				? ( item.discount_amount / totalDiscount ) * 100
				: 0,
	} ) );

	// Build legend data
	const legendData: LegendItem[] = topCoupons.map( ( item ) => {
		const comparisonValue = comparisonCoupons
			? comparisonMap.get( item.coupon_code ) || 0
			: undefined;

		return {
			label: item.coupon_code,
			value: item.discount_amount,
			formattedValue: formatMetricValue(
				item.discount_amount,
				'currency',
				{
					useMultipliers: true,
					decimals: 0,
				}
			),
			comparison: comparisonValue,
		};
	} );

	// Add "Other" segment if there are more coupons than shown
	if ( items.length > totalSegments ) {
		const otherDiscount = items
			.slice( totalSegments )
			.reduce( ( sum, item ) => sum + item.discount_amount, 0 );

		const otherComparison = comparisonCoupons
			? comparisonCoupons.items
					.slice( totalSegments )
					.reduce( ( sum, item ) => sum + item.discount_amount, 0 )
			: undefined;

		chartData.push( {
			label: '',
			value: otherDiscount,
			percentage:
				totalDiscount > 0 ? ( otherDiscount / totalDiscount ) * 100 : 0,
		} );

		legendData.push( {
			label: 'Other',
			value: otherDiscount,
			formattedValue: formatMetricValue( otherDiscount, 'currency', {
				useMultipliers: true,
				decimals: 0,
			} ),
			comparison: otherComparison,
		} );
	}

	return {
		chartData,
		total: totalDiscount,
		comparisonTotal: comparisonTotalDiscount,
		legendData,
	};
}
