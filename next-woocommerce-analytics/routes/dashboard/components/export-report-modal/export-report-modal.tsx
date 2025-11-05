/**
 * External dependencies
 */
import { Dialog, Button } from '@automattic/design-system';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import { getDateRangeLabel } from '@next-woo-analytics/components';
import {
	getComparisonRangeFromPreset,
	type DateRange,
	type PresetId,
} from '@next-woo-analytics/datetime';

/**
 * Internal dependencies
 */
import { MetricsSelector } from './metrics-selector';
import { useExportMetrics } from '../../hooks/use-export-metrics';
import styles from './export-report-modal.module.scss';

interface ExportReportModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialRange?: DateRange;
	presetId?: string;
	comparisonPresetId?: string;
}

/**
 * Export Report Modal Component
 *
 * Allows users to export dashboard data
 */
export const ExportReportModal = ( {
	isOpen,
	onClose,
	initialRange,
	presetId,
	comparisonPresetId,
}: ExportReportModalProps ) => {
	// Metric selection state
	const { selectedMetrics, toggleMetric, hasSelectedMetrics, clearMetrics } =
		useExportMetrics();

	// Calculate comparison range from preset
	const comparisonRange = useMemo( () => {
		if ( ! initialRange || ! comparisonPresetId ) {
			return undefined;
		}
		return getComparisonRangeFromPreset(
			initialRange,
			comparisonPresetId as PresetId
		);
	}, [ initialRange, comparisonPresetId ] );

	// Format date range labels
	const primaryDateLabel = useMemo( () => {
		if ( ! initialRange?.from || ! initialRange?.to ) {
			return '';
		}
		return getDateRangeLabel( initialRange );
	}, [ initialRange ] );

	const comparisonDateLabel = useMemo( () => {
		if ( ! comparisonRange?.from || ! comparisonRange?.to ) {
			return '';
		}
		return getDateRangeLabel( comparisonRange );
	}, [ comparisonRange ] );

	const handleClose = useCallback( () => {
		// Clear selected metrics when closing modal
		clearMetrics();
		onClose();
	}, [ clearMetrics, onClose ] );

	const handleExport = useCallback( () => {
		// Placeholder for export functionality (will be implemented in PR #4)
		// TODO: selectedMetrics and initialRange will be used in export logic; dependencies included in advance.
	}, [ selectedMetrics, initialRange ] );

	return (
		<Dialog.Root
			open={ isOpen }
			title={ __( 'Export data', 'woocommerce-analytics' ) }
		>
			<Dialog.Popup>
				<Dialog.Header>
					<Dialog.Heading />
					<Dialog.CloseIcon onClick={ onClose } />
				</Dialog.Header>
				<p>
					{ __(
						'Choose which metrics you would like to export. Each metric will be exported in a CSV file and sent to your email address when ready.',
						'woocommerce-analytics'
					) }
				</p>
				<div className={ styles.dateFiltersWrapper }>
					<div>
						<h3 className={ styles.dateLabel }>
							{ __( 'DATES', 'woocommerce-analytics' ) }
						</h3>
						<p className={ styles.dateValue }>
							{ primaryDateLabel }
						</p>
					</div>
					{ comparisonDateLabel && (
						<div>
							<h3 className={ styles.dateLabel }>
								{ __(
									'COMPARE TO',
									'woocommerce-analytics'
								) }
							</h3>
							<p className={ styles.dateValue }>
								{ comparisonDateLabel }
							</p>
						</div>
					) }
				</div>
				<MetricsSelector
					selectedMetrics={ selectedMetrics }
					onMetricToggle={ toggleMetric }
				/>
				<Dialog.Footer>
					<Button variant="minimal" onClick={ handleClose }>
						{ __( 'Cancel', 'woocommerce-analytics' ) }
					</Button>
					<Dialog.Action
						disabled={ ! hasSelectedMetrics }
						onClick={ handleExport }
					>
						{ __( 'Export', 'woocommerce-analytics' ) }
					</Dialog.Action>
				</Dialog.Footer>
			</Dialog.Popup>
		</Dialog.Root>
	);
};
