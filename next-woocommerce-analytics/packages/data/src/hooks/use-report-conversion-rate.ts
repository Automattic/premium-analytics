/**
 * External dependencies
 */
import { useQuery } from '@tanstack/react-query';

/**
 * Internal dependencies
 */
import { reportConversionRateQuery } from '../queries';
import {
	hasComparisonEnabled,
	type ReportParams,
	type FilterCondition,
} from '../utils/search';

export function useReportConversionRate(
	params: ReportParams & { filters?: FilterCondition[] }
) {
	const comparisonEnabled = hasComparisonEnabled( params );

	const conversionRateQuery = reportConversionRateQuery( {
		from: params.from,
		to: params.to,
		interval: params.interval,
		filters: params.filters,
	} );

	const conversionRateComparison = comparisonEnabled
		? reportConversionRateQuery( {
				from: params.compare_from,
				to: params.compare_to,
				interval: params.interval,
				filters: params.filters,
		  } )
		: {
				queryKey: [
					'reports',
					'conversion-rate',
					'__comparison__',
					'disabled',
				],
		  };

	const primary = useQuery( conversionRateQuery );

	const comparison = useQuery( {
		...conversionRateComparison,
		enabled:
			comparisonEnabled && ( conversionRateComparison.enabled ?? true ),
	} );

	return {
		primary,
		comparison,
		hasComparison: comparisonEnabled,
		isLoading: primary.isLoading || comparison.isLoading,
		isFetching: primary.isFetching || comparison.isFetching,
		hasData:
			Boolean( primary.data?.steps?.length ) ||
			Boolean( comparison.data?.summary ),
		hasPreviousData:
			Boolean( primary.dataUpdatedAt && primary.dataUpdatedAt > 0 ) ||
			Boolean( comparison.dataUpdatedAt && comparison.dataUpdatedAt > 0 ),
	};
}
