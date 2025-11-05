/**
 * External dependencies
 */
import type { ProductType } from '@next-woo-analytics/widgets';

/**
 * Internal dependencies
 */
import { getDefaultQueryParams } from '../defaults';
import { ORDER_ATTRIBUTION_VIEWS } from '../api/report-order-attribution-summary-fetch';
import { getDefaultIntervalForPeriod } from './interval';
import type { FilterCondition } from '../types/filter-condition';

export type { FilterCondition };

type OrderAttributionView = ( typeof ORDER_ATTRIBUTION_VIEWS )[ number ];

/**
 * Constants
 */
const INTERVAL_TYPES = [
	'hour',
	'day',
	'week',
	'month',
	'quarter',
	'year',
] as const;

export type IntervalType = ( typeof INTERVAL_TYPES )[ number ];

// ToDo: Maybe we should move the presets to this package.
const PRESETS = [
	'today',
	'yesterday',
	'last-7-days',
	'last-30-days',
	'last-90-days',
	'last-365-days',
	'last-month',
	'last-12-months',
	'last-year',
] as const;

export type PresetType = ( typeof PRESETS )[ number ];

/*
 * ReportParams are the expected params present in the client URL.
 * They aren't meant to be the reports params
 * of the API endpoint (RequestReportOrdersParams)
 */
export type ReportParams = {
	from: string;
	to: string;
	preset?: PresetType;
	interval: IntervalType;
	period?: string;
	compare_from?: string;
	compare_to?: string;
	compare_preset?: string;
	comp?: '1';
	view?: OrderAttributionView; // For order attribution reports
	filters?: FilterCondition[];
	section?: ProductType;
};

/*
 * Checks if the comparison is present in the search params.
 */
export function hasComparisonEnabled( p: ReportParams ): p is ReportParams & {
	comp: '1';
	compare_from: string;
	compare_to: string;
} {
	return (
		p.comp === '1' && !! p.compare_from?.trim() && !! p.compare_to?.trim()
	);
}

type NormalizeReportParamsArgType = Omit<
	ReportParams,
	'from' | 'to' | 'interval'
> & {
	from?: string;
	to?: string;
	interval?: string;
};

/**
 * Returns normalized params for the report request query.
 * When no defined, it will use the defaults.
 */
export function normalizeReportParams(
	search?: NormalizeReportParamsArgType
): ReportParams {
	const defaults = getDefaultQueryParams();

	// Calculate the interval from the search params.
	const interval = getDefaultIntervalForPeriod(
		undefined, // Pass undefined to get the default interval for the period.
		search?.from ?? defaults.from,
		search?.to ?? defaults.to
	);

	// Params from `search`, or fallback to defaults.
	const normalized: ReportParams = {
		from: search?.from ?? defaults.from,
		to: search?.to ?? defaults.to,
		interval: interval ?? defaults.interval,
		preset: search?.preset ?? defaults.preset,
	};

	// Add comparison params if enabled
	if ( search && hasComparisonEnabled( search as ReportParams ) ) {
		normalized.compare_from = search.compare_from;
		normalized.compare_to = search.compare_to;
		normalized.compare_preset = search.compare_preset;
		normalized.comp = '1';
	}

	return normalized;
}
