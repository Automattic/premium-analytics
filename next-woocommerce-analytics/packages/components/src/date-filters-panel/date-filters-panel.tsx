/**
 * External dependencies
 */
import { Stack } from '@automattic/design-system';
import { BaseControl } from '@wordpress/components';
import { useState, useMemo, useCallback } from 'react';

/**
 * Internal dependencies
 */
import { DateRangePopover } from '../date-range-popover';
import { DateComparisonDropdown } from '../date-comparison-dropdown';
import { useComparisonDatePresets } from '../use-comparison-date-presets';

type DateRangePopoverProps = Parameters< typeof DateRangePopover >[ 0 ];

export type DateRange = DateRangePopoverProps[ 'range' ];

type DateFiltersPanelProps = {
	/*
	 * The current comparison preset ID.
	 */
	presetId?: string;

	/*
	 * The current primary date range.
	 */
	range: DateRange;

	/*
	 * The current comparison preset ID.
	 */
	comparisonPresetId?: string;

	/*
	 * Callback when the primary date range changes.
	 */
	onChange: DateRangePopoverProps[ 'onChange' ];

	/*
	 * Callback when the comparison date range changes.
	 */
	onComparisonChange: (
		range: DateRange | undefined,
		presetId?: string
	) => void;

	/*
	 * Props for the date range popover.
	 */
	rangeControlProps?: Omit<
		Parameters< typeof BaseControl >[ 0 ],
		'children'
	>;

	/*
	 * Props for the date comparison dropdown.
	 */
	comparisonControlProps?: Omit<
		Parameters< typeof BaseControl >[ 0 ],
		'children'
	>;

	/*
	 * Callback when the primary date range is applied.
	 */
	onApply: DateRangePopoverProps[ 'onApply' ];

	/*
	 * Callback when the primary date range is canceled.
	 */
	onCancel: DateRangePopoverProps[ 'onCancel' ];

	/*
	 * Whether the primary date range can be applied.
	 */
	canApply?: boolean;
};

/**
 * DateFiltersPanel - Manages date range selection and comparison controls
 *
 * This component serves as the container for date filtering functionality,
 * managing both the primary date range selection and the comparison date range.
 * It owns the comparison state and delegates to child components for UI.
 */
export function DateFiltersPanel( {
	presetId,
	range,
	comparisonPresetId,
	onChange,
	onComparisonChange,
	rangeControlProps = {
		label: null,
		help: null,
	},
	comparisonControlProps = {
		label: null,
		help: null,
	},
	onApply,
	onCancel,
	canApply = true,
}: DateFiltersPanelProps ) {
	// Enable the comparison dropdown if the comparisonPresetId is defined
	const [ comparisonEnabled, setComparisonEnabled ] = useState(
		!! comparisonPresetId
	);

	// Get available presets for the current range
	const presets = useComparisonDatePresets( range );

	/**
	 * Determines the default preset ID to use when comparison is enabled.
	 * Priority order:
	 * 1. 'previous-month'
	 * 2. 'previous-period'
	 * 3. First available preset
	 */
	const defaultPresetId = useMemo( () => {
		return (
			presets.find( ( p ) => p.id === 'previous-month' )?.id ??
			presets.find( ( p ) => p.id === 'previous-period' )?.id ??
			presets[ 0 ]?.id
		);
	}, [ presets ] );

	/**
	 * Currently selected comparison preset,
	 * based on the stored preset ID, or the default preset.
	 * Returns undefined if no preset is selected
	 * or if the ID doesn't match any available preset.
	 */
	const preset = useMemo( () => {
		const id = comparisonPresetId ?? defaultPresetId;
		return id ? presets.find( ( p ) => p.id === id ) : undefined;
	}, [ presets, comparisonPresetId, defaultPresetId ] );

	const presetChange = useCallback(
		( id: string ) => {
			const nextPreset = presets.find( ( p ) => p.id === id );
			onComparisonChange( nextPreset?.range, id );
		},
		[ onComparisonChange, presets ]
	);

	/**
	 * Handles clearing the comparison completely.
	 * Disables comparison, clears the selected preset, and notifies parent.
	 */
	const clearComparison = useCallback( () => {
		setComparisonEnabled( false );
		onComparisonChange( undefined, undefined );
	}, [ onComparisonChange ] );

	const handleEnable = useCallback( () => {
		setComparisonEnabled( true );
		onComparisonChange( preset?.range, preset?.id );
	}, [ onComparisonChange, preset ] );

	return (
		<Stack gap={ 2 } wrap="wrap">
			<BaseControl
				label={ rangeControlProps.label }
				id="date-range-popover-button"
				help={ rangeControlProps.help }
			>
				<DateRangePopover
					presetId={ presetId }
					range={ range }
					onChange={ onChange }
					onApply={ onApply }
					onCancel={ onCancel }
					canApply={ canApply }
				/>
			</BaseControl>

			<BaseControl
				label={ comparisonControlProps.label }
				id="date-comparison-dropdown-button"
				help={ comparisonControlProps.help }
			>
				<DateComparisonDropdown
					presets={ presets }
					enabled={ comparisonEnabled }
					presetId={ comparisonPresetId }
					removeCompareToPrefix={ !! comparisonControlProps.label }
					onEnable={ handleEnable }
					onPresetChange={ presetChange }
					onClear={ clearComparison }
				/>
			</BaseControl>
		</Stack>
	);
}
