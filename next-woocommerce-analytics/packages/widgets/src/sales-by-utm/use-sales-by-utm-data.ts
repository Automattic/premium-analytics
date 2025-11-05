/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useReportOrderAttribution } from '@next-woo-analytics/data';
import { getDateRangeLabel } from '@next-woo-analytics/components';

/**
 * Internal dependencies
 */
import { buildSalesByUtmLeaderboardChartData } from './build-sales-by-utm-leaderboard-chart-data';
import {
	useProductTypeFilters,
	hasProductFilters,
} from '../shared/utils/product-type-filters';

type ReportParams = Parameters< typeof useReportOrderAttribution >[ 0 ];

export function useSalesByUtmDataForLeaderboardChart(
	searchWithView: ReportParams
) {
	const filters = useProductTypeFilters( searchWithView.section );
	const hasProductFIlters = hasProductFilters( filters );

	const { primary, hasComparison } = useReportOrderAttribution(
		{
			...searchWithView,
			filters,
		},
		hasProductFIlters
	);
	const {
		data: primaryData,
		isLoading,
		isFetching,
		dataUpdatedAt,
		isSuccess,
	} = primary;

	const chartData = useMemo( () => {
		if ( ! primaryData ) {
			return [];
		}
		return buildSalesByUtmLeaderboardChartData( {
			orderAttribution: primaryData,
			useComparison: hasComparison,
		} );
	}, [ primaryData, hasComparison ] );

	const legendLabels = useMemo( () => {
		if ( ! searchWithView.from || ! searchWithView.to ) {
			return undefined;
		}

		const primaryLabel = getDateRangeLabel( {
			from: new Date( searchWithView.from ),
			to: new Date( searchWithView.to ),
		} );

		const comparisonLabel =
			searchWithView.compare_from && searchWithView.compare_to
				? getDateRangeLabel( {
						from: new Date( searchWithView.compare_from ),
						to: new Date( searchWithView.compare_to ),
				  } )
				: 'Previous period';

		return {
			primary: primaryLabel,
			comparison: comparisonLabel,
		};
	}, [
		searchWithView.from,
		searchWithView.to,
		searchWithView.compare_from,
		searchWithView.compare_to,
	] );

	return {
		chartData,
		hasComparison,
		isLoading,
		isFetching,
		hasData: !! primaryData,
		hasPreviousData: isSuccess && dataUpdatedAt > 0,
		legendLabels,
	};
}
