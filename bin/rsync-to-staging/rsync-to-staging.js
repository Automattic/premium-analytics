#!/usr/bin/env node

/**
 * External dependencies
 */
const { spawn } = require( 'child_process' );
const fs = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );
const { program } = require( 'commander' );

// Configuration
const REMOTE_FOLDER_NAME = 'woocommerce-analytics';

let hasLoggedUrl = false;
let hasActivatedPlugin = false;

/**
 * Unified logging function
 * @param {string} message - The message to log
 * @param {string} level   - The log level (log, error, warn). Defaults to 'log'
 */
function log( message, level = 'log' ) {
	// eslint-disable-next-line no-console
	console[ level ]( message );
}

/**
 * Resolves SSH host alias to actual hostname
 * @param {string} sshHost - The SSH host alias or hostname
 * @return {Promise<string>} The resolved hostname
 */
function resolveHostname( sshHost ) {
	return new Promise( ( resolve ) => {
		// First, check if the host is in user@hostname format
		if ( sshHost.includes( '@' ) ) {
			const username = sshHost.split( '@' )[ 0 ];
			log(
				`🔍 Using username '${ username }' as hostname from '${ sshHost }'`
			);
			resolve( username );
			return;
		}

		// Try to get the actual hostname from SSH config
		const sshConfigCmd = spawn( 'ssh', [ '-G', sshHost ] );
		let output = '';

		sshConfigCmd.stdout.on( 'data', ( data ) => {
			output += data.toString();
		} );

		sshConfigCmd.on( 'close', ( code ) => {
			if ( code === 0 ) {
				// Parse the SSH config output to find user field first
				const lines = output.split( '\n' );
				const userLine = lines.find( ( line ) =>
					line.startsWith( 'user ' )
				);

				if ( userLine ) {
					const user = userLine.split( ' ' )[ 1 ];
					if ( user && user !== sshHost ) {
						log(
							`🔍 Using SSH user '${ user }' as hostname from '${ sshHost }'`
						);
						resolve( user );
						return;
					}
				}

				// Fallback to hostname if user not found
				const hostnameLine = lines.find( ( line ) =>
					line.startsWith( 'hostname ' )
				);

				if ( hostnameLine ) {
					const actualHostname = hostnameLine.split( ' ' )[ 1 ];
					if ( actualHostname && actualHostname !== sshHost ) {
						log(
							`🔍 Resolved SSH alias '${ sshHost }' to '${ actualHostname }'`
						);
						resolve( actualHostname );
						return;
					}
				}
			}

			// Fallback to original host if resolution fails
			resolve( sshHost );
		} );

		sshConfigCmd.on( 'error', () => {
			// Fallback to original host if SSH command fails
			resolve( sshHost );
		} );
	} );
}

/**
 * Checks if build directories exist and have required files
 * @return {Object} Object with status of each build
 */
function checkBuilds() {
	const status = {
		mainBuild: false,
		nextAdminBuild: false,
		featureConfig: false,
		vendor: false,
		composerAutoload: false,
	};

	// Check main build directory
	if ( fs.existsSync( 'build' ) && fs.existsSync( 'build/index.js' ) ) {
		status.mainBuild = true;
	}

	// Check NextAdmin build
	if (
		fs.existsSync( 'next-woocommerce-analytics/build' ) &&
		fs.existsSync( 'next-woocommerce-analytics/build/index.php' )
	) {
		status.nextAdminBuild = true;
	}

	// Check feature config
	if ( fs.existsSync( 'features/feature-config.php' ) ) {
		status.featureConfig = true;
	}

	// Check vendor directory and autoload
	if ( fs.existsSync( 'vendor' ) ) {
		status.vendor = true;
	}

	if (
		fs.existsSync( 'vendor/autoload.php' ) &&
		fs.existsSync( 'vendor/autoload_packages.php' )
	) {
		status.composerAutoload = true;
	}

	return status;
}

/**
 * Gets essential files to sync for production deployment
 * @return {Promise<string[]>} Promise that resolves to array of file/directory paths
 */
