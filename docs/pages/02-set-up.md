# Installation

## NPM Install

You'll need to build your application with Elyra Canvas.

Use the command:
```sh
npm install @elyra/canvas --save-dev
```
or add this to your package.json file:

```
  "@elyra/canvas": "x.x.x"
```
where x.x.x is the latest build and then run:
```sh
npm install
```
## Peer dependencies

Make sure the peer dependency libraries, specified in the [package.json](https://github.com/elyra-ai/canvas/blob/bd10c6b79e60e11954b03d50fcb7ed6de58f0629/canvas_modules/common-canvas/package.json#L117), file are installed as part of the application. The application can use whichever versions of the peer dependencies it wants from those specified.


## Localization

Elyra Canvas text is translated into multiple languages. See the [Localization](02.01-localization.md) page for details on how to include that text in the application. In addition, the [text can be customized](02.01-localization.md/#customizing-text-displayed-by-elyra-canvas-componenets) by the application.

## Styling

Elyra Canvas uses components, colors, styles and fonts from the [Carbon Design System](https://carbondesignsystem.com/).

More development information about Carbon components can be found here: https://carbondesignsystem.com/developing/frameworks/react#getting-started

When building an application there are two possible approaches to styling:

* Quick Start using CSS or
* Styling using SASS to allow the application to override colors, styles, etc.

In the examples below, we refer to files in the Elyra Canvas Test Harness. The Harness behaves like as a sample application that uses Common Canvas and Common Properties.

###  Quick Start using CSS

If you just want to get up and running quickly without using SASS you can get the Carbon and Elyra Canvas styles by importing these CSS files:

  ```
	import "@carbon/styles/css/styles.min.css";
	import "@elyra/canvas/dist/styles/common-canvas.min.css";
  ```

You can also specify which of the Carbon themes you want to use by wrapping the Elyra Canvas component with a `<Theme>` tag.

```
	import { Theme } from '@carbon/react';
	...
	...
	<Theme theme="g10">
		<IntlProvider locale="en">
			<CommonCanvas /> or <CommonProperties />
		</IntlProvider>
	</Theme>
```

 where "g10" can also be set to "g100", "g90" or "white" (the default).


### Styling using SASS

If you want to use the full power of SASS for styling to override default styling in Common Canvas or Common Properties then you must include this `@forward`  in your SCSS:

```
@forward "@carbon/react" with (
	$font-path: "/fonts/plex",
	$use-per-family-plex: true
);
```

For an example of this, refer to the Elyra Canvas Test Harness files:

* [harness.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/harness.scss) and
* [carbon.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/carbon.scss)

Additionally, to get the IBM Plex fonts to display correctly you must complete the steps in the [Loading Fonts](/02-set-up/#loading-fonts) section below.

When building:

- use `autoprefixer`
- if using webpack, make sure to include the following under the `sass-loader`

    ```js
        options: { includePaths: ["node_modules"] }
    ```

- You can refer to the test harness [webpack.config.dev.js](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/webpack.config.dev.js) for an example.


### Loading Fonts
To get the correct display of fonts in Elyra Canvas, the application's build process should copy the IBM Plex font files from `/node_modules/@ibm`to a `./fonts` folder and the following should be added to the `SCSS` for the application:

```
@use "@ibm/plex-sans-condensed/scss" as PlexSansCondensed with (
	$font-prefix: "/fonts/plex-sans-condensed"
);

@use "@ibm/plex-sans/scss" as PlexSans with (
	$font-prefix: "/fonts/plex-sans"
);

@use "@ibm/plex-serif/scss" as PlexSerif with (
	$font-prefix: "/fonts/plex-serif"
);

@use "@ibm/plex-mono/scss" as PlexMono with (
	$font-prefix: "/fonts/plex-mono"
);

@include PlexSansCondensed.all();

@include PlexSans.all();

@include PlexSerif.all();

@include PlexMono.all();
```

You can see an example of this in the [common.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/common.scss) file for the Elyra Canvas Test Harness.

The [Gruntfile](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/Gruntfile.js#L68) that builds the Test Harness contains the following, that ensures the fonts are copied from `/node_modules/@ibm` to the `<carbon fonts folder>`:
```
copy: {
	fonts: {
		files: [{
			expand: true,
			flatten: false,
			cwd: "./node_modules/@ibm",
			src: ["plex-*/fonts/**"],
			dest: ".build/fonts"
		}]
	}
}
...
var buildTasks = ["copy:fonts"];
```

### 3rd party styling

If you intend to configure Common Properties to use the, now superseded, React-virtualized tables by setting `enableTanstackTable` [configuration](/04.08-properties-config/#properties-config) property to `false` then you will need to also include the react-virtualized styles:

- react-virtualized/styles.css

## Content Security Policy

Applications can use Elyra Canvas with a `Content-Security-Policy` that omits `'unsafe-inline'` from `style-src`, but this requires some application-level setup and a few feature constraints.

### Requirements for `style-src` without `'unsafe-inline'`

1. Serve the Carbon and Elyra Canvas stylesheets as external CSS files, or compile them into your application's stylesheet bundle.
2. If your application uses [`<CommonProperties>`](04-common-properties.md) controls that inject runtime styles, generate a nonce for each HTTP response and pass it through the [`cspNonce`](04.08-properties-config.md#properties-config) property in the Common Properties configuration.
3. Ensure any SVG icons or images rendered by the application do not contain embedded `<style>` elements. Elyra Canvas removes `<style>` elements from inline SVG content and expands supported class-based rules to SVG presentation attributes before inserting the SVG into the document, but application teams should still provide CSP-safe SVG assets.
4. Do not use the canvas object inline style APIs when your policy omits `'unsafe-inline'`. The style specifications passed to [`setObjectsStyle()`](03.04-canvas-controller.md#pipeline-flow-methods), [`setObjectsMultiStyle()`](03.04-canvas-controller.md#pipeline-flow-methods), [`setLinksStyle()`](03.04-canvas-controller.md#setlinksstylepipelinelinkids-linkstyle-temporary), and [`setLinksMultiStyle()`](03.04-canvas-controller.md#setlinksmultistylepipelineobjstyles-temporary) are written as inline `style` attributes and therefore require `'unsafe-inline'` in `style-src`.
5. Do not store inline object styles in the pipeline flow data model. Node, comment, and link `.style` and `.style_temp` values are also rendered as inline `style` attributes and therefore require `'unsafe-inline'`.
6. Review any application code that adds inline `style` attributes outside Elyra Canvas. A CSP that omits `'unsafe-inline'` will also block those application-authored inline styles.

### Passing a nonce to Common Properties

Common Properties only requires a nonce when the application uses features that inject runtime styles. This includes the expression editor powered by CodeMirror and table-related components.

Use the [`cspNonce`](04.08-properties-config.md#properties-config) property documented in the Common Properties configuration page:

```jsx
<CommonProperties
    propertiesConfig={{
        cspNonce: nonce
    }}
    ...
/>
```

Your server must generate a new cryptographically random nonce for each HTTP response and include the same nonce in the `Content-Security-Policy` response header, for example:

```http
Content-Security-Policy: default-src 'self'; style-src 'self' 'nonce-<your-nonce-value>'
```

See the [`cspNonce`](04.08-properties-config.md#properties-config) documentation for a fuller example.

### SVG icons and images

If your application provides custom SVG icons or other inline SVG assets to Elyra Canvas, make sure they are compatible with a restrictive `style-src` policy:

- Prefer SVG presentation attributes such as `fill`, `stroke`, `stroke-width`, and `opacity`.
- Avoid embedded `<style>` elements inside the SVG markup.
- Avoid relying on CSS class selectors inside the SVG to define appearance.

If an SVG contains `<style>` elements, Elyra Canvas will attempt to convert the supported class-based rules into presentation attributes and remove the `<style>` blocks before rendering. For predictable results, application teams should still provide SVG assets that already avoid embedded styles.

### Features that still require `'unsafe-inline'`

A `style-src` policy without `'unsafe-inline'` is compatible with the standard Elyra Canvas and Common Properties styling model, but not with APIs that explicitly write inline style attributes.

This means `'unsafe-inline'` is still required if your application uses:

- Canvas object style specifications in the pipeline flow data model, including `.style` and `.style_temp` on nodes, comments, or links.
- [`setObjectsStyle()`](03.04-canvas-controller.md#pipeline-flow-methods) or [`setObjectsMultiStyle()`](03.04-canvas-controller.md#pipeline-flow-methods).
- [`setLinksStyle()`](03.04-canvas-controller.md#setlinksstylepipelinelinkids-linkstyle-temporary) or [`setLinksMultiStyle()`](03.04-canvas-controller.md#setlinksmultistylepipelineobjstyles-temporary).

If your application avoids those inline style APIs, avoids SVG `<style>` blocks, and supplies a nonce where Common Properties requires one, you can enforce `style-src` without `'unsafe-inline'`.

## IBM Telemetry

`@elyra/canvas` uses [IBM Telemetry](https://github.com/ibm-telemetry/telemetry-js) to collect de-identified, anonymized usage metrics. Telemetry runs automatically via a `postinstall` hook the first time the package is installed as a dependency.

**What is collected:**

- Which `@elyra/canvas` components (e.g. `CommonCanvas`, `CommonProperties`, `FlexibleTable`) are used as JSX elements in the consuming project's source code, along with the names of props passed to those components from an explicit allowlist. A small set of safe, enumerated string values (e.g. `"sm"`, `"md"`, `"top"`, `"bottom"`) may also be captured. No free-text user data or prop values outside this allowlist are ever collected.
- The names and versions of npm packages declared as dependencies in the consuming project.

**What is not collected:**

- User-provided data, application content, or any prop values beyond the safe enumerated string allowlist defined in `telemetry.yml`.
- JavaScript function calls or token-level source code.

**Where data is sent:**

Data is transmitted to IBM's telemetry ingestion endpoint. The collected metrics are currently only available to IBM employees. Learn more at [https://github.com/ibm-telemetry/telemetry-js](https://github.com/ibm-telemetry/telemetry-js).

**Opting out:**

By installing this package as a dependency you are agreeing to telemetry collection. To opt out, set the environment variable `IBM_TELEMETRY_DISABLED=true` in your build environment, or follow the instructions at [Opting out of IBM Telemetry data collection](https://github.com/ibm-telemetry/telemetry-js/tree/main#opting-out-of-ibm-telemetry-data-collection).

For further details on what IBM Telemetry collects and how it works, see the [IBM Telemetry documentation](https://github.com/ibm-telemetry/telemetry-js/tree/main#ibm-telemetry-collection-basics).
