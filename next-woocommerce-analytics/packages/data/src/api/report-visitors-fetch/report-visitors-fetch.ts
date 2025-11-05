/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import type { BaseReportParams } from '../../utils/types';
import { reportsPath } from '../constants';

type ReportsVisitorsByDateSummary = {
	active_sessions: string;
	visitors: string;
	date_end: string;
	date_start: string;
};

type VisitorsReportDataItem = {
	time_interval: string;
	date_start: string;
	date_end: string;
	active_sessions: string;
	visitors: string;
};

type ReportsVisitorsByDateResponse = {
	items: VisitorsReportDataItem[];
	summary: ReportsVisitorsByDateSummary;
};

export type RequestReportVisitorsParams = BaseReportParams;

export async function fetchReportVisitors( {
	from,
	to,
	interval,
}: RequestReportVisitorsParams ): Promise< ReportsVisitorsByDateResponse > {
	const path = addQueryArgs( `${ reportsPath }/sessions/by-date`, {
		from,
		to,
		interval,
	} );

	return apiFetch( { path } ) as Promise< ReportsVisitorsByDateResponse >;
}
