<?php
/**
 * Order Product Type Tracker
 *
 * Tracks the site's product type composition by monitoring orders to determine whether
 * the site sells only regular products, only bookable products, or both.
 * Stores the status in wp_options.
 *
 * @package Automattic\WooCommerce\Analytics\Utilities
 */

declare( strict_types=1 );

namespace Automattic\WooCommerce\Analytics\Utilities;

use Automattic\WooCommerce\Analytics\Internal\DI\RegistrableInterface;
use Automattic\WooCommerce\Analytics\Internal\Jetpack\Sync\Modules\Bookings;

defined( 'ABSPATH' ) || exit;

/**
 * Order Product Type Tracker class.
 *
 * Determines the site's product type composition (regular products, bookable products, or mixed)
 * by monitoring the product types in customer orders.
 */
class OrderProductTypeTracker implements RegistrableInterface {

	/**
	 * Option key for storing site type by order product types.
	 */
	const OPTION_KEY = 'wc_analytics_site_status_by_order_product_type';

	/**
	 * Option key for tracking if initial scan has been completed.
	 */
	const SCAN_INITIALIZED_KEY = 'wc_analytics_order_product_type_scan_initialized';

	/**
	 * Status constants.
	 */
	const STATUS_ONLY_PRODUCTS = 'only_products';
	const STATUS_ONLY_BOOKINGS = 'only_bookings';
	const STATUS_INITIAL_MIXED = 'initial_mixed';
	const STATUS_MIXED         = 'mixed';

	const VALID_STATUSES = array(
		self::STATUS_ONLY_PRODUCTS => true,
		self::STATUS_ONLY_BOOKINGS => true,
		self::STATUS_MIXED         => true,
		self::STATUS_INITIAL_MIXED => true,
	);

	/**
	 * Mixed statuses array.
	 * Contains all status values that represent a mixed state (both bookings and products).
	 */
	const MIXED_STATUSES = array(
		self::STATUS_MIXED,
		self::STATUS_INITIAL_MIXED,
	);

	/**
	 * Valid order statuses to track.
	 */
	const VALID_ORDER_STATUSES = array( 'completed', 'processing', 'on-hold' );

	/**
	 * Product type mappings.
	 * Defines which WooCommerce product types belong to bookings vs regular products.
	 */
	const BOOKINGS_TYPES = array( 'booking', 'bookable-event', 'bookable-service' );
	const PRODUCTS_TYPES = array( 'simple', 'variable', 'variation' );

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register(): void {
		// Only register hooks if Bookings plugin is active.
		// Without Bookings, status is always 'only_products' - no tracking needed.
		if ( ! Bookings::is_bookings_active() ) {
			return;
		}

		// Hook on order status changes to track product types in orders.
		add_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_changed' ), 10, 4 );

		// Hook on new orders.
		add_action( 'woocommerce_new_order', array( $this, 'on_new_order' ), 10, 2 );

		// Hook to handle the scheduled scan action.
		add_action( 'wc_analytics_initialize_order_product_type_scan', array( $this, 'perform_initial_scan' ) );
	}

	/**
	 * Check if initial scan needs to be performed and schedule it.
	 * This is called during plugin activation to initialize the order product type tracking.
	 * Schedules a background scan via Action Scheduler, or runs synchronously if unavailable.
	 *
	 * @return void
	 */
	public function maybe_initialize_scan(): void {
		// Check if we've already performed the initial scan.
		if ( get_option( self::SCAN_INITIALIZED_KEY, false ) ) {
			return;
		}

		// Check if a scan is already scheduled.
		if ( function_exists( 'as_next_scheduled_action' ) && as_next_scheduled_action( 'wc_analytics_initialize_order_product_type_scan' ) ) {
			return;
		}

		// Schedule the initial scan to run in the background.
		if ( function_exists( 'as_schedule_single_action' ) ) {
			as_schedule_single_action(
				time(),
				'wc_analytics_initialize_order_product_type_scan'
			);
		} else {
			// Fallback: run synchronously if Action Scheduler is not available.
			$this->perform_initial_scan();
		}
	}

	/**
	 * Perform the initial scan of all orders to determine site status.
	 * This should only run once per site (or after reinstall).
	 *
	 * @return void
	 */
	public function perform_initial_scan(): void {
		// Perform the scan.
		$status = self::determine_site_status_by_scan();

		// Update the status if we found one.
		if ( $status ) {
			update_option( self::OPTION_KEY, $status, false );
		}

		// Mark initialization as complete.
		update_option( self::SCAN_INITIALIZED_KEY, true, false );
	}

