# MetricWithComparison

A composite component that displays a formatted metric value with optional period-over-period comparison. This component combines `MetricValue` and `MetricDelta` to provide a complete metric display solution for WooCommerce Analytics widgets.

## Description

`MetricWithComparison` is the primary component for displaying KPIs in WooCommerce Analytics. It handles:

- Value formatting (currency, percentage, number)
- Period-over-period comparisons
- Visual indicators for positive/negative changes
- Flexible layouts (horizontal/vertical)
- Proper handling of edge cases (null values, division by zero)

## Installation

This component is part of the `@next-woo-analytics/widgets-toolkit` package:

```bash
npm install @next-woo-analytics/widgets-toolkit
```

## Usage

### Basic Usage

```jsx
import { MetricWithComparison } from '@next-woo-analytics/widgets-toolkit';

function SalesMetric( { currentSales, previousSales } ) {
	return (
		<MetricWithComparison
			value={ currentSales }
			previousValue={ previousSales }
			format="currency"
		/>
	);
}
```

### Advanced Usage

```jsx
// Vertical layout with custom size
function RevenueCard( { data } ) {
	return (
		<Card>
			<MetricWithComparison
				value={ data.current.revenue }
				previousValue={ data.previous.revenue }
				format="currency"
				direction="column"
				size="large"
			/>
		</Card>
	);
}

// Metric where lower values are better
function BounceRateMetric( { current, previous } ) {
	return (
		<MetricWithComparison
			value={ current }
			previousValue={ previous }
			format="percentage"
			invertDeltaColors={ true }
		/>
	);
}

// Custom formatter
function OrderCountMetric( { orders } ) {
	const formatter = ( value ) => {
		return value >= 1000
			? `${ ( value / 1000 ).toFixed( 1 ) }K orders`
			: `${ value } orders`;
	};

	return (
		<MetricWithComparison
			value={ orders.current }
			previousValue={ orders.previous }
			formatter={ formatter }
		/>
	);
}
```

## Props

### value

- **Type:** `number`
- **Required:** Yes
- **Description:** The current metric value to display.

### previousValue

- **Type:** `number | null | undefined`
- **Required:** No
- **Default:** `undefined`
- **Description:** The previous period value for comparison. When provided, displays a percentage change indicator.

### format

- **Type:** `'number' | 'currency' | 'percentage'`
- **Required:** No
- **Default:** `'number'`
- **Description:** Determines how the main value is formatted.

### formatter

- **Type:** `( value: number ) => string`
- **Required:** No
- **Description:** Custom formatter function that overrides the default formatting.

### direction

- **Type:** `'row' | 'column'`
- **Required:** No
- **Default:** `'row'`
- **Description:** Layout direction for the value and delta components.

### size

- **Type:** `'small' | 'medium' | 'large'`
- **Required:** No
- **Default:** `'medium'`
- **Description:** Size variant for the main value display.

### invertDeltaColors

- **Type:** `boolean`
- **Required:** No
- **Default:** `false`
- **Description:** Inverts the color meaning for the delta. Use for metrics where a decrease is positive (e.g., bounce rate, return rate).

### hideDeltaOnZero

- **Type:** `boolean`
- **Required:** No
- **Default:** `false`
- **Description:** Hides the delta component when the change is exactly zero.

### className

- **Type:** `string`
- **Required:** No
- **Description:** CSS class name for the container element.

### valueClassName

- **Type:** `string`
- **Required:** No
- **Description:** CSS class name for the value component.

### deltaClassName

- **Type:** `string`
- **Required:** No
- **Description:** CSS class name for the delta component.

### deltaFallback

- **Type:** `string`
- **Required:** No
- **Default:** `'—'`
- **Description:** Text to display when delta calculation is not possible.

### showAbsoluteDelta

- **Type:** `boolean`
- **Required:** No
- **Default:** `false`
- **Description:** Shows absolute change instead of percentage in the delta component.

## Examples

### In Dashboard Widgets

```jsx
function AnalyticsCard( { metric, data } ) {
	const isNegativeMetric = [ 'bounce_rate', 'return_rate' ].includes( metric );

	return (
		<WidgetCard title={ getMetricLabel( metric ) }>
			<MetricWithComparison
				value={ data.current[ metric ] }
				previousValue={ data.previous[ metric ] }
				format={ getMetricFormat( metric ) }
				invertDeltaColors={ isNegativeMetric }
				size="large"
			/>
		</WidgetCard>
	);
}
```

### In Chart Overlays

