# @next-woo-analytics/formatters

Text formatting utilities for WooCommerce Analytics data display.

## Overview

This package provides formatting functions for converting raw data values into user-friendly display strings. It handles numbers, currencies, dates, and metrics with proper localization considerations.

## Usage

### Metric Formatting

```typescript
import { formatMetricValue } from '@next-woo-analytics/formatters';

// Format numbers
formatMetricValue( 1234, 'number' ); // "1234"
formatMetricValue( 1234.56, 'number', { decimals: 2 } ); // "1234.56"

// Format currency
formatMetricValue( 1234.56, 'currency' ); // "$1234.56"

// Format averages
formatMetricValue( 4.75, 'average' ); // "4.75"
```

### Number Formatting

```typescript
import { formatNumber } from '@next-woo-analytics/formatters';

formatNumber( 1234 ); // "1234"
formatNumber( 1234.567, { decimals: 2 } ); // "1234.57"
```

### Currency Formatting

```typescript
import { formatCurrency } from '@next-woo-analytics/formatters';

formatCurrency( 1234.56 ); // "$1234.56"
formatCurrency( 1234.56, { decimals: 0 } ); // "$1235"
```

### Date Range Formatting

```typescript
import { getDateRangeLabel } from '@next-woo-analytics/formatters';

getDateRangeLabel( start, end ); // "Jan 1-31, 2025" (same month)
getDateRangeLabel( start, end ); // "Jan 15-Feb 28, 2025" (cross months)
```

## API Reference

### `formatMetricValue( value, type?, options? )`

Main formatting function for analytics metrics.

**Parameters:**
- `value: string | number` - The value to format
- `type?: 'number' | 'currency' | 'average'` - Format type (default: 'number')
- `options?: FormatMetricValueOptions` - Formatting options

**Options:**
- `decimals?: number` - Number of decimal places
- `useMultipliers?: boolean` - Use K/M suffixes (future)
- `signDisplay?: Intl.NumberFormatOptions[ 'signDisplay' ]` - Sign display (future)

### `formatNumber( value, options? )`

Basic number formatting.

**Parameters:**
- `value: number` - The number to format
- `options?: { decimals?: number }` - Formatting options

### `formatCurrency( value, options? )`

Currency formatting with symbol.

**Parameters:**
- `value: number` - The amount to format
- `options?: FormatMetricValueOptions` - Formatting options

### `getDateRangeLabel( from, to )`

Formats date ranges into human-readable labels.

**Parameters:**
- `from: Date` - Start date
- `to: Date` - End date

**Returns:** `string` - Formatted date range (e.g., "Jan 15-31, 2025")
