/**
 * External dependencies
 */
import {
	formatNumber,
	formatNumberCompact,
} from '@automattic/number-formatters';

/**
 * Internal dependencies
 */
import { formatCurrency } from '../currency';

type MetricType = 'number' | 'average' | 'currency' | 'percentage';

type FormatMetricValueOptions = Parameters< typeof formatCurrency >[ 1 ];

/**
 * Format a numeric metric value based on type, precision and scale.
 * High-level formatter that delegates to specific formatters.
 */
export function formatMetricValue(
	value: string | number,
	type: MetricType = 'number',
	{
		decimals,
		useMultipliers = false,
		signDisplay,
	}: FormatMetricValueOptions = {}
): string {
	if ( value === null || value === undefined ) {
		return '';
	}

	const numericValue = Number( value );
	if ( isNaN( numericValue ) ) {
		return '';
	}

	switch ( type ) {
		case 'currency': {
			return formatCurrency( numericValue, {
				decimals: decimals ?? 2,
				useMultipliers,
				signDisplay,
			} );
		}

		case 'average': {
			if ( ! Number.isFinite( numericValue ) ) {
				return '—';
			}

			return formatNumber( numericValue, {
				decimals: decimals ?? 2,
			} );
		}

		case 'percentage': {
			return formatNumber( numericValue, {
				numberFormatOptions: {
					style: 'percent',
					maximumFractionDigits: decimals ?? 2,
					signDisplay: signDisplay ?? 'exceptZero',
				},
			} );
		}

		case 'number':
		default: {
			return useMultipliers
				? formatNumberCompact( numericValue, {
						decimals: decimals ?? 0,
						numberFormatOptions: {
							maximumFractionDigits: decimals ?? 0,
							signDisplay,
						},
				  } )
				: formatNumber( numericValue, {
						decimals: decimals ?? 0,
						numberFormatOptions: {
							signDisplay,
						},
				  } );
		}
	}
}
