/**
 * External dependencies
 */
import { LeaderboardChartUnresponsive as AutomatticLeaderboardChart } from '@automattic/charts';
import type { ComponentProps } from 'react';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { formatMetricValue } from '@next-woo-analytics/formatters';
import { useMemo } from 'react';
import type { DataFormat } from '@next-woo-analytics/widgets-toolkit';

/**
 * Internal dependencies
 */
import styles from './leaderboard-chart.module.scss';
import { EmptyWidget } from '../empty-widget';

type AutomatticLeaderboardChartData = ComponentProps<
	typeof AutomatticLeaderboardChart
>[ 'data' ];

type LeaderboardChartProps = {
	data: AutomatticLeaderboardChartData;
	loading?: boolean;
	withComparison?: boolean;
	withOverlayLabel?: boolean;
	dataFormat?: DataFormat;
	primaryColor?: string;
	secondaryColor?: string;
	showLegend?: boolean;
	legendLabels?: {
		primary: string;
		comparison: string;
	};
	emptyStateIcon?: React.ReactNode;
};

const DEFAULT_LEGEND_LABELS = {
	primary: __( 'Current period', 'woocommerce-analytics' ),
	comparison: __( 'Previous period', 'woocommerce-analytics' ),
};

export function LeaderboardChart( {
	data,
	dataFormat = {
		type: 'currency',
		options: { useMultipliers: true, decimals: 2 },
	},
	loading = false,
	withComparison = false,
	primaryColor,
	secondaryColor,
	showLegend = true,
	legendLabels = DEFAULT_LEGEND_LABELS,
	withOverlayLabel = false,
	emptyStateIcon = <Icon icon="chart-bar" size={ 48 } />,
}: LeaderboardChartProps ) {
	/**
	 * Create value formatter from dataFormat configuration
	 */
	const valueFormatter = useMemo(
		() => ( value: number ) =>
			formatMetricValue( value, dataFormat.type, dataFormat.options ),
		[ dataFormat ]
	);

	// Check if we have valid data
	const hasValidData = data && data.length > 0;

	if ( ! hasValidData ) {
		return <EmptyWidget>{ emptyStateIcon }</EmptyWidget>;
	}

	return (
		<AutomatticLeaderboardChart
			data={ data }
			loading={ loading }
			withComparison={ withComparison }
			valueFormatter={ valueFormatter }
			primaryColor={ primaryColor }
			secondaryColor={ secondaryColor }
			withOverlayLabel={ withOverlayLabel }
			className={ styles.chart }
			legendLabels={ legendLabels }
		>
			{ showLegend && (
				<AutomatticLeaderboardChart.Legend
					shape="circle"
					shapeHeight={ 8 }
					shapeWidth={ 8 }
				/>
			) }
		</AutomatticLeaderboardChart>
	);
}
