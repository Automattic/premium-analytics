<?php

namespace Automattic\WooCommerce\Analytics\Internal\Jetpack\Sync\Modules;

use Automattic\Jetpack\Sync\Modules\Module as JetpackSyncModule;
use Automattic\WooCommerce\Analytics\HelperTraits\Utilities;

/**
 * WooCommerce Bookings Sync Module class.
 *
 * Follows the same patterns as WooCommerce_Products module, treating bookings as posts.
 */
class Bookings extends JetpackSyncModule {

	use Utilities;

	const BOOKING_POST_TYPES = array( 'wc_booking' );

	/**
	 * Constructor.
	 */
	public function __construct() {
		// Listen to WooCommerce Bookings-specific delete action.
		\add_action( 'woocommerce_delete_booking', array( $this, 'action_booking_deleted' ), 10, 1 );
		// TODO: Temporary measure since Bookings deletion is currently not functioning properly.
		\add_action( 'delete_post', array( $this, 'action_booking_deleted' ), 10, 2 );
	}

	/**
	 * Get the module name.
	 *
	 * @return string
	 */
	public function name() {
		return 'woocommerce_bookings';
	}

	/**
	 * Get the table in the database.
	 *
	 * @return string
	 */
	public function table() {
		global $wpdb;
		return $wpdb->posts;
	}

	/**
	 * Get the ID field for the module.
	 *
	 * @return string
	 */
	public function id_field() {
		return 'ID';
	}

	/**
	 * The full sync action name for this module.
	 *
	 * @return string
	 */
	public function full_sync_action_name() {
		return 'jetpack_full_sync_woocommerce_bookings';
	}

	/**
	 * Initialize WooCommerce Bookings action listeners.
	 *
	 * @param callable $callable Action handler callable.
	 */
	public function init_listeners( $callable ) {
		// Only initialize if WooCommerce Bookings is active.
		if ( ! $this->is_bookings_active() ) {
			return;
		}

		// Listen to booking creation - this hook triggers from WC_Booking data store.
		\add_action( 'woocommerce_new_booking', $callable, 10, 1 );

		// Listen to booking updates and status changes, including status changes, like trash or cancelled.
		\add_action( 'wp_after_insert_post', array( $this, 'action_after_booking_saved' ), 10, 4 );

		// Listen to attendance status meta updates.
		\add_action( 'updated_post_meta', array( $this, 'action_attendance_status_updated' ), 10, 4 );

		// Listen to booking updated.
		\add_action( 'jetpack_sync_woocommerce_booking_updated', $callable, 10, 1 );

		// Listen to booking deletion via wp_delete_post.
		\add_action( 'jetpack_sync_woocommerce_booking_deleted', $callable, 10, 1 );

		// Add filters to expand booking data before sync (only for create/update operations).
		\add_filter( 'jetpack_sync_before_enqueue_woocommerce_new_booking', array( $this, 'expand_booking_data' ) );
		\add_filter( 'jetpack_sync_before_enqueue_jetpack_sync_woocommerce_booking_updated', array( $this, 'expand_booking_data' ) );
	}

	/**
	 * Initialize WooCommerce Bookings action listeners for full sync.
	 *
	 * @param callable $callable Action handler callable.
	 */
	public function init_full_sync_listeners( $callable ) {
		\add_action( 'jetpack_full_sync_woocommerce_bookings', $callable );
	}

	/**
	 * Get full sync actions.
	 *
	 * @return string[] The full sync actions.
	 */
	public function get_full_sync_actions() {
		return array( 'jetpack_full_sync_woocommerce_bookings' );
	}

	/**
	 * Initialize the module in the sender.
	 */
	public function init_before_send() {
		// Full sync.
		\add_filter( 'jetpack_sync_before_send_jetpack_full_sync_woocommerce_bookings', array( $this, 'build_full_sync_action_array' ) );
	}

	/**
	 * Handle woocommerce_delete_booking action and trigger custom booking deletion sync.
	 *
	 * @param int           $booking_id The booking ID being deleted.
	 * @param \WP_Post|null $post      The post object, or null if not provided.
	 */
	public function action_booking_deleted( $booking_id, $post = null ) {
		if ( ! $this->is_a_booking_post( $booking_id ) ) {
			return;
		}

		/**
		 * Fires when a WooCommerce booking is deleted.
		 *
		 * @param int $booking_id The booking ID being deleted.
		 */
		\do_action( 'jetpack_sync_woocommerce_booking_deleted', $booking_id );
	}

