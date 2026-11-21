# 04 — Nodes

> **Full doc reference:** [elyra-ai.github.io/canvas/03.06.01-node-customization](https://elyra-ai.github.io/canvas/03.06.01-node-customization/)

---

## Node anatomy

```
┌─────────────────────────────────────┐
│ ○ [image]  [label]              ••• │  ← horizontal format
└─────────────────────────────────────┘
   ↑           ↑                  ↑
input port   label             ellipsis (context menu)

         [image]
          [label]                       ← vertical format
         ○      ○
```

Every part is optional and fully configurable via `enableNodeLayout` in the canvas config.

---

## Node format type

```js
const config = {
  enableNodeFormatType: "Horizontal", // or "Vertical"
};
```

- `"Horizontal"` — icon on left, label on right. Default.
- `"Vertical"` — icon on top, label below.

→ Full reference: [enableNodeFormatType](https://elyra-ai.github.io/canvas/03.02.01-canvas-config/#enablenodeformattype)

---

## Override layout for ALL nodes

Use `enableNodeLayout` in the canvas config. You only need to set the properties you want to override:

```js
const config = {
  enableNodeLayout: {
    defaultNodeWidth: 160,
    defaultNodeHeight: 40,
    nodeShape: "rectangle",          // "rectangle" | "port-arcs" | "rectangle-rounded-corners"
    imageWidth: 26, imageHeight: 26,
    imagePosX: 6, imagePosY: 7,
    labelPosX: 36, labelPosY: 12,
    labelWidth: 112,
    labelEditable: true,             // allow inline label editing
    labelSingleLine: true,
    dropShadow: true,
    ellipsisDisplay: true,
    inputPortDisplay: true,
    outputPortDisplay: true,
  }
};
```

→ Full list of all layout fields with defaults: [layout-dimensions.js](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/common-canvas/src/object-model/layout-dimensions.js)

---

## Override layout per-node (dynamic)

Use the `layoutHandler` callback to return different layouts per node:

```js
// In your <CommonCanvas layoutHandler={this.layoutHandler} />

layoutHandler(nodeData) {
  // nodeData is the node object from the pipeline flow
  if (nodeData.op === "filter") {
    return {
      defaultNodeWidth: 200,
      defaultNodeHeight: 60,
      nodeShape: "rectangle",
    };
  }
  return {}; // return empty object for default layout
}
```

→ [layoutHandler docs](https://elyra-ai.github.io/canvas/03.03.04-layout-handler/)

---

## Node image — URL (SVG recommended)

In your palette JSON or pipeline flow JSON, set the `image` field to a server path:

```json
{
  "id": "sort-node",
  "op": "sort",
  "app_data": {
    "ui_data": {
      "label": "Sort",
      "image": "/images/nodes/sort.svg"
    }
  }
}
```

SVG files (`.svg` extension) are loaded as **inline SVG** by default, which means you can style individual SVG elements with CSS. Control this with [`enableImageDisplay`](https://elyra-ai.github.io/canvas/03.02.01-canvas-config/#enableimagedisplay).

---

## Node image — Carbon icon (JSX)

Use any icon from the [Carbon icons library](https://carbondesignsystem.com/elements/icons/library/) as a node image:

```js
import { JoinInner } from "@carbon/react/icons";

// Set programmatically after canvas is mounted:
canvasController.setNodeProperties("node-id-123", {
  image: <JoinInner size={20} />
});
```

Or inject into the palette/flow object before passing to `setPipelineFlowPalette()`.

→ [Node image as JSX docs](https://elyra-ai.github.io/canvas/03.06.01-node-customization/#node-image-as-jsx)

---

## Node shape — Custom SVG path

Replace the default rectangle with any SVG path:

```js
const config = {
  enableNodeLayout: {
    // Ellipse:
    bodyPath: "M 0 30 Q 0 0 60 0 Q 120 0 120 30 Q 120 60 60 60 Q 0 60 0 30 Z",
    selectionPath: "M -5 30 Q -5 -5 60 -5 Q 125 -5 125 30 Q 125 65 60 65 Q -5 65 -5 30 Z",
    defaultNodeWidth: 120,
    defaultNodeHeight: 60,
  }
};
```

`bodyPath` — draws the visible node outline  
`selectionPath` — draws the selection highlight (slightly larger, same shape)

Both can also be **functions** `(node) => svgPath` when `enableResizableNodes: true`.

---

## Node shape — React component as body

```js
import MyNodeCard from "./my-node-card";

const config = {
  enableNodeLayout: {
    nodeExternalObject: MyNodeCard,   // React component
    nodeShapeDisplay: false,          // hide default SVG outline
    imageDisplay: false,              // hide default image
    labelDisplay: false,              // hide default label (show in your component)
    defaultNodeWidth: 220,
    defaultNodeHeight: 120,
  }
};
```

Your component receives these props automatically:
```ts
interface NodeProps {
  nodeData: object;            // the full node from the pipeline flow
  canvasController: object;    // CanvasController instance
  externalUtils?: object;      // optional utilities you can pass
}
```

→ [react-nodes-carbon example](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/harness/src/client/components/custom-canvases/react-nodes-carbon)

---

## Ports

Ports are the connection points on nodes. Key config options:

```js
enableNodeLayout: {
  // Show/hide
  inputPortDisplay: true,
  outputPortDisplay: true,

  // Port appearance
  inputPortDisplayObjects: [
    { type: "circleWithArrow" }  // or "circle", or { type: "image", src: "...", width:10, height:10 }
  ],
  outputPortDisplayObjects: [
    { type: "circle" }
  ],

  // Port positions (when inputPortAutoPosition: false)
  inputPortAutoPosition: false,
  inputPortPositions: [
    { x_pos: 0, y_pos: 10, pos: "topLeft" },
    { x_pos: 0, y_pos: -10, pos: "bottomLeft" },
  ],
}
```

→ [Port customization docs](https://elyra-ai.github.io/canvas/03.06.01-node-customization/#overriding-port-positions-and-link-directions)

---

## Resizable nodes

```js
const config = {
  enableResizableNodes: true,   // user can drag node edges to resize
};
```

→ [enableResizableNodes](https://elyra-ai.github.io/canvas/03.02.01-canvas-config/#enableresizablenodes)

---

## CSS classes on nodes

Apply a CSS class to a node's `<g>` group element using any of these methods:

```js
// 1. In pipeline flow JSON:
node.app_data.ui_data.class_name = "my-node-class";

// 2. Via API:
canvasController.setNodeProperties(nodeId, { class_name: "my-node-class" });
canvasController.setNodesClassName([nodeId1, nodeId2], "my-node-class");

// 3. In enableNodeLayout (applies to ALL nodes):
config.enableNodeLayout.className = "my-node-class";

// 4. Returned from layoutHandler (per-node):
layoutHandler(nodeData) { return { className: "my-node-class" }; }
```

Then in your CSS:
```css
.my-node-class .d3-node-body-outline {
  fill: #e8f4fd;
  stroke: #1a73e8;
}
```

→ See [`06-colors-and-css.md`](./06-colors-and-css.md) for all CSS class names.
