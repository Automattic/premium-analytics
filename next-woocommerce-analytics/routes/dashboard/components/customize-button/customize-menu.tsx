/**
 * External dependencies
 */
import { Button, Stack } from '@automattic/design-system';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { CustomizeState } from '../../stage';

type CustomizeMenuProps = {
	state: CustomizeState;
	onEnable: () => void;
	onSave: () => void;
	onCancel: () => void;
};

export function CustomizeMenu( {
	state,
	onEnable,
	onSave,
	onCancel,
}: CustomizeMenuProps ) {
	return (
		<Stack direction="row" gap={ 2 }>
			{ state === 'enabled' && (
				<Button variant="outline" size="compact" onClick={ onCancel }>
					{ __( 'Cancel', 'woocommerce-analytics' ) }
				</Button>
			) }

			{ state === 'disabled' && (
				<Button variant="solid" size="compact" onClick={ onEnable }>
					{ __( 'Customize', 'woocommerce-analytics' ) }
				</Button>
			) }

			{ state === 'enabled' && (
				<Button variant="solid" size="compact" onClick={ onSave }>
					{ __( 'Save', 'woocommerce-analytics' ) }
				</Button>
			) }
		</Stack>
	);
}
