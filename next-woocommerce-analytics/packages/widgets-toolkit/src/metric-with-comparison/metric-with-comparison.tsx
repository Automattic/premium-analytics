/**
 * External dependencies
 */
import { Stack } from '@automattic/design-system';
import { ComponentProps } from 'react';

/**
 * Internal dependencies
 */
import { MetricValue } from '../metric-value';
import { MetricDelta } from '../metric-delta';
import type { MetricValueProps } from '../metric-value';
import type { DataFormat } from '../comparative-line-chart/comparative-line-chart';

export type MetricWithComparisonProps = {
	/**
	 * The current value to display
	 */
	value: number;

	/**
	 * The previous value for comparison. If null/undefined, delta won't be shown.
	 */
	previousValue?: number | null;

	/**
	 * Format configuration for value and delta display
	 * @default { type: 'number' }
	 */
	dataFormat?: DataFormat;

	/**
	 * Layout direction
	 * @default 'row'
	 */
	direction?: ComponentProps< typeof Stack >[ 'direction' ];

	/**
	 * Alignment of items
	 * @default 'flex-end'
	 */
	align?: ComponentProps< typeof Stack >[ 'align' ];

	/**
	 * Size of the main value
	 * @default 'medium'
	 */
	size?: MetricValueProps[ 'size' ];

	/**
	 * For metrics where decrease is improvement (e.g., bounce rate)
	 * @default false
	 */
	invertDeltaColors?: boolean;

	/**
	 * Hide delta when it's zero
	 * @default false
	 */
	hideDeltaOnZero?: boolean;

	/**
	 * CSS class for the container
	 */
	className?: string;

	/**
	 * CSS class for the value
	 */
	valueClassName?: string;

	/**
	 * CSS class for the delta
	 */
	deltaClassName?: string;

	/**
	 * What to display for delta when calculation is not possible
	 */
	deltaFallback?: string;

	/**
	 * Show absolute change instead of percentage in delta
	 * @default false
	 */
	showAbsoluteDelta?: boolean;
};

export function MetricWithComparison( {
	value,
	previousValue,
	dataFormat = { type: 'number' },
	direction = 'row',
	align = 'flex-end',
	size = 'large',
	invertDeltaColors = false,
	hideDeltaOnZero = false,
	className,
	valueClassName,
	deltaClassName,
	deltaFallback,
	showAbsoluteDelta = false,
}: MetricWithComparisonProps ) {
	const showDelta = previousValue !== null && previousValue !== undefined;

	/**
	 * Determine absolute format for delta based on data type
	 */
	const absoluteFormat =
		dataFormat.type === 'currency' ? 'currency' : 'number';

	return (
		<Stack
			className={ className }
			direction={ direction }
			align={ align }
			gap={ 1 }
		>
			<MetricValue
				value={ value }
				dataFormat={ dataFormat }
				size={ size }
				className={ valueClassName }
			/>

			{ showDelta && (
				<MetricDelta
					current={ value }
					previous={ previousValue }
					invertColors={ invertDeltaColors }
					hideZero={ hideDeltaOnZero }
					fallback={ deltaFallback }
					showAbsolute={ showAbsoluteDelta }
					absoluteFormat={ absoluteFormat }
					className={ deltaClassName }
				/>
			) }
		</Stack>
	);
}
