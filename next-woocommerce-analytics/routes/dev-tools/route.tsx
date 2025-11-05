/**
 * External dependencies
 */
import { redirect } from '@tanstack/react-router';

/**
 * Internal dependencies
 */
import type { DevToolsSearchParams } from './stage';

/**
 * Internal dependencies
 */
export const route = {
	beforeLoad: async ( { search }: { search: DevToolsSearchParams } ) => {
		if ( ! search.section ) {
			throw redirect( {
				to: '/wc-analytics/dev-tools',
				search: {
					section: 'settings',
				},
				replace: true,
			} );
		}
	},
};
