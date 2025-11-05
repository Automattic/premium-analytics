// Shared components (base widgets)
export * from './shared';

// Widget categories
export { OrdersOverTime, buildOrdersLineChartSeries } from './orders-over-time';
export { SalesByDevice } from './sales-by-device';
export { TotalReturns } from './total-returns';
export { SalesByUtm } from './sales-by-utm';
export { RevenueByCustomerType } from './revenue-by-customer-type';
export { ConversionRateWidget } from './conversion-rate-widget';
export { VisitorsByTime } from './visitors-by-time';
export { CouponUse } from './coupon-use';
export { SalesByCoupon } from './sales-by-coupon';
export { BookingsByAttendance } from './bookings-by-attendance';
export { TopPerformingProducts } from './top-performing-products';
export { WidgetsGrid } from './widgets-grid';
export {
	useProductTypeFilters,
	hasProductFilters,
} from './shared/utils/product-type-filters';
export type { ProductType } from './shared/utils/product-type-filters';

// Widget registry
export * from './widget-registry';
