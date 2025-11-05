/**
 * External dependencies
 */
import { useSelect, select } from '@wordpress/data';
import { store as coreStore, type Settings } from '@wordpress/core-data';
import type { ProductType } from '@next-woo-analytics/widgets';

type SiteSettings = Settings & {
	wc_analytics_site_status_by_order_product_type?: string;
};

export type SiteStatus =
	| 'mixed'
	| 'initial_mixed'
	| 'only_bookings'
	| 'only_products'
	| '';

const MIXED_STATUSES: SiteStatus[] = [ 'mixed', 'initial_mixed' ];

function extractSiteStatus( settings: SiteSettings | null ): SiteStatus {
	const status =
		settings?.wc_analytics_site_status_by_order_product_type ?? '';
	return status as SiteStatus;
}

/** Get site status synchronously (for use outside React components) */
export function getSiteStatus(): SiteStatus {
	// @ts-expect-error - StoreDescriptor type mismatch with core-data store
	const settings = select( coreStore ).getEntityRecord(
		'root',
		'site'
	) as SiteSettings | null;

	return extractSiteStatus( settings );
}

/** Get site status reactively (for use in React components) */
export function useSiteStatus(): SiteStatus {
	return useSelect( ( localSelect ) => {
		// @ts-expect-error - StoreDescriptor type mismatch with core-data store
		const settings = localSelect( coreStore ).getEntityRecord(
			'root',
			'site'
		) as SiteSettings | null;

		return extractSiteStatus( settings );
	}, [] );
}

/** Check if tabs should be shown for the given site status */
export function shouldShowTabs( status: SiteStatus ): boolean {
	return MIXED_STATUSES.includes( status );
}

/** Get the default section for a site based on its status */
export function getDefaultSection( status: SiteStatus ): ProductType {
	switch ( status ) {
		case 'only_bookings':
			return 'bookings';
		case 'only_products':
			return 'products';
		default:
			return 'general';
	}
}
