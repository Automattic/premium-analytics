/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import type { BaseReportParams } from '../../utils/types';
import { reportsPath } from '../constants';

type CouponsDataItem = {
	coupon_code: string;
	discount_amount: string;
	total_sales: string;
	orders_count: string;
};

type CouponsDataSummary = {
	total_sales: string;
	total_discount_amount: string;
	total_orders: string;
	date_start: string;
	date_end: string;
};

export type ReportsCouponsResponse = {
	summary: CouponsDataSummary;
	items: CouponsDataItem[];
};

export type RequestReportCouponsParams = BaseReportParams;

export async function fetchReportCoupons( {
	from,
	to,
	interval,
	filters,
}: RequestReportCouponsParams ): Promise< ReportsCouponsResponse > {
	const path = addQueryArgs( `${ reportsPath }/coupons/`, {
		from,
		to,
		interval,
		filters,
	} );

	return apiFetch( { path } ) as Promise< ReportsCouponsResponse >;
}
