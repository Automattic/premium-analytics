/**
 * External dependencies
 */
import { Page } from '@automattic/admin-toolkit';
import { __ } from '@wordpress/i18n';
import { AnalyticsQueryClientProvider } from '@next-woo-analytics/data';
import { useStagedSearch } from '@next-woo-analytics/routing';
import { useCallback, useMemo } from 'react';

/**
 * Internal dependencies
 */
import { Tabs, SectionTanstack, SectionSettings } from './components';

export type DevToolsSearchParams = {
	section?: 'tanstack' | 'settings';
};

function DevToolsContent() {
	const { effective, stage, commit } = useStagedSearch<
		DevToolsSearchParams,
		'/wc-analytics/dev-tools'
	>( {
		from: '/wc-analytics/dev-tools',
	} );

	const { section: sectionFromEffective } = effective;

	const section = useMemo(
		() => sectionFromEffective ?? undefined,
		[ sectionFromEffective ]
	);

	const handleSectionChange = useCallback(
		( value: string ) => {
			stage( { section: value as 'tanstack' | 'settings' } );
			commit();
		},
		[ stage, commit ]
	);

	return (
		<Page
			title={ __( 'Dev Tools', 'woocommerce-analytics' ) }
			subTitle={ __(
				'Dev tools, for developers 🧠',
				'woocommerce-analytics'
			) }
			tabs={ <Tabs onChange={ handleSectionChange } value={ section } /> }
		>
			{ section === 'settings' && <SectionSettings /> }
			{ section === 'tanstack' && <SectionTanstack /> }
		</Page>
	);
}

export default function DashboardRoute() {
	return (
		<AnalyticsQueryClientProvider>
			<DevToolsContent />
		</AnalyticsQueryClientProvider>
	);
}
