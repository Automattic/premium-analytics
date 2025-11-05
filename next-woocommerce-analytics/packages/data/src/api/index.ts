/**
 * Internal dependencies
 */
import type { RequestReportOrdersParams } from './report-orders-fetch';
import type { RequestReportOrderAttributionSummaryParams } from './report-order-attribution-summary-fetch';
import type { RequestReportOrderAttributionByProductParams } from './report-order-attribution-by-product-fetch';
import type { RequestReportCouponsParams } from './report-coupons-fetch';
import type { RequestReportCustomersParams } from './report-customers-fetch';
import type { RequestReportProductsParams } from './report-products-fetch';
import type { RequestReportVisitorsParams } from './report-visitors-fetch';
import type { RequestReportBookingsParams } from './report-bookings-fetch';

export type ReportQueryParams = Partial<
	RequestReportOrdersParams &
		RequestReportOrderAttributionSummaryParams &
		RequestReportOrderAttributionByProductParams &
		RequestReportCouponsParams &
		RequestReportCustomersParams &
		RequestReportProductsParams &
		RequestReportVisitorsParams &
		RequestReportBookingsParams
>;

export { fetchReportOrders } from './report-orders-fetch';
export {
	fetchReportOrderAttributionSummary,
	ORDER_ATTRIBUTION_VIEWS,
} from './report-order-attribution-summary-fetch';
export { fetchReportOrderAttributionByProduct } from './report-order-attribution-by-product-fetch';
export { fetchReportCoupons } from './report-coupons-fetch';
export { fetchReportCustomers } from './report-customers-fetch';
export { fetchReportProducts } from './report-products-fetch';
export { fetchReportVisitors } from './report-visitors-fetch';
export { fetchReportBookings } from './report-bookings-fetch';
