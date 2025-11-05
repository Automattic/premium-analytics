/**
 * Available metrics for export
 */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export interface MetricDefinition {
	key: string;
	label: string;
	reportKey: string;
}

/**
 * List of all available metrics that can be exported from the dashboard
 */
export const AVAILABLE_METRICS: MetricDefinition[] = [
	{
		key: 'orders',
		label: __( 'Orders', 'woocommerce-analytics' ),
		reportKey: 'ordersovertime',
	},
	{
		key: 'gross-sales',
		label: __( 'Gross sales', 'woocommerce-analytics' ),
		reportKey: 'grosssalesovertime',
	},
	{
		key: 'net-sales',
		label: __( 'Net sales', 'woocommerce-analytics' ),
		reportKey: 'netsalesovertime',
	},
	{
		key: 'conversion-rate',
		label: __( 'Conversion rate', 'woocommerce-analytics' ),
		reportKey: 'conversionrateovertime',
	},
	{
		key: 'visitors',
		label: __( 'Visitors', 'woocommerce-analytics' ),
		reportKey: 'visitorsovertime',
	},
	{
		key: 'average-order-value',
		label: __( 'Average order value', 'woocommerce-analytics' ),
		reportKey: 'averageordervalue',
	},
	{
		key: 'average-items-per-order',
		label: __( 'Average items per order', 'woocommerce-analytics' ),
		reportKey: 'averageitemsperorder',
	},
	{
		key: 'top-performing-products',
		label: __( 'Top performing products', 'woocommerce-analytics' ),
		reportKey: 'topperformingproducts',
	},
	{
		key: 'sales-by-campaign',
		label: __( 'Sales by campaign', 'woocommerce-analytics' ),
		reportKey: 'salesbycampaign',
	},
	{
		key: 'sales-by-channel',
		label: __( 'Sales by channel', 'woocommerce-analytics' ),
		reportKey: 'salesbychannel',
	},
	{
		key: 'sales-by-source',
		label: __( 'Sales by source', 'woocommerce-analytics' ),
		reportKey: 'salesbysource',
	},
	{
		key: 'sales-by-device',
		label: __( 'Sales by device', 'woocommerce-analytics' ),
		reportKey: 'salesbydevice',
	},
	{
		key: 'sales-by-coupon',
		label: __( 'Sales by coupon', 'woocommerce-analytics' ),
		reportKey: 'salesbycoupon',
	},
];

/**
 * Map of metric keys to their corresponding report keys
 */
export const METRIC_TO_REPORT_KEY = AVAILABLE_METRICS.reduce(
	( acc, metric ) => {
		acc[ metric.key ] = metric.reportKey;
		return acc;
	},
	{} as Record< string, string >
);
