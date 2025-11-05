/**
 * External dependencies
 */
import { dispatch, useSelect } from '@wordpress/data';
import { useCallback, useMemo } from '@wordpress/element';
import { ProductType } from '@next-woo-analytics/widgets';
import { store as preferencesStore } from '@wordpress/preferences';
import { type GridLayoutItem } from '@automattic/grid';

/**
 * Internal dependencies
 */
import { getDefaultLayoutForTab } from '../config/tab-layouts';

/**
 * Merges the user's saved layout with the default layout, creating a
 * synchronized view that preserves user customizations.
 *
 * - Preserves user's x, y, width, and height for existing widgets.
 * - Adopts any new metadata from the default layout for existing widgets.
 * - Adds new widgets from the default layout.
 * - Removes widgets that are no longer in the default layout.
 *
 * @param savedLayout   The user's saved layout.
 * @param defaultLayout The default layout which is the source of truth for available widgets.
 * @return A fully merged and synced layout.
 */
const mergeLayouts = (
	savedLayout: GridLayoutItem[],
	defaultLayout: GridLayoutItem[]
): GridLayoutItem[] => {
	// Create a Map for quick lookups of user's saved widget settings.
	const savedLayoutMap = new Map(
		savedLayout.map( ( item ) => [ item.key, item ] )
	);

	// Iterate over the default layout, as it's the source of truth for which widgets should be displayed.
	const mergedLayout = defaultLayout.map( ( defaultItem ) => {
		const savedItem = savedLayoutMap.get( defaultItem.key );

		// If the user has a saved version of this widget, merge them.
		// The saved properties (especially x, y, width, height) will
		// overwrite the default ones.
		if ( savedItem ) {
			return {
				...defaultItem,
				...savedItem,
			};
		}

		// Otherwise, this is a new widget for this user, so use the default.
		return defaultItem;
	} );

	return mergedLayout;
};

/**
 * Custom hook to get and set the dashboard layout preference for multiple tabs.
 *
 * @param  tabId - The tab identifier to get/set layout for. Defaults to 'general'.
 * @return {Array} An array containing the saved layout and a function to set it.
 */
export const useDashboardLayoutPreference = (
	tabId: ProductType = 'general'
) => {
	const savedLayouts = useSelect( ( select ) => {
		const { get } = select( preferencesStore );

		const stored = get(
			'woocommerce/woocommerce-analytics',
			'dashboardLayouts'
		);
		if ( stored ) {
			try {
				return JSON.parse( stored );
			} catch ( e ) {
				return {};
			}
		}

		return {};
	}, [] );

	// Get the layout for the specific tab, or use default
	const defaultLayout = getDefaultLayoutForTab( tabId );
	const savedLayout = savedLayouts[ tabId ];
	const tabLayout = useMemo( () => {
		return savedLayout
			? mergeLayouts( savedLayout, defaultLayout )
			: defaultLayout;
	}, [ savedLayout, defaultLayout ] );

	const setTabLayout = useCallback(
		( newLayout: GridLayoutItem[] ) => {
			const updatedLayouts = { ...savedLayouts, [ tabId ]: newLayout };

			dispatch( preferencesStore ).set(
				'woocommerce/woocommerce-analytics',
				'dashboardLayouts',
				JSON.stringify( updatedLayouts )
			);
		},
		[ savedLayouts, tabId ]
	);

	return [ tabLayout, setTabLayout ] as const;
};
