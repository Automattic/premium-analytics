/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useReportOrders } from '@next-woo-analytics/data';

/**
 * Internal dependencies
 */
import { buildTotalReturnsDonutChartData } from './build-total-returns-donut-chart-data';
import {
	useProductTypeFilters,
	hasProductFilters,
} from '../shared/utils/product-type-filters';

export function useTotalReturnsDataForDonutChart( {
	search,
}: {
	search: any; // TODO: Type this properly based on search params
} ) {
	const filters = useProductTypeFilters( search.section );
	const { primary, comparison, hasComparison } = useReportOrders(
		{
			...search,
			filters,
		},
		hasProductFilters( filters )
	);

	const {
		data: orders,
		isLoading,
		isFetching,
		dataUpdatedAt,
		isSuccess,
	} = primary;
	const { data: comparisonOrders } = comparison;

	const chartDataResult = useMemo(
		() => buildTotalReturnsDonutChartData( orders, comparisonOrders ),
		[ orders, comparisonOrders ]
	);

	return {
		...chartDataResult,
		hasComparison,
		isLoading,
		isFetching,
		hasData: !! orders,
		hasPreviousData: isSuccess && dataUpdatedAt > 0,
	};
}
