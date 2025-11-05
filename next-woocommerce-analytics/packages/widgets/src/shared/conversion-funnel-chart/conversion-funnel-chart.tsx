/**
 * External dependencies
 */
import { ConversionFunnelChart as AutomatticConversionFunnelChart } from '@automattic/charts';
import type { ComponentProps } from 'react';
import { Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { EmptyWidget } from '../empty-widget';

type AutomatticConversionFunnelChartProps = ComponentProps<
	typeof AutomatticConversionFunnelChart
>;

type ConversionFunnelChartProps = {
	steps: AutomatticConversionFunnelChartProps[ 'steps' ];
	mainRate: AutomatticConversionFunnelChartProps[ 'mainRate' ];
	changeIndicator?: AutomatticConversionFunnelChartProps[ 'changeIndicator' ];
	loading?: AutomatticConversionFunnelChartProps[ 'loading' ];
	className?: string;
};

export function ConversionFunnelChart( {
	steps,
	mainRate,
	changeIndicator,
	loading = false,
	className,
}: ConversionFunnelChartProps ) {
	// Check if we have valid data
	const hasValidData = steps && steps.length > 0;

	if ( ! hasValidData ) {
		return (
			<EmptyWidget>
				<Icon icon="chart-bar" size={ 48 } />
			</EmptyWidget>
		);
	}

	return (
		<AutomatticConversionFunnelChart
			steps={ steps }
			mainRate={ mainRate }
			changeIndicator={ changeIndicator }
			loading={ loading }
			className={ className }
		/>
	);
}
