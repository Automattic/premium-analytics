<?php
/**
 * REST API Reports Sales by Channel controller class.
 *
 * @package Automattic\WooCommerce\Analytics\API\Reports\Exports
 */

declare( strict_types=1 );

namespace Automattic\WooCommerce\Analytics\API\Reports\Exports;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Analytics\API\Reports\CSVExport\AbstractCSVReportController;

/**
 * Sales by Channel CSV Export Controller.
 *
 * Handles CSV exports for the Sales by Channel report (order attribution data).
 * Note: This is a ranked list report, not a time-series report,
 * so it does not support comparison mode.
 *
 * @since x.x.x
 * @internal
 */
class SalesByChannelController extends AbstractCSVReportController {

	/**
	 * Get the report key for this controller.
	 *
	 * @return string The report key.
	 */
	public function get_report_key(): string {
		return 'salesbychannel';
	}

	/**
	 * Get the report label for this controller.
	 *
	 * @return string The report label.
	 */
	public function get_report_label(): string {
		return __( 'Sales by Channel', 'woocommerce-analytics' );
	}

	/**
	 * Get the data endpoint for this controller.
	 *
	 * @return string The data endpoint.
	 */
	public function get_data_endpoint(): string {
		return 'reports/order-attribution/channel/items';
	}

	/**
	 * Get the column headers for this controller.
	 *
	 * @param string|null $interval Optional time interval for dynamic headers.
	 * @return array The column headers.
	 */
	public function get_column_headers( ?string $interval = null ): array {
		return array(
			'channel'             => __( 'Channel', 'woocommerce-analytics' ),
			'gross_sales'         => __( 'Gross sales', 'woocommerce-analytics' ),
			'coupons'             => __( 'Coupons', 'woocommerce-analytics' ),
			'refunds'             => __( 'Refunds', 'woocommerce-analytics' ),
			'net_sales'           => __( 'Net sales', 'woocommerce-analytics' ),
			'new_customers'       => __( 'New customers', 'woocommerce-analytics' ),
			'returning_customers' => __( 'Returning customers', 'woocommerce-analytics' ),
			'avg_order_value'     => __( 'Average Order Value', 'woocommerce-analytics' ),
			'avg_items_per_order' => __( 'Avg Items per order', 'woocommerce-analytics' ),
		);
	}

	/**
	 * Format a row for CSV export.
	 *
	 * @param array $item The row data.
	 * @return array The formatted row.
	 */
	public function format_row_for_csv( array $item ): array {
		// Skip rows where channel is empty.
		if ( empty( $item['channel'] ) ) {
			return array();
		}

		$defaults = $this->get_default_values();

		$returning_customers = ( $item['total_customers'] ?? $defaults['total_customers'] ) - ( $item['new_customers'] ?? $defaults['new_customers'] );

		return array(
			'channel'             => $item['label'] ?? $item['channel'] ?? $defaults['channel'],
			'gross_sales'         => self::format_amount( $item['gross_sales'] ?? $defaults['gross_sales'] ),
			'coupons'             => self::format_amount( $item['coupons'] ?? $defaults['coupons'] ),
			'refunds'             => self::format_amount( $item['refunds'] ?? $defaults['refunds'] ),
			'net_sales'           => self::format_amount( $item['net_sales'] ?? $defaults['net_sales'] ),
			'new_customers'       => $item['new_customers'] ?? $defaults['new_customers'],
			'returning_customers' => $returning_customers,
			'avg_order_value'     => self::format_amount( $item['avg_order_value'] ?? $defaults['avg_order_value'] ),
			'avg_items_per_order' => number_format( floatval( $item['avg_items'] ?? $defaults['avg_items'] ), 2, '.', '' ),
		);
	}

	/**
	 * Get default values for missing data fields.
	 *
	 * @return array Array of field_name => default_value pairs.
	 */
	public function get_default_values(): array {
		return array(
			'channel'         => '',
			'label'           => '',
			'gross_sales'     => 0,
			'coupons'         => 0,
			'refunds'         => 0,
			'net_sales'       => 0,
			'new_customers'   => 0,
			'total_customers' => 0,
			'avg_order_value' => 0,
			'avg_items'       => 0,
		);
	}

	/**
	 * Get additional request parameters for data fetching.
	 *
	 * Sets orderby to gross_sales and view to channel.
	 *
	 * @return array Additional parameters to include in data requests.
	 */
	public function get_additional_params(): array {
		return array(
			'orderby' => 'gross_sales',
			'view'    => 'channel',
		);
	}
}
