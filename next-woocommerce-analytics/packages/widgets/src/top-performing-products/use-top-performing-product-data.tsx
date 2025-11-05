/**
 * External dependencies
 */
import { useMemo } from '@wordpress/element';
import { useReportProducts, useProductImages } from '@next-woo-analytics/data';

/**
 * Internal dependencies
 */
import { ProductLeaderboardLabel } from './product-leaderboard-label';

// Infer the report params type from the useReportProducts hook
type ReportParams = Parameters< typeof useReportProducts >[ 0 ];

export function useTopPerformingProductData( search: ReportParams, limit = 5 ) {
	const {
		primary,
		comparison,
		hasComparison,
		isLoading,
		isFetching,
		hasData,
	} = useReportProducts( search, limit );

	const { data, isSuccess, dataUpdatedAt } = primary;
	const { data: comparisonData } = comparison;

	// Extract product IDs for fetching images
	const productIds = data?.items?.map( ( item ) => item.product_id ) || [];

	// Fetch product images
	const { data: productImages, isLoading: imagesLoading } = useProductImages(
		{
			productIds,
		}
	);

	const topPerformingProducts = useMemo( () => {
		const comparisonItems = comparisonData?.items || [];
		return (
			data?.items?.map( ( product, index: number ) => {
				const currentValue = product.product_net_revenue;
				const maxValue = Math.max(
					...( data.items?.map( ( p ) => p.product_net_revenue ) || [
						1,
					] )
				);

				// Find the product image for this product
				const productImage = productImages
					? productImages[ product.product_id ]
					: undefined;

				const previousValue =
					comparisonItems[ index ]?.product_net_revenue || 0;

				const previousShare =
					comparisonItems.length > 0
						? ( previousValue /
								Math.max(
									...comparisonItems.map(
										( p ) => p.product_net_revenue || 1
									)
								) ) *
						  100
						: 0;

				return {
					id: String( product.product_id || index ),
					label: (
						<ProductLeaderboardLabel
							label={ product.product_name }
							imageUrl={ productImage?.imageUrl || '' }
							imageAlt={
								productImage?.imageAlt || product.product_name
							}
						/>
					),
					currentValue,
					currentShare: ( currentValue / maxValue ) * 100,
					previousValue,
					previousShare,
					delta:
						previousValue > 0
							? ( ( currentValue - previousValue ) /
									previousValue ) *
							  100
							: 0,
				};
			} ) || []
		);
	}, [ data?.items, comparisonData?.items, productImages ] );

	return {
		topPerformingProducts,
		isLoading: isLoading || imagesLoading,
		isFetching,
		hasData:
			hasData ||
			Boolean( productImages && Object.keys( productImages ).length > 0 ),
		hasPreviousData: isSuccess && dataUpdatedAt > 0,
		hasComparison,
	};
}
