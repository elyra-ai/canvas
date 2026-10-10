# 08 — Callbacks (Event Handlers)

> **Full doc reference:** [elyra-ai.github.io/canvas/03.03-callbacks](https://elyra-ai.github.io/canvas/03.03-callbacks/)
> **All internal action names:** [elyra-ai.github.io/canvas/03.11-internal-actions](https://elyra-ai.github.io/canvas/03.11-internal-actions/)

All callbacks are **optional**. If you don't implement them, Common Canvas handles everything with sensible defaults.

---

## Wire up callbacks

```jsx
<CommonCanvas
  canvasController={this.canvasController}
  editActionHandler={this.editActionHandler}
  beforeEditActionHandler={this.beforeEditActionHandler}
  clickActionHandler={this.clickActionHandler}
  contextMenuHandler={this.contextMenuHandler}
  layoutHandler={this.layoutHandler}
  decorationActionHandler={this.decorationActionHandler}
  selectionChangeHandler={this.selectionChangeHandler}
  tipHandler={this.tipHandler}
  idGeneratorHandler={this.idGeneratorHandler}
  actionLabelHandler={this.actionLabelHandler}
/>
```

---

## editActionHandler — most important callback

Called **after** every canvas edit (node created, link drawn, comment edited, etc.).

```js
editActionHandler(data, command) {
  // data.editType — what action was performed
  // data.editSource — "toolbar" | "contextmenu" | "keyboard" | "canvas"
  // command — the command object that was added to the undo/redo stack

  switch (data.editType) {
    case "createNode":
      console.log("New node created:", command.newNode);
      // Save to your backend here
      this.saveFlow(this.canvasController.getPipelineFlow());
      break;

    case "linkNodes":
      console.log("Link created:", data);
      break;

    case "deleteSelectedObjects":
      console.log("Objects deleted");
      break;

    case "myCustomAction":
      // Handle your own custom toolbar/context menu actions
      this.handleMyAction(data);
      break;
  }
}
```

**Common `editType` values** (full list at docs link above):

| Category | editType values |
|---|---|
| Nodes | `createNode`, `createAutoNode`, `insertNodeIntoLink`, `setNodeLabel`, `disconnectNode`, `moveObjects`, `resizeObjects`, `deleteSelectedObjects` |
| Links | `linkNodes`, `linkNodesAndReplace`, `linkComment`, `deleteLink`, `createDetachedLink`, `updateLink` |
| Comments | `createComment`, `createAutoComment`, `editComment`, `setCommentEditingMode` |
| Clipboard | `cut`, `copy`, `paste` |
| History | `undo`, `redo` |
| Selection | `selectAll`, `deselectAll` |
| Canvas | `createFromExternalObject`, `colorSelectedObjects`, `setObjectsStyle` |
| Supernodes | `createSuperNode`, `deconstructSuperNode`, `expandSuperNodeInPlace`, `collapseSuperNodeInPlace` |

→ [Full internal actions list](https://elyra-ai.github.io/canvas/03.11-internal-actions/)

---

## beforeEditActionHandler — intercept and cancel

Called **before** the edit happens. Return `null` to cancel the action:

```js
beforeEditActionHandler(data, command) {
  if (data.editType === "createNode" && !this.canAddMoreNodes()) {
    // Cancel the action
    return null;
  }
  // Return data (modified or unchanged) to allow the action
  return data;
}
```

→ [beforeEditActionHandler docs](https://elyra-ai.github.io/canvas/03.03.02-before-edit-action-handler/)

---

## clickActionHandler — respond to clicks

```js
clickActionHandler(source) {
  // source.clickType: "SINGLE_CLICK" | "DOUBLE_CLICK" | "SINGLE_CLICK_CONTEXTMENU"
  // source.objectType: "node" | "link" | "comment" | "canvas" | "region"
  // source.id: the clicked object's ID (when objectType is node/link/comment)
  // source.selectedObjectIds: array of currently selected IDs

  if (source.clickType === "DOUBLE_CLICK" && source.objectType === "node") {
    // Open properties panel for this node
    this.openNodeProperties(source.id);
  }
}
```

→ [clickActionHandler docs](https://elyra-ai.github.io/canvas/03.03.09-click-action-handler/)

---

## contextMenuHandler — customize right-click menus

```js
contextMenuHandler(source, defaultMenu) {
  // source.type: "node" | "link" | "comment" | "canvas" | "port"
  // source.id: ID of the right-clicked object
  // defaultMenu: the default menu items array

  if (source.type === "node") {
    // Add a custom item to the node context menu
    return [
      ...defaultMenu,
      { divider: true },
      { action: "openProperties", label: "Open Properties", enable: true }
    ];
  }

  if (source.type === "link") {
    // Replace the whole menu for links
    return [
      { action: "deleteSelectedObjects", label: "Delete Link", enable: true },
      {
        action: "color-link",
        label: "Color link",
        submenu: true,
        menu: [
          { action: "link-red",   label: "Red",   enable: true },
          { action: "link-green", label: "Green", enable: true },
          { action: "link-blue",  label: "Blue",  enable: true },
        ]
      }
    ];
  }

  return defaultMenu;
}
```

→ [contextMenuHandler docs](https://elyra-ai.github.io/canvas/03.03.01-context-menu-handler/)

---

## selectionChangeHandler — track selection

```js
selectionChangeHandler(data) {
  // data.selectedNodes — array of selected node objects
  // data.selectedLinks — array of selected link objects
  // data.selectedComments — array of selected comment objects
  // data.addedNodes, data.removedNodes, etc.
  console.log("Selected nodes:", data.selectedNodes.map(n => n.id));
}
```

→ [selectionChangeHandler docs](https://elyra-ai.github.io/canvas/03.03.08-selection-change-handler/)

---

## layoutHandler — per-node layout overrides

Called for every node on the canvas. Return layout overrides for that specific node:

```js
layoutHandler(nodeData) {
  // nodeData is the full node object from the pipeline flow

  if (nodeData.op === "filter") {
    return {
      defaultNodeWidth: 200,
      nodeShape: "rectangle",
      className: "filter-node"
    };
  }

  if (nodeData.type === "binding") {
    return {
      imageDisplay: false,
      defaultNodeWidth: 80,
      defaultNodeHeight: 80,
      bodyPath: "M 0 40 L 40 0 L 80 40 L 40 80 Z",       // diamond
      selectionPath: "M -5 40 L 40 -5 L 85 40 L 40 85 Z"
    };
  }

  return {};  // default for all other nodes
}
```

> **Performance:** `layoutHandler` is called frequently. Keep it fast — no async, no heavy computation.

→ [layoutHandler docs](https://elyra-ai.github.io/canvas/03.03.04-layout-handler/)

---

## tipHandler — custom tooltips

Override what's shown when hovering over canvas objects:

```js
tipHandler(tipType, data) {
  // tipType: "tipTypeNode" | "tipTypeLink" | "tipTypePort" | "tipTypeDecoration" | "tipTypePaletteItem" | ...

  if (tipType === "tipTypeNode") {
    const node = data.node;
    return (
      <div>
        <strong>{node.label}</strong>
        <p>{node.description || "No description"}</p>
      </div>
    );
  }
  return null;  // use default tip
}
```

→ [tipHandler docs](https://elyra-ai.github.io/canvas/03.03.06-tip-handler/)

---

## decorationActionHandler — decoration clicks

Called when a user clicks a decoration with `hotspot: true`:

```js
decorationActionHandler(node, decorationId, pipelineId) {
  if (decorationId === "expand-btn") {
    this.toggleNodeDetails(node.id);
  }
}
```

→ [decorationActionHandler docs](https://elyra-ai.github.io/canvas/03.03.05-decoration-action-handler/)

---

## idGeneratorHandler — custom IDs

Provide your own IDs for new canvas objects instead of auto-generated UUIDs:

```js
idGeneratorHandler(action, data) {
  // action: "node" | "comment" | "link"
  if (action === "node") {
    return `node-${Date.now()}`;
  }
  return null; // null = use default UUID
}
```

→ [idGeneratorHandler docs](https://elyra-ai.github.io/canvas/03.03.07-id-generator-handler/)
