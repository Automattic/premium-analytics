<?php
/**
 * REST API Reports Sales by Coupon controller class.
 *
 * @package Automattic\WooCommerce\Analytics\API\Reports\Exports
 */

declare( strict_types=1 );

namespace Automattic\WooCommerce\Analytics\API\Reports\Exports;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Analytics\API\Reports\CSVExport\AbstractCSVReportController;

/**
 * Sales by Coupon CSV Export Controller.
 *
 * Handles CSV exports for the Sales by Coupon report.
 * Note: This is a ranked list report, not a time-series report,
 * so it does not support comparison mode.
 *
 * @since x.x.x
 * @internal
 */
class SalesByCouponController extends AbstractCSVReportController {

	/**
	 * Get the report key for this controller.
	 *
	 * @return string The report key.
	 */
	public function get_report_key(): string {
		return 'salesbycoupon';
	}

	/**
	 * Get the report label for this controller.
	 *
	 * @return string The report label.
	 */
	public function get_report_label(): string {
		return __( 'Sales by Coupon', 'woocommerce-analytics' );
	}

	/**
	 * Get the data endpoint for this controller.
	 *
	 * @return string The data endpoint.
	 */
	public function get_data_endpoint(): string {
		return 'reports/coupons/';
	}

	/**
	 * Get the column headers for this controller.
	 *
	 * @param string|null $interval Optional time interval for dynamic headers.
	 * @return array The column headers.
	 */
	public function get_column_headers( ?string $interval = null ): array {
		return array(
			'coupon_code'         => __( 'Coupon Code', 'woocommerce-analytics' ),
			'orders_count'        => __( 'Orders with coupon', 'woocommerce-analytics' ),
			'net_total'           => __( 'Net sales', 'woocommerce-analytics' ),
			'discount_amount'     => __( 'Discount amount', 'woocommerce-analytics' ),
			'average_order_value' => __( 'Average order value with coupon', 'woocommerce-analytics' ),
			'new_customers'       => __( 'New customers', 'woocommerce-analytics' ),
			'returning_customers' => __( 'Returning customers', 'woocommerce-analytics' ),
		);
	}

	/**
	 * Format a row for CSV export.
	 *
	 * @param array $item The row data.
	 * @return array The formatted row.
	 */
	public function format_row_for_csv( array $item ): array {
		// Skip rows where coupon_code is empty.
		if ( empty( $item['coupon_code'] ) ) {
			return array();
		}

		$defaults = $this->get_default_values();

		$total_customers     = $item['total_customers'] ?? $defaults['total_customers'];
		$new_customers       = $item['new_customers'] ?? $defaults['new_customers'];
		$returning_customers = max( $total_customers - $new_customers, 0 );

		return array(
			'coupon_code'         => $item['coupon_code'] ?? $defaults['coupon_code'],
			'orders_count'        => $item['orders_count'] ?? $defaults['orders_count'],
			'net_total'           => self::format_amount( $item['net_total'] ?? $defaults['net_total'] ),
			'discount_amount'     => self::format_amount( $item['discount_amount'] ?? $defaults['discount_amount'] ),
			'average_order_value' => self::format_amount( $item['average_order_value'] ?? $defaults['average_order_value'] ),
			'new_customers'       => $new_customers,
			'returning_customers' => $returning_customers,
		);
	}

	/**
	 * Get default values for missing data fields.
	 *
	 * @return array Array of field_name => default_value pairs.
	 */
	public function get_default_values(): array {
		return array(
			'coupon_code'         => '',
			'orders_count'        => 0,
			'net_total'           => 0,
			'discount_amount'     => 0,
			'average_order_value' => 0,
			'new_customers'       => 0,
			'total_customers'     => 0,
		);
	}

	/**
	 * Get additional request parameters for data fetching.
	 *
	 * Sets orderby to orders_count.
	 *
	 * @return array Additional parameters to include in data requests.
	 */
	public function get_additional_params(): array {
		return array(
			'orderby' => 'orders_count',
		);
	}
}
