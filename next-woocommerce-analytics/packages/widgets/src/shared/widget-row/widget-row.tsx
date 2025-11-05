/**
 * External dependencies
 */
import { Stack } from '@automattic/design-system';
import { __experimentalText as Text } from '@wordpress/components';
import type { ReactNode } from 'react';

/**
 * Internal dependencies
 */
import styles from './widget-row.module.css';

type WidgetRowProps = {
	children: ReactNode;
	valueDisplay: string;
	percentageDisplay: ReactNode;
	color: string;
};

export function WidgetRow( {
	children,
	valueDisplay,
	percentageDisplay,
	color,
}: WidgetRowProps ) {
	return (
		<>
			<Stack direction="row" align="center" gap={ 2 }>
				<div
					className={ styles.bullet }
					style={ { backgroundColor: color } }
				/>
				<Text size="small">{ children }</Text>
			</Stack>
			<Text size="small" weight={ 600 } className={ styles.value }>
				{ valueDisplay }
			</Text>
			<Text size="small" className={ styles.percentage }>
				{ percentageDisplay }
			</Text>
		</>
	);
}
