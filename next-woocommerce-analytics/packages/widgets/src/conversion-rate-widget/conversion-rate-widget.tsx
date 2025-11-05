/**
 * External dependencies
 */
import { useSearch } from '@tanstack/react-router';
import { Icon } from '@automattic/design-system';
import { goal } from '@next-woo-analytics/icons';

/**
 * Internal dependencies
 */
import { WidgetCard, ConversionFunnelChart, useWidgetLoading } from '../shared';
import { useConversionRateData } from './use-conversion-rate-data';
import styles from './conversion-rate-widget.module.scss';
import { EmptyWidget } from '../shared/empty-widget';

type ConversionRateWidgetProps = {
	title: string;
	description?: string;
};

export function ConversionRateWidget( {
	title,
	description,
}: ConversionRateWidgetProps ) {
	const search = useSearch( {
		from: '/wc-analytics/dashboard',
	} );

	const {
		steps,
		overallRate,
		previousRate,
		activeSessions,
		hasComparison,
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
	} = useConversionRateData( search );

	const loadingState = useWidgetLoading( {
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
	} );

	// Show empty state when no active sessions or no steps data
	const shouldShowEmptyState = activeSessions === 0 || steps.length === 0;

	let deltaPercentage: number | null = null;

	if ( hasComparison && previousRate !== null ) {
		if ( previousRate === 0 ) {
			// 100% when going from 0 to any positive value, 0% when staying at 0
			deltaPercentage = overallRate > 0 ? 100 : 0;
		} else {
			// Normal percentage calculation
			deltaPercentage =
				( ( overallRate - previousRate ) / previousRate ) * 100;
		}
	}

	const changeIndicator =
		deltaPercentage !== null
			? `${ deltaPercentage >= 0 ? '+' : '' }${ deltaPercentage.toFixed(
					1
			  ) }%`
			: undefined;

	return (
		<WidgetCard
			title={ title }
			description={ description }
			loadingState={ loadingState }
		>
			{ shouldShowEmptyState ? (
				<EmptyWidget>
					<Icon icon={ goal } size={ 48 } />
				</EmptyWidget>
			) : (
				<ConversionFunnelChart
					className={ styles[ 'woocommerce-conversion-rate-widget' ] }
					steps={ steps }
					mainRate={ overallRate }
					changeIndicator={ changeIndicator }
				/>
			) }
		</WidgetCard>
	);
}
