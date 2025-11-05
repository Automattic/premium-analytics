/**
 * External dependencies
 */
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { getComparisonRangeFromPreset } from '@next-woo-analytics/datetime';

/**
 * Internal dependencies
 */
import { dateToISOStringWithLocalTZ, localTZDate } from '../utils';
import { getDefaultIntervalForPeriod } from '../utils/interval';
import type { ReportParams } from '../utils/search';

export const getDefaultQueryParams = (
	withComparison = false
): ReportParams => {
	const now = new Date();
	const initOfToday = localTZDate( startOfDay( now ) );

	// Last 30 days. Re localTZDate.
	const from = localTZDate( subDays( initOfToday, 30 ) );

	// End of yesterday. Re localTZDate.
	const to = localTZDate( endOfDay( subDays( initOfToday, 1 ) ) );

	const fromString = dateToISOStringWithLocalTZ( from );
	const toString = dateToISOStringWithLocalTZ( to );

	// ToDo: Maybe we should move the default preset to this package.
	const preset = 'last-30-days';

	// Calculate the interval from the default range (last 30 days).
	const interval = getDefaultIntervalForPeriod(
		undefined,
		fromString,
		toString
	);

	if ( ! withComparison ) {
		return {
			from: fromString,
			to: toString,
			preset,
			interval,
		};
	}

	const comparisonParams = getComparisonRangeFromPreset(
		{
			from,
			to,
		},
		'previous-month'
	);

	return {
		from: fromString,
		to: toString,
		preset,
		interval,
		compare_from: comparisonParams?.from
			? dateToISOStringWithLocalTZ( comparisonParams?.from )
			: undefined,
		compare_to: comparisonParams?.to
			? dateToISOStringWithLocalTZ( comparisonParams?.to )
			: undefined,
		compare_preset: 'previous-month',
		comp: '1',
	};
};
