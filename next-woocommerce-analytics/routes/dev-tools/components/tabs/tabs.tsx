/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Tabs, Stack } from '@automattic/design-system';

const tabsList = {
	TANSTACK: {
		value: 'tanstack',
		label: __( 'Tanstack', 'woocommerce-analytics' ),
	},
	SETTINGS: {
		value: 'settings',
		label: __( 'Settings', 'woocommerce-analytics' ),
	},
};

type TabsProps = {
	onChange: ( value: string ) => void;
	value?: string;
};

export const defaultSection = tabsList.TANSTACK.value;

export function DashboardTabs( { value, onChange }: TabsProps ) {
	return (
		<Tabs.Root value={ value } onValueChange={ onChange }>
			<Stack gap={ 4 }>
				<Tabs.List density="compact">
					<Tabs.Tab value={ tabsList.SETTINGS.value }>
						{ tabsList.SETTINGS.label }
					</Tabs.Tab>

					<Tabs.Tab value={ tabsList.TANSTACK.value }>
						{ tabsList.TANSTACK.label }
					</Tabs.Tab>
				</Tabs.List>
			</Stack>
		</Tabs.Root>
	);
}
