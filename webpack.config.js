const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const WooCommerceDependencyExtractionWebpackPlugin = require( '@woocommerce/dependency-extraction-webpack-plugin' );
const TerserPlugin = require( 'terser-webpack-plugin' );

const path = require( 'path' );

const isProduction = process.env.NODE_ENV === 'production';

// Add Babel configuration for Emotion
const getBabelConfig = () => {
	const babelRule = defaultConfig.module?.rules?.find(
		( rule ) =>
			rule.use &&
			Array.isArray( rule.use ) &&
			rule.use.find( ( loader ) => loader.loader === 'babel-loader' )
	);

	const babelLoader = babelRule?.use?.find(
		( loader ) => loader.loader === 'babel-loader'
	);

	return {
		...babelLoader?.options,
		plugins: [
			...( babelLoader?.options?.plugins || [] ),
			'@emotion/babel-plugin',
		],
	};
};

/**
 * Default request map for Jetpack dependency extraction.
 *
 * This is retrieved from https://github.com/Automattic/jetpack/blob/2545c7dcdcb71672a518a97e9f7c303515573df1/projects/js-packages/webpack-config/src/webpack.js#L108-L117.
 */
const jetpackDefaultRequestMap = {
	'@automattic/jetpack-script-data': {
		external: 'JetpackScriptDataModule',
		handle: 'jetpack-script-data',
	},
	'@automattic/jetpack-connection': {
		external: 'JetpackConnection',
		handle: 'jetpack-connection',
	},
};

/**
 * Replace WordPress DEWP plugin with WooCommerce DEWP plugin.
 * @param {*} plugins
 */
const replaceDEWP = ( plugins ) =>
	plugins.map( ( plugin ) =>
		plugin.constructor.name === 'DependencyExtractionWebpackPlugin'
			? new WooCommerceDependencyExtractionWebpackPlugin( {
					requestToExternal( request ) {
						if ( request.startsWith( '@wordpress/dataviews' ) ) {
							return null;
						}

						if ( jetpackDefaultRequestMap[ request ] ) {
							return jetpackDefaultRequestMap[ request ].external;
						}
					},
					requestToHandle( request ) {
						if ( request.startsWith( '@wordpress/dataviews' ) ) {
							return null;
						}

						if ( jetpackDefaultRequestMap[ request ] ) {
							return jetpackDefaultRequestMap[ request ].handle;
						}
					},
			  } )
			: plugin
	);

module.exports = {
	...defaultConfig,
	entry: {
		index: './js/src/index.tsx',
		'admin-app': './js/src/admin-app/index.tsx',
	},
	module: {
		...defaultConfig.module,
		rules: defaultConfig.module.rules.map( ( rule ) => {
			if (
				rule.use &&
				Array.isArray( rule.use ) &&
				rule.use.find( ( loader ) => loader.loader === 'babel-loader' )
			) {
				return {
					...rule,
					use: rule.use.map( ( loader ) => {
						if ( loader.loader === 'babel-loader' ) {
							return {
								...loader,
								options: getBabelConfig(),
							};
						}
						return loader;
					} ),
				};
			}
			return rule;
		} ),
	},
	plugins: replaceDEWP( defaultConfig.plugins ),
	devServer: {
		...defaultConfig.devServer,
		allowedHosts: [
			'.ddev.site',
			'.jurassic.tube',
			'.ngrok.app',
			'.ngrok.dev',
		],
		client: {
			overlay: {
				warnings: false,
				errors: true,
			},
		},
	},
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...defaultConfig.resolve?.alias,
			'@wordpress-unstable/edit-site': path.resolve(
				__dirname,
				'js/src/__core_unstable_copy__/edit-site/src/'
			),
			'@wordpress-unstable/components': path.resolve(
				__dirname,
				'js/src/__core_unstable_copy__/components/src/'
			),
		},
	},
	optimization: {
		minimize: true,
		minimizer: isProduction
			? [
					new TerserPlugin( {
						terserOptions: {
							compress: {
								drop_console: true,
							},
						},
					} ),
			  ]
			: [],
	},
};
