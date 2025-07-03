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

## Overriding Styles and Color Themes

When building your application you will need to load fonts and override styles:

### CSS styling for quick start


If you just want to get up and running and don't care about scss then import these regular CSS files:

  - @elyra/canvas/dist/styles/common-canvas.min.css
    - version 8.x and older @elyra/canvas/dist/common-canvas.min.css

More information about carbon components can be found here https://carbondesignsystem.com/developing/frameworks/react#getting-started


### SCSS styling (recommended)

If you want to use the full power of scss styling with variable overrides etc then include these imports in your main SCSS file:
```
@use "@carbon/react"; // Bring in all the styles for Carbon in your root/global stylesheet
@import "@elyra/canvas/src/index.scss";
```

  - use `autoprefixer` when building
  - if using webpack under the `sass-loader` and make sure to include

```js
options: { includePaths: ["node_modules"] }
```

Again, you can refer to the test harness [harness.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/harness.scss) and [common.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/common.scss) files for sample code.


### 3rd party styling

If you are using Common Properties then also include the react-virtualized styles:
  - react-virtualized/styles.css

### Loading Fonts
To get correct and efficient display of fonts in Elyra Canvas, the build process for your application should copy the IBM Plex font files from `/node_modules/@ibm/plex`to a `./fonts` folder and the following should be added to the `.scss` file for your application:

```
@use "@carbon/react" as * with (
	$font-path: "/fonts"
);

$font-prefix: './fonts';
@import 'node_modules/@ibm/plex/scss/ibm-plex.scss';
```

You can see an example of this in the [common.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/common.scss) file for the Elyra Canvas Test Harness. The Test Harness is the equivalent of a host application.

The [Gruntfile](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/Gruntfile.js#L64) that builds the Test Harness contains the following, that ensures the fonts are copied from `/node_modules/@ibm/plex` to the `<carbon fonts folder>`:
```
copy: {
	fonts: {
		files: [{
			expand: true,
			flatten: false,
			cwd: "./node_modules/@ibm/plex",
			src: ["IBM-Plex*/**"],
			dest: ".build/fonts"
		}]
	}
}
...
var buildTasks = ["copy:fonts"];
```