function getFilesToSync() {
	return new Promise( ( resolve ) => {
		// Essential files for production deployment
		const essentialFiles = [
			// Main plugin file
			'woocommerce-analytics.php',
			// PHP source files
			'src',
			// Language files
			'languages',
			// Readme and license
			'readme.txt',
			'LICENSE',
		];

		// Filter to only include files that actually exist
		const existingFiles = essentialFiles.filter( ( file ) => {
			return fs.existsSync( file );
		} );

		// Add essential directories with their contents
		const additionalPaths = [];

		// Add src directory files recursively
		if ( fs.existsSync( 'src' ) ) {
			const getSrcFiles = ( dir, prefix = '' ) => {
				const entries = fs.readdirSync( dir, {
					withFileTypes: true,
				} );
				const files = [];
				for ( const entry of entries ) {
					const fullPath = prefix
						? `${ prefix }/${ entry.name }`
						: entry.name;
					if ( entry.isDirectory() ) {
						files.push( fullPath );
						files.push(
							...getSrcFiles(
								`${ dir }/${ entry.name }`,
								fullPath
							)
						);
					} else {
						files.push( fullPath );
					}
				}
				return files;
			};

			additionalPaths.push( 'src' );
			additionalPaths.push( ...getSrcFiles( 'src', 'src' ) );
		}

		// Add languages directory files recursively
		if ( fs.existsSync( 'languages' ) ) {
			const getLanguageFiles = ( dir, prefix = '' ) => {
				const entries = fs.readdirSync( dir, {
					withFileTypes: true,
				} );
				const files = [];
				for ( const entry of entries ) {
					const fullPath = prefix
						? `${ prefix }/${ entry.name }`
						: entry.name;
					if ( entry.isDirectory() ) {
						files.push( fullPath );
						files.push(
							...getLanguageFiles(
								`${ dir }/${ entry.name }`,
								fullPath
							)
						);
					} else {
						files.push( fullPath );
					}
				}
				return files;
			};

			additionalPaths.push( 'languages' );
			additionalPaths.push(
				...getLanguageFiles( 'languages', 'languages' )
			);
		}

		// Add main build directory
		if ( fs.existsSync( 'build' ) ) {
			const getBuildFiles = ( dir, prefix = '' ) => {
				const entries = fs.readdirSync( dir, {
					withFileTypes: true,
				} );
				const files = [];
				for ( const entry of entries ) {
					const fullPath = prefix
						? `${ prefix }/${ entry.name }`
						: entry.name;
					if ( entry.isDirectory() ) {
						files.push( fullPath );
						files.push(
							...getBuildFiles(
								`${ dir }/${ entry.name }`,
								fullPath
							)
						);
					} else {
						files.push( fullPath );
					}
				}
				return files;
			};

			additionalPaths.push( 'build' );
			additionalPaths.push( ...getBuildFiles( 'build', 'build' ) );
		}

		// Add NextAdmin build directory
		if ( fs.existsSync( 'next-woocommerce-analytics/build' ) ) {
			const getNextAdminBuildFiles = ( dir, prefix = '' ) => {
				const entries = fs.readdirSync( dir, {
					withFileTypes: true,
				} );
				const files = [];
				for ( const entry of entries ) {
					const fullPath = prefix
						? `${ prefix }/${ entry.name }`
						: entry.name;
					if ( entry.isDirectory() ) {
						files.push( fullPath );
						files.push(
							...getNextAdminBuildFiles(
								`${ dir }/${ entry.name }`,
								fullPath
							)
						);
					} else {
						files.push( fullPath );
					}
				}
				return files;
			};

			additionalPaths.push( 'next-woocommerce-analytics/build' );
			additionalPaths.push(
				...getNextAdminBuildFiles(
					'next-woocommerce-analytics/build',
					'next-woocommerce-analytics/build'
				)
			);
		}

		// Add feature config if exists
		if ( fs.existsSync( 'features/feature-config.php' ) ) {
			additionalPaths.push( 'features/feature-config.php' );
		}

		// Add vendor directory if exists
		if ( fs.existsSync( 'vendor' ) ) {
			const getVendorFiles = ( dir, prefix = '' ) => {
				const entries = fs.readdirSync( dir, {
					withFileTypes: true,
				} );
				const files = [];
				for ( const entry of entries ) {
					const fullPath = prefix
						? `${ prefix }/${ entry.name }`
						: entry.name;
					if ( entry.isDirectory() ) {
						files.push( fullPath );
						files.push(
							...getVendorFiles(
								`${ dir }/${ entry.name }`,
								fullPath
							)
						);
					} else {
						files.push( fullPath );
					}
				}
				return files;
			};

			additionalPaths.push( 'vendor' );
			additionalPaths.push( ...getVendorFiles( 'vendor', 'vendor' ) );
		}

		// Combine essential files with build artifacts
		const allFiles = [ ...existingFiles, ...additionalPaths ];
		resolve( allFiles );
	} );
}