	/**
	 * Handle wp_after_insert_post action to catch booking updates.
	 *
	 * @param int      $post_id      Post ID.
	 * @param \WP_Post $post         Post object.
	 * @param bool     $update       True if this is an existing post being updated.
	 * @param array    $post_before  Array of the post data prior to the update.
	 */
	public function action_after_booking_saved( $post_id, $post, $update, $post_before ) {
		if ( ! $this->is_a_booking_post( $post_id ) ) {
			return;
		}
		if ( $update ) {
			/**
			 * Fires when a WooCommerce booking is updated.
			 *
			 * @param int $booking_id The booking ID.
			 */
			\do_action( 'jetpack_sync_woocommerce_booking_updated', $post_id );
		}
	}

	/**
	 * Handle updated_post_meta action to catch attendance status updates.
	 *
	 * @param int    $meta_id    ID of the metadata entry.
	 * @param int    $post_id    Post ID.
	 * @param string $meta_key   Meta key.
	 * @param mixed  $meta_value Meta value.
	 */
	public function action_attendance_status_updated( $meta_id, $post_id, $meta_key, $meta_value ) {
		if ( ! $this->is_a_booking_post( $post_id ) ) {
			return;
		}

		if ( '_booking_attendance_status' !== $meta_key ) {
			return;
		}

		/**
		 * Fires when a WooCommerce booking attendance status is updated.
		 *
		 * @param int $booking_id The booking ID.
		 */
		\do_action( 'jetpack_sync_woocommerce_booking_updated', $post_id );
	}

	/**
	 * Expand booking data to include booking table information.
	 *
	 * @param array $args The hook arguments.
	 * @return array $args The hook arguments with expanded data.
	 */
	public function expand_booking_data( $args ) {
		if ( empty( $args[0] ) ) {
			return $args;
		}

		$booking_id = $args[0];

		// Get the booking data.
		$booking_data = $this->get_booking_by_ids( array( $booking_id ) );

		if ( ! empty( $booking_data ) ) {
			$args[1] = reset( $booking_data ); // Get the first (and only) result.
		}

		return $args;
	}

	/**
	 * Enqueue full sync actions.
	 *
	 * @param array   $config               Full sync configuration.
	 * @param int     $max_items_to_enqueue Maximum number of items to enqueue.
	 * @param boolean $state                True if full sync has finished enqueueing this module.
	 * @return array Number of actions enqueued, and next module state.
	 */
	public function enqueue_full_sync_actions( $config, $max_items_to_enqueue, $state ) {
		return $this->enqueue_all_ids_as_action(
			'jetpack_full_sync_woocommerce_bookings',
			$this->table(),
			$this->id_field(),
			$this->get_where_sql( $config ),
			$max_items_to_enqueue,
			$state
		);
	}

