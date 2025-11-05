/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { getComparisonRangeFromPreset } from '@next-woo-analytics/datetime';

/**
 * Internal dependencies
 */
import type { DateRange } from '../date-range-popover/date-range-filter';
import type { DateRangePreset } from '../date-range-presets/date-range-presets';

type PresetId = Parameters< typeof getComparisonRangeFromPreset >[ 1 ];

/**
 * Preset configuration with labels and IDs.
 */
const presetConfig: { id: PresetId; label: string }[] = [
	{
		id: 'previous-period',
		label: __( 'Previous period', 'woocommerce-analytics' ),
	},
	{
		id: 'previous-week',
		label: __( 'Previous week', 'woocommerce-analytics' ),
	},
	{
		id: 'previous-month',
		label: __( 'Previous month', 'woocommerce-analytics' ),
	},
	{
		id: 'previous-year',
		label: __( 'Previous year', 'woocommerce-analytics' ),
	},
];

/**
 * Custom hook that generates comparison date presets
 * based on a reference date range.
 */
export function useComparisonDatePresets(
	referenceRange: DateRange
): DateRangePreset[] {
	return useMemo( () => {
		if ( ! referenceRange.from || ! referenceRange.to ) {
			return [];
		}

		return presetConfig
			.map( ( { id, label } ) => {
				const range = getComparisonRangeFromPreset(
					referenceRange,
					id
				);
				return range ? { id: id as string, label, range } : null;
			} )
			.filter( ( preset ): preset is DateRangePreset => preset !== null );
	}, [ referenceRange ] );
}
