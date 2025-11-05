/**
 * External dependencies
 */
import type { UseQueryOptions } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import { fetchReportVisitors } from '../api';
import { sanitizeReportVisitorsResponse } from '../processing/visitors';
import type { ReportDataMap } from '../types';

type RequestReportVisitorsParams = Parameters<
	typeof fetchReportVisitors
>[ 0 ];

const getReportVisitorsQueryKey = ( p: RequestReportVisitorsParams ) =>
	[ 'reports', 'visitors', 'by-date', p.from, p.to, p.interval ] as const;

export function reportVisitorsQuery(
	params: RequestReportVisitorsParams
): UseQueryOptions< ReportDataMap[ 'visitors' ] > {
	return {
		queryKey: getReportVisitorsQueryKey( params ),
		queryFn: async () => {
			try {
				const response = await fetchReportVisitors( params );
				return sanitizeReportVisitorsResponse( response );
			} catch ( error ) {
				console.error( 'Failed to fetch visitors data:', error ); // eslint-disable-line no-console
				// Return empty data structure on error
				return sanitizeReportVisitorsResponse( {} as any );
			}
		},

		/**
		 * Enable the query only if the from, to, and interval are set.
		 */
		enabled: !! ( params.from && params.to && params.interval ),
	};
}
