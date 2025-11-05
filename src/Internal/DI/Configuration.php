<?php
/**
 * Dependency Injection Configuration
 *
 * @package Automattic\WooCommerce\Analytics\Internal\DI
 */

declare( strict_types=1 );

namespace Automattic\WooCommerce\Analytics\Internal\DI;

use Automattic\Jetpack\Connection\Manager as JetpackManager;
use Automattic\WooCommerce\Analytics\Admin\DebugTools\WooCommerceStatusTools;
use Automattic\WooCommerce\Analytics\Admin\Admin;
use Automattic\WooCommerce\Analytics\API\ApiProxy;
use Automattic\WooCommerce\Analytics\API\SyncStatus;
use Automattic\WooCommerce\Analytics\API\SyncTrigger;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\OrdersOverTimeController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\AverageItemsPerOrderController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\AverageOrderValueController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\BookingsOverTimeController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\BookingStatusBreakdownController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\ConversionRateOverTimeController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\GrossSalesOverTimeController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\NetSalesOverTimeController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\SalesByCampaignController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\SalesByChannelController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\SalesByCouponController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\SalesByDeviceController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\SalesBySourceController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\TopPerformingProductsController;
use Automattic\WooCommerce\Analytics\API\Reports\Exports\VisitorsOverTimeController;
use Automattic\WooCommerce\Analytics\API\Reports\CSVExport\ReportRegistry;
use Automattic\WooCommerce\Analytics\API\Reports\CSVExport\CSVExportController;
use Automattic\WooCommerce\Analytics\API\Reports\CSVExport\CSVExportScheduler;
use Automattic\WooCommerce\Analytics\API\Reports\CSVExport\CSVExportEmail;
use Automattic\WooCommerce\Analytics\Logging\DebugLogger;
use Automattic\WooCommerce\Analytics\Logging\LoggerInterface;
use Automattic\WooCommerce\Analytics\Utilities\OrderStatsFixer;
use Automattic\WooCommerce\Analytics\Utilities\OrderProductTypeTracker;
use function Automattic\WooCommerce\Analytics\Dependencies\DI\get;
use function Automattic\WooCommerce\Analytics\Dependencies\DI\factory;

defined( 'ABSPATH' ) || exit;

/**
 * Class Configuration
 *
 * @package Automattic\WooCommerce\Analytics\Internal
 */
class Configuration {

	/**
	 * Configuration for dependency injection container.
	 *
	 * @return array The PHP-DI configuration.
	 */
	public static function get_php_di_configuration(): array {
		return array(
			LoggerInterface::class      => function () {
				return new DebugLogger( wc_get_logger() );
			},

			JetpackManager::class       => factory(
				function ( $container ) {
					/**
					 * Admin instance.
					 *
					 * @var Admin $admin
					 */
					$admin = $container->get( Admin::class );

					return new JetpackManager( $admin->get_plugin_slug() );
				}
			),

			// CSV Export System - Registry is singleton, others are auto-wired.
			ReportRegistry::class       => factory(
				function () {
					return ReportRegistry::instance();
				}
			),

			RegistrableInterface::class => array(
				get( Admin::class ),
				get( SyncStatus::class ),
				get( ApiProxy::class ),
				get( SyncTrigger::class ),
				get( WooCommerceStatusTools::class ),
				get( OrderStatsFixer::class ),
				get( OrderProductTypeTracker::class ),

				// New CSV Export System.
				get( CSVExportController::class ),
				get( CSVExportScheduler::class ),
				get( CSVExportEmail::class ),

				// CSV Export Report Controllers.
				get( OrdersOverTimeController::class ),
				get( GrossSalesOverTimeController::class ),
				get( NetSalesOverTimeController::class ),
				get( VisitorsOverTimeController::class ),
				get( ConversionRateOverTimeController::class ),
				get( BookingsOverTimeController::class ),
				get( AverageItemsPerOrderController::class ),
				get( AverageOrderValueController::class ),
				get( TopPerformingProductsController::class ),
				get( BookingStatusBreakdownController::class ),
				get( SalesByCampaignController::class ),
				get( SalesByChannelController::class ),
				get( SalesByCouponController::class ),
				get( SalesByDeviceController::class ),
				get( SalesBySourceController::class ),

			),
		);
	}
}
