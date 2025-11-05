// Import WP-scripts presets to extend them,
// see https://developer.wordpress.org/block-editor/packages/packages-scripts/#advanced-information-11.
const defaultConfig = require( '@wordpress/scripts/config/jest-unit.config' );
process.env.TZ = 'UTC';

module.exports = {
	...defaultConfig,
	testEnvironment: 'jsdom',
	setupFiles: [ 'core-js' ],
	setupFilesAfterEnv: [
		'<rootDir>/js/src/tests/setup-react-testing-library.js',
	],
	transformIgnorePatterns: [],
	transform: {
		'^.+\\.[jt]sx?$': 'babel-jest',
	},
	moduleNameMapper: {
		'\\.(png|jpg)$': '<rootDir>/js/src/tests/mocks/assets/imageMock.js',
		'\\.svg$': '<rootDir>/js/src/tests/mocks/assets/svgMock.js',
		'\\.scss$': '<rootDir>/js/src/tests/mocks/assets/styleMock.js',
		'd3-time-format': '<rootDir>/js/src/tests/mocks/d3-time-format.js',
		// Transform our `.~/` alias.
		'^\\.~/(.*)$': '<rootDir>/js/src/$1',
		'@woocommerce/settings':
			'<rootDir>/js/src/tests/dependencies/woocommerce/settings',
		'@automattic/color-studio':
			'<rootDir>/js/src/tests/dependencies/automattic/color-studio',
		'@wordpress/rich-text':
			'<rootDir>/js/src/tests/dependencies/wordpress/rich-text',
		// Fix `@woocommerce/components` still using incompatible `@woocommerce/currency`.
		'@woocommerce/currency': require.resolve( '@woocommerce/currency' ),
		// Fix the React versioning conflicts between @wordpress/* and @woocommerce/*.
		// It should be removed after they don't have versioning conflicts.
		'^react$': require.resolve( 'react' ),
		// Force 'uuid' to resolve with the CommonJS entry point, because jest doesn't
		// support `package.json.exports`.
		'^uuid$': require.resolve( 'uuid' ),
	},
	// Exclude e2e tests from unit testing.
	testPathIgnorePatterns: [ '/node_modules/', '<rootDir>/build/' ],
	coveragePathIgnorePatterns: [ '/node_modules/', '<rootDir>/tests/' ],
	watchPathIgnorePatterns: [ '/node_modules/', '<rootDir>/build/' ],
};
