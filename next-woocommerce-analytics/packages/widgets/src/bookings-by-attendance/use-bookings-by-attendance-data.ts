/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useReportBookings } from '@next-woo-analytics/data';

/**
 * Internal dependencies
 */
import { buildBookingsByAttendanceDonutChartData } from './build-bookings-by-attendance-donut-chart-data';

type ReportParams = Parameters< typeof useReportBookings >[ 0 ];

export function useBookingsByAttendanceDataForDonutChart( search: ReportParams ) {
	const { primary, comparison, hasComparison } = useReportBookings( search );

	const {
		data: bookings,
		isLoading,
		isFetching,
		dataUpdatedAt,
		isSuccess,
	} = primary;
	const { data: comparisonBookings } = comparison;

	const chartDataResult = useMemo(
		() =>
			buildBookingsByAttendanceDonutChartData( bookings, comparisonBookings ),
		[ bookings, comparisonBookings ]
	);

	return {
		...chartDataResult,
		hasComparison,
		isLoading,
		isFetching,
		hasData: !! bookings,
		hasPreviousData: isSuccess && dataUpdatedAt > 0,
	};
}