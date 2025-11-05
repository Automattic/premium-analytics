/**
 * External dependencies
 */
import { useMemo } from 'react';

export type LoadingState = {
	isLoading: boolean;
	isFetching: boolean;
	hasData: boolean;
	hasPreviousData: boolean;
};

export type UnifiedLoadingState = {
	isInitialLoading: boolean;
	isRefetching: boolean;
};

export function useWidgetLoading( state: LoadingState ): UnifiedLoadingState {
	const { isLoading, isFetching, hasData, hasPreviousData } = state;
	return useMemo( () => {
		// Determine which loading state is active
		const isInitialLoading = isLoading && ! hasData && ! hasPreviousData;
		const isRefetching =
			( isLoading || isFetching ) && ( hasData || hasPreviousData );

		return {
			isInitialLoading,
			isRefetching,
		};
	}, [ isLoading, isFetching, hasData, hasPreviousData ] );
}
