/**
 * External dependencies
 */
import {
	normalizeReportParams,
	useReportOrders,
	AnalyticsQueryClientProvider,
} from '@next-woo-analytics/data';
import {
	buildOrdersLineChartSeries,
	chartTheme,
} from '@next-woo-analytics/widgets';

import {
	ComparativeLineChart,
	MetricWithComparison,
	DEFAULT_METRICS,
	getFormatByMetricKey,
} from '@next-woo-analytics/widgets-toolkit';
import { Tabs, Stack, Tooltip } from '@automattic/design-system';
import { GlobalChartsProvider } from '@automattic/charts';
import { useEffect, useMemo, useState } from 'react';
import { useResizeObserver } from '@wordpress/compose';
import '@automattic/charts/style.css';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import styles from './styles.module.scss';

type SanitizedOrdersByDateResponse = ReturnType<
	typeof useReportOrders
>[ 'primary' ][ 'data' ];

/**
 * Inferred types
 */
type ReportParams = Parameters< typeof normalizeReportParams >[ 0 ];
type Metric = ( typeof DEFAULT_METRICS )[ number ];

interface AnalyticsAtAGlanceRenderProps {
	attributes: {
		reportParams: ReportParams;
		metrics: Metric[];
	};
}

type MetricTabProps = {
	id: string;
	metricKey: Metric[ 'metricKey' ];
	value: number;
	label: Metric[ 'label' ];
	previousValue?: number | null;
	description?: Metric[ 'description' ];
};

function MetricTab( {
	id,
	metricKey,
	label,
	value,
	previousValue,
	description,
}: MetricTabProps ) {
	return (
		<Tabs.Tab value={ id } className={ styles.metricTab }>
			<Tooltip.Root>
				<Tooltip.Trigger
					render={
						<Stack
							direction="column"
							gap={ 2 }
							className={ styles.metricTabContent }
							align="left"
							justify="start"
						>
							<span className={ styles.metricTabLabel }>
								{ label }
							</span>

							<MetricWithComparison
								value={ value }
								previousValue={ previousValue }
								dataFormat={ getFormatByMetricKey( metricKey ) }
							/>
						</Stack>
					}
				/>
				<Tooltip.Popup
					align="start"
					side="bottom"
					className={ styles.metricTabDescription }
				>
					{ description }
				</Tooltip.Popup>
			</Tooltip.Root>
		</Tabs.Tab>
	);
}

const WIDTH_METRIC_BASE = 92 * 2;

