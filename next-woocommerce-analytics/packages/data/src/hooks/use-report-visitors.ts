/**
 * External dependencies
 */
import { useQuery } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import { reportVisitorsQuery } from '../queries/report-visitors-query';
import { hasComparisonEnabled, type ReportParams } from '../utils/search';

export function useReportVisitors( params: ReportParams ) {
	const comparisonEnabled = hasComparisonEnabled( params );

	const visitorsQuery = reportVisitorsQuery( {
		from: params.from,
		to: params.to,
		interval: params.interval,
	} );

	const visitorsComparison = comparisonEnabled
		? reportVisitorsQuery( {
				from: params.compare_from,
				to: params.compare_to,
				interval: params.interval,
		  } )
		: {
				queryKey: [
					'reports',
					'visitors',
					'by-date',
					'__comparison__',
					'disabled',
				],
		  };

	const primary = useQuery( visitorsQuery );

	const comparison = useQuery( {
		...visitorsComparison,
		enabled: comparisonEnabled && ( visitorsComparison.enabled ?? true ),
	} );

	return {
		primary,
		comparison,
		hasComparison: comparisonEnabled,
	};
}
