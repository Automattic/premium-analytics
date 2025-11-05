/**
 * External dependencies
 */
import { useSearch } from '@tanstack/react-router';

/**
 * Internal dependencies
 */
import { WidgetCard, DonutChart, useWidgetLoading } from '../shared';
import { useTotalReturnsDataForDonutChart } from './use-total-returns-data';

type TotalReturnsProps = {
	title: string;
	description?: string;
};

export function TotalReturns( { title, description }: TotalReturnsProps ) {
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
	} = useTotalReturnsDataForDonutChart( { search } );

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
			loadingState={ loadingState }
		>
			<DonutChart
				chartData={ chartData }
				total={ total }
				comparisonTotal={ comparisonTotal }
				hasComparison={ hasComparison }
				showLegend={ true }
				legendData={ legendData }
			/>
		</WidgetCard>
	);
}
