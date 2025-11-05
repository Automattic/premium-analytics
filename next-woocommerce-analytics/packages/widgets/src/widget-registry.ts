/**
 * External dependencies
 */
import { ComponentProps, ComponentType } from 'react';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { OrdersOverTime } from './orders-over-time';
import { TotalReturns } from './total-returns';
import { SalesByDevice } from './sales-by-device';
import { SalesByUtm } from './sales-by-utm';
import { RevenueByCustomerType } from './revenue-by-customer-type';
import { ConversionRateWidget } from './conversion-rate-widget';
import { VisitorsByTime } from './visitors-by-time';
import { CouponUse } from './coupon-use';
import { SalesByCoupon } from './sales-by-coupon';
import { BookingsByAttendance } from './bookings-by-attendance';
import { TopPerformingProducts } from './top-performing-products';
import { BookingCancellationsOverTime } from './booking-cancellations-over-time';

export interface WidgetDefinition<
	TComponent extends ComponentType< any > = ComponentType< any >,
> {
	key: string;
	component: TComponent;
	title: string;
	description: string;
	category: string;
	props?: Partial< ComponentProps< TComponent > >;
}

export const WIDGET_REGISTRY: Record< string, WidgetDefinition > = {
	'net-sales': {
		key: 'net-sales',
		component: OrdersOverTime,
		title: __( 'Net sales over time', 'woocommerce-analytics' ),
		description: __(
			'Monitor your total revenue — after any discounts, returns, or adjustments — over a set period of time.',
			'woocommerce-analytics'
		),
		category: 'Finances',
		props: { metricKey: 'orders_value_net' },
	} satisfies WidgetDefinition< typeof OrdersOverTime >,
	'orders-over-time': {
		key: 'orders-over-time',
		component: OrdersOverTime,
		title: __( 'Orders over time', 'woocommerce-analytics' ),
		description: __(
			'See a breakdown of when orders are placed to identify peak selling periods.',
			'woocommerce-analytics'
		),
		category: 'Orders',
		props: { metricKey: 'orders_no' },
	} satisfies WidgetDefinition< typeof OrdersOverTime >,
	'conversion-rate': {
		key: 'conversion-rate',
		component: ConversionRateWidget,
		title: __( 'Store conversion rate', 'woocommerce-analytics' ),
		description: __(
			"Track your store's conversion funnel from sessions to completed orders.",
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: {},
	} satisfies WidgetDefinition< typeof ConversionRateWidget >,
	'avg-order-value': {
		key: 'avg-order-value',
		component: OrdersOverTime,
		title: __( 'Average order value', 'woocommerce-analytics' ),
		description: __(
			'Track the average value of each order over a set period of time.',
			'woocommerce-analytics'
		),
		category: 'Orders',
		props: { metricKey: 'average_order_value' },
	} satisfies WidgetDefinition< typeof OrdersOverTime >,
	'revenue-by-customer-type': {
		key: 'revenue-by-customer-type',
		component: RevenueByCustomerType,
		title: __( 'Revenue by customer type', 'woocommerce-analytics' ),
		description: __(
			'See the breakdown of revenue between new and returning customers over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: {},
	} satisfies WidgetDefinition< typeof RevenueByCustomerType >,
	'visitors-over-time': {
		key: 'visitors-over-time',
		component: VisitorsByTime,
		title: __( 'Visitors over time', 'woocommerce-analytics' ),
		description: __(
			'Track website visitor trends and monitor traffic patterns over time.',
			'woocommerce-analytics'
		),
		category: 'Visitors',
		props: { metricKey: 'visitors' },
	} satisfies WidgetDefinition< typeof VisitorsByTime >,
	'sales-by-utm-source': {
		key: 'sales-by-utm-source',
		component: SalesByUtm,
		title: __( 'Sales by source', 'woocommerce-analytics' ),
		description: __(
			'Physical goods sales grouped by traffic source over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Finances',
		props: { view: 'source' },
	} satisfies WidgetDefinition< typeof SalesByUtm >,
	'sales-by-utm-channel': {
		key: 'sales-by-utm-channel',
		component: SalesByUtm,
		title: __( 'Sales by channel', 'woocommerce-analytics' ),
		description: __(
			'Physical goods sales grouped by marketing channel source over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: { view: 'channel' },
	} satisfies WidgetDefinition< typeof SalesByUtm >,
	'top-performing-products': {
		key: 'top-performing-products',
		component: TopPerformingProducts,
		title: __( 'Top performing products', 'woocommerce-analytics' ),
		description: __(
			'Your best-selling products by revenue over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Products',
		props: { limit: 5, orderby: 'net_sales' },
	} satisfies WidgetDefinition< typeof TopPerformingProducts >,
	'avg-items': {
		key: 'avg-items',
		component: OrdersOverTime,
		title: __( 'Average items per order', 'woocommerce-analytics' ),
		description: __(
			'Show the average number of products per order over a set period of time.',
			'woocommerce-analytics'
		),
		category: 'Orders',
		props: { metricKey: 'avg_items' },
	} satisfies WidgetDefinition< typeof OrdersOverTime >,
	'sales-by-device': {
		key: 'sales-by-device',
		component: SalesByDevice,
		title: __( 'Sales by device', 'woocommerce-analytics' ),
		description: __(
			'See which devices your customers are using to make purchases in your store.',
			'woocommerce-analytics'
		),
		category: 'Finances',
		props: { view: 'device' },
	} satisfies WidgetDefinition< typeof SalesByDevice >,
	'gross-sales': {
		key: 'gross-sales',
		component: OrdersOverTime,
		title: __( 'Gross sales over time', 'woocommerce-analytics' ),
		description: __(
			'Monitor your total revenue — before any discounts, returns, or adjustments — over a set period of time.',
			'woocommerce-analytics'
		),
		category: 'Finances',
		props: { metricKey: 'orders_value_gross' },
	} satisfies WidgetDefinition< typeof OrdersOverTime >,
	'coupon-use': {
		key: 'coupon-use',
		component: CouponUse,
		title: __( 'Coupon use (% of sales)', 'woocommerce-analytics' ),
		description: __(
			'See the usage of coupons over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: {},
	} satisfies WidgetDefinition< typeof CouponUse >,
	'sales-by-coupon': {
		key: 'sales-by-coupon',
		component: SalesByCoupon,
		title: __( 'Sales by coupon', 'woocommerce-analytics' ),
		description: __(
			'Revenue from physical product sales using coupons over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: {},
	} satisfies WidgetDefinition< typeof SalesByCoupon >,
	coupons: {
		key: 'coupons',
		component: OrdersOverTime,
		title: __( 'Coupon usage over time', 'woocommerce-analytics' ),
		description: __(
			'Track how effective your discounts and promotions have been over a set period of time.',
			'woocommerce-analytics'
		),
		category: 'Finances',
		props: { metricKey: 'coupons' },
	} satisfies WidgetDefinition< typeof OrdersOverTime >,
	'profit-over-time': {
		key: 'profit-over-time',
		component: OrdersOverTime,
		title: __( 'Profit over time', 'woocommerce-analytics' ),
		description: __(
			'Monitor your total profit — after any costs, discounts, returns, or adjustments — over a set period of time.',
			'woocommerce-analytics'
		),
		category: 'Finances',
		props: { metricKey: 'profit_margin' },
	} satisfies WidgetDefinition< typeof OrdersOverTime >,
	'total-returns': {
		key: 'total-returns',
		component: TotalReturns,
		title: __( 'Returns', 'woocommerce-analytics' ),
		description: __(
			'Total value of returns issued for physical products over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Finances',
		props: {},
	} satisfies WidgetDefinition< typeof TotalReturns >,
	'sales-by-utm-campaign': {
		key: 'sales-by-utm-campaign',
		component: SalesByUtm,
		title: __( 'Sales by campaign', 'woocommerce-analytics' ),
		description: __(
			'Physical goods sales attributed to marketing or advertising campaigns over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: { view: 'campaign' },
	} satisfies WidgetDefinition< typeof SalesByUtm >,
	'bookings-over-time': {
		key: 'bookings-over-time',
		component: OrdersOverTime,
		title: __( 'Bookings over time', 'woocommerce-analytics' ),
		description: __(
			'See a breakdown of when bookings are placed to identify peak selling periods.',
			'woocommerce-analytics'
		),
		category: 'Bookings',
		props: { metricKey: 'orders_no' },
	} satisfies WidgetDefinition< typeof OrdersOverTime >,
	'avg-booking-value': {
		key: 'avg-booking-value',
		component: OrdersOverTime,
		title: __( 'Average booking value over time', 'woocommerce-analytics' ),
		description: __(
			'Track the average value of each booking over a set period of time.',
			'woocommerce-analytics'
		),
		category: 'Bookings',
		props: { metricKey: 'average_order_value' },
	} satisfies WidgetDefinition< typeof OrdersOverTime >,
	'top-performing-bookings': {
		key: 'top-performing-bookings',
		component: TopPerformingProducts,
		title: __( 'Top performing bookings', 'woocommerce-analytics' ),
		description: __(
			'Your best-selling bookings by revenue over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Bookings',
		props: { limit: 5, orderby: 'net_sales' },
	} satisfies WidgetDefinition< typeof TopPerformingProducts >,
	'net-booking-sales': {
		key: 'net-booking-sales',
		component: OrdersOverTime,
		title: __( 'Net bookings sales over time', 'woocommerce-analytics' ),
		description: __(
			'Monitor your total booking revenue — after any discounts, returns, or adjustments — over a set period of time.',
			'woocommerce-analytics'
		),
		category: 'Bookings',
		props: { metricKey: 'orders_value_net' },
	} satisfies WidgetDefinition< typeof OrdersOverTime >,
	'conversion-rate-bookings': {
		key: 'conversion-rate-bookings',
		component: ConversionRateWidget,
		title: __(
			'Store conversion rate - Bookings',
			'woocommerce-analytics'
		),
		description: __(
			"Track your store's conversion funnel from sessions to completed orders.",
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: {},
	} satisfies WidgetDefinition< typeof ConversionRateWidget >,
	'revenue-by-customer-type-bookings': {
		key: 'revenue-by-customer-type-bookings',
		component: RevenueByCustomerType,
		title: __(
			'Bookings revenue by customer type',
			'woocommerce-analytics'
		),
		description: __(
			'See the breakdown of revenue between new and returning customers over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: {},
	} satisfies WidgetDefinition< typeof RevenueByCustomerType >,
	'bookings-by-coupon': {
		key: 'bookings-by-coupon',
		component: SalesByCoupon,
		title: __( 'Bookings by coupon', 'woocommerce-analytics' ),
		description: __(
			'Revenue from bookings sales using coupons over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: {},
	} satisfies WidgetDefinition< typeof SalesByCoupon >,
	'booking-cancellations-over-time': {
		key: 'booking-cancellations-over-time',
		component: BookingCancellationsOverTime,
		title: __(
			'Bookings cancellations over time',
			'woocommerce-analytics'
		),
		description: __(
			'Track booking cancellation trends to identify when and how often bookings are being cancelled.',
			'woocommerce-analytics'
		),
		category: 'Bookings',
		props: {},
	} satisfies WidgetDefinition< typeof BookingCancellationsOverTime >,
	'total-returns-bookings': {
		key: 'total-returns-bookings',
		component: TotalReturns,
		title: __( 'Booking refunds over time', 'woocommerce-analytics' ),
		description: __(
			'Total value of refunds issued for bookings over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Finances',
		props: {},
	} satisfies WidgetDefinition< typeof TotalReturns >,
	'bookings-by-device': {
		key: 'bookings-by-device',
		component: SalesByDevice,
		title: __( 'Bookings by device', 'woocommerce-analytics' ),
		description: __(
			'See which devices your customers are using to make purchases in your store.',
			'woocommerce-analytics'
		),
		category: 'Finances',
		props: { view: 'device' },
	} satisfies WidgetDefinition< typeof SalesByDevice >,
	'bookings-by-utm-campaign': {
		key: 'bookings-by-utm-campaign',
		component: SalesByUtm,
		title: __( 'Bookings by campaign', 'woocommerce-analytics' ),
		description: __(
			'Booking sales attributed to marketing or advertising campaigns over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: { view: 'campaign' },
	} satisfies WidgetDefinition< typeof SalesByUtm >,
	'bookings-by-utm-source': {
		key: 'bookings-by-utm-source',
		component: SalesByUtm,
		title: __( 'Bookings by source', 'woocommerce-analytics' ),
		description: __(
			'Booking sales grouped by traffic source over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Finances',
		props: { view: 'source' },
	} satisfies WidgetDefinition< typeof SalesByUtm >,
	'bookings-by-utm-channel': {
		key: 'bookings-by-utm-channel',
		component: SalesByUtm,
		title: __( 'Bookings by channel', 'woocommerce-analytics' ),
		description: __(
			'Booking sales grouped by marketing channel source over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: { view: 'channel' },
	} satisfies WidgetDefinition< typeof SalesByUtm >,
	'bookings-by-attendance': {
		key: 'bookings-by-attendance',
		component: BookingsByAttendance,
		title: __( 'Bookings by Attendance', 'woocommerce-analytics' ),
		description: __(
			'Number of bookings by attendance over the selected time period.',
			'woocommerce-analytics'
		),
		category: 'Sales',
		props: {},
	} satisfies WidgetDefinition< typeof BookingsByAttendance >,
};

export const getWidgetDefinition = (
	key: string
): WidgetDefinition | undefined => {
	return WIDGET_REGISTRY[ key ];
};

export const getAllWidgetKeys = (): string[] => {
	return Object.keys( WIDGET_REGISTRY );
};

export const getWidgetsByCategory = (
	category: string
): WidgetDefinition[] => {
	return Object.values( WIDGET_REGISTRY ).filter(
		( widget ) => widget.category === category
	);
};
