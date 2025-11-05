/**
 * External dependencies
 */
import { useQuery } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import { reportOrderAttributionSummaryQuery } from '../queries';
import { hasComparisonEnabled, type ReportParams } from '../utils/search';

export function useReportOrderAttribution(
	params: ReportParams,
	hasProductFilters: boolean
) {
	const comparisonEnabled = hasComparisonEnabled( params );

	/*
	 * Compare from and to are required for order attribution summary query.
	 * When they aren't provided, compute the `previous-month` range.
	 */
	const compareFrom = params.compare_from ?? params.from;
	const compareTo = params.compare_to ?? params.to;

	const orderAttributionQuery =
		params.view && params.from && params.to && params.interval
			? reportOrderAttributionSummaryQuery(
					{
						from: params.from,
						to: params.to,
						interval: params.interval,
						view: params.view,
						compare_from: compareFrom,
						compare_to: compareTo,
						filters: params.filters,
					},
					hasProductFilters
			  )
			: {
					queryKey: [
						'reports',
						'order-attribution',
						'__disabled__',
						'no-view-param',
					],
					enabled: false,
			  };

	const primary = useQuery( orderAttributionQuery );

	// Order attribution doesn't need separate comparison query
	const comparison = useQuery( {
		queryKey: [
			'reports',
			'order-attribution',
			'__comparison__',
			'included-in-primary',
		],
		enabled: false,
	} );

	return {
		primary,
		comparison,
		hasComparison: comparisonEnabled,
	};
}