/**
 * Activates the plugin on the remote WordPress site using WP-CLI
 * @param {string} host - The SSH host to connect to
 * @return {Promise} Promise that resolves when activation is complete
 */
function activatePlugin( host ) {
	return new Promise( ( resolve ) => {
		if ( hasActivatedPlugin ) {
			resolve(); // Skip activation if already done
			return;
		}

		log( `🔌 Activating plugin on remote site...` );

		const activateCommand = spawn( 'ssh', [
			host,
			`wp plugin activate ${ REMOTE_FOLDER_NAME }`,
		] );

		let output = '';
		let errorOutput = '';

		activateCommand.stdout.on( 'data', ( data ) => {
			output += data.toString();
		} );

		activateCommand.stderr.on( 'data', ( data ) => {
			errorOutput += data.toString();
		} );

		activateCommand.on( 'close', ( code ) => {
			if ( code === 0 ) {
				if ( output.includes( 'Success:' ) ) {
					log( `✅ Plugin activated successfully` );
				} else if ( output.includes( 'already active' ) ) {
					log( `✅ Plugin already active` );
				} else {
					log( `✅ Plugin activation completed` );
				}
				hasActivatedPlugin = true; // Mark as activated
			} else {
				log(
					`⚠️  Plugin activation failed (exit code ${ code })`,
					'warn'
				);
				if ( errorOutput.trim() ) {
					log( `⚠️  Error: ${ errorOutput.trim() }`, 'warn' );
				}
				log(
					`⚠️  You may need to activate the plugin manually in wp-admin`,
					'warn'
				);
			}
			resolve(); // Always resolve to not break the sync process
		} );

		activateCommand.on( 'error', ( error ) => {
			log( `⚠️  Plugin activation failed: ${ error.message }`, 'warn' );
			log(
				`⚠️  You may need to activate the plugin manually in wp-admin`,
				'warn'
			);
			resolve(); // Always resolve to not break the sync process
		} );
	} );
}

/**
 * Logs the WordPress admin URL
 * @param {string} sshHost - The SSH host to resolve for URL generation
 */
async function logAdminUrl( sshHost ) {
	if ( hasLoggedUrl ) {
		return;
	}

	// Resolve the actual hostname for URL generation
	const actualHost = await resolveHostname( sshHost );
	const url = `https://${ actualHost }/wp-admin/plugins.php`;

	// Create a nice box around the URL
	const urlText = `WooCommerce Analytics: ${ url }`;
	const boxWidth = Math.max( urlText.length + 4, 50 );
	const topBorder = '┌' + '─'.repeat( boxWidth - 2 ) + '┐';
	const bottomBorder = '└' + '─'.repeat( boxWidth - 2 ) + '┘';
	const padding = Math.max(
		0,
		Math.floor( ( boxWidth - urlText.length - 2 ) / 2 )
	);
	const paddedText =
		' '.repeat( padding ) +
		urlText +
		' '.repeat( boxWidth - urlText.length - padding - 2 );

	log( '' );
	log( topBorder );
	log( `│${ paddedText }│` );
	log( bottomBorder );
	log( '' );

	hasLoggedUrl = true;
}

