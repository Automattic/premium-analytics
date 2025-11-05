/**
 * External dependencies
 */
import {
	differenceInDays,
	subDays,
	subWeeks,
	subMonths,
	subYears,
	startOfDay,
	endOfDay,
} from 'date-fns';

/**
 * Supported comparison preset identifiers.
 */
export type DateRange = { from?: Date; to?: Date };

export type PresetId =
	| 'previous-period'
	| 'previous-week'
	| 'previous-month'
	| 'previous-year';

/**
 * Returns a comparison DateRange (as Date objects) derived from a reference range
 * and a given preset.
 *
 * - This function is pure and has no side effects.
 * - It does not apply any timezone adjustments. The caller is responsible for
 *   normalizing dates to the desired local day boundaries before passing them in.
 *
 * @param reference - The reference range to compare against (must include both `from` and `to`).
 * @param presetId  - One of the supported preset identifiers.
 * @return A new DateRange for the comparison period, or `undefined` if inputs are invalid.
 */
export function getComparisonRangeFromPreset(
	reference: DateRange,
	presetId: PresetId
): DateRange | undefined {
	if ( ! reference?.from || ! reference?.to ) {
		return undefined;
	}

	const refFrom = reference.from;
	const refTo = reference.to;

	const clampDayBound = ( date: Date, bound: 0 | 1 ) =>
		bound === 1 ? endOfDay( startOfDay( date ) ) : startOfDay( date );

	if ( presetId === 'previous-period' ) {
		const daysInclusive = differenceInDays( refTo, refFrom ) + 1;
		return {
			from: clampDayBound( subDays( refFrom, daysInclusive ), 0 ),
			to: clampDayBound( subDays( refTo, daysInclusive ), 1 ),
		};
	}

	if ( presetId === 'previous-week' ) {
		return {
			from: clampDayBound( subWeeks( refFrom, 1 ), 0 ),
			to: clampDayBound( subWeeks( refTo, 1 ), 1 ),
		};
	}

	if ( presetId === 'previous-month' ) {
		return {
			from: clampDayBound( subMonths( refFrom, 1 ), 0 ),
			to: clampDayBound( subMonths( refTo, 1 ), 1 ),
		};
	}

	if ( presetId === 'previous-year' ) {
		return {
			from: clampDayBound( subYears( refFrom, 1 ), 0 ),
			to: clampDayBound( subYears( refTo, 1 ), 1 ),
		};
	}

	return undefined;
}
