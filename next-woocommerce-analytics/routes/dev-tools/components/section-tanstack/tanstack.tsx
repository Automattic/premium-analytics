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

export function SectionTanstack() {
	const { enabledExperiments, setExperimentEnabled } = useExperiments();

	return (
		<ItemGroup>
			<Item key="tanstack">
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __(
						'Tanstack Query dev tool',
						'woocommerce-analytics'
					) }
					help={ __(
						'Enable Tanstack Query dev tool to see the query history and the data in the console.',
						'woocommerce-analytics'
					) }
					checked={ enabledExperiments[ 'tanstack/query-dev-tool' ] }
					onChange={ ( value ) => {
						setExperimentEnabled(
							'tanstack/query-dev-tool',
							value
						);
					} }
				/>
			</Item>
		</ItemGroup>
	);
}
