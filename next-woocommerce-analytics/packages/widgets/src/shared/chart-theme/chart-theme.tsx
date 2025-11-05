/**
 * External dependencies
 */
import { wooTheme, type ChartTheme } from '@automattic/charts';

export const chartTheme: ChartTheme = {
	...wooTheme,
	colors: [
		'var(--wpds-color-fg-interactive-brand)',
		...( wooTheme.colors?.slice( 1 ) ?? [] ),
	],
	gridStyles: {
		...wooTheme.gridStyles,
		stroke: 'var(--wpds-color-stroke-surface-neutral-weak)',
		strokeWidth: 1,
	},
	legendContainerStyles: {
		rowGap: 'var(--wpds-spacing-05)',
		columnGap: 'var(--wpds-spacing-20)',
	},
	legendLabelStyles: {
		...wooTheme.legendLabelStyles,
		color: 'var(--wpds-color-fg-content-neutral)',
	},
	xTickLineStyles: {
		stroke: '',
	},
	seriesLineStyles: [
		{
			strokeWidth: 2,
		},
		{
			strokeDasharray: '4 4',
			strokeWidth: 1.5,
			strokeLinecap: 'square' as const,
		},
	],
	legendShapeStyles: [
		{
			transform: 'translate(0, 1px)',
		},
		{
			transform: 'translate(0, 1px)',
			strokeDasharray: '2, 2, 3, 2, 3, 2, 2',
		},
	],
	lineChart: {
		lineStyles: {
			comparison: {
				...wooTheme.lineChart?.lineStyles?.comparison,
				strokeOpacity: 0.8,
			},
		},
	},
	svgLabelSmall: {
		...wooTheme.svgLabelSmall,
		fill: 'var(--wpds-color-fg-content-neutral-weak)',
	},
};
