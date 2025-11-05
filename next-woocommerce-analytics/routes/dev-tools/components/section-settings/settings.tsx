/**
 * External dependencies
 */
import {
	ToggleControl,
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useExperiments } from '@automattic/admin-toolkit';

/**
 * Internal dependencies
 */

const settingsList = [
	{
		key: 'woocommerce-analytics/dashboard/customize',
		label: __( 'Dashboard / Customize', 'woocommerce-analytics' ),
		description: __(
			'Allow the dashboard to be customized.',
			'woocommerce-analytics'
		),
	},
	{
		key: 'woocommerce-analytics/dashboard/widget-resizing',
		label: __( 'Dashboard / Widget resizing', 'woocommerce-analytics' ),
		description: __(
			'Allow the dashboard widgets to be resized.',
			'woocommerce-analytics'
		),
	},
];

export function SectionSettings() {
	const { enabledExperiments, setExperimentEnabled } = useExperiments();

	return (
		<ItemGroup>
			{ settingsList.map( ( { key, label, description } ) => (
				<Item key={ key }>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ label }
						help={ description }
						checked={ enabledExperiments[ key ] }
						onChange={ ( newValue ) => {
							setExperimentEnabled( key, newValue );
						} }
					/>
				</Item>
			) ) }
		</ItemGroup>
	);
}
