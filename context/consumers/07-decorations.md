# 07 — Decorations

> **Full doc reference:** [elyra-ai.github.io/canvas/03.04.01-decorations](https://elyra-ai.github.io/canvas/03.04.01-decorations/)

---

## What are decorations?

Decorations are additional visual elements attached to nodes, links, or comments. They are used to show status badges, icons, labels, or custom shapes — without modifying the node's core structure.

Types: **image**, **label**, **SVG path shape**, **JSX object**  
Modes: **static** (display only) or **hotspot** (clickable)

---

## Add decorations via API

```js
// On a node
canvasController.setNodeDecorations("node-123", [
  {
    id: "status-badge",
    image: "/images/icons/warning.svg",
    position: "topRight",
    x_pos: -8, y_pos: -8,
    width: 16, height: 16,
    outline: false,
    tooltip: "Node has warnings",
    temporary: true    // won't be saved to pipeline flow
  }
]);

// On a link
canvasController.setLinkDecorations("link-abc", [
  {
    id: "link-label",
    label: "1.2GB/s",
    position: "middle",
    class_name: "link-throughput-label"
  }
]);

// On a comment
canvasController.setCommentDecorations("comment-xyz", [...]);
```

---

## Decoration positions

**On a node or comment** — 9 anchor positions:
```
"topLeft"      "topCenter"      "topRight"
"middleLeft"   "middleCenter"   "middleRight"
"bottomLeft"   "bottomCenter"   "bottomRight"
```

**On a link** — 3 positions:
```
"source"   "middle"   "target"
```

Fine-tune with `x_pos` (pixels right) and `y_pos` (pixels down) from the anchor.

---

## Image decoration

```js
{
  id: "my-badge",
  image: "/images/icons/check.svg",   // URL to image on server
  position: "topRight",
  x_pos: -10, y_pos: -10,
  width: 20, height: 20,
  outline: false,                      // hide the default outline rectangle
  hotspot: false,                      // true = clickable
  tooltip: "Verified",
  temporary: true
}
```

---

## Label decoration

```js
{
  id: "count-label",
  label: "42 rows",
  position: "bottomCenter",
  x_pos: 0, y_pos: 4,
  width: 80, height: 20,
  class_name: "row-count-label",
  label_single_line: true,
  temporary: true
}
```

```css
.row-count-label {
  font-size: 11px;
  fill: #666;
}
```

---

## SVG path (shape) decoration

```js
{
  id: "triangle-marker",
  path: "M 0 0 L 10 0 L 5 -10 Z",    // SVG path string (triangle)
  position: "topLeft",
  x_pos: 0, y_pos: 0,
  class_name: "warning-triangle"
}
```

```css
.warning-triangle {
  fill: #ff9800;
  stroke: none;
}
```

---

## JSX decoration

```jsx
import { WarningFilled } from "@carbon/react/icons";

canvasController.setNodeDecorations("node-123", [
  {
    id: "warning-icon",
    jsx: <WarningFilled size={16} fill="orange" />,
    position: "topRight",
    x_pos: -8, y_pos: -8,
    width: 16, height: 16,
    hotspot: true   // will call decorationActionHandler when clicked
  }
]);
```

Note: JSX decorations are **not** saved to the pipeline flow document.

---

## Clickable (hotspot) decorations

Set `hotspot: true` to make a decoration clickable. Then implement `decorationActionHandler`:

```jsx
<CommonCanvas
  decorationActionHandler={this.decorationActionHandler}
/>
```

```js
decorationActionHandler(node, decorationId, pipelineId) {
  if (decorationId === "warning-icon") {
    // open a warning details panel, etc.
    console.log("Warning clicked on node:", node.id);
  }
}
```

---

## Decorations in node layout (all nodes at once)

Add decorations to every node via `enableNodeLayout`:

```js
const config = {
  enableNodeLayout: {
    decorations: [
      {
        id: "exec-time",
        label: "",             // dynamically set later via setNodeDecorations
        position: "bottomRight",
        x_pos: -2, y_pos: -2,
        width: 50, height: 16,
        class_name: "exec-time-label"
      }
    ]
  }
};
```

Note: Decorations defined in `enableNodeLayout` are **not** saved to the pipeline flow.

---

## Link decorations — position along the line

For decorations on straight links, use `distance` to move along the link:

```js
{
  id: "midpoint-marker",
  position: "source",    // start from source end
  distance: 40,          // 40px along the line from source
  path: "M -5 -5 L 5 -5 L 5 5 L -5 5 Z",  // small square
  rotate: true           // rotate to match link angle
}
```
