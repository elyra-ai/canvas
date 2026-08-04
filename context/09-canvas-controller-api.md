# 09 — Canvas Controller API

> **Full API reference:** [elyra-ai.github.io/canvas/03.04-canvas-controller](https://elyra-ai.github.io/canvas/03.04-canvas-controller/)
> **Command Stack:** [elyra-ai.github.io/canvas/03.10-command-stack](https://elyra-ai.github.io/canvas/03.10-command-stack/)

The `CanvasController` is the programmatic interface to everything on the canvas. It is a plain JavaScript class — not a React component.

```js
import { CanvasController } from "@elyra/canvas";
const canvasController = new CanvasController();
```

In all methods, `pipelineId` is optional — defaults to the currently displayed pipeline.

---

## The 20 methods you'll use most

```js
// ── Flow ──────────────────────────────────────────────────
canvasController.setPipelineFlow(flowJSON);        // load a saved flow
canvasController.getPipelineFlow();                // get flow to save to backend
canvasController.clearPipelineFlow();              // empty the canvas

// ── Palette ───────────────────────────────────────────────
canvasController.setPipelineFlowPalette(palette);  // load node types
canvasController.openPalette();
canvasController.closePalette();

// ── Nodes ─────────────────────────────────────────────────
canvasController.getNodes(pipelineId);             // array of all nodes
canvasController.getNode(nodeId, pipelineId);      // single node object
canvasController.setNodeProperties(nodeId, { label: "New name" });
canvasController.setNodesClassName([nodeId], "my-class");
canvasController.deleteNode(nodeId, pipelineId);

// ── Links ─────────────────────────────────────────────────
canvasController.getLinks(pipelineId);
canvasController.setLinksClassName([linkId], "my-class");
canvasController.deleteLink(linkId, pipelineId);

// ── Selection ─────────────────────────────────────────────
canvasController.getSelectedNodes();
canvasController.setSelections([nodeId], pipelineId);
canvasController.clearSelections();

// ── Zoom ──────────────────────────────────────────────────
canvasController.zoomToFit();
canvasController.panToNode(nodeId, pipelineId);

// ── Undo / Redo ───────────────────────────────────────────
canvasController.undo();
canvasController.redo();
canvasController.canUndo();    // boolean
canvasController.canRedo();    // boolean
```

For the full API — all 100+ methods — see the [Canvas Controller docs](https://elyra-ai.github.io/canvas/03.04-canvas-controller/).

---

## Common patterns

### Save the flow when anything changes

```js
editActionHandler(data, command) {
  const flow = this.canvasController.getPipelineFlow();
  localStorage.setItem("my-flow", JSON.stringify(flow));
  // or POST to your backend
}
```

### Add a node programmatically

```js
const template = canvasController.getPaletteNode("filter");  // by op field
const newNode = canvasController.createNode({ nodeTemplate: template, offsetX: 200, offsetY: 150 });
canvasController.addNode(newNode);  // not on undo stack

// OR — with undo/redo + editActionHandler support:
canvasController.createNodeCommand({ nodeTemplate: template, offsetX: 200, offsetY: 150 });
```

### Color nodes by status at runtime

```js
const statusStyles = {
  running:  { body: { default: "fill: #e8f5e9; stroke: #4caf50;" } },
  error:    { body: { default: "fill: #ffebee; stroke: #f44336;" } },
  complete: { body: { default: "fill: #f3f4f6; stroke: #9ca3af;" } },
};

function updateNodeStatus(nodeId, status) {
  canvasController.setObjectsStyle(
    { [canvasController.getCurrentPipelineId()]: [nodeId] },
    statusStyles[status],
    true   // temporary — cleared on next removeAllStyles(true)
  );
}

// Reset all when done
canvasController.removeAllStyles(true);
```

### Open right flyout on node double-click

```js
clickActionHandler(source) {
  if (source.clickType === "DOUBLE_CLICK" && source.objectType === "node") {
    const node = this.canvasController.getNode(source.id);
    this.setState({ selectedNode: node, showRightFlyout: true });
  }
}
```

### Add notification messages

```js
canvasController.setNotificationMessages([
  {
    id: "err-1",
    type: "error",   // "info" | "success" | "warning" | "error"
    title: "Missing input",
    content: "Node 'Filter' has no connected input.",
    timestamp: new Date().toLocaleTimeString(),
    callback: () => canvasController.setSelections(["node-filter-001"])
  }
]);
canvasController.clearNotificationMessages();
```

---

## Undo / Redo

Works **automatically** — every user action is on the undo stack without any code from you. Ctrl/Cmd+Z works out of the box.

```js
// Add undo/redo to your toolbar (auto-enables/disables):
const toolbarConfig = {
  leftBar: [
    { action: "undo", label: "Undo" },
    { action: "redo", label: "Redo" },
  ]
};
```

---

## Custom commands (participate in undo/redo)

```js
import { Action } from "@elyra/canvas";

class MyAction extends Action {
  constructor(data, canvasController) {
    super(data);
    this.cc = canvasController;
    this.nodeId = data.nodeId;
  }
  do()    { this.cc.setNodeProperties(this.nodeId, { label: "Done" }); }
  undo()  { this.cc.setNodeProperties(this.nodeId, { label: "Original" }); }
  redo()  { this.do(); }
  getLabel()       { return "Rename node"; }
  getFocusObject() { return this.cc.getNode(this.nodeId) || "CanvasFocus"; }
}

// Execute — goes on undo stack, triggers editActionHandler
canvasController.do(new MyAction({ nodeId: "node-1" }, canvasController));
```

Exportable base classes you can extend: `CreateNodeAction`, `DeleteObjectsAction`, `CreateNodeLinkAction`, `DisconnectObjectsAction`, `PasteAction`

→ [Command Stack docs](https://elyra-ai.github.io/canvas/03.10-command-stack/)
