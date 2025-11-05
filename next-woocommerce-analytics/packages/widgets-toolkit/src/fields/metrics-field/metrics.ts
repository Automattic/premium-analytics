/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { buildOrdersLineChartSeries } from '@next-woo-analytics/widgets';
import { FilterCondition } from '@next-woo-analytics/data';

/**
 * Internal dependencies
 */
export type MetricType = Parameters<
	typeof buildOrdersLineChartSeries
>[ 0 ][ 'metricKey' ];

export type Metric = {
	id: string;
	label: string;
	description?: string;
	category?: 'Finances' | 'Orders' | 'Sales' | 'Inventory';
	metricType: 'general' | 'product' | 'booking';
	metricKey: MetricType;
	filters?: FilterCondition[];
	enabled: boolean;
};

const METRIC_NET_SALES: Metric = {
	id: 'general-orders_value_net',
	label: __( 'Net sales', 'woocommerce-analytics' ),
	description: __(
		'Monitor your total revenue — after any discounts, returns, or adjustments — over a set period of time.',
		'woocommerce-analytics'
	),
	category: 'Finances',
	metricType: 'general',
	metricKey: 'orders_value_net',
	enabled: true,
};

const METRIC_ORDERS: Metric = {
	id: 'general-orders_no',
	label: __( 'Orders', 'woocommerce-analytics' ),
	description: __(
		'See a breakdown of when orders are placed to identify peak selling periods.',
		'woocommerce-analytics'
	),
	category: 'Orders',
	metricType: 'general',
	metricKey: 'orders_no',
	enabled: true,
};

const METRIC_BOOKINGS: Metric = {
	id: 'booking-orders_no',
	label: __( 'Bookings', 'woocommerce-analytics' ),
	description: __(
		'See a breakdown of when bookings are placed to identify peak selling periods.',
		'woocommerce-analytics'
	),
	category: 'Orders',
	metricKey: 'orders_no',
	metricType: 'booking',
	filters: [
		{
			compare: 'IN',
			key: 'product_type',
			value: [ 'booking', 'bookable-event', 'bookable-service' ],
		},
	],
	enabled: true,
};

export const DEFAULT_METRICS = [
	METRIC_NET_SALES,
	METRIC_ORDERS,
	METRIC_BOOKINGS,
];
