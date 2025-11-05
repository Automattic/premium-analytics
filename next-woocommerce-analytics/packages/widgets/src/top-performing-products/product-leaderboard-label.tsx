/**
 * External dependencies
 */
import { __experimentalHStack as HStack } from '@wordpress/components';

/**
 * Internal dependencies
 */
import styles from './product-leaderboard-label.module.scss';

// Simple default image for when the product image is not available.
const DEFAULT_IMAGE_URL =
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="%23e5e7eb"/></svg>';

export const ProductLeaderboardLabel = ( {
	label,
	imageUrl = DEFAULT_IMAGE_URL,
	imageAlt,
}: {
	label: string;
	imageUrl: string;
	imageAlt: string;
} ) => {
	return (
		<HStack
			as="div"
			spacing={ 2 }
			align="center"
			justify="flex-start"
			className={ styles.container }
		>
			<img
				src={ imageUrl }
				onError={ ( e: React.SyntheticEvent< HTMLImageElement > ) => {
					e.currentTarget.src = DEFAULT_IMAGE_URL;
				} }
				alt={ imageAlt }
				className={ styles.productImage }
			/>
			<span className={ styles.label }>{ label }</span>
		</HStack>
	);
};
