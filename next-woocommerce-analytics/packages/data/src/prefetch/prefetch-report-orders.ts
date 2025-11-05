/**
 * Internal dependencies
 */
import { queryClient } from '../providers';
import {
	reportOrdersQuery,
	reportOrderAttributionSummaryQuery,
	reportCouponsQuery,
	reportCustomersQuery,
	reportVisitorsQuery,
} from '../queries';

type RequestReportParamsMap = {
	orders: Parameters< typeof reportOrdersQuery >[ 0 ];
	'order-attribution': Parameters<
		typeof reportOrderAttributionSummaryQuery
	>[ 0 ];
	coupons: Parameters< typeof reportCouponsQuery >[ 0 ];
	customers: Parameters< typeof reportCustomersQuery >[ 0 ];
	visitors: Parameters< typeof reportVisitorsQuery >[ 0 ];
};

export async function prefetchReport< T extends keyof RequestReportParamsMap >(
	reportType: T = 'orders' as T,
	params: RequestReportParamsMap[ T ]
) {
	switch ( reportType ) {
		case 'orders':
			return queryClient.ensureQueryData(
				reportOrdersQuery(
					params as RequestReportParamsMap[ 'orders' ]
				)
			);

		case 'order-attribution':
			return queryClient.ensureQueryData(
				reportOrderAttributionSummaryQuery(
					params as RequestReportParamsMap[ 'order-attribution' ]
				)
			);

		case 'coupons':
			return queryClient.ensureQueryData(
				reportCouponsQuery(
					params as RequestReportParamsMap[ 'coupons' ]
				)
			);

		case 'customers':
			return queryClient.ensureQueryData(
				reportCustomersQuery(
					params as RequestReportParamsMap[ 'customers' ]
				)
			);

		case 'visitors':
			return queryClient.ensureQueryData(
				reportVisitorsQuery(
					params as RequestReportParamsMap[ 'visitors' ]
				)
			);

		default:
			throw new Error( `Unsupported report type: ${ reportType }` );
	}
}
