/**
 * External dependencies
 */
import { Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { IconButton } from '@automattic/design-system';
import { moreVertical as MoreVerticalIcon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

export interface MoreActionsDropdownProps {
	/**
	 * Array of menu items to display in the dropdown
	 */
	items?: Array< {
		label: string;
		onClick: () => void;
		icon?: React.ComponentType< { size?: number } > | React.ReactElement;
		disabled?: boolean;
	} >;
	/**
	 * Additional CSS class name for the dropdown
	 */
	className?: string;
}

export function MoreActionsDropdown( {
	items = [],
	className,
}: MoreActionsDropdownProps ) {
	return (
		<Dropdown
			className={ className }
			renderToggle={ ( { onToggle } ) => (
				<IconButton
					icon={ MoreVerticalIcon }
					label={ __( 'More Actions', 'woocommerce-analytics' ) }
					variant="minimal"
					size="compact"
					onClick={ onToggle }
				/>
			) }
			renderContent={ ( { onClose } ) => (
				<MenuGroup>
					{ items.map( ( item, index ) => (
						<MenuItem
							key={ `${ item.label }-${ index }` }
							icon={ item.icon }
							iconPosition="left"
							onClick={ () => {
								item.onClick();
								onClose();
							} }
							disabled={ item.disabled }
						>
							{ item.label }
						</MenuItem>
					) ) }
				</MenuGroup>
			) }
		/>
	);
}
