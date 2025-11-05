/**
 * External dependencies
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExperiments } from '@automattic/admin-toolkit';
import { ReactNode, lazy, Suspense } from 'react';

/**
 * Constants
 */
const DEFAULT_STALE_TIME = 5 * 60 * 1000;
const DEFAULT_GC_TIME = 10 * 60 * 1000;

const ReactQueryDevtoolsProduction = lazy( () =>
	import( '@tanstack/react-query-devtools/production' ).then( ( d ) => ( {
		default: d.ReactQueryDevtools,
	} ) )
);

export const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			/*
			 * Stale time is the time after which the data
			 * is considered stale and a new request is made.
			 * Stale time: 5 minutes
			 */
			staleTime: DEFAULT_STALE_TIME,

			/*
			 * GC time is the time after which the data is considered garbage
			 * collected and removed from the cache.
			 * GC time: 10 minutes
			 */
			gcTime: DEFAULT_GC_TIME,

			/**
			 * Noop fetcher to prevent react-query errors for empty queries in console.
			 */
			queryFn: () => Promise.resolve( undefined ),
		},
	},
} );

export const AnalyticsQueryClientProvider = ( {
	children,
}: {
	children: ReactNode;
} ) => {
	const { enabledExperiments } = useExperiments();
	return (
		<QueryClientProvider client={ queryClient }>
			{ children }
			{ enabledExperiments[ 'tanstack/query-dev-tool' ] && (
				<Suspense fallback={ null }>
					<ReactQueryDevtoolsProduction initialIsOpen={ true } />
				</Suspense>
			) }
		</QueryClientProvider>
	);
};
