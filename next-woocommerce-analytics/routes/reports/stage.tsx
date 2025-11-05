/**
 * External dependencies
 */
import { Page } from '@automattic/admin-toolkit';
import { __ } from '@wordpress/i18n';
import { AnalyticsQueryClientProvider } from '@next-woo-analytics/data';

function ReportsContent() {
	return (
		<Page title={ __( 'Reports', 'woocommerce-analytics' ) }>
			Hello Reports
		</Page>
	);
}

export default function ReportsRoute() {
	return (
		<AnalyticsQueryClientProvider>
			<ReportsContent />
		</AnalyticsQueryClientProvider>
	);
}
