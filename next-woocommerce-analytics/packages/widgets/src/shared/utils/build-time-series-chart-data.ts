/**
 * External dependencies
 */
import { parseISO, addHours, differenceInHours } from 'date-fns';
import { getDateRangeLabel } from '@next-woo-analytics/components';
import { type DataPointDate, type SeriesData } from '@automattic/charts';
import { localTZDate } from '@next-woo-analytics/data';

/**
 * Generic type for time series data that has date_start and metric values
 */
type TimeSeriesData = {
	date_start: string;
	[ key: string ]: string | number;
};

type TimeSeriesResponse< T extends TimeSeriesData > = {
	data: T[];
	summary: T & { date_end: string };
};

/**
 * Map time series items array into chart series data.
 * When the offset is provided, it will be used to adjust the date of chart items
 */
function mapTimeSeriesToLineChartData< T extends TimeSeriesData >(
	data: T[],
	metricKey: keyof T,
	offset = 0
): DataPointDate[] {
	if ( ! data ) {
		return [];
	}

	return data.map( ( item ) => {
		const date = localTZDate( item.date_start );

		// Adjust the date by the data offset when it's provided
		const adjustedDate = offset ? addHours( date, offset ) : date;

		return {
			date: adjustedDate,
			value: Number( item[ metricKey ] ),
			realDate: date,
		};
	} );
}

type BuildTimeSeriesChartOptions< T extends TimeSeriesData > = {
	primary: TimeSeriesResponse< T >;
	comparison?: TimeSeriesResponse< T >;
	metricKey: keyof T;
	emptyDataFallback?: 'empty-array' | 'no-data-series';
};

/**
 * Generic function to build line chart series from time series data
 */
export function buildTimeSeriesChartData< T extends TimeSeriesData >( {
	primary,
	comparison,
	metricKey,
	emptyDataFallback = 'empty-array',
}: BuildTimeSeriesChartOptions< T > ): SeriesData[] {
	if ( ! primary.data?.length ) {
		if ( emptyDataFallback === 'no-data-series' ) {
			return [
				{
					label: 'No data available',
					data: [],
				},
			];
		}
		return [];
	}

	const primarySeries: SeriesData = {
		label: getDateRangeLabel( {
			from: localTZDate( primary.summary.date_start ),
			to: localTZDate( primary.summary.date_end ),
		} ),
		data: mapTimeSeriesToLineChartData( primary.data, metricKey ),
		group: 'primary',
	};

	if ( ! comparison?.data?.length ) {
		return [ primarySeries ];
	}

	/*
	 * Comparison data
	 */
	const primaryStartDate = primary.summary?.date_start
		? parseISO( primary.summary.date_start )
		: null;

	/*
	 * Align the comparison period to the current one.
	 * In the LineChart context, it means that we need to
	 * compute the difference between the current period
	 * and the comparison period.
	 */
	const comparisonStartDate = comparison?.summary?.date_start
		? parseISO( comparison?.summary.date_start )
		: null;

	/*
	 * Calculate the date offset between the current period
	 * and the comparison period.
	 */
	const offset =
		comparisonStartDate && primaryStartDate
			? differenceInHours( primaryStartDate, comparisonStartDate )
			: 0;

	const comparisonSeries: SeriesData = {
		label: getDateRangeLabel( {
			from: localTZDate( comparison.summary.date_start ),
			to: localTZDate( comparison.summary.date_end ),
		} ),
		data: mapTimeSeriesToLineChartData(
			comparison.data,
			metricKey,
			offset
		),
		group: 'primary',
		options: {
			type: 'comparison',
		},
	};

	return [ primarySeries, comparisonSeries ];
}
