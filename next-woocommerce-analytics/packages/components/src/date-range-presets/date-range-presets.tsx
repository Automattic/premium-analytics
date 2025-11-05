/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	startOfDay,
	endOfDay,
	subDays,
	subMonths,
	subYears,
	startOfMonth,
	endOfMonth,
	startOfYear,
	endOfYear,
} from 'date-fns';
import { MenuItem, MenuGroup } from '@wordpress/components';
import { check } from '@wordpress/icons';
import { localTZDate } from '@next-woo-analytics/data';
import { useMemo } from 'react';

/**
 * Internal dependencies
 */
import { DateRangePopover } from '../date-range-popover/date-range-filter';
import './date-range-presets.scss';

type DateRange = Parameters< typeof DateRangePopover >[ 0 ][ 'range' ];

// ToDo: Consider to move this to the data package.
const PRESET_TODAY = 'today';
const PRESET_YESTERDAY = 'yesterday';
const PRESET_LAST_7_DAYS = 'last-7-days';
const PRESET_LAST_30_DAYS = 'last-30-days';
const PRESET_LAST_90_DAYS = 'last-90-days';
const PRESET_LAST_365_DAYS = 'last-365-days';
const PRESET_LAST_MONTH = 'last-month';
const PRESET_LAST_12_MONTHS = 'last-12-months';
const PRESET_LAST_YEAR = 'last-year';
export const PRESET_CUSTOM = 'custom';

export type DateRangePreset = {
	id: string;
	label: string;
	range: DateRange;
};

type DateRangePresetsProps = {
	onRangeChange: ( range: DateRange, id: string ) => void;
	value: string | null;
	presets?: DateRangePreset[];
	supportCustom?: boolean;
};

/**
 * Get the default date range presets.
 * ToDo: Consider to move this to the data package.
 *
 * @return {DateRangePreset[]} The default date range presets.
 */
export const getDefaultDateRangePresets = (): DateRangePreset[] => {
	const nowWithTZ = localTZDate();
	const initOfToday = startOfDay( nowWithTZ );
	const endOfToday = endOfDay( nowWithTZ );
	const endOfYesterday = endOfDay( subDays( initOfToday, 1 ) );
	const lastMonth = subMonths( initOfToday, 1 );
	const endOfLastMonth = endOfMonth( lastMonth );
	const lastYear = subYears( initOfToday, 1 );

	return [
		{
			id: PRESET_TODAY,
			label: __( 'Today', 'woocommerce-analytics' ),
			range: { from: initOfToday, to: endOfToday },
		},
		{
			id: PRESET_YESTERDAY,
			label: __( 'Yesterday', 'woocommerce-analytics' ),
			range: { from: subDays( initOfToday, 1 ), to: endOfYesterday },
		},
		{
			id: PRESET_LAST_7_DAYS,
			label: __( 'Last 7 days', 'woocommerce-analytics' ),
			range: { from: subDays( initOfToday, 7 ), to: endOfYesterday },
		},
		{
			id: PRESET_LAST_30_DAYS,
			label: __( 'Last 30 days', 'woocommerce-analytics' ),
			range: { from: subDays( initOfToday, 30 ), to: endOfYesterday },
		},
		{
			id: PRESET_LAST_90_DAYS,
			label: __( 'Last 90 days', 'woocommerce-analytics' ),
			range: { from: subDays( initOfToday, 90 ), to: endOfYesterday },
		},
		{
			id: PRESET_LAST_365_DAYS,
			label: __( 'Last 365 days', 'woocommerce-analytics' ),
			range: { from: subDays( initOfToday, 365 ), to: endOfYesterday },
		},
		{
			id: PRESET_LAST_MONTH,
			label: __( 'Last month', 'woocommerce-analytics' ),
			range: { from: startOfMonth( lastMonth ), to: endOfLastMonth },
		},
		{
			id: PRESET_LAST_12_MONTHS,
			label: __( 'Last 12 months', 'woocommerce-analytics' ),
			range: {
				from: startOfMonth( subMonths( initOfToday, 12 ) ),
				to: endOfLastMonth,
			},
		},
		{
			id: PRESET_LAST_YEAR,
			label: __( 'Last year', 'woocommerce-analytics' ),
			range: { from: startOfYear( lastYear ), to: endOfYear( lastYear ) },
		},
	];
};

export function DateRangePresets( {
	onRangeChange,
	value,
	presets: presetsProp,
}: DateRangePresetsProps ) {
	const defaultPresets = useMemo( () => getDefaultDateRangePresets(), [] );

	const presets = useMemo(
		() => presetsProp || defaultPresets,
		[ presetsProp, defaultPresets ]
	);

	return (
		<MenuGroup className="date-range-presets">
			{ presets.map( ( { id, label, range: presetRange } ) => (
				<MenuItem
					__next40pxDefaultSize
					key={ label }
					role="menuitemradio"
					isSelected={ value === id }
					icon={ value === id ? check : null }
					onClick={ () => onRangeChange( presetRange, id ) }
				>
					{ label }
				</MenuItem>
			) ) }
			<MenuItem
				__next40pxDefaultSize
				key="custom"
				role="menuitemradio"
				isSelected={ value === PRESET_CUSTOM }
				icon={ value === PRESET_CUSTOM ? check : null }
				className="date-range-presets__custom"
				disabled
			>
				{ __( 'Custom', 'woocommerce-analytics' ) }
			</MenuItem>
		</MenuGroup>
	);
}