	/**
	 * Handle new order creation.
	 *
	 * @param int            $order_id Order ID.
	 * @param \WC_Order|bool $order    Order object or false.
	 * @return void
	 */
	public function on_new_order( $order_id, $order = false ): void {
		if ( ! $order ) {
			$order = wc_get_order( $order_id );
		}

		if ( ! $order ) {
			return;
		}

		// Only process completed, processing, or on-hold orders.
		if ( ! in_array( $order->get_status(), self::VALID_ORDER_STATUSES, true ) ) {
			return;
		}

		$this->check_order_and_update_status( $order );
	}

	/**
	 * Handle order status changes.
	 *
	 * @param int    $order_id   Order ID.
	 * @param string $old_status Old status.
	 * @param string $new_status New status.
	 * @param object $order      Order object.
	 * @return void
	 */
	public function on_order_status_changed( $order_id, $old_status, $new_status, $order ): void {
		// Only process completed, processing, or on-hold orders.
		if ( in_array( $new_status, self::VALID_ORDER_STATUSES, true ) ) {
			$this->check_order_and_update_status( $order );
		}
	}

	/**
	 * Check order items and update site status.
	 *
	 * @param \WC_Order $order Order object.
	 * @return void
	 */
	private function check_order_and_update_status( $order ): void {
		$current_status = self::get_site_status();

		// Early exit if already mixed.
		if ( in_array( $current_status, self::MIXED_STATUSES, true ) ) {
			return;
		}

		$has_bookable = false;
		$has_regular  = false;

		// Check current order items for product types.
		foreach ( $order->get_items() as $item ) {
			$product = $item->get_product();
			if ( ! $product ) {
				continue;
			}

			$product_type = $product->get_type();

			// Check if this is a bookable product type.
			if ( in_array( $product_type, self::BOOKINGS_TYPES, true ) ) {
				$has_bookable = true;
			} elseif ( in_array( $product_type, self::PRODUCTS_TYPES, true ) ) {
				// Check if this is a regular product type.
				$has_regular = true;
			}

			// Early exit if we found both types in this order.
			if ( $has_bookable && $has_regular ) {
				break;
			}
		}

		// Determine the new status based on what we found.
		$new_status = null;

		if ( $has_bookable && $has_regular ) {
			// This order has both types → mixed.
			$new_status = self::STATUS_MIXED;
		} elseif ( $has_bookable ) {
			// This order only has bookable products.
			if ( self::STATUS_ONLY_PRODUCTS === $current_status ) {
				// Was only_products, now found bookables → mixed.
				$new_status = self::STATUS_MIXED;
			} elseif ( '' === $current_status ) {
				// First order ever, only bookables → only_bookings.
				$new_status = self::STATUS_ONLY_BOOKINGS;
			}
			// else: already only_bookings, no change needed.
		} elseif ( $has_regular ) {
			// This order only has regular products.
			if ( self::STATUS_ONLY_BOOKINGS === $current_status ) {
				// Was only_bookings, now found regular → mixed.
				$new_status = self::STATUS_MIXED;
			} elseif ( '' === $current_status ) {
				// First order ever, only regular → only_products.
				$new_status = self::STATUS_ONLY_PRODUCTS;
			}
			// else: already only_products, no change needed.
		}

		// Update if we determined a new status.
		if ( $new_status && $new_status !== $current_status ) {
			update_option( self::OPTION_KEY, $new_status, false );
		}
	}

	/**
	 * Scan all orders to determine site status by product types.
	 * This is useful for initial setup or recalculating the status.
	 *
	 * @return string The determined status (only_products, only_bookings, mixed, or empty string if no orders found).
	 */
	public static function determine_site_status_by_scan(): string {
		// If Bookings plugin is not active, we can assume the site only needs to track regular products.
		if ( ! Bookings::is_bookings_active() ) {
			return self::STATUS_ONLY_PRODUCTS;
		}

		// Check if there are orders with bookable products.
		$has_bookings = self::has_orders_with_product_type( self::BOOKINGS_TYPES );

		// Check if there are orders with regular products.
		$has_products = self::has_orders_with_product_type( self::PRODUCTS_TYPES );

		// Determine status based on what we found.
		if ( $has_bookings && $has_products ) {
			// use a different status to indicate initial mixed state, so that we do not show the modal.
			return self::STATUS_INITIAL_MIXED;
		} elseif ( $has_bookings ) {
			return self::STATUS_ONLY_BOOKINGS;
		} elseif ( $has_products ) {
			return self::STATUS_ONLY_PRODUCTS;
		}

		return ''; // No valid orders found.
	}

	/**
	 * Get term IDs for product type slugs.
	 *
	 * This is used to optimize queries by using term IDs instead of slugs,
	 * avoiding the need to JOIN the terms table.
	 *
	 * @param array $product_type_slugs Array of product type slugs (e.g., 'simple', 'variable').
	 * @return array Array of term IDs. Empty array if no terms found.
	 */
	private static function get_product_type_term_ids( array $product_type_slugs ): array {
		if ( empty( $product_type_slugs ) ) {
			return array();
		}

		$term_ids = get_terms(
			array(
				'taxonomy'   => 'product_type',
				'slug'       => $product_type_slugs,
				'fields'     => 'ids',
				'hide_empty' => false, // Include terms even if no products use them yet.
			)
		);

		// get_terms returns WP_Error on failure, or array of term IDs on success.
		if ( is_wp_error( $term_ids ) || empty( $term_ids ) ) {
			return array();
		}

		return $term_ids;
	}

