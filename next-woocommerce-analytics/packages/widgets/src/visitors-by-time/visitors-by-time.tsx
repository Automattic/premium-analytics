/**
 * External dependencies
 */
import { useReportVisitors } from '@next-woo-analytics/data';
import { useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';
import { MetricComparisonWidget } from '@next-woo-analytics/widgets-toolkit';

/**
 * Internal dependencies
 */
import { buildVisitorsLineChartSeries } from './build-visitors-line-chart-series';
import { WidgetCard, useWidgetLoading } from '../shared';

type VisitorsByTimeProps = {
	metricKey: 'visitors';
	title: string;
	description?: string;
	linkTo?: string;
};

export function VisitorsByTime( {
	metricKey = 'visitors',
	title,
	description,
	linkTo,
}: VisitorsByTimeProps ) {
	const search = useSearch( {
		from: '/wc-analytics/dashboard',
	} );

	const { primary, comparison } = useReportVisitors( search );

	const {
		data: visitors,
		isLoading,
		isFetching,
		dataUpdatedAt,
		isSuccess,
	} = primary;
	const { data: comparisonVisitors } = comparison;
	const hasData = !! visitors;
	const hasPreviousData = isSuccess && dataUpdatedAt > 0;

	const loadingState = useWidgetLoading( {
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
	} );

	// Build line chart series data
	const visitorSeries = useMemo( () => {
		return visitors?.summary
			? buildVisitorsLineChartSeries( {
					visitors,
					comparison: comparisonVisitors,
					metricKey,
			  } )
			: [];
	}, [ visitors, comparisonVisitors, metricKey ] );

	return (
		<WidgetCard
			title={ title }
			linkTo={ linkTo }
			description={ description }
			loadingState={ loadingState }
		>
			<MetricComparisonWidget
				value={ visitors?.summary[ metricKey ] ?? 0 }
				comparisonValue={
					comparisonVisitors?.summary[ metricKey ] ?? null
				}
				series={ visitorSeries }
				dataFormat={ {
					type: 'number',
					options: { useMultipliers: true, decimals: 0 },
				} }
			/>
		</WidgetCard>
	);
}
