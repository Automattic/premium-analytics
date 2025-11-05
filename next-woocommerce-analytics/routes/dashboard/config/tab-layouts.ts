/**
 * External dependencies
 */
import { type GridLayoutItem } from '@automattic/grid';
import { ProductType } from '@next-woo-analytics/widgets';

/**
 * Tab-specific default layouts configuration
 */
export const TAB_LAYOUTS: Record< ProductType, GridLayoutItem[] > = {
	general: [
		{ key: 'net-sales', width: 1, height: 1 },
		{ key: 'conversion-rate', width: 1, height: 1 },
		{ key: 'avg-order-value', width: 1, height: 1 },
		{ key: 'revenue-by-customer-type', width: 1, height: 1 },
		{ key: 'profit-over-time', width: 1, height: 1 },
		{ key: 'visitors-over-time', width: 1, height: 1 },
		{ key: 'sales-by-utm-source', width: 1, height: 1 },
		{ key: 'sales-by-utm-channel', width: 1, height: 1 },
		{ key: 'top-performing-products', width: 1, height: 1 },
		{ key: 'sales-by-device', width: 1, height: 1 },
		{ key: 'gross-sales', width: 1, height: 1 },
		{ key: 'sales-by-utm-campaign', width: 1, height: 1 },
	],
	products: [
		{ key: 'net-sales', width: 1, height: 1 },
		{ key: 'orders-over-time', width: 1, height: 1 },
		{ key: 'gross-sales', width: 1, height: 1 },
		{ key: 'avg-order-value', width: 1, height: 1 },
		{ key: 'avg-items', width: 1, height: 1 },
		{ key: 'conversion-rate', width: 1, height: 1 },
		{ key: 'revenue-by-customer-type', width: 1, height: 1 },
		{ key: 'coupons', width: 1, height: 1 },
		{ key: 'top-performing-products', width: 1, height: 1 },
		{ key: 'total-returns', width: 1, height: 1 },
		{ key: 'sales-by-coupon', width: 1, height: 1 },
		{ key: 'coupon-use', width: 1, height: 1 },
		{ key: 'sales-by-device', width: 1, height: 1 },
		{ key: 'sales-by-utm-campaign', width: 1, height: 1 },
		{ key: 'sales-by-utm-source', width: 1, height: 1 },
		{ key: 'sales-by-utm-channel', width: 1, height: 1 },
	],
	bookings: [
		{ key: 'net-booking-sales', width: 1, height: 1 },
		{ key: 'bookings-over-time', width: 1, height: 1 },
		{ key: 'conversion-rate-bookings', width: 1, height: 1 },
		{ key: 'booking-cancellations-over-time', width: 1, height: 1 },
		{ key: 'avg-booking-value', width: 1, height: 1 },
		{ key: 'total-returns-bookings', width: 1, height: 1 },
		{ key: 'revenue-by-customer-type-bookings', width: 1, height: 1 },
		{ key: 'bookings-by-attendance', width: 1, height: 1 },
		{ key: 'top-performing-bookings', width: 1, height: 1 },
		{ key: 'bookings-by-coupon', width: 1, height: 1 },
		{ key: 'bookings-by-device', width: 1, height: 1 },
		{ key: 'bookings-by-utm-campaign', width: 1, height: 1 },
		{ key: 'bookings-by-utm-source', width: 1, height: 1 },
		{ key: 'bookings-by-utm-channel', width: 1, height: 1 },
	],
};

/**
 * Get the default layout for a specific tab
 * @param tabId - The tab identifier
 * @return The default layout for the tab, or general layout as fallback
 */
export const getDefaultLayoutForTab = (
	tabId: ProductType
): GridLayoutItem[] => {
	return TAB_LAYOUTS[ tabId ] || TAB_LAYOUTS.general;
};

/**
 * Get all available tab IDs
 * @return Array of tab IDs that have defined layouts
 */
export const getAvailableTabIds = (): string[] => {
	return Object.keys( TAB_LAYOUTS );
};

/**
 * Check if a tab has a defined layout
 * @param tabId - The tab identifier to check
 * @return Whether the tab has a defined layout
 */
export const hasTabLayout = ( tabId: string ): boolean => {
	return tabId in TAB_LAYOUTS;
};
