/**
 * Internal dependencies
 */
import {
	sanitizeReportOrdersResponse,
	sanitizeReportProductsResponse,
} from './processing';
import { sanitizeReportCustomersResponse } from './processing/customers';
import { sanitizeReportOrderAttributionSummaryResponse } from './processing/order-attribution';
import { sanitizeReportCouponsResponse } from './processing/coupons';
import { sanitizeReportVisitorsResponse } from './processing/visitors';
import { sanitizeReportConversionRateResponse } from './processing/conversion-rate';
import { sanitizeReportOrdersByProductTypeResponse } from './processing/orders-by-product-type';
import { sanitizeReportBookingsResponse } from './processing/bookings';
import type { ReportParams } from './utils/search';

export type ReportType =
	| 'orders'
	| 'orders-by-product-type'
	| 'order-attribution'
	| 'coupons'
	| 'customers'
	| 'products'
	| 'visitors'
	| 'conversionRate'
	| 'bookings';

export type QueryParams = ReportParams & {
	p?: string; // encoded pathname
};

// Inferred from processing/orders.ts
type SanitizedOrdersByDateResponse = ReturnType<
	typeof sanitizeReportOrdersResponse
>;

// Inferred from processing/order-attribution.ts
type SanitizedOrderAttributionSummaryResponse = ReturnType<
	typeof sanitizeReportOrderAttributionSummaryResponse
>;

// Inferred from processing/coupons.ts
type SanitizedCouponsResponse = ReturnType<
	typeof sanitizeReportCouponsResponse
>;

// Inferred from processing/customers.ts
type SanitizedCustomersResponse = ReturnType<
	typeof sanitizeReportCustomersResponse
>;

// Inferred from processing/products.ts
type SanitizedProductsResponse = ReturnType<
	typeof sanitizeReportProductsResponse
>;

// Inferred from processing/visitors.ts
type SanitizedVisitorsResponse = ReturnType<
	typeof sanitizeReportVisitorsResponse
>;

// Inferred from processing/conversion-rate.ts
type SanitizedConversionRateResponse = ReturnType<
	typeof sanitizeReportConversionRateResponse
>;

// Inferred from processing/orders-by-product-type.ts
type SanitizedOrdersByProductTypeResponse = ReturnType<
	typeof sanitizeReportOrdersByProductTypeResponse
>;

// Inferred from processing/bookings.ts
type SanitizedBookingsResponse = ReturnType<
	typeof sanitizeReportBookingsResponse
>;

// Type mapping for report types to their PROCESSED data structures
export interface ReportDataMap {
	orders: SanitizedOrdersByDateResponse; // Returns processed data with numbers
	'orders-by-product-type': SanitizedOrdersByProductTypeResponse; // Returns processed orders by product type data with numbers
	'order-attribution': SanitizedOrderAttributionSummaryResponse; // Returns processed attribution data
	coupons: SanitizedCouponsResponse; // Returns processed coupons data with numbers
	customers: SanitizedCustomersResponse; // Returns processed customers data with numbers
	products: SanitizedProductsResponse; // Returns raw products data
	visitors: SanitizedVisitorsResponse; // Returns processed visitors data with numbers
	conversionRate: SanitizedConversionRateResponse; // Returns processed conversion rate data with numbers
	bookings: SanitizedBookingsResponse; // Returns processed bookings data with numbers
}