	/**
	 * Estimate full sync actions.
	 *
	 * @param array $config Full sync configuration.
	 * @return int Number of items yet to be enqueued.
	 */
	public function estimate_full_sync_actions( $config ) {
		global $wpdb;

		$query = "SELECT COUNT(*) FROM {$this->table()}";

		$where_sql = $this->get_where_sql( $config );
		if ( $where_sql ) {
			$query .= ' WHERE ' . $where_sql;
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$count = (int) $wpdb->get_var( $query );

		return (int) ceil( $count / self::ARRAY_CHUNK_SIZE );
	}

	/**
	 * Returns a list of booking objects by their IDs.
	 *
	 * @param array  $ids List of booking IDs to fetch.
	 * @param string $order Either 'ASC' or 'DESC'.
	 *
	 * @return array
	 */
	public function get_booking_by_ids( $ids, $order = '' ) {
		if ( ! is_array( $ids ) ) {
			return array();
		}

		// Make sure the IDs are numeric and are non-zero.
		$ids = array_filter( array_map( 'intval', $ids ) );

		if ( empty( $ids ) ) {
			return array();
		}

		$posts    = $this->get_booking_posts( $ids, $order );
		$bookings = array();

		// Build base booking data from posts.
		foreach ( $posts as $post ) {
			$booking_data = array(
				'ID'                => $post->ID, // Required by Jetpack sync module.
				'booking_id'        => $post->ID,
				'status'            => $post->post_status,
				'date_created'      => self::datetime_to_object( $post->post_date ),
			);

			// Get booking meta data.
			$meta_data    = $this->get_booking_meta_data( $post->ID );
			$booking_data = array_merge( $booking_data, $meta_data );

			// A less accurate fallback for date_status_updated if the meta field is missing or the status is not cancelled.
			if ( empty( $booking_data['date_status_updated'] ) || 'cancelled' !== $booking_data['status'] ) {
				$booking_data['date_status_updated'] = self::datetime_to_object( $post->post_modified );
			}

			$bookings[ $post->ID ] = $booking_data;
		}

		return $bookings;
	}

	/**
	 * Build the full sync action object.
	 *
	 * @param array $args An array with filtered objects and previous end.
	 *
	 * @return array An array with bookings and previous end.
	 */
	public function build_full_sync_action_array( $args ) {
		list( $filtered_bookings, $previous_end ) = $args;
		return array(
			'booking'      => $filtered_bookings['objects'],
			'previous_end' => $previous_end,
		);
	}

	/**
	 * Given the Module Configuration and Status return the next chunk of items to send.
	 *
	 * @param array $config This module Full Sync configuration.
	 * @param array $status This module Full Sync status.
	 * @param int   $chunk_size Chunk size.
	 *
	 * @return array
	 */
	public function get_next_chunk( $config, $status, $chunk_size ) {
		$booking_ids = parent::get_next_chunk( $config, $status, $chunk_size );

		if ( empty( $booking_ids ) ) {
			return array();
		}

		// Fetch the booking data in DESC order for the next chunk logic to work.
		$booking_data = $this->get_booking_by_ids( $booking_ids, 'DESC' );

		// If no data was fetched, make sure to return the expected structure so that status is updated correctly.
		if ( empty( $booking_data ) ) {
			return array(
				'object_ids' => $booking_ids,
				'objects'    => array(),
			);
		}
		// Filter the booking data based on the maximum size constraints.
		list( $filtered_booking_ids, $filtered_booking_data, ) = $this->filter_objects_and_metadata_by_size(
			'booking',
			$booking_data,
			array(), // No separate metadata for bookings table.
			0,       // No individual meta size limit since we don't have separate metadata.
			self::MAX_SIZE_FULL_SYNC
		);

		return array(
			'object_ids' => $filtered_booking_ids,
			'objects'    => $filtered_booking_data,
		);
	}

	/**
	 * Get where SQL clause for the module.
	 *
	 * @param array $config Full sync configuration.
	 * @return string
	 */
	public function get_where_sql( $config ) {
		global $wpdb;

		// Filter by booking post types.
		$post_types_placeholders = implode( ',', array_fill( 0, count( self::BOOKING_POST_TYPES ), '%s' ) );
		$where                   = $wpdb->prepare( "post_type IN ($post_types_placeholders)", self::BOOKING_POST_TYPES ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		if ( ! empty( $config['start_date'] ) ) {
			$where .= $wpdb->prepare( ' AND post_date_gmt >= %s', $config['start_date'] );
		}
		if ( ! empty( $config['end_date'] ) ) {
			$where .= $wpdb->prepare( ' AND post_date_gmt <= %s', $config['end_date'] );
		}

		/**
		 * Filter the WHERE SQL for bookings full sync
		 *
		 * @param string $where The WHERE SQL clause
		 * @param array  $config The sync configuration
		 */
		return \apply_filters( 'woocommerce_bookings_full_sync_where_sql', $where, $config );
	}

	/**
	 * Get the booking posts data from the posts table.
	 *
	 * @param array  $ids List of booking IDs to fetch.
	 * @param string $order Either 'ASC' or 'DESC'.
	 *
	 * @return array
	 */
	private function get_booking_posts( $ids, $order = '' ) {
		$posts = \get_posts(
			array(
				'include'     => $ids,
				'order'       => $order,
				'post_type'   => self::BOOKING_POST_TYPES,
				// See https://github.com/woocommerce/woocommerce-bookings/blob/4da5f3048a14d7303693a85e8ba1e2952d7ece9e/includes/wc-bookings-functions.php#L89 .
				'post_status' => array( 'any', 'trash', 'auto-draft', 'in-cart', 'unpaid', 'paid', 'cancelled', 'pending-confirmation', 'confirmed', 'complete' ),
				'numberposts' => -1, // Get all posts.
			)
		);

		return $posts;
	}

	/**
	 * Get booking meta data for a booking ID.
	 *
	 * @param int $booking_id The booking ID.
	 * @return array
	 */
	private function get_booking_meta_data( $booking_id ) {
		global $wpdb;

		$meta_data = array();

		// Get relevant meta fields based on your schema.
		$meta_fields = array(
			// Core booking fields.
			'_booking_resource_id'                => 'resource_id',
			'_booking_product_id'                 => 'product_id',
			'_booking_order_id'                   => 'order_id',
			'_booking_order_item_id'              => 'order_item_id',
			'_booking_start'                      => 'start_time',
			'_booking_end'                        => 'end_time',
			'_booking_date_cancelled'             => 'date_status_updated',
			'_booking_attendance_status'          => 'attendance_status',

			// Additional analytics fields - added based on feedback.
			'_booking_all_day'                    => 'all_day',
			'_booking_customer_id'                => 'customer_id',
			'_booking_duplicate_of'               => 'duplicate_of',
			'_booking_persons'                    => 'person_counts',
			'_booking_cost'                       => 'cost',
			'_booking_parent_id'                  => 'parent_id',
		);

		// Get all meta values in a single query.
		$meta_keys    = array_keys( $meta_fields );
		$placeholders = implode( ',', array_fill( 0, count( $meta_keys ), '%s' ) );
		$query_params = array_merge( array( $booking_id ), $meta_keys );

		// Prepare and execute query.
		$meta_results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key IN ($placeholders)", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				...$query_params
			),
			\ARRAY_A
		);

		// Process the results.
		$meta_values = array();
		foreach ( $meta_results as $meta_row ) {
			$meta_values[ $meta_row['meta_key'] ] = $meta_row['meta_value'];
		}

		// Map to our field names and process values.
		foreach ( $meta_fields as $meta_key => $field_name ) {
			$meta_value = isset( $meta_values[ $meta_key ] ) ? $meta_values[ $meta_key ] : '';

			// Handle different data types based on field.
			if ( in_array( $field_name, array( 'start_time', 'end_time' ), true ) && ! empty( $meta_value ) ) {
				// Convert YYYYMMDDHHMMSS string to datetime object in UTC.
				$dt = \DateTime::createFromFormat( 'YmdHis', $meta_value, new \DateTimeZone( 'UTC' ) );
				$formatted = $dt ? $dt->format( 'Y-m-d H:i:s' ) : null;
				$meta_data[ $field_name ] = $formatted ? self::datetime_to_object( $formatted ) : null;
			} elseif ( 'date_status_updated' === $field_name && is_numeric( $meta_value ) ) {
				// Convert unix timestamp to WC_DateTime in site timezone.
				$meta_data[ $field_name ] = self::datetime_to_object( new \WC_DateTime( '@' . $meta_value ) );
			} elseif ( 'all_day' === $field_name ) {
				// Boolean field.
				$meta_data[ $field_name ] = '1' === $meta_value ? '1' : '0';
			} elseif ( 'person_counts' === $field_name ) {
				// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_unserialize
				$meta_data[ $field_name ] = $meta_value ? wp_json_encode( maybe_unserialize( $meta_value ) ) : null;
			} elseif ( in_array( $field_name, array( 'cost' ), true ) ) {
				// Float fields.
				$meta_data[ $field_name ] = $meta_value ? floatval( $meta_value ) : null;
			} elseif ( 'attendance_status' === $field_name ) {
				// @see https://github.com/woocommerce/woocommerce-bookings/blob/6ab69f4a50cb25a28a9302c7f9d75d7a4ebddaed/includes/api/rest-api/v2/Controllers/class-wc-bookings-rest-booking-v2-controller.php#L643.
				$valid_statuses = array( 'booked', 'checked-in', 'no-show' );
				$meta_data[ $field_name ] = in_array( $meta_value, $valid_statuses, true ) ? $meta_value : 'booked';
			} else {
				// Integer fields (IDs, etc.).
				$meta_data[ $field_name ] = $meta_value ? intval( $meta_value ) : null;
			}
		}

		return $meta_data;
	}

	/**
	 * Check if the post is a booking post.
	 *
	 * @param int $post_id The post ID to check.
	 * @return bool True if the post is a booking post, false otherwise.
	 */
	private function is_a_booking_post( $post_id ) {
		$post_type = \get_post_type( $post_id );
		return in_array( $post_type, self::BOOKING_POST_TYPES, true );
	}

	/**
	 * Check if WooCommerce Bookings is active.
	 *
	 * @return bool
	 */
	public static function is_bookings_active() {
		return \is_plugin_active( 'woocommerce-bookings/woocommerce-bookings.php' ) || class_exists( 'WC_Bookings' );
	}
}
