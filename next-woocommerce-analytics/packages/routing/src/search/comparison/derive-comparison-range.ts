/**
 * External dependencies
 */
import {
	normalizeReportParams,
	localTZDate,
	dateToISOStringWithLocalTZ,
	getSiteTimezone,
} from '@next-woo-analytics/data';
import {
	getComparisonRangeFromPreset,
	type PresetId,
	startOfDayTZ,
	endOfDayTZ,
} from '@next-woo-analytics/datetime';

type ReportParams = NonNullable<
	Parameters< typeof normalizeReportParams >[ 0 ]
>;

/**
 * Map URL/UI preset ids to the canonical PresetId used by datetime.
 * (Accepts variants with hyphen or underscore for robustness)
 */
const toPresetId = ( value?: string ): PresetId | undefined => {
	switch ( value ) {
		case 'previous-period':
		case 'previous_period':
			return 'previous-period';
		case 'previous-week':
		case 'previous_week':
			return 'previous-week';
		case 'previous-month':
		case 'previous_month':
			return 'previous-month';
		case 'previous-year':
		case 'previous_year':
			return 'previous-year';
		default:
			return undefined;
	}
};

/**
 * Derive compare_from/compare_to from the main range + preset,
 * honoring the site's timezone via existing data utils.
 *
 * Rules:
 * - Only derive when comparison is enabled (comp === "1") AND a preset is present.
 * - Normalize main range to site-local day bounds before computing presets.
 * - Return ISO strings WITH site offset (same format you write to the URL).
 */
export function deriveComparisonRange( opts: ReportParams ):
	| {
			compare_from: string;
			compare_to: string;
	  }
	| undefined {
	// Require comparison enabled + preset
	const presetId = toPresetId( opts.compare_preset );
	if ( opts.comp !== '1' || ! presetId ) {
		return undefined;
	}

	// Need valid main range
	if ( ! opts.from || ! opts.to ) {
		return undefined;
	}

	// Parse URL params (ISO+offset) to instants
	const fromInstant = new Date( opts.from );
	const toInstant = new Date( opts.to );
	if ( isNaN( fromInstant.getTime() ) || isNaN( toInstant.getTime() ) ) {
		return undefined;
	}

	// Normalize to site-local day bounds
	const timezone = getSiteTimezone();
	const reference = {
		from: startOfDayTZ( fromInstant, timezone ),
		to: endOfDayTZ( toInstant, timezone ),
	};

	// Compute comparison range (Dates)
	const cmp = getComparisonRangeFromPreset( reference, presetId );
	if ( ! cmp?.from || ! cmp?.to ) {
		return undefined;
	}

	// Serialize back to ISO with site offset (string-to-string stable)
	return {
		compare_from: dateToISOStringWithLocalTZ( cmp.from ),
		compare_to: dateToISOStringWithLocalTZ( cmp.to ),
	};
}
