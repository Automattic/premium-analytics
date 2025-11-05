/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Tabs, IconButton, Stack } from '@automattic/design-system';
import { plus } from '@next-woo-analytics/icons';
import type { ProductType } from '@next-woo-analytics/widgets';

/**
 * Internal dependencies
 */
import styles from './tabs.module.scss';
import {
	type SiteStatus,
	getSiteStatus,
	useSiteStatus,
	shouldShowTabs,
	getDefaultSection,
} from './site-status';

type TabsProps = {
	onChange: ( value: string ) => void;
	value?: string;
};

const TAB_DEFINITIONS: Record< string, { value: ProductType; label: string } > =
	{
		GENERAL: {
			value: 'general',
			label: __( 'General', 'woocommerce-analytics' ),
		},
		PRODUCTS: {
			value: 'products',
			label: __( 'Products', 'woocommerce-analytics' ),
		},
		BOOKINGS: {
			value: 'bookings',
			label: __( 'Services & Events', 'woocommerce-analytics' ),
		},
	};

export const defaultSection = TAB_DEFINITIONS.GENERAL.value;

function resolveSection(
	status: SiteStatus,
	preferredSection?: ProductType
): ProductType {
	// Mixed sites: respect user preference or default to general
	if ( shouldShowTabs( status ) ) {
		return preferredSection ?? defaultSection;
	}
	// Single-type sites: use the appropriate section for their product type
	return getDefaultSection( status );
}

/** Determine if tabs should be shown (React hook version) */
export function useShouldShowDashboardTabs(): boolean {
	const status = useSiteStatus();
	return shouldShowTabs( status );
}

/** Resolve dashboard section (non-React version for route loaders) */
export function resolveDashboardSection(
	preferredSection?: ProductType
): ProductType {
	const status = getSiteStatus();
	return resolveSection( status, preferredSection );
}

/** Resolve dashboard section (React hook version) */
export function useResolveDashboardSection(
	preferredSection?: ProductType
): ProductType {
	const status = useSiteStatus();
	return resolveSection( status, preferredSection );
}

export function DashboardTabs( { value, onChange }: TabsProps ) {
	return (
		<Tabs.Root value={ value } onValueChange={ onChange }>
			<Stack gap={ 4 }>
				<Tabs.List density="compact" className={ styles.tabsList }>
					<Tabs.Tab value={ TAB_DEFINITIONS.GENERAL.value }>
						{ TAB_DEFINITIONS.GENERAL.label }
					</Tabs.Tab>
					<Tabs.Tab value={ TAB_DEFINITIONS.PRODUCTS.value }>
						{ TAB_DEFINITIONS.PRODUCTS.label }
					</Tabs.Tab>
					<Tabs.Tab value={ TAB_DEFINITIONS.BOOKINGS.value }>
						{ TAB_DEFINITIONS.BOOKINGS.label }
					</Tabs.Tab>
				</Tabs.List>

				<IconButton
					className={ styles.addTabButton }
					icon={ plus }
					variant="minimal"
					size="small"
					label={ __( 'Add tab', 'woocommerce-analytics' ) }
				/>
			</Stack>
		</Tabs.Root>
	);
}
