/* eslint-disable no-console */
const fs = require( 'fs' ).promises;
const path = require( 'path' );
const PHPParser = require( 'php-parser' ); // eslint-disable-line import/no-extraneous-dependencies

const pluginDir = path.dirname( __dirname );

const assetFile = path.join( pluginDir, 'build', 'index.asset.php' );
const outputFile = path.join( pluginDir, 'build', 'build-meta.json' );

async function parseIndexAsset() {
	try {
		// Read the index.asset.php file.
		const assetContent = await fs.readFile( assetFile, 'utf8' );

		// Parse the PHP file
		const parser = new PHPParser();
		const ast = parser.parseCode( assetContent );

		// Traverse to find dependencies and version.
		let dependencies = [];
		let version = '';

		ast.children.forEach( ( node ) => {
			if ( node.kind === 'return' ) {
				node.expr.items.forEach( ( item ) => {
					if ( item.key && item.key.value === 'dependencies' ) {
						// Extract dependencies array.
						dependencies = item.value.items.map(
							( dep ) => dep.value.value
						);
					}
					if ( item.key && item.key.value === 'version' ) {
						// Extract version.
						version = item.value.value;
					}
				} );
			}
		} );

		if ( dependencies.length === 0 || ! version ) {
			// These logs will show up in the TeamCity build process.
			console.error(
				'parse-assets: Could not find dependencies or version in the asset file.'
			);
			return false;
		}

		// Write the dependencies and version to a JSON file.
		await fs.writeFile(
			outputFile,
			JSON.stringify( { dependencies, version }, null, 2 )
		);

		console.log(
			'parse-assets: Dependencies and version JSON file created successfully.'
		);
		return true;
	} catch ( error ) {
		// These logs will show up in the TeamCity build process.
		console.error( 'parse-assets: Error processing asset file:', error );
		return false;
	}
}

( async () => {
	const success = await parseIndexAsset();
	process.exit( success ? 0 : 1 );
} )();
