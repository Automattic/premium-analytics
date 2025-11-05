/**
 * External dependencies
 */
import { MetricDelta } from '@next-woo-analytics/widgets-toolkit';
import { type BaseLegendItem } from '@automattic/charts';

/**
 * Internal dependencies
 */
import { WidgetRow } from '../widget-row';
import styles from './legend.module.scss';
import { WOO_COLORS } from '../chart-theme/color-palette';

export type LegendItem = {
	label: string;
	value: number;
	formattedValue: string;
	/**
	 * Optional color for the legend item. If provided, this color will be used.
	 * If not provided, the color will be assigned from the corresponding themed chartItems
	 * in the global charts context (if available), or will fall back to a theme color.
	 */
	color?: string;
	comparison?: number;
};

type LegendProps = {
	chartItems?: BaseLegendItem[];
	items: LegendItem[];
	withComparison?: boolean;
};

export function Legend( {
	chartItems,
	items,
	withComparison = false,
}: LegendProps ) {
	return (
		<div className={ styles.legendGrid }>
			{ items.map( ( item, index ) => (
				<WidgetRow
					key={ item.label }
					valueDisplay={ item.formattedValue }
					percentageDisplay={
						withComparison && item.comparison !== undefined ? (
							<MetricDelta
								current={ item.value }
								previous={ item.comparison }
							/>
						) : null
					}
					color={
						item.color ||
						chartItems?.[ index ]?.color ||
						WOO_COLORS[ index % WOO_COLORS.length ]
					}
				>
					{ item.label }
				</WidgetRow>
			) ) }
		</div>
	);
}
