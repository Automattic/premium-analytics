/**
 * External dependencies
 */
import {
	formatNumberCompact,
	formatNumber,
} from '@automattic/number-formatters';
import { store as coreStore } from '@wordpress/core-data';
import { select } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';

type FormatMetricValueOptions = {
	decimals?: number;
	useMultipliers?: boolean;
	signDisplay?: Intl.NumberFormatOptions[ 'signDisplay' ];
};

// Todo: Pick the correct type for the general settings entity
type GeneralSettingItem = {
	id: 'woocommerce_currency' | 'woocommerce_currency_pos';
	value?: string;
	default?: string;
	symbol?: string;
};

type GeneralSettingsEntity = {
	data?: GeneralSettingItem[];
};

function getCurrencySettings() {
	const generalSettings = select( coreStore ).getEntityRecord(
		'root',
		'settings',
		'general'
	) as Partial< GeneralSettingsEntity > | undefined;

	const currencySettings = generalSettings?.data?.find(
		( { id } ) => id === 'woocommerce_currency'
	);

	// Pick the currency from the settings, fallback to default.
	const currency = currencySettings?.value ?? currencySettings?.default;
	const currencySymbol = currencySettings?.symbol
		? decodeEntities( currencySettings.symbol )
		: '$';

	// Pick the position from the settings
	const currencyPosition = generalSettings?.data?.find(
		( { id } ) => id === 'woocommerce_currency_pos'
	);

	// Pick the position from the settings, fallback to default.
	const position = currencyPosition?.value ?? currencyPosition?.default;

	let prefix = '';
	let suffix = '';

	switch ( position ) {
		case 'left':
			prefix = currencySymbol;
			break;
		case 'left_space':
			prefix = `${ currencySymbol } `;
			break;
		case 'right':
			suffix = currencySymbol;
			break;
		case 'right_space':
			suffix = ` ${ currencySymbol }`;
			break;
		default:
			prefix = currencySymbol;
			break;
	}

	return {
		currency,
		currencySymbol,
		prefix,
		suffix,
	};
}

/**
 * Formats a number into a currency string
 *
 * Extends the @automattic/number-formatters formatCurrency function to support multipliers.
 * @example
 * formatCurrency(30223, 2, true); // "30.2k €" (depending on locale and config)
 */
export function formatCurrency(
	value: number,
	{
		decimals,
		useMultipliers = false,
		signDisplay = 'auto',
	}: FormatMetricValueOptions
): string {
	const { prefix, suffix } = getCurrencySettings();

	let sign = '';
	let formattedValue = useMultipliers
		? formatNumberCompact( value, {
				decimals,
				numberFormatOptions: {
					maximumFractionDigits: decimals,
					signDisplay,
				},
		  } )
		: formatNumber( value, {
				decimals,
				numberFormatOptions: {
					signDisplay,
				},
		  } );

	if (
		formattedValue.startsWith( '-' ) ||
		formattedValue.startsWith( '+' )
	) {
		sign = formattedValue.slice( 0, 1 );
		formattedValue = formattedValue.slice( 1 );
	}

	return `${ sign }${ prefix }${ formattedValue }${ suffix }`;
}
