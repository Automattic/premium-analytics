/**
 * External dependencies
 */
import { memo, useMemo, useCallback, type ReactElement } from 'react';
import { __ } from '@wordpress/i18n';
import { GlobalChartsProvider } from '@automattic/charts';
import { Grid, type GridLayoutItem } from '@automattic/grid';
import '@automattic/charts/style.css';

/**
 * Internal dependencies
 */
import { chartTheme } from '../shared/chart-theme';
import { getWidgetDefinition } from '../widget-registry';
import { WidgetsGridProvider } from './widgets-grid-context';
import { type ProductType } from '../shared/utils/product-type-filters';
import styles from './widgets-grid.module.scss';

type WidgetsGridProps = {
	/** Whether the grid is in edit mode allowing drag and drop */
	editMode?: boolean;
	/** Array of grid layout items defining widget positions and sizes */
	layout: GridLayoutItem[];
	/** Callback function called when the layout changes */
	onChangeLayout: ( layout: GridLayoutItem[] ) => void;
	/** Section identifier for the grid, used for generating unique keys */
	section?: ProductType;
};

/**
 * WidgetsGrid component that renders a grid of widgets based on the provided layout.
 * Supports edit mode for drag and drop functionality.
 */

const WidgetsGridComponent = ( {
	editMode = false,
	layout,
	onChangeLayout,
	section = 'general',
}: WidgetsGridProps ) => {
	// Memoized function to render widgets dynamically from the registry based on layout
	const renderWidget = useCallback( ( key: string ): ReactElement | null => {
		const widgetDef = getWidgetDefinition( key );
		if ( ! widgetDef ) {
			return null;
		}

		const {
			component: Component,
			title,
			description,
			category,
			props = {},
		} = widgetDef;

		return (
			<Component
				key={ key }
				title={ title }
				description={ description }
				category={ category }
				{ ...props }
			/>
		);
	}, [] );

	// Memoize the grid key
	const gridKey = useMemo(
		() =>
			`grid-${ section }-${ layout.length }-${ layout
				.map( ( item ) => item.key )
				.join( '-' ) }`,
		[ section, layout ]
	);

	// Memoize widgets to avoid recreating them on every render
	const widgets = useMemo( () => {
		return layout
			.map( ( item ) => renderWidget( item.key ) )
			.filter( ( widget ): widget is ReactElement => widget !== null );
	}, [ layout, renderWidget ] );

	// Display message when no widgets are available
	if ( widgets.length === 0 ) {
		return (
			<div className={ styles.emptyState }>
				{ __( 'No widgets available.', 'woocommerce-analytics' ) }
			</div>
		);
	}

	return (
		<WidgetsGridProvider editMode={ editMode }>
			<GlobalChartsProvider theme={ chartTheme }>
				<Grid
					key={ gridKey }
					layout={ layout }
					minColumnWidth={ 320 }
					rowHeight={ 340 }
					spacing={ 6 }
					editMode={ editMode }
					onChangeLayout={ onChangeLayout }
				>
					{ widgets }
				</Grid>
			</GlobalChartsProvider>
		</WidgetsGridProvider>
	);
};

export const WidgetsGrid = memo( WidgetsGridComponent );
