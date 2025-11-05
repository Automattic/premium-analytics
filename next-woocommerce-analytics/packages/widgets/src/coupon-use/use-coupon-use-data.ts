/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useReportCoupons } from '@next-woo-analytics/data';

/**
 * Internal dependencies
 */
import { buildCouponUseDonutChartData } from './build-coupon-use-donut-chart-data';

type ReportParams = Parameters< typeof useReportCoupons >[ 0 ];

export function useCouponUseDataForDonutChart( search: ReportParams ) {
	const { primary, comparison, hasComparison } = useReportCoupons( search );

	const {
		data: coupons,
		isLoading,
		isFetching,
		dataUpdatedAt,
		isSuccess,
	} = primary;
	const { data: comparisonCoupons } = comparison;

	const chartDataResult = useMemo(
		() => buildCouponUseDonutChartData( coupons, comparisonCoupons ),
		[ coupons, comparisonCoupons ]
	);

	return {
		...chartDataResult,
		hasComparison,
		isLoading,
		isFetching,
		hasData: !! coupons,
		hasPreviousData: isSuccess && dataUpdatedAt > 0,
	};
}
