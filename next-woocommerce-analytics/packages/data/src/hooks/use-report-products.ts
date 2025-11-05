/**
 * External dependencies
 */
import { useQuery } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import { reportProductsQuery } from '../queries/report-products-query';
import { hasComparisonEnabled, type ReportParams } from '../utils/search';

export function useReportProducts( params: ReportParams, limit = 5 ) {
	const comparisonEnabled = hasComparisonEnabled( params );
	const productsQuery = reportProductsQuery( {
		from: params.from,
		to: params.to,
		limit,
		filters: params.filters,
	} );
	const productsComparison = comparisonEnabled
		? reportProductsQuery( {
				from: params.compare_from,
				to: params.compare_to,
				limit,
				filters: params.filters,
		  } )
		: {
				queryKey: [
					'reports',
					'products',
					'__comparison__',
					'disabled',
				],
		  };

	const primary = useQuery( productsQuery );

	const comparison = useQuery( {
		...productsComparison,
		enabled: comparisonEnabled && ( productsComparison.enabled ?? true ),
	} );

	return {
		primary,
		comparison,
		hasComparison: comparisonEnabled,
		isLoading: primary.isLoading || comparison.isLoading,
		isFetching: primary.isFetching || comparison.isFetching,
		hasData:
			Boolean( primary.data?.items?.length ) ||
			Boolean( comparison.data?.items?.length ),
		hasPreviousData:
			Boolean( primary.dataUpdatedAt && primary.dataUpdatedAt > 0 ) ||
			Boolean( comparison.dataUpdatedAt && comparison.dataUpdatedAt > 0 ),
	};
}
