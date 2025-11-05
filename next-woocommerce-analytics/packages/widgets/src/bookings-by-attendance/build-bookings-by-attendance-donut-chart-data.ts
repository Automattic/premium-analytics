/**
 * External dependencies
 */
import type { ComponentProps } from 'react';
import type { PieChartUnresponsive as PieChart } from '@automattic/charts';
import type { ReportDataMap } from '@next-woo-analytics/data';
import { formatMetricValue } from '@next-woo-analytics/formatters';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { LegendItem } from '../shared';

/**
 * Derive the chart data type from PieChart's expected data structure
 */
type PieChartData = ComponentProps< typeof PieChart >[ 'data' ];

// Color for cancelled status
const CANCELLED_COLOR = 'rgb(240, 240, 240)';

export interface BookingsByStatusChartData {
	chartData: PieChartData;
	total: number;
	comparisonTotal: number;
	legendData: LegendItem[];
}

export function buildBookingsByAttendanceDonutChartData(
	bookings: ReportDataMap[ 'bookings' ] | undefined,
	comparisonBookings: ReportDataMap[ 'bookings' ] | undefined
): BookingsByStatusChartData {
	if ( ! bookings?.summary ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: 0,
			legendData: [],
		};
	}

	const { summary } = bookings;
	const comparisonSummary = comparisonBookings?.summary;

	// Define status mapping with user-friendly labels
	const statusMap = [
		{
			key: 'attendance_status_booked' as const,
			label: __( 'Booked', 'woocommerce-analytics' ),
		},
		{
			key: 'attendance_status_checked_in' as const,
			label: __( 'Checked In', 'woocommerce-analytics' ),
		},
		{
			key: 'attendance_status_no_show' as const,
			label: __( 'No Show', 'woocommerce-analytics' ),
		},
		{
			key: 'status_cancelled' as const,
			label: __( 'Cancelled', 'woocommerce-analytics' ),
		},
	];

	// Calculate values for each status
	const statusValues = statusMap.map( ( status ) => {
		const value = summary[ status.key ] || 0;
		const comparisonValue = comparisonSummary
			? comparisonSummary[ status.key ] || 0
			: 0;

		return {
			...status,
			value,
			comparisonValue,
		};
	} );

	// Calculate total bookings across all statuses
	const totalBookings = statusValues.reduce(
		( sum, status ) => sum + status.value,
		0
	);

	const comparisonTotalBookings = statusValues.reduce(
		( sum, status ) => sum + status.comparisonValue,
		0
	);

	// If there are no bookings, return empty state
	if ( totalBookings === 0 ) {
		return {
			chartData: [],
			total: 0,
			comparisonTotal: comparisonTotalBookings,
			legendData: [],
		};
	}

	// Filter out statuses with zero bookings
	const statusesWithData = statusValues.filter(
		( status ) => status.value > 0
	);

	// Build chart data
	const chartData: PieChartData = statusesWithData.map( ( status ) => ( {
		label: '', // Empty label to hide labels on the chart
		value: status.value,
		formattedValue: formatMetricValue( status.value, 'number', {
			useMultipliers: false,
			decimals: 0,
		} ),
		percentage:
			totalBookings > 0 ? ( status.value / totalBookings ) * 100 : 0,
		...( status.key === 'status_cancelled' && { color: CANCELLED_COLOR } ),
	} ) );

	// Build legend data
	const legendData: LegendItem[] = statusesWithData.map( ( status ) => ( {
		label: status.label,
		value: status.value,
		formattedValue: formatMetricValue( status.value, 'number', {
			useMultipliers: false,
			decimals: 0,
		} ),
		comparison: status.comparisonValue,
		...( status.key === 'status_cancelled' && { color: CANCELLED_COLOR } ),
	} ) );

	return {
		chartData,
		total: totalBookings,
		comparisonTotal: comparisonTotalBookings,
		legendData,
	};
}