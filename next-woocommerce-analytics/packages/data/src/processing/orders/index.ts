/**
 * Internal dependencies
 */
import { fetchReportOrders } from '../../api/report-orders-fetch';
import type { Override } from '../../utils/types';
import { safeParseFloat, safeParseInt } from '../../utils/parsing';

type ReportsOrdersByDateResponse = Awaited<
	ReturnType< typeof fetchReportOrders >
>;
type RawOrdersReportDataItem = ReportsOrdersByDateResponse[ 'data' ][ number ];
type SanitizedOrdersByDateItem = Override<
	RawOrdersReportDataItem,
	{
		average_order_value: number;
		avg_items: number;
		cogs_amount: number;
		coupons: number;
		orders_no: number;
		orders_value_gross: number;
		orders_value_net: number;
		product_net_revenue: number;
		profit_margin: number;
		refunds: number;
		total_sales: number;
	}
>;

/**
 * Sanitize/process a single order item by converting strings to numbers
 */
function sanitizeOrderItem(
	item: RawOrdersReportDataItem
): SanitizedOrdersByDateItem {
	return {
		...item,
		average_order_value: safeParseFloat( item.average_order_value ),
		avg_items: safeParseFloat( item.avg_items ),
		cogs_amount: safeParseFloat( item.cogs_amount ),
		coupons: safeParseInt( item.coupons ),
		orders_no: safeParseInt( item.orders_no ),
		orders_value_gross: safeParseFloat( item.orders_value_gross ),
		orders_value_net: safeParseFloat( item.orders_value_net ),
		product_net_revenue: safeParseFloat( item.product_net_revenue ),
		profit_margin: safeParseFloat( item.profit_margin ),
		refunds: safeParseFloat( item.refunds ),
		total_sales: safeParseFloat( item.total_sales ),
	};
}

/**
 * Processed response with numeric values
 */
type SanitizedOrdersByDateResponse = {
	summary: SanitizedOrdersByDateItem;
	data: SanitizedOrdersByDateItem[];
};

/**
 * Sanitize the response from the reports/orders/by-date endpoint
 * Converts string values to numbers for easier calculations and charting.
 *
 * The `summary` single item has basically the same structure
 * as the `data` array items, so we can use the same mapper function for both.
 */
export const sanitizeReportOrdersResponse = (
	response: ReportsOrdersByDateResponse
): SanitizedOrdersByDateResponse => {
	return {
		summary: sanitizeOrderItem( response.summary ),
		data: response.data.map( sanitizeOrderItem ),
	};
};
