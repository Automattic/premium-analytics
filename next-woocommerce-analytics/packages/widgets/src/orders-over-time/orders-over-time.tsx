/**
 * External dependencies
 */
import { useReportOrders } from '@next-woo-analytics/data';
import { useSearch } from '@tanstack/react-router';
import { formatOrderMetric } from '@next-woo-analytics/widgets-toolkit';
/**
 * Internal dependencies
 */
import { OrdersOverTimeBase } from './orders-over-time-base';
import {
	useProductTypeFilters,
	hasProductFilters,
} from '../shared/utils/product-type-filters';

type MetricKey = Parameters< typeof formatOrderMetric >[ 0 ];

type OrdersOverTimeProps = {
	metricKey: MetricKey;
	title: string;
	description?: string;
	linkTo?: string;
};

export function OrdersOverTime( {
	metricKey,
	title,
	description,
	linkTo,
}: OrdersOverTimeProps ) {
	const search = useSearch( {
		from: '/wc-analytics/dashboard',
	} );
	const filters = useProductTypeFilters( search.section );
	const {
		primary,
		comparison,
		isLoading,
		isFetching,
		hasData,
		hasPreviousData,
	} = useReportOrders(
		{
			...search,
			filters,
		},
		hasProductFilters( filters )
	);

	return (
		<OrdersOverTimeBase
			primary={ primary }
			comparison={ comparison }
			metricKey={ metricKey }
			title={ title }
			description={ description }
			linkTo={ linkTo }
			isLoading={ isLoading }
			isFetching={ isFetching }
			hasData={ hasData }
			hasPreviousData={ hasPreviousData }
		/>
	);
}
