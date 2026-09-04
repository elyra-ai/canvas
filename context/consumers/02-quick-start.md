# 02 — Quick Start

> **Full doc reference:** [elyra-ai.github.io/canvas/03-common-canvas](https://elyra-ai.github.io/canvas/03-common-canvas/)
> **Live tiny app:** [elyra-canvas-test-harness — tiny](https://elyra-canvas-test-harness.u20youmx4sm.us-south.codeengine.appdomain.cloud/#/app-tiny-ts)

---

## Minimal working canvas (copy-paste ready)

```tsx
import React, { useMemo } from "react";
import { IntlProvider } from "react-intl";
import { CommonCanvas, CanvasController } from "@elyra/canvas";
import { Theme } from "@carbon/react";

import "@carbon/styles/css/styles.min.css";
import "@elyra/canvas/dist/styles/common-canvas.min.css";

// Copy starter-palette.json and starter-flow.json from the consumers/ folder
// into your project src/ directory (or wherever your component lives), then:
import myPalette from "./starter-palette.json";
import myFlow from "./starter-flow.json";

const MyCanvas = () => {
  const canvasController = useMemo(() => {
    const cc = new CanvasController();
    cc.setPipelineFlow(myFlow);           // 3 pre-connected nodes (Source → Filter → Output)
    cc.setPipelineFlowPalette(myPalette); // 3 categories: Sources, Transform, Outputs
    cc.openPalette();                     // open palette on mount
    return cc;
  }, []);

  return (
    <Theme theme="g10">
      <div style={{ height: "100vh" }}>
        <IntlProvider locale="en">
          <CommonCanvas canvasController={canvasController} />
        </IntlProvider>
      </div>
    </Theme>
  );
};

export default MyCanvas;
```

This gives you: palette, toolbar, context menus, drag-to-connect, undo/redo — all working out of the box.

---

## 6-Step guide

### Step 1 — Install
See [`01-setup.md`](./01-setup.md).

### Step 2 — Import
```js
import { CommonCanvas, CanvasController } from "@elyra/canvas";
```
CJS-only import (if needed):
```js
import { CommonCanvas, CanvasController } from "@elyra/canvas/dist/lib/canvas";
```

### Step 3 — Create a CanvasController
```js
const canvasController = new CanvasController();
```

### Step 4 — (Optional) Load palette
```js
canvasController.setPipelineFlowPalette(paletteJSON);
```
Palette JSON schema: [palette-v3-schema.json](https://github.com/elyra-ai/pipeline-schemas/tree/main/common-canvas/palette)
Example palettes: [harness/test_resources/palettes/](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/harness/test_resources/palettes)

### Step 5 — (Optional) Load a saved flow
```js
canvasController.setPipelineFlow(flowJSON);
```
Pipeline flow schema: [pipeline-flow-v3-schema.json](https://github.com/elyra-ai/pipeline-schemas/tree/main/common-pipeline/pipeline-flow)
Example flows: [harness/test_resources/diagrams/](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/harness/test_resources/diagrams)

### Step 6 — Render
```jsx
<div style={{ height: "100vh" }}>
  <IntlProvider locale="en">
    <CommonCanvas
      canvasController={canvasController}
      config={canvasConfig}           // optional
      editActionHandler={...}         // optional
      clickActionHandler={...}        // optional
      contextMenuHandler={...}        // optional
    />
  </IntlProvider>
</div>
```

---

## CommonCanvas props at a glance

| Prop | Required | Description |
|---|---|---|
| `canvasController` | ✅ | The only required prop |
| `config` | — | Canvas behavior config (nodes, links, toolbar, zoom…) |
| `toolbarConfig` | — | Customize toolbar buttons |
| `notificationConfig` | — | Notification panel config |
| `contextMenuConfig` | — | Context menu config |
| `keyboardConfig` | — | Keyboard shortcut config |
| `editActionHandler` | — | Called after every canvas edit |
| `clickActionHandler` | — | Called on click/double-click |
| `contextMenuHandler` | — | Customize context menus |
| `layoutHandler` | — | Per-node layout overrides |
| `decorationActionHandler` | — | Decoration click callbacks |
| `selectionChangeHandler` | — | Selection change callbacks |
| `tipHandler` | — | Custom tooltip content |
| `showLeftFlyout` + `leftFlyoutContent` | — | Left panel |
| `showRightFlyout` + `rightFlyoutContent` | — | Right panel |
| `showTopPanel` + `topPanelContent` | — | Top panel |
| `showBottomPanel` + `bottomPanelContent` | — | Bottom panel |

Full config docs: [elyra-ai.github.io/canvas/03.02-configuration](https://elyra-ai.github.io/canvas/03.02-configuration/)
