/**
 * External dependencies
 */
import type { UseQueryOptions } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import {
	fetchReportOrderAttributionSummary,
	fetchReportOrderAttributionByProduct,
} from '../api';
import {
	sanitizeReportOrderAttributionSummaryResponse,
	normalizeOrderAttributionByProductResponse,
	type SanitizedOrderAttributionSummaryResponse,
} from '../processing/order-attribution';
import type { FilterCondition } from '../types/filter-condition';

type ReportOrderAttributionSummaryParams = Parameters<
	typeof fetchReportOrderAttributionSummary
>[ 0 ] & {
	filters?: FilterCondition[];
};

/**
 * Creates a query key for order attribution queries
 */
const getReportOrderAttributionQueryKey = (
	params: ReportOrderAttributionSummaryParams
) =>
	[
		'reports',
		'order-attribution',
		params.view,
		params.from,
		params.to,
		params.interval,
		params.compare_from,
		params.compare_to,
		params.filters,
	] as const;

/**
 * React Query configuration for order attribution summary data
 *
 * This function now supports both the regular order-attribution API and the new
 * order-attribution-by-product API. It automatically chooses the correct API based
 * on the presence of filters.
 *
 * Note:
 * - The regular API returns both primary and comparison data in a single response
 * - The new by-product API requires separate requests for comparison data
 */
export function reportOrderAttributionSummaryQuery(
	params: ReportOrderAttributionSummaryParams,
	hasProductFilters: boolean
): UseQueryOptions< SanitizedOrderAttributionSummaryResponse > {
	return {
		queryKey: getReportOrderAttributionQueryKey( params ),
		queryFn: async () => {
			// Determine which API to use based on filters
			if ( hasProductFilters ) {
				// Use the new API with product filtering support
				const { compare_from, compare_to } = params;

				// Fetch current period data
				const currentResponse =
					await fetchReportOrderAttributionByProduct( {
						from: params.from,
						to: params.to,
						interval: params.interval,
						view: params.view,
						filters: params.filters,
					} );

				// If comparison is needed, fetch previous period data
				let previousResponse;
				if (
					compare_from &&
					compare_to &&
					( compare_from !== params.from || compare_to !== params.to )
				) {
					previousResponse =
						await fetchReportOrderAttributionByProduct( {
							from: compare_from,
							to: compare_to,
							interval: params.interval,
							view: params.view,
							filters: params.filters,
						} );
				}

				// Normalize the response to match the existing structure
				const normalizedResponse =
					normalizeOrderAttributionByProductResponse(
						currentResponse,
						previousResponse
					);

				// Apply the same sanitization as the regular API
				return sanitizeReportOrderAttributionSummaryResponse(
					normalizedResponse
				);
			}
			// Use the regular API (existing behavior)
			const response = await fetchReportOrderAttributionSummary( params );
			return sanitizeReportOrderAttributionSummaryResponse( response );
		},
		enabled: !! (
			params.from &&
			params.to &&
			params.interval &&
			params.view
		),
	};
}
