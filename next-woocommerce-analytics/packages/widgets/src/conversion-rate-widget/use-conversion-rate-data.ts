/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useReportConversionRate } from '@next-woo-analytics/data';

/**
 * Internal dependencies
 */
import { useProductTypeFilters } from '../shared/utils/product-type-filters';

type ReportParams = Parameters< typeof useReportConversionRate >[ 0 ];

export function useConversionRateData( search: ReportParams ) {
	const filters = useProductTypeFilters( search.section );

	const {
		primary,
		comparison,
		hasComparison,
		isLoading,
		isFetching,
		hasData,
	} = useReportConversionRate( {
		...search,
		filters,
	} );

	const { data: conversionData, isSuccess, dataUpdatedAt } = primary;
	const { data: comparisonData } = comparison;

	const result = useMemo( () => {
		if ( ! conversionData ) {
			return {
				steps: [],
				overallRate: 0,
				previousRate: null,
				activeSessions: 0,
			};
		}

		// Calculate previous rate for comparison
		let previousRate: number | null = null;
		if ( comparisonData?.summary ) {
			previousRate = comparisonData.summary.conversion_rate;
		}

		return {
			steps: conversionData.steps || [],
			overallRate: conversionData.overallRate || 0,
			previousRate,
			activeSessions: conversionData.summary?.active_sessions || 0,
		};
	}, [ conversionData, comparisonData ] );

	return {
		...result,
		hasComparison,
		isLoading,
		isFetching,
		hasData,
		hasPreviousData: isSuccess && dataUpdatedAt > 0,
	};
}
