const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Generates an array of feature flags, based on the config used by the client application.
 */

const phase = [ 'development', 'production' ].includes( process.env.NODE_ENV )
	? process.env.NODE_ENV
	: 'production';

// Read the config file
const configPath = path.join( __dirname, '..', 'features', `${ phase }.json` );
const configJson = fs.readFileSync( configPath, 'utf8' );
const config = JSON.parse( configJson );

// Generate the PHP output
const output = [
	'<?php',
	'// WARNING: Do not directly edit this file.',
	'// This file is auto-generated as part of the build process and things may break.',
	"if ( ! function_exists( 'wc_analytics_get_feature_config' ) ) {",
	'\tfunction wc_analytics_get_feature_config() {',
	'\t\treturn array(',
];

// Add feature flags
for ( const [ feature, value ] of Object.entries( config ) ) {
	output.push( `\t\t\t'${ feature }' => ${ value ? 'true' : 'false' },` );
}

output.push( '\t\t);', '\t}', '}' );

// Write the file
const outputPath = path.join(
	__dirname,
	'..',
	'features',
	'feature-config.php'
);

fs.writeFileSync( outputPath, output.join( '\n' ) );
