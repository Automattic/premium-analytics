/**
 * External dependencies
 */
import { differenceInDays } from 'date-fns';

/**
 * Internal dependencies
 */
import type { IntervalType } from './search';
import { localTZDate } from './date';

function getAllowedIntervalsByRange(
	from: string,
	to: string
): IntervalType[] {
	const daysDiff = Math.abs(
		differenceInDays( localTZDate( from ), localTZDate( to ) )
	);

	if ( daysDiff >= 365 ) {
		return [ 'month', 'quarter' ];
	} else if ( daysDiff >= 90 ) {
		return [ 'week', 'month' ];
	} else if ( daysDiff >= 28 ) {
		return [ 'day', 'week' ];
	} else if ( daysDiff >= 3 ) {
		return [ 'day' ];
	} else if ( daysDiff >= 1 ) {
		return [ 'hour', 'day' ];
	}

	return [ 'hour', 'day' ];
}

/**
 * Returns the allowed selectable intervals for a specific period.
 *
 * @return {Array} Array containing allowed intervals.
 */
function getAllowedIntervalsForPeriod(
	period: string | undefined,
	from: string,
	to: string
): IntervalType[] {
	switch ( period ) {
		case 'today':
		case 'yesterday':
			return [ 'hour', 'day' ];
		case 'last-7-days':
			return [ 'day' ];
		case 'last-30-days':
		case 'last-month':
			return [ 'day', 'week' ];
		case 'last-90-days':
			return [ 'week', 'month' ];
		case 'last-12-months':
		case 'last-365-days':
		case 'last-year':
			return [ 'month', 'quarter' ];
		default:
			return getAllowedIntervalsByRange( from, to );
	}
}

export function getDefaultIntervalForPeriod(
	period: string | undefined,
	from: string,
	to: string
): IntervalType {
	return getAllowedIntervalsForPeriod( period, from, to )?.[ 0 ] ?? 'day';
}
