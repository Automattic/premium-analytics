/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useReportCoupons } from '@next-woo-analytics/data';

/**
 * Internal dependencies
 */
import { buildSalesByCouponSemiCircleData } from './build-sales-by-coupon-semi-circle-data';

type ReportParams = Parameters< typeof useReportCoupons >[ 0 ];

export function useSalesByCouponDataForSemiCircle(
	search: ReportParams,
	totalSegments = 3
) {
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
		() =>
			buildSalesByCouponSemiCircleData(
				coupons,
				comparisonCoupons,
				totalSegments
			),
		[ coupons, comparisonCoupons, totalSegments ]
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
