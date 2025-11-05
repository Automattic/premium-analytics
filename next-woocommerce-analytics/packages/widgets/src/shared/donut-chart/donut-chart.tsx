/**
 * External dependencies
 */
import { PieChartUnresponsive as PieChart } from '@automattic/charts';
import type { ComponentProps } from 'react';
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
import styles from './donut-chart.module.scss';
import { EmptyWidget } from '../empty-widget';

// Chart configuration constants
const CHART_CONFIG = {
	thickness: 0.3,
	cornerScale: 0.03,
	gapScale: 0.01,
	padding: 0,
	size: 164,
} as const;

type PieChartData = ComponentProps< typeof PieChart >[ 'data' ];

type DonutChartProps = {
	chartData: PieChartData;
	total: number;
	dataFormat?: DataFormat;
	comparisonTotal?: number;
	hasComparison?: boolean;
	legendData?: LegendItem[];
	showLegend?: boolean;
};

/**
 * Check if the donut chart can be displayed for the given chart data
 *
 * @param chartData - The chart data
 *
 * @return True if the donut chart can be displayed, false otherwise
 */
function canDisplayDonutChart( chartData: PieChartData ) {
	const hasNegativeValues = chartData.some(
		( item ) => item.percentage < 0 || item.value < 0
	);

	if ( hasNegativeValues ) {
		return false;
	}

	const totalPercentage = chartData.reduce(
		( sum, item ) => sum + item.percentage,
		0
	);

	return Math.abs( totalPercentage - 100 ) < 0.01;
}

export function DonutChart( {
	chartData,
	total,
	comparisonTotal,
	dataFormat = { type: 'currency', options: { useMultipliers: true } },
	hasComparison = false,
	legendData,
	showLegend = false,
}: DonutChartProps ) {
	// Check if we have valid data
	const hasValidData = chartData?.length > 0;
	if ( ! hasValidData ) {
		return (
			<EmptyWidget>
				<Icon icon="chart-pie" size={ 48 } />
			</EmptyWidget>
		);
	}

	const shouldShowChart = canDisplayDonutChart( chartData );

	if ( ! shouldShowChart ) {
		return (
			<Stack
				direction="column"
				justify="center"
				align="center"
				className={ styles.noChart }
				gap={ 5 }
			>
				<Stack direction="column" align="center" gap={ 1 }>
					<MetricWithComparison
						value={ total }
						dataFormat={ dataFormat }
						previousValue={ hasComparison ? comparisonTotal : null }
						direction="column"
						align="center"
					/>
				</Stack>
				{ showLegend && legendData && (
					<Legend
						items={ legendData }
						withComparison={ hasComparison }
					/>
				) }
			</Stack>
		);
	}

	return (
		<PieChart
			data={ chartData }
			thickness={ CHART_CONFIG.thickness }
			cornerScale={ CHART_CONFIG.cornerScale }
			gapScale={ CHART_CONFIG.gapScale }
			padding={ CHART_CONFIG.padding }
			size={ CHART_CONFIG.size }
			showLegend={ false }
			withTooltips={ false }
			className={ styles.chart }
		>
			{ showLegend && legendData && (
				<PieChart.Legend
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
				justify="center"
				className={ styles.chartOverlay }
				style={ { height: `${ CHART_CONFIG.size }px` } }
			>
				<MetricWithComparison
					value={ total }
					dataFormat={ dataFormat }
					previousValue={ hasComparison ? comparisonTotal : null }
					direction="column"
					align="center"
				/>
			</Stack>
		</PieChart>
	);
}
