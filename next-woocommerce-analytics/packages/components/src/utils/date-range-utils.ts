/**
 * External dependencies
 */
import { format } from 'date-fns';

/**
 * Internal dependencies
 */
import { type DateRange } from '../date-range-popover/date-range-filter';

/**
 * Get the label for a date range.
 *
 * @param {DateRange} range - The date range.
 * @return {string} The label for the date range.
 */
export const getDateRangeLabel = ( { from, to }: DateRange ): string => {
	if ( ! from || ! to ) {
		return '';
	}

	if ( format( from, 'yyyy-MM-dd' ) === format( to, 'yyyy-MM-dd' ) ) {
		return format( from, 'MMM d, yyyy' );
	}

	if ( format( from, 'MMM yyyy' ) === format( to, 'MMM yyyy' ) ) {
		return `${ format( from, 'MMM d' ) }-${ format( to, 'd, yyyy' ) }`;
	}

	if ( format( from, 'yyyy' ) === format( to, 'yyyy' ) ) {
		return `${ format( from, 'MMM d' ) }-${ format( to, 'MMM d, yyyy' ) }`;
	}

	return `${ format( from, 'MMM d, yyyy' ) }-${ format(
		to,
		'MMM d, yyyy'
	) }`;
};
