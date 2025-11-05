/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useSearch } from '@tanstack/react-router';

/**
 * Internal dependencies
 */
import {
	WidgetCard,
	type WidgetCategory,
	DonutChart,
	useWidgetLoading,
} from '../shared';
import { useBookingsByAttendanceDataForDonutChart } from './use-bookings-by-attendance-data';

type BookingsByAttendanceProps = {
	title?: string;
	description?: string;
	category?: WidgetCategory;
};

export function BookingsByAttendance( {
	title = __( 'Bookings by attendance', 'woocommerce-analytics' ),
	description = __(
		'Number of bookings by attendance over the selected time period.',
		'woocommerce-analytics'
	),
	category = 'Sales',
}: BookingsByAttendanceProps ) {
	const search = useSearch( {
		from: '/wc-analytics/dashboard',
	} );

	// All the data fetching and processing is now handled in the hook
	const {
		chartData,
		total,
		comparisonTotal,
		hasComparison,
		legendData,
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
	} = useBookingsByAttendanceDataForDonutChart( search );

	const loadingState = useWidgetLoading( {
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
	} );

	return (
		<WidgetCard
			title={ title }
			description={ description }
			category={ category }
			loadingState={ loadingState }
		>
			<DonutChart
				chartData={ chartData }
				total={ total }
				comparisonTotal={ comparisonTotal }
				hasComparison={ hasComparison }
				showLegend={ true }
				legendData={ legendData }
				format="number"
			/>
		</WidgetCard>
	);
}