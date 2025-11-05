/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useReportOrderAttribution } from '@next-woo-analytics/data';

/**
 * Internal dependencies
 */
import { buildSalesByDeviceDonutChartData } from './build-sales-by-device-donut-chart-data';
import {
	useProductTypeFilters,
	hasProductFilters,
	type ProductType,
} from '../shared/utils/product-type-filters';

type ReportParams = Parameters< typeof useReportOrderAttribution >[ 0 ];

export function useSalesByDeviceDataForDonutChart(
	searchWithView: ReportParams
) {
	const filters = useProductTypeFilters(
		searchWithView.section as ProductType
	);
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

	const chartDataResult = useMemo( () => {
		if ( ! primaryData ) {
			return {
				chartData: [],
				total: 0,
				comparisonTotal: 0,
				legendData: [],
			};
		}

		return buildSalesByDeviceDonutChartData( {
			orderAttribution: primaryData,
			useComparison: hasComparison,
		} );
	}, [ primaryData, hasComparison ] );

	return {
		...chartDataResult,
		hasComparison,
		isLoading,
		isFetching,
		hasData: !! primaryData,
		hasPreviousData: isSuccess && dataUpdatedAt > 0,
	};
}
