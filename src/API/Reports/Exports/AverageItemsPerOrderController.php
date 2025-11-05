<?php
/**
 * REST API Reports Average Items Per Order controller class.
 *
 * @package Automattic\WooCommerce\Analytics\API\Reports\Exports
 */

declare( strict_types=1 );

namespace Automattic\WooCommerce\Analytics\API\Reports\Exports;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Analytics\API\Reports\CSVExport\AbstractCSVReportController;

/**
 * Average Items Per Order CSV Export Controller.
 *
 * Handles CSV exports for the Average Items Per Order report, supporting both
 * single interval and comparison interval data.
 *
 * @since x.x.x
 * @internal
 */
class AverageItemsPerOrderController extends AbstractCSVReportController {

	/**
	 * Get the report key for this controller.
	 *
	 * @return string The report key.
	 */
	public function get_report_key(): string {
		return 'averageitemsperorder';
	}

	/**
	 * Get the report label for this controller.
	 *
	 * @return string The report label.
	 */
	public function get_report_label(): string {
		return __( 'Average Items Per Order', 'woocommerce-analytics' );
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
			'time_interval' => $this->get_interval_label( $interval ),
			'avg_items'     => __( 'Avg items per order', 'woocommerce-analytics' ),
		);
	}

	/**
	 * Format a row for CSV export.
	 *
	 * @param array $item The row data.
	 * @return array The formatted row.
	 */
	public function format_row_for_csv( array $item ): array {
		$defaults  = $this->get_default_values();
		$avg_items = floatval( $item['avg_items'] ?? $defaults['avg_items'] );

		return array(
			'time_interval' => $this->format_time_interval( $item ),
			'avg_items'     => number_format( $avg_items, 2, '.', '' ),
		);
	}

	/**
	 * Get default values for missing data fields.
	 *
	 * @return array Array of field_name => default_value pairs.
	 */
	public function get_default_values(): array {
		return array(
			'avg_items' => 0,
		);
	}
}
