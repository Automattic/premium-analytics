/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { ReportParamsField } from '@next-woo-analytics/widgets-toolkit';
import { getDefaultQueryParams } from '@next-woo-analytics/data';

const widget = {
	name: 'woocommerce-analytics/orders-over-time',
	title: __( 'Orders over time', 'woocommerce-analytics' ),
	description: __(
		'Display orders metrics over time.',
		'woocommerce-analytics'
	),
	attributes: [
		{
			id: 'reportParams',
			label: __( 'Range', 'woocommerce-analytics' ),
			Edit: ReportParamsField,
		},
	],
	example: {
		reportParams: getDefaultQueryParams( true ),
	},
};

export default widget;
