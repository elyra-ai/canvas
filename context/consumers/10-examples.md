# 10 — Real Examples

These are working config snippets from the official Elyra Canvas example apps.

- **Browse all examples:** [github.com/elyra-ai/canvas — custom-canvases/](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/harness/src/client/components/custom-canvases)
- **Try them live:** [elyra-canvas-test-harness](https://elyra-canvas-test-harness.u20youmx4sm.us-south.codeengine.appdomain.cloud/)

---

## Example 1 — Logic / Decision Tree (TopBottom flow)

→ Source: [logic-canvas.jsx](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/src/client/components/custom-canvases/logic/logic-canvas.jsx)

```js
const config = {
  enableParentClass: "logic-canvas",
  enableNodeFormatType: "Horizontal",
  enableLinkType: "Straight",
  enableLinkMethod: "Freeform",
  enableLinkDirection: "TopBottom",        // top-to-bottom flow
  enableLinkSelection: "LinkOnly",
  enableSnapToGridType: "During",
  enableContextToolbar: true,
  enableInsertNodeDroppedOnLink: true,
  enableHighlightNodeOnNewLinkDrag: true,
  tipConfig: { palette: true, nodes: true, ports: false, links: false },

  enableNodeLayout: {
    drawNodeLinkLineFromTo: "node_center",
    drawCommentLinkLineTo: "node_center",
    defaultNodeWidth: 280,
    defaultNodeHeight: 60,
    nodeShape: "rectangle",
    nodeHighlightGap: 6,
    minInitialLine: 20,

    // Ellipsis (3-dot menu) position — right side center
    ellipsisPosition: "middleRight",
    ellipsisWidth: 15, ellipsisHeight: 30,
    ellipsisPosY: -15, ellipsisPosX: -30,

    // Image — left side
    imageWidth: 40, imageHeight: 40,
    imagePosX: 10, imagePosY: 10,

    // Label — next to image
    labelPosX: 65, labelPosY: 15,
    labelWidth: 180, labelHeight: 29,
    labelEditable: true, labelSingleLine: true, labelOutline: false,

    // Ports — input hidden, output is a custom SVG arrow image
    inputPortDisplay: false,
    outputPortBottomPosX: 140, outputPortBottomPosY: 20,
    outputPortWidth: 20, outputPortHeight: 20,
    outputPortObject: "image",
    outputPortImage: "/images/custom-canvases/logic/decorations/dragStateArrow.svg",
    outputPortGuideObject: "image",
    outputPortGuideImage: "/images/custom-canvases/logic/decorations/dragStateArrow.svg",
    outputPortGuideImageRotate: true,
  },

  enableCanvasLayout: {
    commentHighlightGap: 6,
    dataLinkArrowHead: true,
    linkGap: 4,
    displayLinkOnOverlap: true,
    snapToGridX: "10%",
    snapToGridY: "20%",
  }
};
```

**Context menu with link color sub-menu:**

```jsx
import { ColorPalette } from "@carbon/react/icons";

contextMenuHandler(source, defaultMenu) {
  if (source.type === "link") {
    return [
      {
        action: "color-submenu",
        icon: <ColorPalette size={32} />,
        label: "Color link",
        enable: true,
        submenu: true,
        toolbarItem: true,
        menu: [
          { action: "default-color", label: "Default Color", enable: true },
          { action: "red-color",     label: "Red",           enable: true },
          { action: "yellow-color",  label: "Yellow",        enable: true },
          { action: "green-color",   label: "Green",         enable: true },
        ]
      },
      { action: "deleteSelectedObjects", enable: true, toolbarItem: true }
    ];
  }
  return defaultMenu;
}
```

---

## Example 2 — Network / Infrastructure Diagram

Source: [network-canvas.jsx](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/src/client/components/custom-canvases/network/network-canvas.jsx)

```js
const config = {
  enableParentClass: "network-canvas",
  enableNodeFormatType: "Vertical",          // image on top, label below
  enableLinkType: "Elbow",                   // right-angle connections
  enableLinkMethod: "Freeform",              // connect from node body
  enableMarkdownInComments: true,
  enableContextToolbar: true,
  enableSaveZoom: "LocalStorage",            // remember zoom per session
  enableSnapToGridType: "During",
  tipConfig: { palette: true, nodes: true, ports: false, links: false },

  enableNodeLayout: {
    nodeHighlightGap: 6,
    nodeShapeDisplay: false,                 // no outline rectangle — image-only look
    labelEditable: true,
    labelWidth: 200,
    inputPortDisplay: false,
    outputPortDisplay: true,
    outputPortGuideObject: "image",
    outputPortGuideImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg"
  },

  enableCanvasLayout: {
    dataLinkArrowHead: "M 0 0 L -5 -2 -5 2 Z"   // custom filled triangle arrow
  }
};
```

---

## Example 3 — Custom ellipse-shaped nodes

Source: [node-customization docs](https://elyra-ai.github.io/canvas/03.06.01-node-customization/)

```js
const config = {
  enableNodeLayout: {
    bodyPath: "M 0 30 Q 0 0 60 0 Q 120 0 120 30 Q 120 60 60 60 Q 0 60 0 30 Z",
    selectionPath: "M -5 30 Q -5 -5 60 -5 Q 125 -5 125 30 Q 125 65 60 65 Q -5 65 -5 30 Z",
    defaultNodeWidth: 120,
    defaultNodeHeight: 60,
    imageWidth: 30, imageHeight: 30,
    imagePosX: 20, imagePosY: 10,
    labelEditable: true,
    labelPosX: 60, labelPosY: 37,
    labelWidth: 90, labelHeight: 17,
    ellipsisDisplay: true,
    ellipsisPosX: 100, ellipsisPosY: 20,
    portPosY: 30
  }
};
```

---

## Example 4 — React component nodes (Carbon Charts CardNode)

Source: [react-nodes-carbon](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/harness/src/client/components/custom-canvases/react-nodes-carbon)

```js
import CardNodeWrapper from "./wrapper-card-node.jsx";

const config = {
  enableNodeLayout: {
    nodeExternalObject: CardNodeWrapper,
    nodeShapeDisplay: false,
    imageDisplay: false,
    labelDisplay: false,
    defaultNodeWidth: 220,
    defaultNodeHeight: 130,
  }
};
```

```jsx
// wrapper-card-node.jsx — receives nodeData, canvasController, externalUtils
const CardNodeWrapper = ({ nodeData }) => (
  <div className="card-node">
    <strong>{nodeData.label}</strong>
    <p>{nodeData.description}</p>
  </div>
);
```

---

## Example 5 — Custom port positions (multi-direction)

Source: [node customization — port positions](https://elyra-ai.github.io/canvas/03.06.01-node-customization/#overriding-port-positions-and-link-directions)

```js
const config = {
  enableNodeLayout: {
    inputPortAutoPosition: false,
    inputPortPositions: [
      { x_pos: 0, y_pos: 5,  pos: "topLeft" },    // input port near top
      { x_pos: 0, y_pos: -5, pos: "bottomLeft" }, // input port near bottom
    ],
    outputPortAutoPosition: false,
    outputPortPositions: [
      { x_pos: 0, y_pos: 5,  pos: "topRight" },
      { x_pos: 0, y_pos: -5, pos: "bottomRight" },
    ]
  }
};
```

---

## Example 6 — Background grid

Source: [flow-editor-customization docs](https://elyra-ai.github.io/canvas/03.06.04-flow-editor-customization/)

```js
const config = {
  enableCanvasLayout: {
    displayGridType: "DotsAndLines",   // "None" | "Dots" | "Boxes" | "DotsAndLines" | "BoxesAndLines"
    displayGridMinorX: "10%",
    displayGridMinorY: "10%",
    displayGridMajorX: "100%",
    displayGridMajorY: "100%",
  },
  enableSnapToGridType: "During",
  enableSnapToGridX: "10%",
  enableSnapToGridY: "10%",
};
```

---

## Example 7 — Node status coloring at runtime

```js
// After execution — color nodes based on status
const nodes = canvasController.getNodes();
nodes.forEach(node => {
  const status = getExecutionStatus(node.id);  // your function
  const styleMap = {
    running:  { body: { default: "fill: #e8f5e9; stroke: #4caf50;" } },
    error:    { body: { default: "fill: #ffebee; stroke: #f44336;" } },
    waiting:  { body: { default: "fill: #fff8e1; stroke: #ff9800;" } },
    complete: { body: { default: "fill: #f3f4f6; stroke: #9ca3af;" } },
  };
  if (styleMap[status]) {
    canvasController.setObjectsStyle(
      [{ pipelineId: canvasController.getCurrentPipelineId(), objId: node.id }],
      styleMap[status],
      true  // temporary
    );
  }
});
```

---

## Minimal palette JSON structure

```json
{
  "version": "3.0",
  "categories": [
    {
      "id": "transform",
      "label": "Transform",
      "description": "Data transformation nodes",
      "node_types": [
        {
          "id": "sort-node-type",
          "op": "sort",
          "type": "execution_node",
          "inputs": [{ "id": "inPort", "label": "Input" }],
          "outputs": [{ "id": "outPort", "label": "Output" }],
          "app_data": {
            "ui_data": {
              "label": "Sort",
              "description": "Sort data by column",
              "image": "/images/nodes/sort.svg"
            }
          }
        }
      ]
    }
  ]
}
```

Palette schema: [palette-v3-schema.json](https://github.com/elyra-ai/pipeline-schemas/tree/main/common-canvas/palette)  
Example palettes: [harness/test_resources/palettes/](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/harness/test_resources/palettes)  
Example flows: [harness/test_resources/diagrams/](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/harness/test_resources/diagrams)