	/**
	 * Check if there are any orders containing products of the specified types.
	 *
	 * Optimization strategy:
	 * 1. Convert product type slugs to term IDs using get_terms() (avoids JOIN on terms table)
	 * 2. First check if products of these types exist at all (bail early)
	 * 3. Use EXISTS subquery for the order check (faster than multiple JOINs)
	 * 4. Use SELECT 1 instead of COUNT for existence checks (faster)
	 *
	 * @param array $product_types Array of product type slugs to check for.
	 * @return bool True if orders with these product types exist, false otherwise.
	 */
	private static function has_orders_with_product_type( array $product_types ): bool {
		global $wpdb;

		if ( empty( $product_types ) ) {
			return false;
		}

		// Step 1: Get term IDs for the product type slugs.
		// This is cached by WordPress and avoids JOINing the terms table in the main query.
		$term_ids = self::get_product_type_term_ids( $product_types );

		if ( empty( $term_ids ) ) {
			// No terms found for these product types, so no products can exist.
			return false;
		}

		// Limit the array to a reasonable number.
		$term_ids = array_slice( $term_ids, 0, 100 );

		// Prepare placeholders for term IDs.
		$placeholders = implode( ',', array_fill( 0, count( $term_ids ), '%d' ) );

		// Step 2: Check if products of these types exist at all.
		// This is much faster than querying orders and allows us to bail early.
		//
		// We use wp_term_taxonomy.count field which is automatically maintained by WordPress.
		// This field counts the number of objects (products) using this term.
		//
		// Note: tt.count includes all post_status (publish, draft, trash, etc.).
		// This is acceptable because:
		// - If count > 0 but all are drafts, the order query (Step 3) will return false anyway.
		// - The worst case is one extra order query, which is negligible compared to the
		// performance gain from using a single-table query instead of multiple JOINs.
		// - In practice, 99.9% of products with product_type are published.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
		$products_exist_query = $wpdb->prepare(
			"SELECT EXISTS (
				SELECT 1
				FROM {$wpdb->prefix}term_taxonomy tt
				WHERE tt.taxonomy = 'product_type'
				AND tt.term_id IN ($placeholders)
				AND tt.count > 0
			) AS products_exist",
			...$term_ids
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- Query is prepared above.
		$products_exist = (bool) $wpdb->get_var( $products_exist_query );
		if ( ! $products_exist ) {
			return false;
		}

		// Step 3: Now check if there are any orders containing these product types.
		// Use direct JOINs which allows MySQL optimizer to choose the best execution plan.
		// Starting from the most selective condition (term_id) and using LIMIT 1
		// allows the optimizer to stop as soon as it finds the first match.
		//
		// Note: We only check orders from the last year to improve query performance.
		// This is acceptable because we're only determining the site's product type composition,
		// not doing historical analysis. If a site had bookings/products in the past but not
		// recently, it's reasonable to exclude them from the current classification.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
		$orders_exist_query = $wpdb->prepare(
			"SELECT EXISTS (
				SELECT 1 
				FROM {$wpdb->prefix}wc_order_product_lookup opl 
				INNER JOIN {$wpdb->prefix}term_relationships tr ON tr.object_id = opl.product_id 
				INNER JOIN {$wpdb->prefix}term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id 
				INNER JOIN {$wpdb->prefix}wc_order_stats os ON os.order_id = opl.order_id 
				WHERE tt.taxonomy = 'product_type'
				AND tt.term_id IN ($placeholders) 
				AND os.status IN ('wc-completed', 'wc-processing', 'wc-on-hold')
				AND os.date_created_gmt >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
			) AS orders_exist",
			...$term_ids
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- Query is prepared above.
		$orders_exist = (bool) $wpdb->get_var( $orders_exist_query );
		return $orders_exist;
	}

	/**
	 * Get the current site product status.
	 *
	 * @return string The current status (only_products, only_bookings, mixed, or empty string if not yet determined).
	 */
	public static function get_site_status(): string {
		$status = get_option( self::OPTION_KEY, '' );

		// Ensure the returned value is one of the valid statuses.
		if ( ! isset( self::VALID_STATUSES[ $status ] ) ) {
			return '';
		}

		return $status;
	}

	/**
	 * Check if the current site status is mixed.
	 *
	 * @return bool True if the site has mixed product types (both regular and bookable products).
	 */
	public static function is_mixed_statuses(): bool {
		return in_array( self::get_site_status(), self::MIXED_STATUSES, true );
	}
}
