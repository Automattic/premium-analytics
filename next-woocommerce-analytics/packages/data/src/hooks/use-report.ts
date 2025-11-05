/**
 * External dependencies
 */
import { useQuery } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import {
	reportOrdersQuery,
	reportCouponsQuery,
	reportOrderAttributionSummaryQuery,
} from '../queries';
import { hasComparisonEnabled, type ReportParams } from '../utils/search';
import type { ReportType } from '../types';

// @deprecated Use individual hooks instead: useReportOrders, useReportOrderAttribution, useReportCoupons
export function useReport< T extends ReportType >(
	reportType: T,
	params: ReportParams
) {
	const comparisonEnabled = hasComparisonEnabled( params );

	// ORDERS QUERIES - Always called, enabled conditionally
	const ordersQuery = reportOrdersQuery( {
		from: params.from,
		to: params.to,
		interval: params.interval,
	} );

	const ordersComparison = comparisonEnabled
		? reportOrdersQuery( {
				from: params.compare_from,
				to: params.compare_to,
				interval: params.interval,
		  } )
		: {
				queryKey: [
					'reports',
					'orders',
					'by-date',
					'__comparison__',
					'disabled',
				],
		  };

	const ordersPrimary = useQuery( {
		...ordersQuery,
		enabled: reportType === 'orders' && ordersQuery.enabled,
	} );

	const ordersComparisonQuery = useQuery( {
		...ordersComparison,
		enabled:
			reportType === 'orders' &&
			comparisonEnabled &&
			( ordersComparison.enabled ?? true ),
	} );

	// COUPONS QUERIES - Always called, enabled conditionally
	const couponsQuery = reportCouponsQuery( {
		from: params.from,
		to: params.to,
		interval: params.interval,
	} );

	const couponsComparison = comparisonEnabled
		? reportCouponsQuery( {
				from: params.compare_from,
				to: params.compare_to,
				interval: params.interval,
		  } )
		: {
				queryKey: [
					'reports',
					'coupons',
					'__comparison__',
					'disabled',
				],
		  };

	const couponsPrimary = useQuery( {
		...couponsQuery,
		enabled: reportType === 'coupons' && couponsQuery.enabled,
	} );

	const couponsComparisonQuery = useQuery( {
		...couponsComparison,
		enabled:
			reportType === 'coupons' &&
			comparisonEnabled &&
			( couponsComparison.enabled ?? true ),
	} );

	// ORDER ATTRIBUTION QUERIES - Always called, enabled conditionally
	// Note: Order attribution handles comparison internally in single request
	const orderAttributionQuery =
		params.view && params.from && params.to && params.interval
			? reportOrderAttributionSummaryQuery( {
					from: params.from,
					to: params.to,
					interval: params.interval,
					view: params.view,
					compare_from: params.compare_from,
					compare_to: params.compare_to,
			  } )
			: {
					queryKey: [
						'reports',
						'order-attribution',
						'__disabled__',
						'no-view-param',
					],
					enabled: false,
			  };

	const orderAttributionPrimary = useQuery( {
		...orderAttributionQuery,
		enabled:
			reportType === 'order-attribution' &&
			( orderAttributionQuery.enabled ?? false ),
	} );

	// Order attribution doesn't need separate comparison query
	const orderAttributionComparisonQuery = useQuery( {
		queryKey: [
			'reports',
			'order-attribution',
			'__comparison__',
			'included-in-primary',
		],
		enabled: false,
	} );

	// Return the appropriate queries based on reportType
	switch ( reportType ) {
		case 'orders':
			return {
				primary: ordersPrimary,
				comparison: ordersComparisonQuery,
				hasComparison: comparisonEnabled,
			};

		case 'coupons':
			return {
				primary: couponsPrimary,
				comparison: couponsComparisonQuery,
				hasComparison: comparisonEnabled,
			};

		case 'order-attribution':
			return {
				primary: orderAttributionPrimary,
				comparison: orderAttributionComparisonQuery,
				hasComparison: comparisonEnabled,
			};

		default:
			throw new Error( `Unsupported report type: ${ reportType }` );
	}
}
