/**
 * External dependencies
 */
import { useQuery } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import { reportOrdersQuery } from '../queries';
import { hasComparisonEnabled, type ReportParams } from '../utils/search';

export function useReportOrders(
	params: ReportParams,
	hasProductFilters: boolean
) {
	const comparisonEnabled = hasComparisonEnabled( params );
	const ordersQuery = reportOrdersQuery(
		{
			from: params.from,
			to: params.to,
			interval: params.interval,
			filters: params.filters,
		},
		hasProductFilters
	);

	const ordersComparison = comparisonEnabled
		? reportOrdersQuery(
				{
					from: params.compare_from,
					to: params.compare_to,
					interval: params.interval,
					filters: params.filters,
				},
				hasProductFilters
		  )
		: {
				queryKey: [
					'reports',
					'orders',
					'by-date',
					'__comparison__',
					'disabled',
				],
		  };

	const primary = useQuery( ordersQuery );

	const comparison = useQuery( {
		...ordersComparison,
		enabled: comparisonEnabled && ( ordersComparison.enabled ?? true ),
	} );

	return {
		primary,
		comparison,
		hasComparison: comparisonEnabled,
		isLoading: primary.isLoading || comparison.isLoading,
		isFetching: primary.isFetching || comparison.isFetching,
		hasData:
			Boolean( primary.data?.summary ) ||
			Boolean( comparison.data?.summary ),
		hasPreviousData:
			Boolean( primary.dataUpdatedAt && primary.dataUpdatedAt > 0 ) ||
			Boolean( comparison.dataUpdatedAt && comparison.dataUpdatedAt > 0 ),
	};
}
