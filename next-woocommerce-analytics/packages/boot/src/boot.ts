/**
 * External dependencies
 */
import { updateMenuItem } from '@automattic/boot';
import { dashboard } from '@next-woo-analytics/icons';
import { bug } from '@wordpress/icons';

updateMenuItem( 'wc-analytics', {
	icon: dashboard,
} );

updateMenuItem( 'wc-analytics-dashboard', {
	icon: dashboard,
} );

updateMenuItem( 'wc-analytics-dev', {
	icon: bug,
} );
