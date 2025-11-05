<?php
/**
 * REST API Reports Booking Status Breakdown controller class.
 *
 * @package Automattic\WooCommerce\Analytics\API\Reports\Exports
 */

declare( strict_types=1 );

namespace Automattic\WooCommerce\Analytics\API\Reports\Exports;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Analytics\API\Reports\CSVExport\AbstractCSVReportController;

/**
 * Booking Status Breakdown CSV Export Controller.
 *
 * Handles CSV exports for the Booking Status Breakdown report, supporting both
 * single interval and comparison interval data.
 *
 * @since x.x.x
 * @internal
 */
class BookingStatusBreakdownController extends AbstractCSVReportController {

	/**
	 * Get the report key for this controller.
	 *
	 * @return string The report key.
	 */
	public function get_report_key(): string {
		return 'bookingstatusbreakdown';
	}

	/**
	 * Get the report label for this controller.
	 *
	 * @return string The report label.
	 */
	public function get_report_label(): string {
		return __( 'Booking Status Breakdown', 'woocommerce-analytics' );
	}

	/**
	 * Get the data endpoint for this controller.
	 *
	 * @return string The data endpoint.
	 */
	public function get_data_endpoint(): string {
		return 'reports/bookings/by-date';
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
			'completed'     => __( 'Completed', 'woocommerce-analytics' ),
			'pending'       => __( 'Pending', 'woocommerce-analytics' ),
			'cancelled'     => __( 'Cancelled', 'woocommerce-analytics' ),
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
			'completed'     => (int) ( $item['status_complete'] ?? $defaults['status_complete'] ),
			'pending'       => $this->calculate_pending_count( $item ),
			'cancelled'     => (int) ( $item['status_cancelled'] ?? $defaults['status_cancelled'] ),
		);
	}

	/**
	 * Get default values for missing data fields.
	 *
	 * @return array Array of field_name => default_value pairs.
	 */
	public function get_default_values(): array {
		return array(
			'status_complete'             => 0,
			'status_pending_confirmation' => 0,
			'status_confirmed'            => 0,
			'status_paid'                 => 0,
			'status_unpaid'               => 0,
			'status_cancelled'            => 0,
		);
	}

	/**
	 * Calculate the total pending count from various pending statuses.
	 *
	 * @param array $item The item data.
	 * @return int The total pending count.
	 */
	private function calculate_pending_count( array $item ): int {
		$defaults = $this->get_default_values();

		$pending_count  = 0;
		$pending_count += (int) ( $item['status_pending_confirmation'] ?? $defaults['status_pending_confirmation'] );
		$pending_count += (int) ( $item['status_confirmed'] ?? $defaults['status_confirmed'] );
		$pending_count += (int) ( $item['status_paid'] ?? $defaults['status_paid'] );
		$pending_count += (int) ( $item['status_unpaid'] ?? $defaults['status_unpaid'] );

		return $pending_count;
	}
}
