/**
 * External dependencies
 */
import { formatMetricValue } from '@next-woo-analytics/formatters';
import clsx from 'clsx';
import { useMemo } from 'react';

/**
 * Internal dependencies
 */
import styles from './metric-value.module.scss';
import type { DataFormat } from '../comparative-line-chart/comparative-line-chart';

export type MetricValueProps = {
	/**
	 * The numeric value to display
	 */
	value: number;

	/**
	 * Format configuration for value display
	 * @default { type: 'number' }
	 */
	dataFormat?: DataFormat;

	/**
	 * CSS class for styling
	 */
	className?: string;

	/**
	 * Size variant
	 * @default 'medium'
	 */
	size?: 'small' | 'medium' | 'large';

	/**
	 * Color variant
	 * @default 'neutral'
	 */
	color?: 'neutral' | 'positive' | 'negative';
};

export function MetricValue( {
	value,
	dataFormat = { type: 'number' },
	className,
	size = 'medium',
	color = 'neutral',
}: MetricValueProps ) {
	/**
	 * Create display value using dataFormat configuration
	 */
	const displayValue = useMemo(
		() => formatMetricValue( value, dataFormat.type, dataFormat.options ),
		[ value, dataFormat ]
	);

	return (
		<span
			className={ clsx(
				styles.metricValue,
				styles[ `size--${ size }` ],
				styles[ `color--${ color }` ],
				className
			) }
		>
			{ displayValue }
		</span>
	);
}
