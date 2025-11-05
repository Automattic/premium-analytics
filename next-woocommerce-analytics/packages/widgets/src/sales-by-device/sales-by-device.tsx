/**
 * External dependencies
 */
import { ORDER_ATTRIBUTION_VIEWS } from '@next-woo-analytics/data';
import { useSearch } from '@tanstack/react-router';

/**
 * Internal dependencies
 */
import { WidgetCard, DonutChart, useWidgetLoading } from '../shared';
import { useSalesByDeviceDataForDonutChart } from './use-sales-by-device-data';

type OrderAttributionView = ( typeof ORDER_ATTRIBUTION_VIEWS )[ number ];

type SalesByDeviceProps = {
	title: string;
	description?: string;
	view: OrderAttributionView;
};

export function SalesByDevice( {
	title,
	description,
	view,
}: SalesByDeviceProps ) {
	const search = useSearch( {
		from: '/wc-analytics/dashboard',
	} );
	const searchWithView = { ...search, view };

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
	} = useSalesByDeviceDataForDonutChart( searchWithView );

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
