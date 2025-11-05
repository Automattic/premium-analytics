/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useSearch } from '@tanstack/react-router';

/**
 * Internal dependencies
 */
import { WidgetCard, SemiCircleChart, useWidgetLoading } from '../shared';
import { useSalesByCouponDataForSemiCircle } from './use-sales-by-coupon-data';
import { useProductTypeFilters } from '../shared/utils/product-type-filters';

type SalesByCouponProps = {
	title?: string;
	description?: string;
	totalSegments?: number;
};

export function SalesByCoupon( {
	title = __( 'Sales by coupon', 'woocommerce-analytics' ),
	description = __(
		'Revenue from physical product sales using coupons over the selected time period.',
		'woocommerce-analytics'
	),
	totalSegments = 3,
}: SalesByCouponProps ) {
	const search = useSearch( {
		from: '/wc-analytics/dashboard',
	} );
	const filters = useProductTypeFilters( search.section );

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
	} = useSalesByCouponDataForSemiCircle(
		{
			...search,
			filters,
		},
		totalSegments
	);

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
			<SemiCircleChart
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
