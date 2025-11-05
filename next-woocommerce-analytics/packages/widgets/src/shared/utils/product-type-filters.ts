/**
 * External dependencies
 */
import { useMemo } from 'react';
import type { FilterCondition } from '@next-woo-analytics/data';

/**
 * Product type filter utilities
 */

export type ProductType = 'general' | 'products' | 'bookings';

// Map product type categories to their specific types
const PRODUCT_TYPE_MAPPINGS: Record< ProductType, string[] > = {
	general: [],
	bookings: [ 'booking', 'bookable-event', 'bookable-service' ],
	products: [ 'simple', 'variable', 'variation' ],
};

/**
 * Product lookup table lavel filters.
 */
const PRODUCT_FILTER_KEYS = [
	'product_type',
	'virtual',
	'downloadable',
] as const;

/**
 * Checks if any of the provided filters are product-related filters
 *
 * @param filters - Array of filter conditions to check
 * @return True if any filter is product-related, false otherwise
 */
export function hasProductFilters( filters?: FilterCondition[] ): boolean {
	if ( ! filters || ! Array.isArray( filters ) || filters.length === 0 ) {
		return false;
	}

	return filters.some( ( filter ) =>
		PRODUCT_FILTER_KEYS.includes( filter.key as any )
	);
}

/**
 * Hook to create memoized filter conditions based on product type
 * @param productType The type of product to filter for
 * @param filterKey   The filter key to use (defaults to 'product_type')
 * @return Memoized array of filter conditions for the API
 */
export function useProductTypeFilters(
	productType?: ProductType,
	filterKey = 'product_type'
): FilterCondition[] {
	return useMemo( () => {
		if ( ! productType ) {
			return [];
		}

		const productTypes = PRODUCT_TYPE_MAPPINGS[ productType ] || [];

		if ( productTypes.length === 0 ) {
			return [];
		}

		return [
			{
				key: filterKey,
				value: productTypes,
				compare: 'IN' as const,
			},
		];
	}, [ productType, filterKey ] );
}
