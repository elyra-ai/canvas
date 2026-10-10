# 01 — Setup & Installation

> **Full doc reference:** [elyra-ai.github.io/canvas/02-set-up](https://elyra-ai.github.io/canvas/02-set-up/)

---

## Install

```sh
npm install @elyra/canvas --save
```

---

## Peer dependencies

Your app must also have these installed (check the exact version ranges in [@elyra/canvas package.json](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/common-canvas/package.json#L117)):

```sh
npm install react react-dom react-intl @carbon/react
```

---

## Styling — Quick Start (CSS, no SASS)

Import these two CSS files once in your app entry point:

```js
import "@carbon/styles/css/styles.min.css";
import "@elyra/canvas/dist/styles/common-canvas.min.css";
```

Wrap your canvas with a Carbon `<Theme>` to choose a color theme:

```jsx
import { Theme } from "@carbon/react";

// theme options: "white" (default), "g10", "g90", "g100"
<Theme theme="g10">
  <IntlProvider locale="en">
    <CommonCanvas canvasController={canvasController} />
  </IntlProvider>
</Theme>
```

---

## Styling — Advanced (SASS)

If you need to override Carbon or canvas CSS variables, use SASS instead:

```scss
// In your main .scss entry file — must come before any canvas imports
@forward "@carbon/react" with (
  $font-path: "/fonts/plex",
  $use-per-family-plex: true
);
```

Reference examples:
- [harness.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/harness.scss)
- [carbon.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/carbon.scss)

Webpack `sass-loader` option needed:
```js
options: { includePaths: ["node_modules"] }
```

---

## Fonts (IBM Plex)

If using SASS, copy IBM Plex fonts from `node_modules/@ibm` to a `./fonts` folder in your build output. Then add to your SCSS:

```scss
@use "@ibm/plex-sans/scss" as PlexSans with ($font-prefix: "/fonts/plex-sans");
@use "@ibm/plex-mono/scss" as PlexMono with ($font-prefix: "/fonts/plex-mono");
// ... add plex-sans-condensed and plex-serif similarly
@include PlexSans.all();
@include PlexMono.all();
```

Reference: [common.scss in the test harness](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/common.scss)

---

## Localization

Wrap your canvas in React-Intl's `<IntlProvider>`:

```jsx
import { IntlProvider } from "react-intl";

<IntlProvider locale="en">
  <CommonCanvas canvasController={canvasController} />
</IntlProvider>
```

Elyra Canvas has built-in translations. For custom overrides see: [Localization docs](https://elyra-ai.github.io/canvas/02.01-localization/)

---

## Telemetry (opt-out)

`@elyra/canvas` collects anonymous usage telemetry via IBM Telemetry. To opt out:

```sh
IBM_TELEMETRY_DISABLED=true  # set in your build environment
```
