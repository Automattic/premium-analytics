/**
 * External dependencies
 */
import { Stack, Tooltip, Icon } from '@automattic/design-system';
import {
	__experimentalHeading as Heading,
	__experimentalText as Text,
} from '@wordpress/components';
import clsx from 'clsx';
import { useRef, useEffect } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { info } from '@next-woo-analytics/icons';

/**
 * Internal dependencies
 */
import { useWidgetsGridContext } from '../../widgets-grid/widgets-grid-context';
import type { UnifiedLoadingState } from '../use-widget-loading';
import styles from './widget-card.module.css';

export type WidgetCategory =
	| 'Finances'
	| 'Orders'
	| 'Sales'
	| 'Inventory'
	| 'Visitors';

type WidgetCardProps = {
	title: string;
	category?: WidgetCategory;
	description?: ReactNode;
	linkTo?: string;
	children: ReactNode;
	loadingState?: UnifiedLoadingState;
	className?: string;
	style?: CSSProperties & {
		[ key: `--${ string }` ]: string | number;
	};
};

export function WidgetCard( {
	title,
	description = '',
	children,
	loadingState,
	className,
	style,
}: WidgetCardProps ) {
	const ref = useRef< HTMLDivElement >( null );

	// Inert the widget card when in edit mode.
	const { editMode } = useWidgetsGridContext();

	/**
	 * React 18 strips unknown props like `inert` from JSX and
	 * `@types/react@18` doesn't type it.
	 * Use a ref + effect to set/remove
	 * the DOM attribute/property reliably.
	 */
	useEffect( () => {
		if ( ! ref.current ) {
			return;
		}
		if ( editMode ) {
			return ref.current.setAttribute( 'inert', 'true' );
		}

		ref.current.removeAttribute( 'inert' );
	}, [ editMode ] );

	// Destructure loading state flags with defaults
	const { isInitialLoading = false, isRefetching = false } =
		loadingState || {};

	return (
		<div
			ref={ ref }
			className={ clsx(
				styles.root,
				{
					[ styles[ 'is-updating' ] ]: isRefetching,
				},
				className
			) }
			style={ style }
		>
			<div className={ styles.header }>
				<Heading level={ 5 } className={ styles.title } as="div">
					{ title }
				</Heading>
				{ description && (
					<Tooltip.Root>
						<Tooltip.Trigger
							render={
								<Stack align="center" justify="center">
									<Icon
										icon={ info }
										fill="var(--wpds-color-fg-interactive-neutral-weak)"
										size={ 20 }
									/>
								</Stack>
							}
						/>
						<Tooltip.Popup side="top" className={ styles.tooltip }>
							<Stack direction="column" gap={ 2 } align="left">
								<Text size="small">{ description }</Text>
							</Stack>
						</Tooltip.Popup>
					</Tooltip.Root>
				) }
			</div>
			<Stack direction="column" className={ styles.body }>
				{ children }
			</Stack>
			{ isInitialLoading && (
				<div className={ styles[ 'initial-loading-overlay' ] } />
			) }
			{ isRefetching && (
				<div className={ styles[ 'updating-overlay' ] }>
					<div className={ styles[ 'updating-spinner' ] }></div>
				</div>
			) }
		</div>
	);
}
