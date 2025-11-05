# Next WooCommerce Analytics

## Getting started

### Requirements 

* `npm` and `composer` required. `nvm` is recommend.
* [Gutenberg plugin](https://wordpress.org/plugins/gutenberg/) installed and activated
* `Next Admin` and `WooCommerce ↔ Simple Admin Integration` plugins

1. Clone the **WooCommerce Analytics** and **Next Admin** repositories into the same directory, at the same level:

```bash
git clone git@github.com:woocommerce/woocommerce-analytics.git
```

```bash
git clone git@github.a8c.com:Automattic/next-admin.git
```

2. Install dependencies and build `Next Admin` and `WooCommerce ↔ Simple Admin Integration`:

```bash
cd next-admin
```

```bash
nvm use
```

```bash
npm install
```

```bash
composer install
```

```bash
npm run build
```

Do the same for the `woocommerce-next` plugin.

3. Add the `Next Admin` and `WooCommerce ↔ Simple Admin Integration` plugins to
your local development site (e.g., by editing `wp-env.json`):

```json
{
	"plugins": [
	".",
	"../next-admin",
	"../next-admin/woocommerce-next"
	]
}
```

4. Install dependencies and build WooCommerce Analytics:

```bash
cd ../woocommerce-analytics
```

```bash
nvm use
```

```bash
npm install
```

```bash
composer install
```

```bash
npm run build:next-admin
```

---

## 1. Introduction

Currently, the integration between WooCommerce Analytics and Next Admin is under active development, with several important limitations:

* **Next Admin is not yet published as an official plugin.**
* **Next Admin npm packages are not available on a public registry.**

Because of this, **the integration between both projects is done using relative paths between locally cloned repositories**.

The entire integration with Next Admin lives inside the `next-woocommerce-analytics` folder within the WooCommerce Analytics repository.

## 2. Project setup

To make everything work, both repositories must be located at the same level in your filesystem:

```
/my-dev-projects/
├── next-admin/
└── woocommerce-analytics/
```

You can see the relative references to Next Admin packages inside the `woocommerce-analytics/package.json`, for example:

```json
"@automattic/admin-toolkit": "file:../../next-admin/packages/admin-toolkit",
"@automattic/design-system": "file:../../next-admin/packages/design-system",
"@automattic/wp-build": "file:../../next-admin/packages/wp-build",
```

Once the Next Admin repo is cloned, you need to build its packages so they can be consumed by `woocommerce-analytics`:

```bash
cd next-admin
```

```bash
npm install
```

```bash
composer install
```

```bash
npm run build
```

## 3. Build scripts

The `woocommerce-analytics` `package.json` defines several scripts. The most relevant ones for working with the Next Admin integration are:

_Builds the next-woocommerce-analytics packages_

```bash
npm run build:next-admin
```

_Starts dev mode for next-woocommerce-analytics_

```bash
npm run start:next-admin
```

## 4. Add Next Admin as a plugin

To make WordPress load the Next Admin modules, the plugin must be available inside your `wp-env` development environment.

Edit your `wp-env.json` file and include the local plugin path:

```json
{
  "plugins": [
    ".",
    "../next-admin"
  ]
}
```

Then start the environment:

```bash
wp-env start
```

This ensures WordPress loads the Next Admin plugin from the local filesystem.
