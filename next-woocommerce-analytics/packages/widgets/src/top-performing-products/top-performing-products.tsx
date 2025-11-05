/**
 * External dependencies
 */
import { useSearch } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { Icon } from '@automattic/design-system';
import { productBlouse } from '@next-woo-analytics/icons';

/**
 * Internal dependencies
 */
import { LeaderboardChart, WidgetCard, useWidgetLoading } from '../shared';
import { useTopPerformingProductData } from './use-top-performing-product-data';
import { useProductTypeFilters } from '../shared/utils/product-type-filters';

type TopPerformingProductsProps = {
	title?: string;
	description?: string;
	linkTo?: string;
	limit?: number;
	orderby?: 'net_sales' | 'orders_count' | 'items_sold';
};

export function TopPerformingProducts( {
	title = __( 'Sales by product', 'woocommerce-analytics' ),
	description = __(
		'Your best-selling products by revenue',
		'woocommerce-analytics'
	),
	linkTo,
	limit = 5,
}: TopPerformingProductsProps ) {
	const search = useSearch( {
		from: '/wc-analytics/dashboard',
	} );

	const productTypeFilters = useProductTypeFilters( search.section );
	const filters = [
		...productTypeFilters,
		{
			key: 'product_net_revenue',
			value: [ '0' ],
			compare: '>' as const,
		},
	];
	const searchWithFilters = {
		...search,
		filters,
	};

	const {
		topPerformingProducts,
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
		hasComparison,
	} = useTopPerformingProductData( searchWithFilters, limit );

	const loadingState = useWidgetLoading( {
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
	} );

	return (
		<WidgetCard
			title={ title }
			linkTo={ linkTo }
			description={ description }
			loadingState={ loadingState }
		>
			<LeaderboardChart
				data={ topPerformingProducts }
				primaryColor="rgba(56, 88, 233, 0.08)"
				showLegend={ false }
				withOverlayLabel={ true }
				withComparison={ hasComparison }
				emptyStateIcon={ <Icon icon={ productBlouse } size={ 48 } /> }
			/>
		</WidgetCard>
	);
}
