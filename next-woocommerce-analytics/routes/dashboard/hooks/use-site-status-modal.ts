/**
 * External dependencies
 */
import { useCallback } from '@wordpress/element';
import { useSelect, dispatch } from '@wordpress/data';
import { store as preferencesStore } from '@wordpress/preferences';

/**
 * Custom hook to manage the visibility of the site status modal.
 *
 * This hook tracks whether the user has dismissed the site status
 * announcement modal that appears on the dashboard.
 *
 * The dismissal state is stored using the WordPress preferences store,
 * allowing the preference to persist across devices and browsers.
 *
 * @return {Object} An object containing:
 *   - isVisible: Whether the modal should be shown
 *   - dismiss: Function to dismiss the modal
 */
export const useSiteStatusModal = () => {
	const isVisible = !! useSelect(
		( select ) =>
			select( preferencesStore ).get(
				'woocommerce/woocommerce-analytics',
				'siteStatusShowModal'
			),
		[]
	);

	const dismiss = useCallback( () => {
		dispatch( preferencesStore ).set(
			'woocommerce/woocommerce-analytics',
			'siteStatusShowModal',
			false
		);
	}, [] );

	return { isVisible, dismiss };
};
