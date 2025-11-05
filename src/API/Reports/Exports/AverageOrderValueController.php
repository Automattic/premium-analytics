<?php
/**
 * REST API Reports Average Order Value controller class.
 *
 * @package Automattic\WooCommerce\Analytics\API\Reports\Exports
 */

declare( strict_types=1 );

namespace Automattic\WooCommerce\Analytics\API\Reports\Exports;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Analytics\API\Reports\CSVExport\AbstractCSVReportController;

/**
 * Average Order Value CSV Export Controller.
 *
 * Handles CSV exports for the Average Order Value report, supporting both
 * single interval and comparison interval data.
 *
 * @since x.x.x
 * @internal
 */
class AverageOrderValueController extends AbstractCSVReportController {

	/**
	 * Get the report key for this controller.
	 *
	 * @return string The report key.
	 */
	public function get_report_key(): string {
		return 'averageordervalue';
	}

	/**
	 * Get the report label for this controller.
	 *
	 * @return string The report label.
	 */
	public function get_report_label(): string {
		return __( 'Average Order Value', 'woocommerce-analytics' );
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
			'time_interval'       => $this->get_interval_label( $interval ),
			'orders_no'           => __( 'Orders', 'woocommerce-analytics' ),
			'total_sales'         => __( 'Gross sales', 'woocommerce-analytics' ),
			'average_order_value' => __( 'Average order value', 'woocommerce-analytics' ),
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
			'time_interval'       => $this->format_time_interval( $item ),
			'orders_no'           => $item['orders_no'] ?? $defaults['orders_no'],
			'total_sales'         => self::format_amount( $item['total_sales'] ?? $defaults['total_sales'] ),
			'average_order_value' => self::format_amount( $item['average_order_value'] ?? $defaults['average_order_value'] ),
		);
	}

	/**
	 * Get default values for missing data fields.
	 *
	 * @return array Array of field_name => default_value pairs.
	 */
	public function get_default_values(): array {
		return array(
			'orders_no'           => 0,
			'total_sales'         => 0,
			'average_order_value' => 0,
		);
	}
}
