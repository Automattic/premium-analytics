/**
 * External dependencies
 */
import { ORDER_ATTRIBUTION_VIEWS } from '@next-woo-analytics/data';
import { useSearch } from '@tanstack/react-router';

/**
 * Internal dependencies
 */
import { WidgetCard, LeaderboardChart, useWidgetLoading } from '../shared';
import { useSalesByUtmDataForLeaderboardChart } from './use-sales-by-utm-data';

type OrderAttributionView = ( typeof ORDER_ATTRIBUTION_VIEWS )[ number ];

type SalesByUtmProps = {
	title: string;
	description?: string;
	view: OrderAttributionView; // e.g. 'source', 'channel', etc.
};

export function SalesByUtm( { title, description, view }: SalesByUtmProps ) {
	const search = useSearch( {
		from: '/wc-analytics/dashboard',
	} );
	const searchWithView = { ...search, view };

	// Data fetching and processing for leaderboard chart
	const {
		chartData,
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
		hasComparison,
		legendLabels,
	} = useSalesByUtmDataForLeaderboardChart( searchWithView );

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
			<LeaderboardChart
				data={ chartData }
				loading={ isLoading }
				withComparison={ hasComparison }
				legendLabels={ legendLabels }
			/>
		</WidgetCard>
	);
}
