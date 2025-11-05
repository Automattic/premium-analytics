/**
 * External dependencies
 */
import { useReportBookings } from '@next-woo-analytics/data';
import { useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';
import { MetricComparisonWidget } from '@next-woo-analytics/widgets-toolkit';

/**
 * Internal dependencies
 */
import { buildBookingCancellationsLineChartSeries } from './build-booking-cancellations-line-chart-series';
import { WidgetCard, useWidgetLoading } from '../shared';

type BookingCancellationsOverTimeProps = {
	title: string;
	description?: string;
	linkTo?: string;
};

export function BookingCancellationsOverTime( {
	title,
	description,
	linkTo,
}: BookingCancellationsOverTimeProps ) {
	const search = useSearch( {
		from: '/wc-analytics/dashboard',
	} );

	const {
		primary,
		comparison,
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
	} = useReportBookings( {
		...search,
		filters: [],
	} );

	const { data: bookings } = primary;
	const { data: comparisonBookings } = comparison;

	const loadingState = useWidgetLoading( {
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
	} );

	const bookingSeries = useMemo( () => {
		if ( ! bookings ) {
			return [];
		}
		return buildBookingCancellationsLineChartSeries( {
			bookings,
			comparison: comparisonBookings,
		} );
	}, [ bookings, comparisonBookings ] );

	return (
		<WidgetCard
			title={ title }
			linkTo={ linkTo }
			description={ description }
			loadingState={ loadingState }
		>
			<MetricComparisonWidget
				value={ bookings?.summary?.status_cancelled ?? 0 }
				comparisonValue={
					comparisonBookings?.summary?.status_cancelled ?? null
				}
				series={ bookingSeries }
				dataFormat={ {
					type: 'number',
					options: { useMultipliers: true, decimals: 0 },
				} }
			/>
		</WidgetCard>
	);
}
