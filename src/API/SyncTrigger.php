<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Analytics\API;

use Automattic\Jetpack\Connection\Manager as JetpackManager;
use Automattic\WooCommerce\Analytics\HelperTraits\LoggerTrait;
use Automattic\WooCommerce\Analytics\HelperTraits\Utilities;
use Automattic\WooCommerce\Analytics\Internal\DI\RegistrableInterface;
use Automattic\WooCommerce\Analytics\Internal\Jetpack\SyncModules;
use Automattic\WooCommerce\Analytics\Logging\LoggerInterface;
use Automattic\WooCommerce\Analytics\Utilities\Tracking;
use WC_REST_Controller;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * Class SyncTrigger.
 * REST API endpoint to trigger WooCommerce Analytics data synchronization.
 *
 * @package Automattic\WooCommerce\Analytics\API
 */
class SyncTrigger extends WC_REST_Controller implements RegistrableInterface {
	use LoggerTrait;
	use Utilities;

	/** @var string */
	private const NAMESPACE = 'wc/v3';

	/** @var string */
	private const REST_BASE_SUFFIX = '/sync-trigger';

	/**
	 * The base of the REST API route.
	 *
	 * @var string
	 */
	protected $rest_base;

	/**
	 * @var JetpackManager
	 */
	protected JetpackManager $manager;

	/**
	 * @var SyncModules
	 */
	protected SyncModules $sync_modules;

	/**
	 * @var SyncStatus
	 */
	protected SyncStatus $sync_status;


	/**
	 * SyncTrigger constructor.
	 *
	 * @param SyncModules     $sync_modules The sync modules.
	 * @param LoggerInterface $logger The logger.
	 * @param JetpackManager  $manager The Jetpack manager.
	 * @param SyncStatus      $sync_status The sync status.
	 */
	public function __construct( SyncModules $sync_modules, LoggerInterface $logger, JetpackManager $manager, SyncStatus $sync_status ) {
		$this->rest_base = $this->get_plugin_slug() . self::REST_BASE_SUFFIX;
		$this->set_logger( $logger );
		$this->manager      = $manager;
		$this->sync_modules = $sync_modules;
		$this->sync_status  = $sync_status;
	}

	/**
	 * Register the hooks.
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			$this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'trigger_full_sync' ),
					'permission_callback' => array( $this, 'check_permission' ),
					'schema'              => array( $this, 'get_trigger_sync_schema' ),
				),
			)
		);
	}

	/**
	 * Check if a given request has permission to trigger sync.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return bool
	 */
	public function check_permission( WP_REST_Request $request ): bool {
		return current_user_can( 'manage_woocommerce' );
	}

	/**
	 * Triggers a full synchronization of WooCommerce Analytics data.
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response|WP_Error Response object or WP_Error.
	 */
	public function trigger_full_sync( WP_REST_Request $request ) {
		try {
			// Check if the store is connected to Jetpack.
			if ( ! $this->manager->is_connected() ) {
				return new WP_Error(
					'not_connected',
					__( 'Store is not connected to Jetpack.', 'woocommerce-analytics' ),
					array( 'status' => 400 )
				);
			}

			// Start only if the full-sync module is available.
			if ( ! $this->sync_status->is_full_sync_available() ) {
				return new WP_Error(
					'sync_not_available',
					__( 'A full sync is not available.', 'woocommerce-analytics' ),
					array( 'status' => 400 )
				);
			}

			// Check if a full sync is already running.
			if ( $this->sync_status->is_full_sync_running() ) {
				return new WP_Error(
					'sync_already_running',
					__( 'A full sync is already running.', 'woocommerce-analytics' ),
					array( 'status' => 400 )
				);
			}

			// Run the full sync.
			$this->run_full_sync();
			Tracking::track_manual_sync_action( 'started' );

			return new WP_REST_Response(
				array(
					'success' => true,
					'message' => __( 'Full Sync has been triggered.', 'woocommerce-analytics' ),
				),
				200
			);

		} catch ( \Exception $e ) {
			$this->get_logger()->log_exception( $e, __METHOD__ );
			return new WP_Error(
				'sync_trigger_error',
				__( 'Error triggering sync.', 'woocommerce-analytics' ),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Run the full sync.
	 *
	 * @return void
	 */
	private function run_full_sync(): void {
		$full_sync_module = $this->sync_modules->get_full_sync_immediately();
		$full_sync_module->start();
	}

	/**
	 * Get the schema for the trigger sync endpoint.
	 *
	 * @return array
	 */
	public function get_trigger_sync_schema(): array {
		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'trigger_sync',
			'type'       => 'object',
			'properties' => array(
				'success' => array(
					'description' => 'Whether the sync was triggered successfully.',
					'type'        => 'boolean',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'message' => array(
					'description' => 'A message describing the result of the sync trigger.',
					'type'        => 'string',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
			),
		);

		return $this->add_additional_fields_schema( $schema );
	}
}
