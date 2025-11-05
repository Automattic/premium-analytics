/**
 * External dependencies
 */
import type { UseQueryOptions } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import { fetchReportCustomers } from '../api';
import { sanitizeReportCustomersResponse } from '../processing/customers';
import type { ReportDataMap } from '../types';

type RequestReportCustomersParams = Parameters<
	typeof fetchReportCustomers
>[ 0 ];

const getReportCustomersQueryKey = ( p: RequestReportCustomersParams ) =>
	[
		'reports',
		'customers',
		'new-returning',
		p.from,
		p.to,
		p.filters,
	] as const;

export function reportCustomersQuery(
	params: RequestReportCustomersParams
): UseQueryOptions< ReportDataMap[ 'customers' ] > {
	return {
		queryKey: getReportCustomersQueryKey( params ),
		queryFn: async () => {
			const response = await fetchReportCustomers( params );
			return sanitizeReportCustomersResponse( response );
		},

		/**
		 * Enable the query only if the from and to are set.
		 * Note: interval is not required for customers endpoint.
		 */
		enabled: !! ( params.from && params.to ),
	};
}
