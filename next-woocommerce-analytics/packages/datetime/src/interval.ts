/**
 * External dependencies
 */
import { differenceInDays } from 'date-fns';

/**
 * Internal types
 */
export type IntervalType =
	| 'hour'
	| 'day'
	| 'week'
	| 'month'
	| 'quarter'
	| 'year';

export function getAllowedIntervalsByRangeDates(
	from: Date,
	to: Date
): IntervalType[] {
	const daysDiff = Math.abs( differenceInDays( from, to ) );

	if ( daysDiff >= 365 ) {
		return [ 'week', 'month', 'quarter', 'year' ];
	} else if ( daysDiff >= 90 ) {
		return [ 'day', 'week', 'month', 'quarter' ];
	} else if ( daysDiff >= 28 ) {
		return [ 'day', 'week', 'month' ];
	} else if ( daysDiff >= 7 ) {
		return [ 'day', 'week' ];
	} else if ( daysDiff > 1 && daysDiff < 7 ) {
		return [ 'hour', 'day' ];
	}
	return [ 'hour', 'day' ];
}

export function getAllowedIntervalsForPeriodId(
	period: string
): IntervalType[] | undefined {
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
			return undefined;
	}
}

/**
 * If `periodId` is provided, use its fixed whitelist.
 * If not, calculate by range (dates already normalized).
 */
export function getAllowedIntervals(
	periodId: string | undefined,
	from: Date,
	to: Date
): IntervalType[] {
	const fromPeriod = periodId
		? getAllowedIntervalsForPeriodId( periodId )
		: undefined;
	return fromPeriod ?? getAllowedIntervalsByRangeDates( from, to );
}

/**
 * Given the current interval and the allowed list, returns:
 * - the current if it is valid
 * - the “coarser” nearest if not (according to canonical order)
 * - if nothing matches (extreme case), the last allowed of the list
 */
const ORDER: IntervalType[] = [
	'hour',
	'day',
	'week',
	'month',
	'quarter',
	'year',
];

export function coerceInterval(
	current: IntervalType | undefined,
	allowed: IntervalType[]
): IntervalType {
	if ( current && allowed.includes( current ) ) {
		return current;
	}
	// Choose the first allowed that is equal or coarser than the current
	if ( current ) {
		const currentIdx = ORDER.indexOf( current );
		for ( let i = currentIdx; i < ORDER.length; i++ ) {
			if ( allowed.includes( ORDER[ i ] ) ) {
				return ORDER[ i ];
			}
		}
	}
	// Fallback: the last allowed (typically the coarsest)
	return allowed[ allowed.length - 1 ];
}
