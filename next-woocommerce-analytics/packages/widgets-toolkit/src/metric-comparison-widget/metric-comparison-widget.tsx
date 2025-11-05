/**
 * External dependencies
 */
import { Stack } from '@automattic/design-system';
import clsx from 'clsx';
import type { SeriesData } from '@automattic/charts';

/**
 * Internal dependencies
 */
import { MetricWithComparison } from '../metric-with-comparison';
import {
	ComparativeLineChart,
	type DataFormat,
} from '../comparative-line-chart';
import styles from './metric-comparison-widget.module.scss';

export type MetricComparisonWidgetProps = {
	/**
	 * Card container styles
	 */
	className?: string;

	/**
	 * Primary metric value
	 */
	value: number;

	/**
	 * Optional comparison metric (previous period, target, etc.)
	 */
	comparisonValue?: number | null;

	/**
	 * Chart display props
	 */
	series: SeriesData[];
	dataFormat: DataFormat;
};

export function MetricComparisonWidget( {
	className,
	value,
	comparisonValue,
	series,
	dataFormat,
}: MetricComparisonWidgetProps ) {
	return (
		<Stack
			direction="column"
			gap={ 4 }
			className={ clsx( styles.container, className ) }
		>
			<Stack direction="row" justify="start">
				<MetricWithComparison
					value={ value }
					previousValue={ comparisonValue }
					dataFormat={ dataFormat }
					direction="row"
					align="flex-end"
				/>
			</Stack>

			<ComparativeLineChart series={ series } dataFormat={ dataFormat } />
		</Stack>
	);
}
