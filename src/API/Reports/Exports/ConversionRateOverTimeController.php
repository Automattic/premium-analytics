<?php
/**
 * REST API Reports Conversion Rate Over Time controller class.
 *
 * @package Automattic\WooCommerce\Analytics\API\Reports\Exports
 */

declare( strict_types=1 );

namespace Automattic\WooCommerce\Analytics\API\Reports\Exports;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Analytics\API\Reports\CSVExport\AbstractCSVReportController;

/**
 * Conversion Rate Over Time CSV Export Controller.
 *
 * Handles CSV exports for the Conversion Rate Over Time report, supporting both
 * single interval and comparison interval data.
 *
 * @since x.x.x
 * @internal
 */
class ConversionRateOverTimeController extends AbstractCSVReportController {

	/**
	 * Get the report key for this controller.
	 *
	 * @return string The report key.
	 */
	public function get_report_key(): string {
		return 'conversionrateovertime';
	}

	/**
	 * Get the report label for this controller.
	 *
	 * @return string The report label.
	 */
	public function get_report_label(): string {
		return __( 'Conversion Rate Over Time', 'woocommerce-analytics' );
	}

	/**
	 * Get the data endpoint for this controller.
	 *
	 * @return string The data endpoint.
	 */
	public function get_data_endpoint(): string {
		return 'reports/sessions/by-conversion-rate';
	}

	/**
	 * Get the column headers for this controller.
	 *
	 * @param string|null $interval Optional time interval for dynamic headers.
	 * @return array The column headers.
	 */
	public function get_column_headers( ?string $interval = null ): array {
		return array(
			'time_interval'         => __( 'Day', 'woocommerce-analytics' ),
			'sessions'              => __( 'Sessions', 'woocommerce-analytics' ),
			'cart'                  => __( 'Cart', 'woocommerce-analytics' ),
			'checkout'              => __( 'Checkout', 'woocommerce-analytics' ),
			'purchase'              => __( 'Purchase', 'woocommerce-analytics' ),
			'store_conversion_rate' => __( 'Store conversion rate', 'woocommerce-analytics' ),
		);
	}

	/**
	 * Get default values for missing data fields.
	 *
	 * @return array Array of field_name => default_value pairs.
	 */
	public function get_default_values(): array {
		return array(
			'active_sessions'    => 0,
			'with_cart_addition' => 0,
			'reached_checkout'   => 0,
			'completed_checkout' => 0,
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

		// Extract values with defaults.
		$active_sessions    = (float) ( $item['active_sessions'] ?? $defaults['active_sessions'] );
		$with_cart_addition = (float) ( $item['with_cart_addition'] ?? $defaults['with_cart_addition'] );
		$reached_checkout   = (float) ( $item['reached_checkout'] ?? $defaults['reached_checkout'] );
		$completed_checkout = (float) ( $item['completed_checkout'] ?? $defaults['completed_checkout'] );

		// Calculate store conversion rate (purchase rate).
		$store_conversion_rate = $active_sessions > 0 ? ( $completed_checkout / $active_sessions ) : 0;

		return array(
			'time_interval'         => $this->format_time_interval( $item ),
			'sessions'              => $active_sessions,
			'cart'                  => $with_cart_addition,
			'checkout'              => $reached_checkout,
			'purchase'              => $completed_checkout,
			'store_conversion_rate' => $store_conversion_rate,
		);
	}
}
