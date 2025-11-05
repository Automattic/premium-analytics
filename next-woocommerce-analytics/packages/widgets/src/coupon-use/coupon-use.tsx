/**
 * External dependencies
 */
import { useSearch } from '@tanstack/react-router';

/**
 * Internal dependencies
 */
import { WidgetCard, DonutChart, useWidgetLoading } from '../shared';
import { useCouponUseDataForDonutChart } from './use-coupon-use-data';

type CouponUseProps = {
	title: string;
	description?: string;
};

export function CouponUse( { title, description }: CouponUseProps ) {
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
	} = useCouponUseDataForDonutChart( search );

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
				type="percentage"
				total={ total }
				comparisonTotal={ comparisonTotal }
				hasComparison={ hasComparison }
				showLegend={ true }
				legendData={ legendData }
			/>
		</WidgetCard>
	);
}
