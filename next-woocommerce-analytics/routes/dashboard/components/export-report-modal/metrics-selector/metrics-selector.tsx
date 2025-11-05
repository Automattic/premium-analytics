/**
 * External dependencies
 */
import { CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { AVAILABLE_METRICS } from '../constants';
import styles from './metrics-selector.module.scss';

interface MetricsSelectorProps {
	selectedMetrics: string[];
	onMetricToggle: ( metricKey: string ) => void;
}

/**
 * Metrics Selector Component
 *
 * Displays a list of checkboxes for available metrics to export
 */
export const MetricsSelector = ( {
	selectedMetrics,
	onMetricToggle,
}: MetricsSelectorProps ) => {
	return (
		<div className={ styles.metricsSelector }>
			<h3 className={ styles.heading }>
				{ __( 'General Metrics', 'woocommerce-analytics' ) }
			</h3>
			<div className={ styles.checkboxList }>
				{ AVAILABLE_METRICS.map( ( metric ) => (
					<CheckboxControl
						key={ metric.key }
						className={ styles.checkbox }
						label={ metric.label }
						checked={ selectedMetrics.includes( metric.key ) }
						onChange={ () => onMetricToggle( metric.key ) }
					/>
				) ) }
			</div>
		</div>
	);
};
