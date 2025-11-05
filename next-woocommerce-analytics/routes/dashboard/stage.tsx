/**
 * External dependencies
 */
import { Page, useExperiments } from '@automattic/admin-toolkit';
import { __ } from '@wordpress/i18n';
import {
	AnalyticsQueryClientProvider,
	localTZDate,
	ReportQueryParams,
} from '@next-woo-analytics/data';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { DateFiltersPanel } from '@next-woo-analytics/components';
import { BaseLayout } from '@next-woo-analytics/layout';
import { endOfDay } from 'date-fns';
import {
	encodeDateToSearchParam,
	useStagedSearch,
} from '@next-woo-analytics/routing';
import { ProductType, WidgetsGrid } from '@next-woo-analytics/widgets';
import type { DateRange } from '@next-woo-analytics/datetime';
import { type GridLayoutItem } from '@automattic/grid';
import { download as DownloadIcon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { CustomizeMenu } from './components/customize-button';
import { useDashboardLayoutPreference } from './hooks/use-dashboard-layout-preference';
import { useSiteStatusModal } from './hooks/use-site-status-modal';
import {
	Tabs,
	defaultSection,
	useShouldShowDashboardTabs,
} from './components/tabs';
import { SiteStatusModal } from './components/site-status-modal';
import { MoreActionsDropdown } from './components/more-actions-dropdown';
import { ExportReportModal } from './components/export-report-modal';
import styles from './dashboard.module.scss';

type ReportQuerySearchParams = Partial<
	ReportQueryParams & {
		preset?: string;
		compare_preset?: string;
		comp?: string;
		section?: ProductType;
	}
>;

export type CustomizeState = 'enabled' | 'disabled' | 'accepting' | 'canceling';

function DashboardContent() {
	// Pick up the `editMode` from the experiments.
	const { enabledExperiments } = useExperiments();

	// Enable/disable features depending on the experiments.
	const ffCustomizeDashboard =
		enabledExperiments[ 'woocommerce-analytics/dashboard/customize' ];

	const ffWidgetResize =
		enabledExperiments[ 'woocommerce-analytics/dashboard/widget-resizing' ];

	const [ customizeMode, setCustomizeMode ] =
		useState< CustomizeState >( 'disabled' );

	/**
	 * Manage export modal state (placeholder for now).
	 */
	const [ isExportModalOpen, setIsExportModalOpen ] = useState( false );

	/**
	 * Manage the site status modal visibility.
	 */
	const {
		isVisible: isSiteStatusModalVisible,
		dismiss: dismissSiteStatusModal,
	} = useSiteStatusModal();

	/**
	 * Determine if tabs should be shown based on site status.
	 */
	const showTabs = useShouldShowDashboardTabs();

	/**
	 * Below the code that handles the URL parameters,
	 * staging and committing the changes.
	 */
	const { effective, stage, commit, revert, isDirty } = useStagedSearch<
		ReportQuerySearchParams,
		'/wc-analytics/dashboard'
	>( {
		from: '/wc-analytics/dashboard',
	} );

	const presetId = useMemo(
		() => effective.preset ?? undefined,
		[ effective.preset ]
	);

	const range = useMemo( () => {
		return {
			from: effective.from ? localTZDate( effective.from ) : undefined,
			to: effective.to ? localTZDate( effective.to ) : undefined,
		};
	}, [ effective.from, effective.to ] );

	/**
	 * Primary range change:
	 * Stage and push a history entry (atomic commit).
	 */
	const onChange = useCallback(
		( nextRange?: DateRange, nextPresetId?: string ) => {
			if ( ! nextRange && ! nextPresetId ) {
				return;
			}

			if ( nextRange && nextRange.from && nextRange.to ) {
				/*
				 * Stage `preset`, `from` and `to` as search params,
				 * always like a ISO string.
				 */
				const from = encodeDateToSearchParam( nextRange.from );

				/*
				 * We need to tweak the `to` date to the end of the day, since
				 * the date picker core component sets the time to 00:00:00.
				 */
				const to = encodeDateToSearchParam( endOfDay( nextRange.to ) );

				stage( {
					from,
					to,
				} );
			}

			if ( nextPresetId ) {
				stage( { preset: nextPresetId } );
			}
		},
		[ stage ]
	);

	/*
	 * Resolve the comparison preset from `effective`.
	 */
	const comparisonPresetId = useMemo(
		() => effective.compare_preset ?? undefined,
		[ effective.compare_preset ]
	);

	/**
	 * Comparison change: same pattern.
	 */
	const onComparisonChange = useCallback(
		(
			nextComparisonRange: DateRange | undefined,
			nextComparisonPresetId?: string
		) => {
			stage( {
				compare_from: encodeDateToSearchParam(
					nextComparisonRange?.from
				),
				compare_to: encodeDateToSearchParam( nextComparisonRange?.to ),
				compare_preset: nextComparisonPresetId ?? undefined,
				comp: nextComparisonRange ? '1' : undefined,
			} );

			commit();
		},
		[ stage, commit ]
	);

	const commitSection = useCallback(
		( value: string ) => {
			stage( { section: value as ProductType } );
			commit();
		},
		[ stage, commit ]
	);

	const section = useMemo(
		() => effective.section ?? defaultSection,
		[ effective.section ]
	);

	/**
	 * Manage the layout of the widgets for the current tab.
	 */

	// Get the persisted layout from the preferences store for current tab.
	const [ savedLayout, setSavedLayout ] =
		useDashboardLayoutPreference( section );

	// Use the persisted layout for the current tab.
	const [ layout, setLayout ] = useState< GridLayoutItem[] >( savedLayout );

	// Load saved layout when it changes (tab switch or preference update).
	useEffect( () => {
		setLayout( savedLayout );
	}, [ savedLayout ] );

	// Handle the layout change.
	const onChangeLayout = useCallback(
		( nextLayout: GridLayoutItem[] ) => {
			setLayout( nextLayout );
		},
		[ setLayout ]
	);

	const gridEditMode = useMemo(
		() => ffWidgetResize && customizeMode === 'enabled',
		[ ffWidgetResize, customizeMode ]
	);

	return (
		<Page
			title={ __( 'Dashboard', 'woocommerce-analytics' ) }
			subTitle={ __(
				"A high-level snapshot of your store's performance with key metrics.",
				'woocommerce-analytics'
			) }
			tabs={
				showTabs && (
					<Tabs value={ section } onChange={ commitSection } />
				)
			}
			actions={
				<>
					{ ffCustomizeDashboard && (
						<CustomizeMenu
							state={ customizeMode }
							onEnable={ () => {
								setCustomizeMode( 'enabled' );
							} }
							onSave={ () => {
								setSavedLayout( layout );
								setCustomizeMode( 'disabled' );
							} }
							onCancel={ () => {
								setLayout( savedLayout );
								setCustomizeMode( 'disabled' );
							} }
						/>
					) }
					<MoreActionsDropdown
						items={ [
							{
								label: __(
									'Export data',
									'woocommerce-analytics'
								),
								icon: DownloadIcon,
								onClick: () => setIsExportModalOpen( true ),
							},
						] }
					/>
				</>
			}
			className={ styles.woocommerceAnalyticsDashboard }
		>
			<BaseLayout
				header={
					<DateFiltersPanel
						presetId={ presetId }
						range={ range }
						comparisonPresetId={ comparisonPresetId }
						onChange={ onChange }
						onComparisonChange={ onComparisonChange }
						onApply={ commit }
						onCancel={ revert }
						canApply={ isDirty }
					/>
				}
			>
				<WidgetsGrid
					editMode={ gridEditMode }
					layout={ layout }
					onChangeLayout={ onChangeLayout }
					section={ section }
				/>
			</BaseLayout>
			<SiteStatusModal
				isOpen={ isSiteStatusModalVisible }
				onClose={ dismissSiteStatusModal }
			/>
			<ExportReportModal
				isOpen={ isExportModalOpen }
				onClose={ () => setIsExportModalOpen( false ) }
				initialRange={ range }
				presetId={ presetId }
				comparisonPresetId={ comparisonPresetId }
			/>
		</Page>
	);
}

export default function DashboardRoute() {
	return (
		<AnalyticsQueryClientProvider>
			<DashboardContent />
		</AnalyticsQueryClientProvider>
	);
}
