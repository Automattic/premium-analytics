/**
 * External dependencies
 */
import { Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { Button, IconButton, Stack } from '@automattic/design-system';
import { sprintf, __ } from '@wordpress/i18n';
import { check, close } from '@wordpress/icons';
import { useMemo } from 'react';

/**
 * Internal dependencies
 */
import { DateRangePresets } from '../date-range-presets';
import { getDateRangeLabel } from '../utils';
import { DateRangePreset } from '../date-range-presets/date-range-presets';
import './date-comparison-dropdown.scss';

type DateComparisonDropdownProps = {
	presets: DateRangePreset[];
	enabled: boolean;
	presetId?: string;
	removeCompareToPrefix?: boolean;
	onEnable: () => void;
	onPresetChange: ( id: string ) => void;
	onClear: () => void;
};

export function DateComparisonDropdown( {
	presets,
	enabled,
	presetId,
	removeCompareToPrefix = false,
	onEnable,
	onPresetChange,
	onClear,
}: DateComparisonDropdownProps ) {
	const selectedPreset = useMemo(
		() =>
			presetId ? presets.find( ( p ) => p.id === presetId ) : undefined,
		[ presets, presetId ]
	);

	const comparisonRange = selectedPreset?.range;
	const hasValidPreset = !! comparisonRange;
	const hasPresets = presets.length > 0;

	if ( ! enabled ) {
		return (
			<Dropdown
				renderToggle={ ( { onToggle: open } ) => (
					<Button
						className="date-filters-panel-button"
						variant="outline"
						onClick={ open }
						size="compact"
						id="date-comparison-dropdown-button"
					>
						{ __( 'No comparison', 'woocommerce-analytics' ) }
					</Button>
				) }
				renderContent={ ( { onClose } ) => (
					<MenuGroup>
						<MenuItem
							isSelected={ true }
							onClick={ onClose }
							icon={ check }
							role="menuitemradio"
						>
							{ __( 'No comparison', 'woocommerce-analytics' ) }
						</MenuItem>

						<MenuItem
							isSelected={ false }
							onClick={ () => {
								onEnable();
								onClose();
							} }
							role="menuitemradio"
						>
							{ __(
								'Comparison to past',
								'woocommerce-analytics'
							) }
						</MenuItem>
					</MenuGroup>
				) }
			/>
		);
	}

	let label = __( 'Select comparison', 'woocommerce-analytics' );
	if ( hasValidPreset ) {
		if ( removeCompareToPrefix ) {
			label = getDateRangeLabel( comparisonRange );
		} else {
			label = sprintf(
				// translators: %s is the comparison range label
				__( 'Compare to: %s', 'woocommerce-analytics' ),
				getDateRangeLabel( comparisonRange )
			);
		}
	}

	return (
		<Dropdown
			popoverProps={ {
				className: 'date-comparison-dropdown__popover',
			} }
			renderToggle={ ( { onToggle: open, onClose } ) => (
				<Stack
					role="group"
					aria-label={ __(
						'Comparison controls',
						'woocommerce-analytics'
					) }
				>
					<Button
						className="date-comparison-dropdown__button"
						variant="outline"
						onClick={ open }
						size="compact"
					>
						{ label }
					</Button>
					<IconButton
						className="date-comparison-dropdown__clear-button"
						label={ __(
							'Clear comparison range',
							'woocommerce-analytics'
						) }
						variant="outline"
						icon={ close }
						size="compact"
						disabled={ ! hasValidPreset }
						onClick={ () => {
							onClear();
							onClose();
						} }
					/>
				</Stack>
			) }
			renderContent={ () =>
				hasPresets && (
					<DateRangePresets
						value={ presetId ?? null }
						presets={ presets }
						onRangeChange={ ( range, id ) => {
							onPresetChange( id );
						} }
					/>
				)
			}
		/>
	);
}
