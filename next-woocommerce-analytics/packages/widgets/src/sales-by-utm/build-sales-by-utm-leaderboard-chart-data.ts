/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useReportOrderAttribution } from '@next-woo-analytics/data';
import type { LeaderboardEntry } from '@automattic/charts/leaderboard-chart';

// Extract the data type from the hook's return type
type OrderAttributionData = NonNullable<
	ReturnType< typeof useReportOrderAttribution >[ 'primary' ][ 'data' ]
>;

type BuildSalesByUtmLeaderboardChartDataProps = {
	orderAttribution: OrderAttributionData;
	useComparison?: boolean;
	maxEntries?: number;
};

/**
 * Build leaderboard chart data from order attribution response
 *
 * @param props                  - Order attribution data and configuration
 * @param props.orderAttribution - Order attribution data from API
 * @param props.useComparison    - Whether to include comparison data
 * @param props.maxEntries       - Maximum number of entries to include in the leaderboard
 * @return Processed data ready for LeaderboardChart component
 */
export function buildSalesByUtmLeaderboardChartData( {
	orderAttribution,
	useComparison = false, // Not used currently but might be useful in future
	maxEntries = 4,
}: BuildSalesByUtmLeaderboardChartDataProps ): LeaderboardEntry[] {
	if ( ! orderAttribution?.data ) {
		return [];
	}

	// Find the max current value for share calculation
	const maxValue = Math.max(
		...orderAttribution.data.map( ( item: any ) =>
			Math.max(
				item.current_period.value || 0,
				item.previous_period?.value || 0
			)
		),
		1
	);

	return orderAttribution.data
		.slice( 0, maxEntries )
		.map( ( item: any, idx: number ) => {
			const currentValue = item.current_period.value || 0;
			let previousValue = item.previous_period?.value ?? 0;

			return {
				id: item.key ? String( item.key ) : String( idx ),
				label: item.item || __( 'Unassigned', 'woocommerce-analytics' ),
				currentValue,
				previousValue,
				currentShare: ( currentValue / maxValue ) * 100,
				previousShare: ( previousValue / maxValue ) * 100,
				// Calculate delta as percentage change, handle division by zero
				delta:
					previousValue === 0
						? 0
						: ( ( currentValue - previousValue ) / previousValue ) *
						  100,
			};
		} );
}
