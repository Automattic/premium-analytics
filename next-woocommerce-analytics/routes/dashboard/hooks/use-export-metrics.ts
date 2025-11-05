/**
 * External dependencies
 */
import { useState, useCallback } from 'react';

/**
 * Hook for managing export metrics selection
 */
export const useExportMetrics = () => {
	const [ selectedMetrics, setSelectedMetrics ] = useState< string[] >( [] );

	/**
	 * Toggle a metric on or off
	 */
	const toggleMetric = useCallback( ( metricKey: string ) => {
		setSelectedMetrics( ( prev ) => {
			if ( prev.includes( metricKey ) ) {
				return prev.filter( ( key ) => key !== metricKey );
			}
			return [ ...prev, metricKey ];
		} );
	}, [] );

	/**
	 * Clear all selected metrics
	 */
	const clearMetrics = useCallback( () => {
		setSelectedMetrics( [] );
	}, [] );

	/**
	 * Check if at least one metric is selected
	 */
	const hasSelectedMetrics = selectedMetrics.length > 0;

	return {
		selectedMetrics,
		toggleMetric,
		clearMetrics,
		hasSelectedMetrics,
	};
};
