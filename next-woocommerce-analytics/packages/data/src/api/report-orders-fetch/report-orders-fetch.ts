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
import type { FilterCondition } from '../../types/filter-condition';

type ReportsOrdersByDateSummary = {
	average_order_value: string;
	avg_items: string;
	cogs_amount: string;
	coupons: string;
	date_end: string;
	date_start: string;
	orders_no: string;
	orders_value_gross: string;
	orders_value_net: string;
	product_net_revenue: string;
	profit_margin: string;
	refunds: string;
	total_sales: string;
};

type OrdersReportDataItem = ReportsOrdersByDateSummary & {
	time_interval?: string;
};

export type ReportsOrdersByDateResponse = {
	data: OrdersReportDataItem[];
	summary: ReportsOrdersByDateSummary;
};

export type RequestReportOrdersParams = BaseReportParams & {
	filters?: FilterCondition[];
};

export async function fetchReportOrders(
	{ from, to, interval, filters }: RequestReportOrdersParams,
	hasProductFilters: boolean
): Promise< ReportsOrdersByDateResponse > {
	const apiUrl = hasProductFilters
		? `${ reportsPath }/orders-by-product-type/by-date`
		: `${ reportsPath }/orders/by-date`;

	const path = addQueryArgs( apiUrl, {
		from,
		to,
		interval,
		filters,
	} );

	return apiFetch( { path } ) as Promise< ReportsOrdersByDateResponse >;
}
