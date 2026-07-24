# 09 — Canvas Controller API

> **Full doc reference:** [elyra-ai.github.io/canvas/03.04-canvas-controller](https://elyra-ai.github.io/canvas/03.04-canvas-controller/)

The `CanvasController` is the programmatic interface to everything on the canvas. It is a plain JavaScript class — not a React component.

```js
import { CanvasController } from "@elyra/canvas";
const canvasController = new CanvasController();
```

In all methods, `pipelineId` is optional — it defaults to the currently displayed pipeline.

---

## Pipeline flow

```js
// Load a saved flow (replaces current canvas content)
canvasController.setPipelineFlow(flowJSON);

// Clear the canvas
canvasController.clearPipelineFlow();

// Get the current flow (to save to backend)
const flow = canvasController.getPipelineFlow();

// Get internal canvas data
const info = canvasController.getCanvasInfo();
```

---

## Palette

```js
// Load node types into palette
canvasController.setPipelineFlowPalette(paletteJSON);

// Open/close palette
canvasController.openPalette();
canvasController.closePalette();

// Open a specific palette category
canvasController.openPaletteCategory("my-category-id");

// Add a single node type to palette
canvasController.addNodeTypeToPalette(nodeTypeObj, categoryId, categoryLabel);

// Remove a node type from palette
canvasController.removeNodeTypeFromPalette(nodeTypeId, categoryId);
```

---

## Nodes

```js
// Get all nodes in a pipeline
const nodes = canvasController.getNodes(pipelineId);

// Get a single node
const node = canvasController.getNode(nodeId, pipelineId);

// Create a node from a palette template (does NOT add to canvas)
const template = canvasController.getPaletteNode("sort");  // by op field
const newNode = canvasController.createNode({
  nodeTemplate: template,
  offsetX: 200,
  offsetY: 150
});

// Add the node to the canvas (not on undo stack)
canvasController.addNode(newNode);

// Create + add + put on undo stack (triggers editActionHandler)
canvasController.createNodeCommand({ nodeTemplate: template, offsetX: 200, offsetY: 150 });

// Update node properties
canvasController.setNodeProperties(nodeId, { label: "New Label" }, pipelineId);

// Assign CSS class to nodes
canvasController.setNodesClassName([nodeId], "my-class", pipelineId);

// Delete nodes
canvasController.deleteNode(nodeId, pipelineId);

// Select nodes
canvasController.setSelections([nodeId], pipelineId);

// Get selected nodes
const selected = canvasController.getSelectedNodes();
```

---

## Links

```js
// Get all links
const links = canvasController.getLinks(pipelineId);

// Get links connected to a node
const nodeLinks = canvasController.getNodeDataLinks(nodeId, pipelineId);

// Update link properties
canvasController.setLinkProperties(linkId, { class_name: "active" }, pipelineId);

// Assign CSS class to links
canvasController.setLinksClassName([linkId], "my-link-class", pipelineId);

// Delete a link
canvasController.deleteLink(linkId, pipelineId);

// Create a link between two nodes programmatically
canvasController.createNodeLinks([{
  srcNodeId: "node-1",
  srcNodePortId: "output-1",
  trgNodeId: "node-2",
  trgNodePortId: "input-1"
}], pipelineId);
```

---

## Comments

```js
// Get all comments
const comments = canvasController.getComments(pipelineId);

// Create a comment
canvasController.createAutoComment("My note text", { x: 100, y: 100 });

// Update comment
canvasController.setCommentProperties(commentId, { content: "Updated text" });
```

---

## Decorations

```js
// Set decorations on a node
canvasController.setNodeDecorations(nodeId, decorationsArray, pipelineId);

// Set decorations on multiple nodes at once
canvasController.setNodesMultiDecorations([
  { pipelineId, nodeId: "n1", decorations: [...] },
  { pipelineId, nodeId: "n2", decorations: [...] },
]);

// Set decorations on a link
canvasController.setLinkDecorations(linkId, decorationsArray, pipelineId);

// Get decorations
const decs = canvasController.getNodeDecorations(nodeId, pipelineId);
```

---

## Styling

```js
// Set inline style on objects (temporary or permanent)
canvasController.setObjectsStyle(
  [{ pipelineId, objId: nodeId }],
  { body: { default: "fill: #f0f4ff; stroke: #3b82f6;" } },
  true   // true = temporary (cleared by removeAllStyles)
);

// Style a single link
canvasController.setLinkStyle(linkId, { line: { default: "stroke: red;" } }, true, pipelineId);

// Remove all temporary styles
canvasController.removeAllStyles(true);
```

---

## Zoom & Navigation

```js
// Zoom to fit all canvas content
canvasController.zoomToFit();

// Zoom to a specific scale at a specific point
canvasController.zoomTo({ k: 1.5, x: 0, y: 0 });

// Pan the canvas
canvasController.translateBy(100, 50);

// Zoom to show a specific node
canvasController.panToNode(nodeId, pipelineId);

// Clear saved zoom values from local storage
canvasController.clearSavedZoomValues();
```

---

## Panels

```js
// Open/close right flyout panel
canvasController.openRightFlyout();
canvasController.closeRightFlyout();

// Open/close left flyout panel (palette)
canvasController.openPalette();
canvasController.closePalette();

// Open/close notification panel
canvasController.openNotificationPanel();
canvasController.closeNotificationPanel();
```

---

## Notification messages

```js
canvasController.setNotificationMessages([
  {
    id: "msg-1",
    type: "error",          // "info" | "success" | "warning" | "error"
    title: "Validation error",
    content: "Node 'Sort' is missing a required input.",
    timestamp: new Date().toLocaleTimeString()
  }
]);

// Clear all messages
canvasController.clearNotificationMessages();
```

→ [Notification messages docs](https://elyra-ai.github.io/canvas/03.04.05-notification-messages/)

---

## Auto-layout

```js
// Automatically arrange nodes
canvasController.autoLayout("horizontal", pipelineId);  // or "vertical"
```

---

## Undo / Redo

Undo/redo works **automatically** — every user action (create node, delete link, move, edit comment etc.) is pushed onto the command stack and is undoable with Ctrl/Cmd+Z without any code from you.

```js
// Programmatic undo/redo
canvasController.undo();
canvasController.redo();
canvasController.canUndo();   // returns boolean — use to enable/disable your UI
canvasController.canRedo();   // returns boolean
```

**Adding undo/redo buttons to your toolbar** — see [`11-toolbar.md`](./11-toolbar.md). The built-in action names are `"undo"` and `"redo"`:

```js
const toolbarConfig = {
  leftBar: [
    { action: "undo", label: "Undo" },
    { action: "redo", label: "Redo" },
    { divider: true },
    // ... your other actions
  ]
};
// Pass to: <CommonCanvas toolbarConfig={toolbarConfig} ... />
```

Common Canvas auto-enables/disables the undo and redo buttons based on stack state — no extra code needed.

---

## Command Stack — custom commands

Every built-in canvas action uses the command stack automatically. You can push your own commands too (so they participate in undo/redo):

```js
import { Action } from "@elyra/canvas";

// 1. Define your command class
class MyAddTagAction extends Action {
  constructor(data, canvasController) {
    super(data);
    this.canvasController = canvasController;
    this.nodeId = data.nodeId;
    this.tag = data.tag;
  }

  do() {
    this.canvasController.setNodeProperties(this.nodeId, {
      app_data: { tag: this.tag }
    });
  }

  undo() {
    this.canvasController.setNodeProperties(this.nodeId, {
      app_data: { tag: null }
    });
  }

  redo() { this.do(); }

  getLabel() { return `Add tag "${this.tag}"`; }

  getFocusObject() {
    return this.canvasController.getNode(this.nodeId) || "CanvasFocus";
  }
}

// 2. Execute — adds to undo stack, triggers editActionHandler callbacks
const cmd = new MyAddTagAction({ nodeId: "node-1", tag: "important" }, canvasController);
canvasController.do(cmd);
```

**Exported action classes** you can extend instead of writing from scratch:
- `CreateAutoNodeAction`, `CreateNodeAction`, `CreateNodeLinkAction`
- `DeleteObjectsAction`, `DisconnectObjectsAction`, `PasteAction`

→ [Command Stack docs](https://elyra-ai.github.io/canvas/03.10-command-stack/)
