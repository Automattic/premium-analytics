/**
 * External dependencies
 */
import { redirect } from '@tanstack/react-router';
import {
	prefetchReport,
	normalizeReportParams,
	ORDER_ATTRIBUTION_VIEWS,
	ensureCoreSettingsReady,
} from '@next-woo-analytics/data';
import { deriveComparisonRange } from '@next-woo-analytics/routing';

/**
 * Internal dependencies
 */
import { resolveDashboardSection } from './components/tabs';

type ReportParams = NonNullable<
	Parameters< typeof normalizeReportParams >[ 0 ]
>;

/**
 * Compare only the keys we canonicalize to avoid noisy redirects.
 */
function shallowEqualKeys< T extends Record< string, unknown > >(
	a: T,
	b: T,
	keys: ( keyof T )[]
) {
	for ( const k of keys ) {
		if ( ( a[ k ] ?? undefined ) !== ( b[ k ] ?? undefined ) ) {
			return false;
		}
	}
	return true;
}

export const route = {
	beforeLoad: async ( { search }: { search: ReportParams } ) => {
		await ensureCoreSettingsReady();

		// Normalize the primary range search params
		const normalized = normalizeReportParams( search );

		// Build the canonical search params (primary range + comparison range)
		const canonical: ReportParams = {
			...search,
			...normalized,
			section: resolveDashboardSection( search.section ),
		};

		// If the comparison is disabled, remove the comparison params
		if ( canonical.comp !== '1' ) {
			delete canonical.compare_from;
			delete canonical.compare_to;
			delete canonical.compare_preset;
		} else {
			/*
			 * If the comparison is enabled, derive the comparison range
			 * from the primary range and the comparison preset.
			 */
			const derived = deriveComparisonRange( canonical );

			if ( derived?.compare_from && derived?.compare_to ) {
				canonical.compare_from = derived.compare_from;
				canonical.compare_to = derived.compare_to;
			} else {
				// Otherwise, remove the comparison params
				delete ( canonical as any ).compare_from;
				delete ( canonical as any ).compare_to;
			}
		}

		// Check if the primary params are missing
		const missingPrimary =
			! search.from || ! search.to || ! search.interval;

		// Check if the search params have changed
		const changed = ! shallowEqualKeys( search as any, canonical as any, [
			'from',
			'to',
			'interval',
			'compare_from',
			'compare_to',
			'compare_preset',
			'comp',
			'section',
		] );

		/*
		 * If the primary params are missing or the search params
		 * have changed, redirect to the dashboard route with the
		 * canonical search params.
		 */
		if ( missingPrimary || changed ) {
			throw redirect( {
				to: '/wc-analytics/dashboard',
				search: canonical,
				replace: true,
			} );
		}

		// Prefetch the reports data
		try {
			// Prefetch orders data
			prefetchReport( 'orders', normalized );

			// Prefetch coupons data
			prefetchReport( 'coupons', normalized );

			// Prefetch customers data
			prefetchReport( 'customers', {
				from: normalized.from,
				to: normalized.to,
			} );

			// Prefetch visitors data
			prefetchReport( 'visitors', normalized );

			// Prefetch orders data for comparison if required
			if (
				canonical.comp === '1' &&
				canonical.compare_from &&
				canonical.compare_to
			) {
				prefetchReport( 'orders', {
					from: canonical.compare_from,
					to: canonical.compare_to,
					interval: canonical.interval,
				} );

				// Prefetch coupons data for comparison if required
				prefetchReport( 'coupons', {
					from: canonical.compare_from,
					to: canonical.compare_to,
					interval: canonical.interval,
				} );

				// Prefetch customers data for comparison if required
				prefetchReport( 'customers', {
					from: canonical.compare_from,
					to: canonical.compare_to,
				} );

				// Prefetch visitors data for comparison if required
				prefetchReport( 'visitors', {
					from: canonical.compare_from,
					to: canonical.compare_to,
					interval: canonical.interval,
				} );
			}

			// Prefetch order-attribution summary data for all views
			Promise.all(
				ORDER_ATTRIBUTION_VIEWS.map( ( view ) =>
					prefetchReport( 'order-attribution', {
						...normalized,
						view,
						compare_from: canonical.compare_from ?? canonical.from,
						compare_to: canonical.compare_to ?? canonical.to,
					} )
				)
			);
		} catch ( error ) {
			console.error( error ); // eslint-disable-line no-console
		}
	},
};
