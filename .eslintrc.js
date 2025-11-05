module.exports = {
	extends: [
		'plugin:@woocommerce/eslint-plugin/recommended',
		'plugin:storybook/recommended',
	],
	settings: {
		'import/ignore': [ '@automattic/jetpack-connection' ],
		'import/resolver': {
			node: {},
			webpack: {},
			typescript: {
				project: [
					'./tsconfig.json',
					'./next-woocommerce-analytics/tsconfig.json',
				],
			},
		},
	},
	rules: {
		'@wordpress/i18n-text-domain': [
			'error',
			{
				allowedTextDomain: 'woocommerce-analytics',
			},
		],
		'@typescript-eslint/no-explicit-any': 'off',
		'react-hooks/exhaustive-deps': 'error',
		'react/react-in-jsx-scope': 'off',
	},
};
