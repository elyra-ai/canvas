# 12 — Advanced Topics

Covers: read-only/locked canvas, keyboard shortcuts, panels (flyout/top/bottom), palette search, schema validation, external drag-and-drop, markdown comments.

---

## Read-only / Locked canvas

> **Full doc:** [elyra-ai.github.io/canvas/03.09-read-only-or-locked-flows](https://elyra-ai.github.io/canvas/03.09-read-only-or-locked-flows/)

One config field does most of the work:

```js
const config = {
  enableEditingActions: false,    // disables ALL editing interactions
  enableDropZoneOnExternalDrag: false, // hide drop zone when read-only
  enableStateTag: "ReadOnly",     // or "Locked" — shows a state pill over the canvas
  enablePaletteLayout: "None",    // hide palette in read-only mode
};
```

What `enableEditingActions: false` does automatically:
- Prevents node/comment drag & move
- Prevents new link creation
- Prevents label/comment editing
- Removes editing options from context menus
- Disables toolbar editing buttons (undo, redo, cut, copy, delete, etc.)
- Disables editing keyboard shortcuts

What you still need to handle yourself:
- Any custom toolbar buttons you added — disable them in your code
- Any custom context menu items — check before returning them in `contextMenuHandler`
- Styling nodes/links to look "read-only" — use the `config-edit-actions-false` CSS hook:

```css
.config-edit-actions-false .d3-node-body-outline {
  fill: #f5f5f5;
  stroke: #ccc;
}
.config-edit-actions-false .d3-link-line {
  stroke: #ddd;
}
```

Reference sample app: [read-only canvas example](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/harness/src/client/components/custom-canvases/read-only)

---

## Keyboard shortcuts

> **Full doc:** [elyra-ai.github.io/canvas/03.05-keyboard-support](https://elyra-ai.github.io/canvas/03.05-keyboard-support/)

### Always available (no config needed)

| Shortcut (Mac: ⌘, Windows: Ctrl) | Action |
|---|---|
| `Meta + A` | Select all |
| `Meta + Shift + A` | Deselect all |
| `Delete` / `Backspace` | Delete selected |
| `Meta + X` | Cut |
| `Meta + C` | Copy |
| `Meta + V` | Paste |
| `Meta + Z` | **Undo** |
| `Meta + Shift + Z` / `Meta + Y` | **Redo** |

### Keyboard navigation (requires `enableKeyboardNavigation: true`)

```js
const config = { enableKeyboardNavigation: true };
```

| Shortcut | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move focus between object groups |
| `Arrow keys` | Move focus between nodes in a group |
| `Return` | Select focused object (double-Return = double-click) |
| `Meta + Arrow` | Move selected objects |
| `Shift + Arrow` | Resize node/comment (if `enableResizableNodes: true`) |
| `Meta + Shift + 8/9/0` | Zoom in / zoom out / zoom to fit |
| `Meta + Shift + Arrows` | Pan the canvas |
| `Shift + Alt + ↓` | Move focus into sub-objects (ports/decorations) |
| `Meta + Shift + L` | Create a link from selected output port to focused input port |

### Disable specific keyboard shortcuts

Use the `keyboardConfig` prop to turn off individual shortcuts:

```js
const keyboardConfig = {
  actions: {
    undo: false,   // disable Ctrl+Z
    redo: false,   // disable Ctrl+Shift+Z
    cut:  false,
    copy: false,
    paste: false,
    delete: false,
    selectAll: false,
    deselectAll: false
  }
};

<CommonCanvas keyboardConfig={keyboardConfig} ... />
```

→ [keyboardConfig docs](https://elyra-ai.github.io/canvas/03.02.05-keyboard-config/)

---

## Panels (flyout, top, bottom)

> **Full doc:** [elyra-ai.github.io/canvas/03.06.05-panels-customization](https://elyra-ai.github.io/canvas/03.06.05-panels-customization/)

```jsx
<CommonCanvas
  canvasController={canvasController}

  // Left flyout (palette lives here by default)
  showLeftFlyout={this.state.showLeft}
  leftFlyoutContent={<MyLeftPanel />}

  // Right flyout (typically node properties)
  showRightFlyout={this.state.showRight}
  rightFlyoutContent={<MyPropertiesPanel node={this.state.selectedNode} />}

  // Top panel
  showTopPanel={this.state.showTop}
  topPanelContent={<MyTopBar />}

  // Bottom panel
  showBottomPanel={this.state.showBottom}
  bottomPanelContent={<MyLogPanel />}
/>
```

Open/close panels programmatically via the Canvas Controller:

```js
canvasController.openRightFlyout();
canvasController.closeRightFlyout();
canvasController.isRightFlyoutOpen();     // boolean

canvasController.openLeftFlyout();         // when palette is "None"
canvasController.closeLeftFlyout();

canvasController.openTopPanel();
canvasController.closeTopPanel();

canvasController.openBottomPanel();
canvasController.closeBottomPanel();
```

**Typical pattern** — open right flyout when a node is double-clicked:

```js
clickActionHandler(source) {
  if (source.clickType === "DOUBLE_CLICK" && source.objectType === "node") {
    const node = this.canvasController.getNode(source.id);
    this.setState({ selectedNode: node, showRight: true });
  }
}
```

**Resizable right flyout:**
```js
const config = { enableRightFlyoutDragToResize: true };
```

**Flyout below toolbar** (doesn't compress toolbar):
```js
const config = {
  enableRightFlyoutUnderToolbar: true,
  enableLeftFlyoutUnderToolbar: true,
};
```

---

## Markdown in comments

Enable rich text in comments:

```js
const config = {
  enableMarkdownInComments: true,  // renders markdown syntax as HTML
  enableMarkdownHTML: true,        // also allow raw HTML in comments (default: true)
};
```

When `enableMarkdownInComments: true`:
- Comments switch between **edit mode** (raw markdown) and **presentation mode** (rendered HTML)
- Users can double-click to enter edit mode
- Keyboard shortcuts: `Meta+B` bold, `Meta+I` italic, `Meta+K` link, etc.

---

## Schema validation (development only)

Validate your palette and pipeline flow JSON against the schemas. **Enable during development, disable in production:**

```js
const config = {
  schemaValidation: true   // logs errors to browser console if JSON is invalid
};
```

Validates objects passed to:
- `canvasController.setPipelineFlow(flow)` — against pipeline-flow schema
- `canvasController.setPipelineFlowPalette(palette)` — against palette schema

---

## External drag-and-drop (dropping files/objects from outside the browser)

Enable a visual drop zone when a file is dragged from the OS onto the canvas:

```js
const config = {
  enableDropZoneOnExternalDrag: true,
  dropZoneCanvasContent: (         // optional custom JSX for the drop zone overlay
    <div>
      <p>Drop your file here to add to canvas</p>
    </div>
  )
};
```

Handle the drop in `editActionHandler`:

```js
editActionHandler(data, command) {
  if (data.editType === "createFromExternalObject") {
    // data.files — array of dropped File objects
    // data.offsetX / data.offsetY — drop position on canvas
    const file = data.files[0];
    this.loadFileAsNode(file, data.offsetX, data.offsetY);
  }
}
```

→ [External objects docs](https://elyra-ai.github.io/canvas/03.07-external-objects/)

---

## Palette search & recommendations

The palette has a built-in search bar — no configuration needed. It searches node labels, descriptions, and category labels simultaneously.

**Improve search quality** by writing good descriptions in your palette JSON:

```json
{
  "app_data": {
    "ui_data": {
      "label": "CSV Import",
      "description": "Import comma-separated values from a file. Supports csv, tsv, tab-delimited formats."
    }
  }
}
```

The search uses keyword ranking — nodes where the search term appears in the label rank higher than those where it appears only in the description.

---

## Saving and restoring the flow

```js
// Save — get the full pipeline flow JSON
const flowToSave = canvasController.getPipelineFlow();
localStorage.setItem("my-flow", JSON.stringify(flowToSave));

// Restore — load it back
const savedFlow = JSON.parse(localStorage.getItem("my-flow"));
canvasController.setPipelineFlow(savedFlow);
```

The pipeline flow JSON is self-contained — it includes nodes, links, comments, and positions. Images are **not** embedded (they are URL references), so your image files must be present at the same paths when the flow is reloaded.

---

## Context menu config

Suppress the default canvas context menu, or add extra items at the top:

```js
const contextMenuConfig = {
  enableCreateSupernodeNonContiguous: true,  // allow supernode creation even with gaps
  defaultMenuEntries: {
    saveToPalette: false,   // hide "Save to palette" from context menus
    createSupernode: false  // hide "Create supernode"
  }
};

<CommonCanvas contextMenuConfig={contextMenuConfig} ... />
```

→ [contextMenuConfig docs](https://elyra-ai.github.io/canvas/03.02.04-context-menu-config/)
