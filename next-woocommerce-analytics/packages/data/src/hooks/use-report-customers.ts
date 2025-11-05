/**
 * External dependencies
 */
import { useQuery } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import { reportCustomersQuery } from '../queries';
import { hasComparisonEnabled, type ReportParams } from '../utils/search';

export function useReportCustomers( params: ReportParams ) {
	const comparisonEnabled = hasComparisonEnabled( params );

	const customersQuery = reportCustomersQuery( {
		from: params.from,
		to: params.to,
		filters: params.filters,
	} );

	const customersComparison = comparisonEnabled
		? reportCustomersQuery( {
				from: params.compare_from,
				to: params.compare_to,
				filters: params.filters,
		  } )
		: {
				queryKey: [
					'reports',
					'customers',
					'new-returning',
					'__comparison__',
					'disabled',
				],
		  };

	const primary = useQuery( customersQuery );

	const comparison = useQuery( {
		...customersComparison,
		enabled: comparisonEnabled && ( customersComparison.enabled ?? true ),
	} );

	return {
		primary,
		comparison,
		hasComparison: comparisonEnabled,
	};
}
