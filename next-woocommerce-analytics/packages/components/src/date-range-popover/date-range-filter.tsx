/**
 * External dependencies
 */
import { DateRangeCalendar } from '@automattic/ui';
import { Dropdown } from '@wordpress/components';
import { calendar } from '@wordpress/icons';
import { Stack, Button } from '@automattic/design-system';
import { useState } from 'react';
import { useViewportMatch } from '@wordpress/compose';
import { getSiteTimezone } from '@next-woo-analytics/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import '@automattic/ui/style.css';

/**
 * Internal dependencies
 */
import { getDateRangeLabel } from '../utils';
import { DateRangePresets, PRESET_CUSTOM } from '../date-range-presets';
import { DateRangeInput } from '../date-range-input';
import './date-range-filter.scss';

/*
 * Use DateRange type from @automattic/ui
 * as the source of truth for the date range.
 */
export type DateRange = NonNullable<
	Parameters< typeof DateRangeCalendar >[ 0 ][ 'selected' ]
>;

type DateRangePopoverProps = {
	presetId?: string;
	range: DateRange;
	onChange: ( range?: DateRange, preset?: string ) => void;
	onApply: () => void;
	onCancel: () => void;
	canApply: boolean;
};

function getDisplayedMonth( range: DateRange ): Date {
	return range?.from ?? new Date();
}

export function DateRangePopover( {
	presetId,
	range,
	onChange,
	onApply,
	onCancel,
	canApply,
}: DateRangePopoverProps ) {
	const isWideScreen = useViewportMatch( 'wide', '>=' );

	const [ displayedMonth, setDisplayedMonth ] = useState(
		getDisplayedMonth( range )
	);

	const handleChange = ( nextRange?: DateRange, nextPresetId?: string ) => {
		if ( nextRange ) {
			setDisplayedMonth( getDisplayedMonth( nextRange ) );
		}

		// If nextPresetId is undefined, the user manually changed the dates
		// (via calendar or input fields), so we switch to PRESET_CUSTOM
		const effectivePresetId = nextPresetId ?? PRESET_CUSTOM;

		onChange( nextRange, effectivePresetId );
	};

	const timeZone = getSiteTimezone();

	return (
		<Dropdown
			popoverProps={ {
				className: 'date-filters-panel__popover',
			} }
			renderToggle={ ( { onToggle } ) => (
				<Button
					className="date-filters-panel-button"
					variant="outline"
					onClick={ onToggle }
					size="compact"
					id="date-range-popover-button"
				>
					<Button.Icon icon={ calendar } />
					{ getDateRangeLabel( range ) }
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<Stack gap={ 2 } direction="column">
					<Stack direction="row" gap={ 2 }>
						<div className="date-range-presets-wrapper">
							<DateRangePresets
								value={ presetId ?? null }
								onRangeChange={ handleChange }
							/>
						</div>

						<Stack
							className={ clsx( 'date-range-calendar-wrapper', {
								'date-range-calendar-wrapper__wide':
									isWideScreen,
							} ) }
							gap={ 4 }
							direction="column"
						>
							<DateRangeInput
								range={ range }
								onChange={ handleChange }
								timeZone={ timeZone }
							/>

							<DateRangeCalendar
								className="date-range-calendar"
								selected={ range }
								onSelect={ ( nextRange ) =>
									handleChange( nextRange )
								}
								numberOfMonths={ isWideScreen ? 2 : 1 }
								month={ displayedMonth }
								onMonthChange={ setDisplayedMonth }
								timeZone={ timeZone }
							/>
						</Stack>
					</Stack>

					<Stack
						direction="row"
						gap={ 2 }
						align="end"
						justify="end"
						className="date-range-popover-actions"
					>
						<Button
							variant="minimal"
							size="compact"
							onClick={ () => {
								onCancel();
								onClose();
							} }
						>
							{ __( 'Cancel', 'woocommerce-analytics' ) }
						</Button>
						<Button
							variant="solid"
							size="compact"
							disabled={ ! canApply }
							onClick={ () => {
								onApply();
								onClose();
							} }
						>
							{ __( 'Apply', 'woocommerce-analytics' ) }
						</Button>
					</Stack>
				</Stack>
			) }
		/>
	);
}
