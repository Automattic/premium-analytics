/**
 * External dependencies
 */
import { createContext, useContext, type ReactNode } from 'react';

type WidgetsGridContextValue = {
	editMode: boolean;
};

const WidgetsGridContext = createContext< WidgetsGridContextValue | undefined >(
	undefined
);

type WidgetsGridProviderProps = {
	children: ReactNode;
	editMode: boolean;
};

export function WidgetsGridProvider( {
	children,
	editMode,
}: WidgetsGridProviderProps ) {
	return (
		<WidgetsGridContext.Provider value={ { editMode } }>
			{ children }
		</WidgetsGridContext.Provider>
	);
}

export function useWidgetsGridContext() {
	const context = useContext( WidgetsGridContext );

	if ( context === undefined ) {
		throw new Error(
			'useWidgetsGridContext must be used within a WidgetsGridProvider'
		);
	}

	return context;
}
