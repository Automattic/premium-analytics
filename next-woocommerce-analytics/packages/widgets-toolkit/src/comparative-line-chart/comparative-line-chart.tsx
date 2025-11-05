/**
 * External dependencies
 */
import { useCallback, useMemo, useState } from 'react';
import { useResizeObserver } from '@wordpress/compose';
import {
	LineChartUnresponsive as LineChart,
	type SeriesData,
} from '@automattic/charts';
import { formatMetricValue } from '@next-woo-analytics/formatters';
import { type ComponentProps } from 'react';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { ChartTooltip } from '../chart-tooltip/chart-tooltip';
import styles from './comparative-line-chart.module.scss';

/**
 * Helper functions
 */
function isEmptyChartData( series: SeriesData[] ): boolean {
	return series.every( ( s ) =>
		s.data.every( ( point ) => point.value === 0 )
	);
}

function getEmptyChartDomain( metricType: string ): [ number, number ] {
	// The Y-axis domain always spans from 0 to a multiple of 4.
	// This ensures the chart renders 5 evenly spaced ticks (0 plus 4 distinct values),
	// which aligns nicely with the chart library's preferred tick count, that matches with design.

	if ( metricType === 'currency' ) {
		return [ 0, 4000 ];
	}

	// Default for 'number' and other types
	return [ 0, 80 ];
}

/**
 * Inferred types
 */
type LineChartProps = ComponentProps< typeof LineChart >;
type RenderTooltipParams = Parameters<
	NonNullable< LineChartProps[ 'renderTooltip' ] >
>[ 0 ];

export type MetricFormat = NonNullable<
	Parameters< typeof formatMetricValue >[ 1 ]
>;

type FormatMetricValueOptions = NonNullable<
	Parameters< typeof formatMetricValue >[ 2 ]
>;

export type DataFormat = {
	type: MetricFormat;
	options?: FormatMetricValueOptions;
};

/**
 * Props for the ComparativeLineChart component.
 *
 * Combines series data with chart options, formatting, and responsive behavior.
 * Wraps @automattic/charts LineChart with sensible defaults for comparative data visualization.
 */
export type ComparativeLineChartProps = {
	/**
	 * Array of series data to display in the chart
	 */
	series: SeriesData[];

	/**
	 * CSS class for the chart container
	 */
	className?: string;

	/**
	 * Format configuration for chart values (Y-axis ticks and tooltips)
	 */
	dataFormat: DataFormat;
} & Omit<
	ComponentProps< typeof LineChart >,
	| 'data'
	| 'options'
	| 'withLegendGlyph'
	| 'smoothing'
	| 'showLegend'
	| 'withGradientFill'
	| 'resizeDebounceTime'
	| 'maxWidth'
	| 'withTooltips'
	| 'renderTooltip'
>;

export function ComparativeLineChart( {
	series,
	className,
	dataFormat,
}: ComparativeLineChartProps ) {
	const [ contentRect, setContentRect ] = useState< DOMRectReadOnly | null >(
		null
	);

	const [ legendRect, setLegendRect ] = useState< DOMRectReadOnly | null >(
		null
	);

	const [ chartSpacing, setChartSpacing ] = useState< number >( 0 );

	const ref = useResizeObserver( ( entries ) => {
		const entry = entries?.[ 0 ];
		if ( entry?.contentRect ) {
			setContentRect( entry.contentRect );
		}
	} );

	const legendRef = useResizeObserver( ( entries ) => {
		const entry = entries?.[ 0 ];
		if ( entry?.contentRect ) {
			setLegendRect( entry.contentRect );
		}

		// Read margin-top value directly from legend element
		if ( entry?.target ) {
			const computedStyle = window.getComputedStyle( entry.target );
			const marginValue = computedStyle?.marginTop;
			const newMargin = marginValue ? parseInt( marginValue, 10 ) : 0;
			// Only update if margin changed to avoid unnecessary re-renders
			if ( newMargin !== chartSpacing ) {
				setChartSpacing( newMargin );
			}
		}
	} );

	const renderTooltip = useCallback(
		( params: RenderTooltipParams ) => {
			return <ChartTooltip dataFormat={ dataFormat } { ...params } />;
		},
		[ dataFormat ]
	);

	/**
	 * Y-axis formatter using dataFormat configuration,
	 * but using multipliers and 0 decimals to keep strings short and concise.
	 */
	const tickFormat = useMemo(
		() => ( value: number ) => {
			return formatMetricValue( value, dataFormat.type, {
				useMultipliers: true,
				decimals: 0,
			} );
		},
		[ dataFormat ]
	);

	/**
	 * Detect if chart data is empty and apply special props for empty state
	 */
	const isEmptyData = useMemo( () => isEmptyChartData( series ), [ series ] );

	const emptyChartProps = useMemo( () => {
		if ( ! isEmptyData ) {
			return {};
		}

		const domain = getEmptyChartDomain( dataFormat.type );

		return {
			chartOptions: { yScale: { domain } },
			// For some reason, when providing a fixed domain, the chart library
			// does not adjust the left margin accordingly, so we do it manually.
			// This is a rough estimate, not perfect, but good enough for our use case.
			margin: { left: tickFormat( domain[ 1 ] ).length * 10 },
		};
	}, [ isEmptyData, dataFormat.type, tickFormat ] );

	const getChartHeight = useCallback( () => {
		if ( contentRect?.height && legendRect?.height ) {
			return contentRect?.height - legendRect?.height - chartSpacing;
		}

		return 180;
	}, [ contentRect?.height, legendRect?.height, chartSpacing ] );

	/**
	 * Merge chart options with empty chart options if data is empty
	 */
	const chartOptions = useMemo( () => {
		const baseOptions = {
			axis: {
				y: {
					tickFormat,
				},
			},
		};

		if ( ! isEmptyData ) {
			return baseOptions;
		}

		// Merge with empty chart options
		return {
			...baseOptions,
			...emptyChartProps.chartOptions,
		};
	}, [ tickFormat, isEmptyData, emptyChartProps.chartOptions ] );

	return (
		<div ref={ ref } className={ styles.reference }>
			<div className={ styles.wrapper }>
				<LineChart
					className={ clsx( styles.chart, className ) }
					data={ series }
					options={ chartOptions }
					margin={ emptyChartProps.margin }
					withLegendGlyph={ false }
					smoothing={ false }
					showLegend={ false }
					withGradientFill={ false }
					withTooltips={ !! renderTooltip && ! isEmptyData }
					renderTooltip={ renderTooltip }
					width={ contentRect?.width ?? 310 }
					height={ getChartHeight() }
				>
					<LineChart.Legend
						shape="line"
						ref={ legendRef }
						className={ styles.legend }
					/>
				</LineChart>
			</div>
		</div>
	);
}