/**
 * Syncs the local folder to the remote host
 * @param {string}  host       - The remote host to sync to
 * @param {string}  remotePath - The remote path to sync to
 * @param {boolean} watch      - Whether this is a watch mode sync
 * @param {Object}  options    - Command line options
 * @return {Promise} Promise that resolves when sync is complete
 */
function syncToRemote( host, remotePath, watch = false, options = {} ) {
	return new Promise( async ( resolve, reject ) => {
		let gitFiles;
		let tempFileListPath;
		let cleanupTempFile;

		try {
			// Check build status
			const buildStatus = checkBuilds();
			let hasErrors = false;

			if ( ! buildStatus.vendor || ! buildStatus.composerAutoload ) {
				log(
					`❌ Error: Vendor directory or autoload files missing. Run 'composer install' first.`,
					'error'
				);
				hasErrors = true;
			}

			if ( ! buildStatus.mainBuild ) {
				log(
					`❌ Error: Main build directory not found. Run 'npm run build:assets' first.`,
					'error'
				);
				hasErrors = true;
			}

			if ( ! buildStatus.featureConfig ) {
				log(
					`❌ Error: Feature config not found. Run 'npm run build:features' first.`,
					'error'
				);
				hasErrors = true;
			}

			if ( ! buildStatus.nextAdminBuild ) {
				log(
					`⚠️  Warning: NextAdmin build not found. Run 'npm run build:next-admin' for NextAdmin features.`,
					'warn'
				);
			}

			if ( hasErrors && ! options.skipBuildCheck ) {
				log( '', 'error' );
				log(
					'❌ Build verification failed. Required files are missing.',
					'error'
				);
				log( '', 'error' );
				log(
					'Run the following commands to prepare for deployment:',
					'error'
				);
				log( '  1. composer install', 'error' );
				log( '  2. npm run build:assets', 'error' );
				log( '  3. npm run build:features', 'error' );
				log( '  4. npm run build:next-admin', 'error' );
				log( '', 'error' );
				log( 'Or use: npm run build:deploy', 'error' );
				reject( new Error( 'Build verification failed' ) );
				return;
			}

			// Get files to sync
			gitFiles = await getFilesToSync();

			if ( gitFiles.length === 0 ) {
				reject( new Error( 'No files found to sync.' ) );
				return;
			}

			// Create a temporary file list for rsync
			tempFileListPath = path.join(
				os.tmpdir(),
				'woocommerce-analytics-sync-files.txt'
			);
			fs.writeFileSync( tempFileListPath, gitFiles.join( '\n' ) );

			// Cleanup function
			cleanupTempFile = () => {
				try {
					fs.unlinkSync( tempFileListPath );
				} catch {
					// Ignore cleanup errors
				}
			};
		} catch ( error ) {
			reject( error );
			return;
		}

		const rsyncArgs = [
			'-avz',
			'--delete',
			'--files-from=' + tempFileListPath,
			'--exclude=.DS_Store',
			'--exclude=node_modules',
			'--exclude=*.log',
			'.',
			`${ host }:${ remotePath }${ REMOTE_FOLDER_NAME }/`,
		];

		if ( watch ) {
			log( `📡 Starting sync in watch mode to ${ host }...` );
			log( `📁 Syncing ${ gitFiles.length } files (including builds)` );
		} else {
			log( `📡 Syncing to ${ host }...` );
			log( `📁 Syncing ${ gitFiles.length } files (including builds)` );
		}

		// Ensure remote directory exists
		log( `📁 Ensuring remote directory exists...` );
		const mkdirCommand = spawn( 'ssh', [
			host,
			`mkdir -p ${ remotePath }${ REMOTE_FOLDER_NAME }`,
		] );

		mkdirCommand.on( 'close', ( mkdirCode ) => {
			if ( mkdirCode !== 0 ) {
				log(
					`⚠️  Warning: Could not create remote directory (exit code ${ mkdirCode })`
				);
			}

			// Proceed with rsync
			const rsync = spawn( 'rsync', rsyncArgs );

			rsync.stdout.on( 'data', ( data ) => {
				process.stdout.write( data );
			} );

			rsync.stderr.on( 'data', ( data ) => {
				process.stderr.write( data );
			} );

			rsync.on( 'close', async ( code ) => {
				cleanupTempFile();

				if ( code === 0 ) {
					log( `✅ Sync completed successfully` );

					// Activate plugin on remote site
					await activatePlugin( host );

					// Log admin URL on first successful sync
					if ( ! hasLoggedUrl ) {
						await logAdminUrl( host );
					}

					resolve();
				} else {
					reject(
						new Error( `Rsync failed with exit code ${ code }` )
					);
				}
			} );

			rsync.on( 'error', ( err ) => {
				cleanupTempFile();

				if ( err.code === 'ENOENT' ) {
					reject(
						new Error(
							'rsync command not found. Please install rsync.'
						)
					);
				} else {
					reject( err );
				}
			} );
		} );

		mkdirCommand.on( 'error', ( error ) => {
			log(
				`⚠️  Warning: Could not test/create remote directory: ${ error.message }`
			);
			// Continue with rsync anyway - it might still work
			const rsync = spawn( 'rsync', rsyncArgs );

			rsync.stdout.on( 'data', ( data ) => {
				process.stdout.write( data );
			} );

			rsync.stderr.on( 'data', ( data ) => {
				process.stderr.write( data );
			} );

			rsync.on( 'close', async ( code ) => {
				cleanupTempFile();

				if ( code === 0 ) {
					log( `✅ Sync completed successfully` );

					// Activate plugin on remote site
					await activatePlugin( host );

					// Log admin URL on first successful sync
					if ( ! hasLoggedUrl ) {
						await logAdminUrl( host );
					}

					resolve();
				} else {
					reject(
						new Error( `Rsync failed with exit code ${ code }` )
					);
				}
			} );

			rsync.on( 'error', ( err ) => {
				cleanupTempFile();

				if ( err.code === 'ENOENT' ) {
					reject(
						new Error(
							'rsync command not found. Please install rsync.'
						)
					);
				} else {
					reject( err );
				}
			} );
		} );
	} );
}

