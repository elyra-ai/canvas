# 03 — Canvas Types (Start Here)

> This file is designed for your AI assistant to read first. It maps use-case questions to the right config.

---

## Step 0 — Let the AI ask you these questions

When you share these context files with an AI, ask it to prompt you with:

1. **What does your canvas represent?**
   - Data pipeline / ML workflow
   - Network / infrastructure diagram
   - Logic / decision tree / flowchart
   - Process / org chart (stages/swimlanes)
   - Free-form mind map or whiteboard
   - Other

2. **What do your nodes look like?**
   - Standard rectangular icon + label (horizontal)
   - Card-style (label below icon, vertical)
   - Custom shape (circle, diamond, ellipse)
   - React component inside the node (e.g. Carbon Charts CardNode)

3. **What do your links (edges/arrows) look like?**
   - Smooth curves (Bezier)
   - Right-angle elbows
   - Straight lines
   - Bidirectional / association (no direction)

4. **Do you need a palette?** (sidebar with draggable node types)

5. **Do you need colors?** Per-node? Per-link? Theme-based?

6. **Do you need custom SVGs or Carbon icons as node images?**

---

## Canvas Type → Config Matrix

Based on your answers above, here is the config to use:

### Type A — Data Pipeline / ML Workflow
Classic IBM SPSS / AI pipeline style. Horizontal nodes, curved links, palette.

```js
const config = {
  enableNodeFormatType: "Horizontal",   // icon left, label right
  enableLinkType: "Curve",              // smooth bezier curves
  enableLinkMethod: "Ports",            // links connect to specific ports
  enableLinkDirection: "LeftRight",     // input ports left, output ports right
  enablePaletteLayout: "Flyout",        // collapsible left sidebar palette
  enableContextToolbar: true,           // toolbar on hover instead of right-click menu
  enableSnapToGridType: "After",
};
```
→ See [`10-examples.md`](./10-examples.md) — "Pipeline/Modeler" example

---

### Type B — Network / Infrastructure Diagram
Nodes represent servers, services, containers. Elbow links. Vertical format.

```js
const config = {
  enableNodeFormatType: "Vertical",     // icon top, label below
  enableLinkType: "Elbow",              // right-angle elbow connections
  enableLinkMethod: "Freeform",         // links from node body, not specific ports
  enableMarkdownInComments: true,       // rich comments
  enableContextToolbar: true,
  enableSaveZoom: "LocalStorage",       // remember zoom level per session
  enableSnapToGridType: "During",
  enableNodeLayout: {
    nodeShapeDisplay: false,            // no rectangle outline — image-only nodes
    labelEditable: true,
    inputPortDisplay: false,
    outputPortDisplay: false,
  },
};
```
→ See [`10-examples.md`](./10-examples.md) — "Network" example

---

### Type C — Logic / Decision Tree / Flowchart
Nodes are wide cards representing decisions or actions. Top-to-bottom flow.

```js
const config = {
  enableNodeFormatType: "Horizontal",
  enableLinkType: "Straight",
  enableLinkMethod: "Freeform",
  enableLinkDirection: "TopBottom",     // flow goes top → bottom
  enableLinkSelection: "LinkOnly",
  enableSnapToGridType: "During",
  enableContextToolbar: true,
  enableInsertNodeDroppedOnLink: true,  // drop node onto link to insert
  enableHighlightNodeOnNewLinkDrag: true,
  tipConfig: { palette: true, nodes: true, ports: false, links: false },
  enableNodeLayout: {
    defaultNodeWidth: 280,
    defaultNodeHeight: 60,
    nodeShape: "rectangle",
    drawNodeLinkLineFromTo: "node_center",
    inputPortDisplay: false,
    labelEditable: true,
    labelSingleLine: true,
  },
};
```
→ See [`10-examples.md`](./10-examples.md) — "Logic" example

---

### Type D — Stages / Process Flow (Swimlanes)
Nodes grouped into horizontal stage bands. Often used for process modeling.

```js
const config = {
  enableNodeFormatType: "Vertical",
  enableLinkType: "Curve",
  enableLinkMethod: "Ports",
  enablePaletteLayout: "Flyout",
  enableSnapToGridType: "During",
};
```
→ See the [Stages canvas example](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/harness/src/client/components/custom-canvases/stages)

---

### Type E — Custom Shape Nodes (SVG paths)
Nodes drawn as ellipses, diamonds, circles or any SVG path.

```js
const config = {
  enableNodeLayout: {
    // Ellipse example:
    bodyPath: "M 0 30 Q 0 0 60 0 Q 120 0 120 30 Q 120 60 60 60 Q 0 60 0 30 Z",
    selectionPath: "M -5 30 Q -5 -5 60 -5 Q 125 -5 125 30 Q 125 65 60 65 Q -5 65 -5 30 Z",
    defaultNodeWidth: 120,
    defaultNodeHeight: 60,
    imagePosX: 20, imagePosY: 10,
    imageWidth: 30, imageHeight: 30,
    labelPosX: 60, labelPosY: 37,
  }
};
```
→ See [`04-nodes.md`](./04-nodes.md) — "Node shape" section

---

### Type F — React Component Nodes
Node body rendered by a React component (e.g. Carbon Charts `CardNode`).

```js
import MyCardNode from "./my-card-node.jsx";

const config = {
  enableNodeLayout: {
    nodeExternalObject: MyCardNode,    // your React component
    nodeShapeDisplay: false,
    imageDisplay: false,
    labelDisplay: true,
    defaultNodeWidth: 200,
    defaultNodeHeight: 100,
  }
};
```
The React component receives: `{ nodeData, canvasController, externalUtils }` as props.

→ See [`04-nodes.md`](./04-nodes.md) — "Node with React object" section  
→ See [react-nodes-carbon example](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/harness/src/client/components/custom-canvases/react-nodes-carbon)

---

## Mix and match

All options compose freely. You can have:
- Vertical format + Elbow links + React component nodes + custom CSS colors
- Horizontal format + Straight Freeform links + custom SVG port icons

The [`enableNodeLayout`](https://elyra-ai.github.io/canvas/03.06.01-node-customization/) and [`enableCanvasLayout`](https://elyra-ai.github.io/canvas/03.06.04-flow-editor-customization/) objects in the config accept 50+ layout properties. Start with the closest type above and override from there.