```jsx
function DonutChartWithTotal( { chartData, totals } ) {
	return (
		<div className="chart-container">
			<DonutChart data={ chartData } />
			<div className="chart-overlay">
				<MetricWithComparison
					value={ totals.current }
					previousValue={ totals.previous }
					format="currency"
					direction="column"
					size="small"
				/>
			</div>
		</div>
	);
}
```

### In Data Tables

```jsx
function MetricsTable( { metrics } ) {
	return (
		<Table>
			<tbody>
				{ metrics.map( ( metric ) => (
					<tr key={ metric.id }>
						<td>{ metric.label }</td>
						<td>
							<MetricWithComparison
								value={ metric.current }
								previousValue={ metric.previous }
								format={ metric.format }
								size="small"
							/>
						</td>
					</tr>
				) ) }
			</tbody>
		</Table>
	);
}
```

## Composition

This component internally composes:

1. **MetricValue** - Handles value formatting and display
2. **MetricDelta** - Handles comparison calculation and display
3. **Stack** (from `@wordpress/design-system`) - Handles layout

You can also compose these components manually for custom layouts:

```jsx
import { MetricValue, MetricDelta } from '@next-woo-analytics/widgets-toolkit';
import { Stack } from '@wordpress/design-system';

function CustomMetricLayout( { current, previous } ) {
	return (
		<Stack direction="row" gap={ 5 }>
			<MetricValue
				value={ current }
				format="currency"
				size="large"
			/>
			<Stack direction="column" gap={ 1 }>
				<MetricDelta
					current={ current }
					previous={ previous }
				/>
				<span className="metric-label">vs last period</span>
			</Stack>
		</Stack>
	);
}
```

## Styling

The component uses CSS modules and provides several className props for customization:

```jsx
// Custom styled metric
function BrandedMetric( { value, previousValue } ) {
	return (
		<MetricWithComparison
			value={ value }
			previousValue={ previousValue }
			format="currency"
			className="branded-metric-container"
			valueClassName="branded-value"
			deltaClassName="branded-delta"
		/>
	);
}
```

```css
.branded-metric-container {
	padding: 20px;
	background: linear-gradient( ... );
}

.branded-value {
	color: var( --brand-primary );
	text-shadow: 0 2px 4px rgba( 0, 0, 0, 0.1 );
}

.branded-delta {
	opacity: 0.9;
}
```

## Accessibility

The component renders semantic HTML with proper ARIA attributes:

- Values are wrapped in appropriate semantic elements
- Color is not the only indicator of change (includes +/- symbols)
- Supports keyboard navigation when used within interactive contexts

## Related Components

- [`MetricValue`](../metric-value/README.md) - For displaying single formatted values
- [`MetricDelta`](../metric-delta/README.md) - For displaying only the comparison
- [`WidgetCard`](@next-woo-analytics/widgets) - Container for dashboard widgets

## Migration from Legacy Components

If migrating from the old `MetricDisplay` component:

```jsx
// Old implementation
import { MetricDisplay } from '@next-woo-analytics/widgets';

<MetricDisplay
	value={ 1250 }
	comparisonValue={ 1000 }
	type="currency"
	metricIsBetterWhenLower={ false }
/>

// New implementation
import { MetricWithComparison } from '@next-woo-analytics/widgets-toolkit';

<MetricWithComparison
	value={ 1250 }
	previousValue={ 1000 }
	format="currency"
	invertDeltaColors={ false }
/>
```

### Key Changes

1. `comparisonValue` → `previousValue`
2. `type` → `format`
3. `metricIsBetterWhenLower` → `invertDeltaColors`
4. Clearer separation of concerns
5. Better TypeScript support

## Testing

```jsx
import { render } from '@testing-library/react';
import { MetricWithComparison } from '@next-woo-analytics/widgets-toolkit';

describe( 'MetricWithComparison', () => {
	it( 'renders value and positive delta', () => {
		const { getByText } = render(
			<MetricWithComparison
				value={ 150 }
				previousValue={ 100 }
				format="currency"
			/>
		);

		expect( getByText( '$150.00' ) ).toBeInTheDocument();
		expect( getByText( '+50%' ) ).toBeInTheDocument();
	} );

	it( 'handles metrics where lower is better', () => {
		const { container } = render(
			<MetricWithComparison
				value={ 20 }
				previousValue={ 30 }
				format="percentage"
				invertDeltaColors={ true }
			/>
		);

		const delta = container.querySelector( '.positive' );
		expect( delta ).toHaveTextContent( '-33%' );
	} );
} );
```