/**
 * Watches for file changes and syncs
 * @param {string} host       - The remote host to sync to
 * @param {string} remotePath - The remote path to sync to
 * @param {Object} options    - Command line options
 */
function watchAndSync( host, remotePath, options = {} ) {
	const chokidar = require( 'chokidar' );

	// Initial sync
	syncToRemote( host, remotePath, false, options )
		.then( async () => {
			// Get files for watching
			const gitFiles = await getFilesToSync();
			const watchPaths = gitFiles.filter( ( file ) => {
				// Watch directories by extracting unique directory paths
				return ! file.startsWith( '.' );
			} );

			// Get unique directories to watch
			const dirsToWatch = new Set();
			watchPaths.forEach( ( file ) => {
				const dir = file.split( '/' )[ 0 ];
				if ( dir && dir !== file ) {
					dirsToWatch.add( dir );
				}
			} );

			// Add individual files in the root
			const rootFiles = watchPaths.filter(
				( file ) => ! file.includes( '/' )
			);
			const watchTargets = [ ...Array.from( dirsToWatch ), ...rootFiles ];

			// Always watch build directories and feature config
			watchTargets.push( 'build' );
			watchTargets.push( 'next-woocommerce-analytics/build' );
			watchTargets.push( 'features/feature-config.php' );

			log( `👀 Watching ${ watchTargets.length } paths for changes...` );

			const watcher = chokidar.watch( watchTargets, {
				ignored: [ '**/.*', '**/.DS_Store', '**/node_modules/**' ],
				persistent: true,
				ignoreInitial: true,
			} );

			let syncTimeout;

			watcher.on( 'all', ( event, filePath ) => {
				log( `📝 File ${ event }: ${ filePath }` );

				// Debounce rapid file changes
				clearTimeout( syncTimeout );
				syncTimeout = setTimeout( () => {
					syncToRemote( host, remotePath, true, options ).catch(
						( error ) => {
							log( `❌ Sync error: ${ error.message }`, 'error' );
						}
					);
				}, 1000 );
			} );

			watcher.on( 'error', ( error ) => {
				log( `❌ Watcher error: ${ error.message }`, 'error' );
			} );

			// Handle graceful shutdown
			process.on( 'SIGINT', () => {
				log( '\n🛑 Stopping file watcher...' );
				watcher.close();
				process.exit( 0 );
			} );
		} )
		.catch( ( error ) => {
			log( `❌ Initial sync failed: ${ error.message }`, 'error' );
			process.exit( 1 );
		} );
}

