/**
 * External dependencies
 */
import { Stack } from '@automattic/design-system';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import styles from './empty-widget.module.scss';

type EmptyWidgetProps = {
	children: React.ReactNode;
};

export function EmptyWidget( { children }: EmptyWidgetProps ) {
	return (
		<Stack
			direction="column"
			align="center"
			justify="center"
			gap={ 4 }
			className={ styles.emptyWidget }
		>
			<span className={ styles.emptyWidgetIcon }> { children } </span>
			<p className={ styles.emptyWidgetText }>
				{ __(
					'No data found for this date range.',
					'woocommerce-analytics'
				) }
			</p>
		</Stack>
	);
}
