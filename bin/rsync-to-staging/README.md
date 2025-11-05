# Sync with a remote staging site

Syncs woocommerce-analytics files to remote WordPress staging sites.

## What it does

- Syncs all git-tracked files (except dotfiles, tests/, docs/, and other non-production directories)
- Syncs the `vendor/` directory with Composer dependencies
- Syncs the `build/` directory with compiled JavaScript/CSS assets
- Syncs the `next-woocommerce-analytics/build/` directory with NextAdmin integration
- Syncs the `features/feature-config.php` file for feature flags
- Validates all required builds before syncing
- Activates the plugin on first sync
- Shows the admin URL when done
- Can watch for changes and auto-sync

## Prerequisites

### Required builds

The script validates that all required files exist before syncing. If any are missing, it will show specific error messages.

#### Option 1: Build everything at once (recommended)

```bash
npm run build:deploy
```

This command runs:
1. `composer install` - Installs PHP dependencies
2. `npm run build:features` - Generates feature configuration
3. `npm run build:assets` - Builds JavaScript/CSS assets
4. `npm run build:next-admin` - Builds NextAdmin integration

#### Option 2: Build individually

```bash
# Install PHP dependencies (REQUIRED)
composer install

# Build main plugin assets (REQUIRED)
npm run build:assets

# Generate feature configuration (REQUIRED)
npm run build:features  # for production
# or
npm run build:features:dev  # for development

# Build NextAdmin integration (OPTIONAL but recommended)
npm run build:next-admin
```

## Usage

### You need a site with SSH access

This syncs files using rsync, which requires SSH access.

```bash
# From woocommerce-analytics root directory
npm run sync-staging <user@host:/path/> # Example: username@example.com:/srv/htdocs/wp-content/plugins/
```

#### Watch mode

```sh
npm run sync-staging <user@host:/path/> -- --watch ## watch mode
```

## Requirements

- rsync, git, and ssh
- WP-CLI on remote server (for plugin activation)
- Node.js and npm

## What gets synced

Only essential files needed for production deployment:

**Core plugin files:**
- `woocommerce-analytics.php` (main plugin file)
- `src/` and all its contents (PHP backend code)
- `languages/` and all its contents (translation files)
- `readme.txt`, `LICENSE` (documentation)

**Build artifacts (automatically detected):**
- `vendor/` and all its contents (PHP dependencies)
- `build/` and all its contents (compiled JavaScript/CSS assets)
- `next-woocommerce-analytics/build/` and all its contents (NextAdmin integration)
- `features/feature-config.php` (feature flags configuration)

**What is NOT synced (much smaller deployment):**
- Source files (`js/src/`, TypeScript, etc.)
- Development tools (`bin/`, `tests/`, `docs/`)
- Configuration files (`.eslintrc`, `tsconfig.json`, etc.)
- Development dependencies and build tools

## Build Validation

The script validates required files before syncing. If any critical files are missing, it will:

1. **Show specific error messages** for each missing component
2. **Provide instructions** on how to fix the issue
3. **Stop the sync** to prevent deploying an incomplete plugin

### Required components:
- ✅ **Vendor directory** (`vendor/`) - PHP dependencies from Composer
- ✅ **Main build** (`build/`) - JavaScript/CSS assets
- ✅ **Feature config** (`features/feature-config.php`) - Feature flags

### Optional components:
- ⚠️ **NextAdmin build** (`next-woocommerce-analytics/build/`) - Shows warning if missing

To skip build validation (not recommended):
```bash
npm run sync-staging <target> -- --skip-build-check
```

## Troubleshooting

### Files not syncing
If you add a new file as part of your changes, make sure to `git add` it. Otherwise it won't be synced.

### "Installation is incomplete" error
If you see this error on the staging site, it means required files are missing. Run:
```bash
npm run build:deploy  # Builds everything needed for deployment
npm run sync-staging <target>  # Sync again
```

### Build directories missing
The script will tell you exactly what's missing. Follow the instructions or run:
```bash
npm run build:deploy  # Builds everything needed
```

### Plugin activation fails
- Ensure WP-CLI is installed on the remote server
- Check that you have the correct permissions
- You can manually activate the plugin in wp-admin if needed