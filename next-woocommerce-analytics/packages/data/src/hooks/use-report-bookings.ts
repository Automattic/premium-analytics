/**
 * External dependencies
 */
import { useQuery } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import { reportBookingsQuery } from '../queries';
import { hasComparisonEnabled, type ReportParams } from '../utils/search';

export function useReportBookings( params: ReportParams ) {
	const comparisonEnabled = hasComparisonEnabled( params );
	const bookingsQuery = reportBookingsQuery( {
		from: params.from,
		to: params.to,
		interval: params.interval,
		filters: params.filters,
	} );

	const bookingsComparison = comparisonEnabled
		? reportBookingsQuery( {
				from: params.compare_from,
				to: params.compare_to,
				interval: params.interval,
				filters: params.filters,
		  } )
		: {
				queryKey: [
					'reports',
					'bookings',
					'by-date',
					'__comparison__',
					'disabled',
				],
		  };

	const primary = useQuery( bookingsQuery );

	const comparison = useQuery( {
		...bookingsComparison,
		enabled: comparisonEnabled && ( bookingsComparison.enabled ?? true ),
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
