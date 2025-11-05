/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useReportCustomers } from '@next-woo-analytics/data';

/**
 * Internal dependencies
 */
import { buildRevenueByCustomerTypeDonutChartData } from './build-revenue-by-customer-type-donut-chart-data';
import { useProductTypeFilters } from '../shared/utils/product-type-filters';

type ReportParams = Parameters< typeof useReportCustomers >[ 0 ];

export function useRevenueByCustomerTypeDataForDonutChart(
	search: ReportParams
) {
	const filters = useProductTypeFilters( search.section );

	const { primary, comparison, hasComparison } = useReportCustomers( {
		...search,
		filters,
	} );

	const {
		data: customers,
		isLoading,
		isFetching,
		dataUpdatedAt,
		isSuccess,
	} = primary;
	const { data: comparisonCustomers } = comparison;

	const chartDataResult = useMemo(
		() =>
			buildRevenueByCustomerTypeDonutChartData(
				customers,
				comparisonCustomers
			),
		[ customers, comparisonCustomers ]
	);

	return {
		...chartDataResult,
		hasComparison,
		isLoading,
		isFetching,
		hasData: !! customers,
		hasPreviousData: isSuccess && dataUpdatedAt > 0,
	};
}
