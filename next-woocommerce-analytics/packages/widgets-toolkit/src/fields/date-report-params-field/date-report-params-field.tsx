/**
 * External dependencies
 */
import { Stack } from '@automattic/design-system';
import { DateFiltersPanel } from '@next-woo-analytics/components';
import { normalizeReportParams, localTZDate } from '@next-woo-analytics/data';
import { endOfDay } from 'date-fns';
import {
	deriveComparisonRange,
	encodeDateToSearchParam,
} from '@next-woo-analytics/routing';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import type { DataFormControlProps } from '@wordpress/dataviews/wp';
import type { DateRange } from '@next-woo-analytics/datetime';

/**
 * Inferred types
 */
type ReportParams = NonNullable<
	Parameters< typeof normalizeReportParams >[ 0 ]
>;

type PresetType = ReportParams[ 'preset' ];

export type ReportParamsFieldAttributes = {
	reportParams: ReportParams;
};

export function ReportParamsField( {
	data: attributes,
	onChange,
}: DataFormControlProps< ReportParamsFieldAttributes > ) {
	const [ stagedReportParams, setStagedReportParams ] =
		useState< ReportParams >( attributes?.reportParams );

	const reportParams = normalizeReportParams( stagedReportParams );

	const range = {
		from: localTZDate( reportParams.from ),
		to: localTZDate( reportParams.to ),
	};

	const stageDateRange = useCallback(
		( nextRange?: DateRange | undefined, nextPresetId?: string ) => {
			const nextReportParams = { ...stagedReportParams };

			if ( nextRange?.from && nextRange?.to ) {
				nextReportParams.from = encodeDateToSearchParam(
					nextRange.from
				);
				nextReportParams.to = encodeDateToSearchParam(
					endOfDay( nextRange.to )
				);
			}

			if ( nextPresetId ) {
				nextReportParams.preset = nextPresetId as PresetType;
			}

			/*
			 * Derive comparison range from primary range and preset,
			 * when comparison is enabled.
			 */
			if ( reportParams.comp === '1' ) {
				const derived = deriveComparisonRange( nextReportParams );
				if ( derived ) {
					nextReportParams.compare_from = derived.compare_from;
					nextReportParams.compare_to = derived.compare_to;
				}
			}

			setStagedReportParams( nextReportParams );
		},
		[ stagedReportParams, reportParams.comp ]
	);

	// Basic check if the date range has been changed.
	const isDateRangeDirty = useMemo( () => {
		return (
			attributes?.reportParams?.from !== stagedReportParams?.from ||
			attributes?.reportParams?.to !== stagedReportParams?.to ||
			attributes?.reportParams?.preset !== stagedReportParams?.preset
		);
	}, [
		attributes?.reportParams?.from,
		attributes?.reportParams?.to,
		attributes?.reportParams?.preset,
		stagedReportParams?.from,
		stagedReportParams?.to,
		stagedReportParams?.preset,
	] );

	const commitComparisonRange = useCallback(
		(
			nextComparisonRange?: DateRange,
			nextComparisonPresetId?: string
		) => {
			onChange( {
				reportParams: {
					...reportParams,
					compare_from: encodeDateToSearchParam(
						nextComparisonRange?.from
					),
					compare_to: encodeDateToSearchParam(
						nextComparisonRange?.to
					),
					compare_preset: nextComparisonPresetId,
					comp: '1' as const,
				},
			} );
		},
		[ onChange, reportParams ]
	);

	const commit = useCallback( () => {
		onChange( { reportParams: stagedReportParams } );
	}, [ onChange, stagedReportParams ] );

	const clear = useCallback( () => {
		setStagedReportParams( attributes?.reportParams );
	}, [ setStagedReportParams, attributes ] );

	return (
		<Stack direction="column" gap={ 2 }>
			<DateFiltersPanel
				range={ range }
				presetId={ stagedReportParams?.preset }
				comparisonPresetId={ attributes?.reportParams?.compare_preset }
				onChange={ stageDateRange }
				onComparisonChange={ commitComparisonRange }
				rangeControlProps={ {
					label: __( 'Date range', 'woocommerce-analytics' ),
				} }
				comparisonControlProps={ {
					label: __( 'Compare to', 'woocommerce-analytics' ),
				} }
				onApply={ commit }
				canApply={ isDateRangeDirty }
				onCancel={ clear }
			/>
		</Stack>
	);
}
