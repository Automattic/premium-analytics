/**
 * External dependencies
 */
import { Stack } from '@automattic/design-system';
import { format } from 'date-fns';
import {
	LineShape,
	CircleShape,
	RectShape,
} from '@automattic/charts/visx/legend';
import { formatMetricValue } from '@next-woo-analytics/formatters';
import { useCallback } from 'react';

/**
 * Internal dependencies
 */
import type { DataFormat } from '../index';
import { MetricValue } from '../index';
import styles from './chart-tooltip.module.scss';

type ChartDatum = {
	date: Date;
	value: number;
	realDate?: Date;
};

type ChartDatumEntry = {
	datum: ChartDatum;
	index: number;
	key: string;
};

type ChartTooltipProps = {
	tooltipData?: {
		datumByKey?: Record< string, unknown >;
	};
	colorScale?: ( key: string ) => string;
	dataFormat: DataFormat;
	shape?: Shape;
	shapeSize?: number;
};

/**
 * Check if the entry is a chart datum entry.
 *
 * @param entry The entry to check.
 * @return True if the entry is a comparison entry, false otherwise.
 */
const isChartDatumEntry = ( entry: unknown ): entry is ChartDatumEntry => {
	return (
		typeof entry === 'object' &&
		entry !== null &&
		'datum' in entry &&
		'index' in entry &&
		'key' in entry
	);
};

type Shape = 'line' | 'circle' | 'rect';

const LegendShape = ( {
	shape,
	color,
	size = 16,
	isComparison = false,
}: {
	shape: Shape;
	color: string;
	size?: number;
	isComparison?: boolean;
} ) => {
	switch ( shape ) {
		case 'circle':
			return (
				<CircleShape fill={ color } height={ size } width={ size } />
			);
		case 'rect':
			return <RectShape fill={ color } height={ size } width={ size } />;
		case 'line':
		default:
			return (
				<LineShape
					fill={ color }
					height={ size }
					width={ size }
					style={ {
						transform: 'translateY(2px)',
						strokeDasharray: isComparison
							? '2, 2, 3, 2, 3, 2, 2' // TODO: We should get this from the theme.
							: 'none',
					} }
				/>
			);
	}
};

export const ChartTooltip: React.FC< ChartTooltipProps > = ( {
	tooltipData,
	dataFormat,
	colorScale,
	shape = 'line',
	shapeSize = 16,
} ) => {
	const formatter = useCallback(
		( value: number ) =>
			formatMetricValue( value, dataFormat.type, dataFormat.options ),
		[ dataFormat ]
	);

	if ( ! tooltipData?.datumByKey || ! colorScale ) {
		return null;
	}

	const datumEntries = Object.values( tooltipData.datumByKey );
	if ( datumEntries.length === 0 ) {
		return null;
	}

	const primaryItem = datumEntries[ 0 ] as ChartDatumEntry;
	const compareItem = datumEntries[ 1 ];

	const primaryData = primaryItem.datum;
	const comparisonData = isChartDatumEntry( compareItem )
		? compareItem.datum
		: null;

	const primaryDateFormatted = format( primaryData.date, 'PP' );
	const compareDateFormatted = comparisonData
		? format( comparisonData.realDate || comparisonData.date, 'PP' )
		: null;

	return (
		<Stack direction="column" className={ styles.tooltip }>
			<Stack
				direction="row"
				className={ styles.item }
				justify="start"
				align="center"
				gap={ 2 }
			>
				<div className={ `${ styles.shape }` }>
					<LegendShape
						shape={ shape }
						color={ colorScale( primaryItem.key ) }
						size={ shapeSize }
					/>
				</div>
				<div className={ styles.label }>{ primaryDateFormatted }</div>
				<div className={ styles.value }>
					<MetricValue
						value={ primaryData.value }
						formatter={ formatter }
						size="small"
						className={ styles.value }
					/>
				</div>
			</Stack>

			{ comparisonData && isChartDatumEntry( compareItem ) && (
				<Stack
					direction="row"
					className={ `${ styles.item } ${ styles.isComparison }` }
					justify="start"
					align="center"
					gap={ 2 }
				>
					<div className={ `${ styles.shape }` }>
						<LegendShape
							shape={ shape }
							color={ colorScale( compareItem.key ) }
							size={ shapeSize }
							isComparison={ true }
						/>
					</div>
					<div className={ styles.label }>
						{ compareDateFormatted }
					</div>
					<div className={ styles.value }>
						<MetricValue
							value={ comparisonData.value }
							formatter={ formatter }
							size="small"
							className={ styles.value }
						/>
					</div>
				</Stack>
			) }
		</Stack>
	);
};
