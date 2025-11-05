/**
 * External dependencies
 */
import { useQuery } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import { reportCouponsQuery } from '../queries';
import { hasComparisonEnabled, type ReportParams } from '../utils/search';

export function useReportCoupons( params: ReportParams ) {
	const comparisonEnabled = hasComparisonEnabled( params );
	const couponsQuery = reportCouponsQuery( {
		from: params.from,
		to: params.to,
		interval: params.interval,
		filters: params.filters,
	} );

	const couponsComparison = comparisonEnabled
		? reportCouponsQuery( {
				from: params.compare_from,
				to: params.compare_to,
				interval: params.interval,
				filters: params.filters,
		  } )
		: {
				queryKey: [
					'reports',
					'coupons',
					'__comparison__',
					'disabled',
				],
		  };

	const primary = useQuery( couponsQuery );

	const comparison = useQuery( {
		...couponsComparison,
		enabled: comparisonEnabled && ( couponsComparison.enabled ?? true ),
	} );

	return {
		primary,
		comparison,
		hasComparison: comparisonEnabled,
	};
}
