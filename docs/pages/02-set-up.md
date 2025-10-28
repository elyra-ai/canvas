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

Elyra Canvas text is translated into multple languages. See the [Localization](02.01-localization.md) page for details on how to include that text in the application. In addition, the [text can be customized](02.01-localization.md/#customizing-text-displayed-by-elyra-canvas-componenets) by the application.

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

You can also specify which of the Carbon themes you want to use by wrapping your applications with a `<Theme>` tag.

```
	<Theme theme="g10">
		<IntlProvider locale="en">
			<CommonCanvas canvasController={canvasController} />
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
