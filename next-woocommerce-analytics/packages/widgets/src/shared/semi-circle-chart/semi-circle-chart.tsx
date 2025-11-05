/**
 * External dependencies
 */
import { PieSemiCircleChartUnresponsive as PieSemiCircleChart } from '@automattic/charts';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Icon } from '@wordpress/components';
import { Stack } from '@automattic/design-system';
import {
	MetricWithComparison,
	type DataFormat,
} from '@next-woo-analytics/widgets-toolkit';

/**
 * Internal dependencies
 */
import { Legend } from '../legend';
import type { LegendItem } from '../legend';
import styles from './semi-circle-chart.module.scss';
import { EmptyWidget } from '../empty-widget';

// Chart configuration constants
const CHART_CONFIG = {
	thickness: 0.3,
	width: 200,
	height: 100,
	clockwise: false,
} as const;

type PieChartData = ComponentProps< typeof PieSemiCircleChart >[ 'data' ];

type SemiCircleChartProps = {
	chartData: PieChartData;
	total: number;
	dataFormat?: DataFormat;
	comparisonTotal?: number;
	hasComparison?: boolean;
	legendData?: LegendItem[];
	showLegend?: boolean;
	colors?: string[];
};

export function SemiCircleChart( {
	chartData,
	total,
	comparisonTotal,
	dataFormat = { type: 'currency', options: { useMultipliers: true, decimals: 0 } },
	hasComparison = false,
	legendData,
	showLegend = false,
}: SemiCircleChartProps ) {
	// Memoize chart configuration
	const chartConfig = useMemo(
		() => ( {
			thickness: CHART_CONFIG.thickness,
			width: CHART_CONFIG.width,
			clockwise: CHART_CONFIG.clockwise,
		} ),
		[]
	);

	// Check if we have valid data
	const hasValidData = chartData?.length > 0;
	if ( ! hasValidData ) {
		return (
			<EmptyWidget>
				<Icon icon="chart-pie" size={ 48 } />
			</EmptyWidget>
		);
	}

	return (
		<PieSemiCircleChart
			label=""
			data={ chartData }
			className={ styles.chart }
			{ ...chartConfig }
		>
			{ showLegend && legendData && (
				<PieSemiCircleChart.Legend
					render={ ( items ) => (
						<Legend
							chartItems={ items }
							items={ legendData }
							withComparison={ hasComparison }
						/>
					) }
				/>
			) }

			<Stack
				direction="column"
				align="center"
				justify="end"
				className={ styles.chartOverlay }
				style={ { height: `${ CHART_CONFIG.height }px` } }
			>
				<MetricWithComparison
					value={ total }
					dataFormat={ dataFormat }
					previousValue={ hasComparison ? comparisonTotal : null }
					direction="column"
					align="center"
				/>
			</Stack>
		</PieSemiCircleChart>
	);
}
