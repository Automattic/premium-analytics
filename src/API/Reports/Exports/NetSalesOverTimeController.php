<?php
/**
 * REST API Reports Net Sales Over Time controller class.
 *
 * @package Automattic\WooCommerce\Analytics\API\Reports\Exports
 */

declare( strict_types=1 );

namespace Automattic\WooCommerce\Analytics\API\Reports\Exports;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Analytics\API\Reports\CSVExport\AbstractCSVReportController;

/**
 * Net Sales Over Time CSV Export Controller.
 *
 * Handles CSV exports for the Net Sales Over Time report, supporting both
 * single interval and comparison interval data.
 *
 * @since x.x.x
 * @internal
 */
class NetSalesOverTimeController extends AbstractCSVReportController {

	/**
	 * Get the report key for this controller.
	 *
	 * @return string The report key.
	 */
	public function get_report_key(): string {
		return 'netsalesovertime';
	}

	/**
	 * Get the report label for this controller.
	 *
	 * @return string The report label.
	 */
	public function get_report_label(): string {
		return __( 'Net Sales Over Time', 'woocommerce-analytics' );
	}

	/**
	 * Get the data endpoint for this controller.
	 *
	 * @return string The data endpoint.
	 */
	public function get_data_endpoint(): string {
		return 'reports/orders/by-date';
	}

	/**
	 * Get the column headers for this controller.
	 *
	 * @param string|null $interval Optional time interval for dynamic headers.
	 * @return array The column headers.
	 */
	public function get_column_headers( ?string $interval = null ): array {
		return array(
			'time_interval' => __( 'Day', 'woocommerce-analytics' ),
			'orders_no'     => __( 'Orders', 'woocommerce-analytics' ),
			'net_sales'     => __( 'Net sales', 'woocommerce-analytics' ),
		);
	}

	/**
	 * Get default values for missing data fields.
	 *
	 * @return array Array of field_name => default_value pairs.
	 */
	public function get_default_values(): array {
		return array(
			'orders_no'        => 0,
			'orders_value_net' => 0,
		);
	}

	/**
	 * Format a row for CSV export.
	 *
	 * @param array $item The row data.
	 * @return array The formatted row.
	 */
	public function format_row_for_csv( array $item ): array {
		$defaults = $this->get_default_values();
		return array(
			'time_interval' => $this->format_time_interval( $item ),
			'orders_no'     => $item['orders_no'] ?? $defaults['orders_no'],
			'net_sales'     => self::format_amount( $item['orders_value_net'] ?? $defaults['orders_value_net'] ),
		);
	}
}