function AnalyticsAtAGlanceContent( {
	attributes,
}: AnalyticsAtAGlanceRenderProps ) {
	const defaultMetricList = attributes?.metrics ?? DEFAULT_METRICS;

	// Show/hide metrics number based on widget width.
	const [ metricsNumber, setMetricsNumber ] = useState< number >( 1 );

	// Show/hide chart based on widget height.
	const [ showChart, setShowChart ] = useState( true );

	const ref = useResizeObserver( ( entries ) => {
		const entry = entries?.[ 0 ];
		if ( ! entry?.contentRect?.width ) {
			return;
		}

		setMetricsNumber(
			Math.floor(
				Math.max( entry.contentRect.width / WIDTH_METRIC_BASE, 1 )
			)
		);

		setShowChart( entry.contentRect.height > WIDTH_METRIC_BASE );
	} );

	/*
	 * Report params
	 */
	const normalized = normalizeReportParams( attributes?.reportParams );
	const { primary, comparison } = useReportOrders( normalized, false );

	/*
	 * Bookings report params
	 */
	const { primary: bookingsPrimary, comparison: bookingsComparison } =
		useReportOrders(
			{
				...normalized,
				filters: [
					{
						compare: 'IN',
						key: 'product_type',
						value: [
							'booking',
							'bookable-event',
							'bookable-service',
						],
					},
				],
			},
			true
		);

	const metrics = useMemo(
		() =>
			defaultMetricList
				.filter( ( metric ) => metric.enabled )
				.map( ( metric ) => {
					const _primary =
						metric.metricType === 'booking'
							? bookingsPrimary.data
							: primary.data;
					const _comparison =
						metric.metricType === 'booking'
							? bookingsComparison.data
							: comparison.data;

					return {
						...metric,
						id: `${ metric.metricType }-${ metric.metricKey }`,
						primary: _primary?.summary[ metric.metricKey ] ?? 0,
						comparison:
							_comparison?.summary[ metric.metricKey ] ?? null,
					};
				} )
				.slice( 0, metricsNumber ?? 1 ),
		[
			defaultMetricList,
			metricsNumber,
			primary.data,
			comparison.data,
			bookingsPrimary.data,
			bookingsComparison.data,
		]
	);

	const defaultMetric = metrics[ 0 ];
	const [ currentMetric, setCurrentMetric ] = useState( defaultMetric );

	// Update the metric key when the selected metrics list change.
	useEffect( () => setCurrentMetric( metrics[ 0 ] ), [ metrics ] );

	const defaultReportData: SanitizedOrdersByDateResponse = {
		summary: {
			date_start: '',
			date_end: '',
			total_sales: 0,
			orders_no: 0,
			avg_items: 0,
			average_order_value: 0,
			orders_value_net: 0,
			orders_value_gross: 0,
			product_net_revenue: 0,
			profit_margin: 0,
			cogs_amount: 0,
			coupons: 0,
			refunds: 0,
		},
		data: [],
	};

	const series = buildOrdersLineChartSeries( {
		orders: primary.data ?? defaultReportData,
		comparison: comparison.data ?? defaultReportData,
		metricKey: currentMetric?.metricKey,
	} );

	const bookingSeries = buildOrdersLineChartSeries( {
		orders: bookingsPrimary.data ?? defaultReportData,
		comparison: bookingsComparison.data ?? defaultReportData,
		metricKey: currentMetric?.metricKey,
	} );

	return (
		<Tabs.Root
			defaultValue={ defaultMetric?.id }
			value={ currentMetric?.id }
			className={ styles.widgetRoot }
			onValueChange={ ( id ) => {
				const _metric = metrics.find( ( m ) => m.id === id );
				if ( ! _metric ) {
					return;
				}

				setCurrentMetric( _metric );
			} }
		>
			<Stack
				gap={ 4 }
				direction="column"
				justify="center"
				className={ styles.widgetBody }
				ref={ ref }
			>
				{ currentMetric && (
					<div className={ styles.metricTabsContainer }>
						<div className={ styles.metricTabsListWrapper }>
							<Tabs.List
								density="compact"
								className={ styles.metricTabsList }
							>
								{ metrics.map( ( metric ) => (
									<MetricTab
										id={ metric.id }
										key={ metric.id }
										metricKey={ metric.metricKey }
										label={ metric.label }
										description={ metric.description }
										value={ metric.primary }
										previousValue={ metric.comparison }
									/>
								) ) }
							</Tabs.List>
						</div>
					</div>
				) }

				{ showChart &&
					series &&
					currentMetric?.metricType === 'general' && (
						<ComparativeLineChart
							series={ series }
							dataFormat={ getFormatByMetricKey(
								currentMetric.metricKey
							) }
						/>
					) }

				{ showChart &&
					series &&
					currentMetric?.metricType === 'booking' && (
						<ComparativeLineChart
							series={ bookingSeries }
							dataFormat={ getFormatByMetricKey(
								currentMetric.metricKey
							) }
						/>
					) }

				{ ! currentMetric && (
					<Stack direction="column" align="center" justify="center">
						{ __(
							'No metric selected. Please select a metric from the metrics list.',
							'woocommerce-analytics'
						) }
					</Stack>
				) }
			</Stack>
		</Tabs.Root>
	);
}

export default function AnalyticsAtAGlanceRender( {
	attributes,
}: AnalyticsAtAGlanceRenderProps ) {
	return (
		<AnalyticsQueryClientProvider>
			<GlobalChartsProvider theme={ chartTheme }>
				<AnalyticsAtAGlanceContent attributes={ attributes } />
			</GlobalChartsProvider>
		</AnalyticsQueryClientProvider>
	);
}
