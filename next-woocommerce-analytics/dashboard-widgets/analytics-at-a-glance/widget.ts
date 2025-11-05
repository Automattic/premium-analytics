/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	ReportParamsField,
	MetricsField,
} from '@next-woo-analytics/widgets-toolkit';
import { getDefaultQueryParams } from '@next-woo-analytics/data';

const widget = {
	name: 'woocommerce-analytics/at-a-glance',
	title: __( 'Analytics at a glance', 'woocommerce-analytics' ),
	description: __(
		'Display key metrics and statistics of your store.',
		'woocommerce-analytics'
	),
	attributes: [
		{
			id: 'reportParams',
			label: __( 'Range', 'woocommerce-analytics' ),
			Edit: ReportParamsField,
		},
		{
			id: 'metrics',
			label: __( 'Metrics', 'woocommerce-analytics' ),
			Edit: MetricsField,
		},
	],
	example: {
		reportParams: getDefaultQueryParams( true ),
	},
};

export default widget;
