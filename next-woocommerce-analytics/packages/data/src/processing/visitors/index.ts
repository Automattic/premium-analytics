/**
 * Internal dependencies
 */
import { fetchReportVisitors } from '../../api/report-visitors-fetch';
import type { Override } from '../../utils/types';

type ReportsVisitorsByDateResponse = Awaited<
	ReturnType< typeof fetchReportVisitors >
>;
type RawVisitorsReportDataItem =
	ReportsVisitorsByDateResponse[ 'items' ][ number ];
type SanitizedVisitorsByDateItem = Override<
	RawVisitorsReportDataItem,
	{
		active_sessions: number;
		visitors: number;
	}
>;

/**
 * Sanitize/process a single visitors item by converting strings to numbers
 */
function sanitizeVisitorsItem(
	item: RawVisitorsReportDataItem
): SanitizedVisitorsByDateItem {
	return {
		...item,
		active_sessions: parseInt( item.active_sessions, 10 ),
		visitors: parseInt( item.visitors, 10 ),
	};
}

/**
 * Processed response with numeric values
 */
type SanitizedVisitorsByDateResponse = {
	summary: SanitizedVisitorsByDateItem;
	data: SanitizedVisitorsByDateItem[];
};

/**
 * Sanitize the response from the sessions/by-date endpoint
 * Converts string values to numbers for easier calculations and charting.
 *
 * The `summary` single item has basically the same structure
 * as the `data` array items, so we can use the same mapper function for both.
 */
export const sanitizeReportVisitorsResponse = (
	response: ReportsVisitorsByDateResponse
): SanitizedVisitorsByDateResponse => {
	// Handle cases where response might not have the expected structure
	const defaultSummary = {
		active_sessions: '0',
		visitors: '0',
		date_start: '',
		date_end: '',
	};

	return {
		summary: sanitizeVisitorsItem( response?.summary || defaultSummary ),
		data: response?.items ? response.items.map( sanitizeVisitorsItem ) : [],
	};
};
