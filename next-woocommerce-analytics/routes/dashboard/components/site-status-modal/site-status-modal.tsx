/**
 * External dependencies
 */
import { Dialog } from '@automattic/design-system';
import { __ } from '@wordpress/i18n';

interface SiteStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * Site Status Modal Component
 *
 * Displays an announcement modal to inform users about new data and tabs
 * available in the Analytics Dashboard.
 */
export const SiteStatusModal = ( {
	isOpen,
	onClose,
}: SiteStatusModalProps ) => {
	return (
		<Dialog.Root
			open={ isOpen }
			title={ __(
				'Congrats, you now have more data!',
				'woocommerce-analytics'
			) }
		>
			<Dialog.Popup size="medium">
				<Dialog.Header>
					<Dialog.Heading />
					<Dialog.CloseIcon onClick={ onClose } />
				</Dialog.Header>
				<p>
					{ __(
						'You can now view insights for both Products and Services & Events.',
						'woocommerce-analytics'
					) }
				</p>
				<p>
					{ __(
						'We\'ve added new tabs so you can easily track your store\'s performance in the "Overview" section, as well as dive deeper into the "Products" and "Services & Events" tabs for more detailed results.',
						'woocommerce-analytics'
					) }
				</p>
				<Dialog.Footer>
					<Dialog.Action onClick={ onClose }>
						{ __( 'Got it', 'woocommerce-analytics' ) }
					</Dialog.Action>
				</Dialog.Footer>
			</Dialog.Popup>
		</Dialog.Root>
	);
};