// CLI setup
program
	.name( 'rsync-to-staging' )
	.description(
		'Sync woocommerce-analytics plugin with remote WordPress installation'
	)
	.argument(
		'<target>',
		'Remote target in format user@host:/path/ (e.g., username@example.com:/srv/htdocs/wp-content/plugins/)'
	)
	.option( '-w, --watch', 'Watch for file changes and sync automatically' )
	.option( '-v, --verbose', 'Verbose output' )
	.option( '--skip-build-check', 'Skip build verification warnings' )
	.action( ( target, options ) => {
		if ( ! target ) {
			log( '❌ Error: Target parameter is required', 'error' );
			log( 'Usage: node rsync-to-staging.js <target> [options]' );
			log(
				'Example: node rsync-to-staging.js username@example.com:/srv/htdocs/wp-content/plugins/ --watch'
			);
			process.exit( 1 );
		}

		// Parse the target to extract host and remote path
		const colonIndex = target.indexOf( ':' );
		if ( colonIndex === -1 ) {
			log(
				'❌ Error: Target must include both host and path separated by ":"',
				'error'
			);
			log( 'Format: user@host:/path/' );
			log(
				'Example: username@example.com:/srv/htdocs/wp-content/plugins/'
			);
			process.exit( 1 );
		}

		const host = target.substring( 0, colonIndex );
		let remotePath = target.substring( colonIndex + 1 );

		// Ensure remote path ends with a slash
		if ( ! remotePath.endsWith( '/' ) ) {
			remotePath += '/';
		}

		// Test connection first
		log( `🔍 Testing connection to ${ host }...` );

		const testConnection = spawn( 'ssh', [
			'-o',
			'ConnectTimeout=10',
			host,
			'echo "Connection successful"',
		] );

		testConnection.on( 'close', ( code ) => {
			if ( code === 0 ) {
				log( `✅ Connection to ${ host } established` );

				if ( options.watch ) {
					watchAndSync( host, remotePath, options );
				} else {
					syncToRemote( host, remotePath, false, options )
						.then( () => {
							log( '🎉 Sync completed!' );
							process.exit( 0 );
						} )
						.catch( ( error ) => {
							log(
								`❌ Sync failed: ${ error.message }`,
								'error'
							);
							process.exit( 1 );
						} );
				}
			} else {
				log(
					`❌ Connection failed: Unable to connect to ${ host }`,
					'error'
				);
				log( 'Please check:', 'error' );
				log( '  - Host is reachable', 'error' );
				log( '  - SSH key is properly configured', 'error' );
				log( '  - Username and hostname are correct', 'error' );
				process.exit( 1 );
			}
		} );

		testConnection.on( 'error', ( error ) => {
			if ( error.code === 'ENOENT' ) {
				log(
					'❌ SSH command not found. Please install OpenSSH.',
					'error'
				);
			} else {
				log( `❌ Connection error: ${ error.message }`, 'error' );
			}
			process.exit( 1 );
		} );
	} );

// Handle missing arguments
if ( process.argv.length < 3 ) {
	log( '❌ Error: Target parameter is required', 'error' );
	log( 'Usage: node rsync-to-staging.js <target> [options]' );
	log(
		'Example: node rsync-to-staging.js username@example.com:/srv/htdocs/wp-content/plugins/ --watch'
	);
	process.exit( 1 );
}

program.parse();
