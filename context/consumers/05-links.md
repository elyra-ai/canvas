# 05 — Links (Edges/Connections)

> **Full doc reference:** [elyra-ai.github.io/canvas/03.06.03-link-customization](https://elyra-ai.github.io/canvas/03.06.03-link-customization/)

---

## Link type (shape)

```js
const config = {
  enableLinkType: "Curve",  // "Curve" | "Elbow" | "Parallax" | "Straight"
};
```

| Value | Description | Best for |
|---|---|---|
| `"Curve"` | Smooth Bezier curves (default) | Data pipelines, ML workflows |
| `"Elbow"` | Right-angle connections | Network diagrams, architecture |
| `"Parallax"` | Parallel offset lines | Dense graphs |
| `"Straight"` | Straight diagonal lines | Flowcharts, decision trees |

→ [enableLinkType docs](https://elyra-ai.github.io/canvas/03.02.01-canvas-config/#enablelinktype)

---

## Link method (where links attach)

```js
const config = {
  enableLinkMethod: "Ports",     // "Ports" | "Freeform"
};
```

- `"Ports"` — links connect to specific input/output ports. Requires port definitions in the node.
- `"Freeform"` — links connect to the node body; ports are ignored. Use when ports are hidden.

> **Note:** When `enableLinkType` is `"Straight"`, freeform is enforced by default. Opt out with `enableStraightLinksAsFreeform: false`.

→ [enableLinkMethod docs](https://elyra-ai.github.io/canvas/03.02.01-canvas-config/#enablelinkmethod)

---

## Link direction (which side ports appear on)

```js
const config = {
  enableLinkDirection: "LeftRight", // "LeftRight" | "RightLeft" | "TopBottom" | "BottomTop"
};
```

- `"LeftRight"` — inputs on left, outputs on right (default)
- `"TopBottom"` — inputs on top, outputs on bottom (use for top-down flowcharts)

→ [enableLinkDirection docs](https://elyra-ai.github.io/canvas/03.02.01-canvas-config/#enablelinkdirection)

---

## Link selection

```js
const config = {
  enableLinkSelection: "None",  // "None" | "LinkOnly" | "Handles" | "Detachable"
};
```

| Value | Behavior |
|---|---|
| `"None"` | Links cannot be selected (default) |
| `"LinkOnly"` | Links can be selected |
| `"Handles"` | Selected links show drag handles to rewire connections |
| `"Detachable"` | Links can be fully detached from nodes and left floating on canvas |

→ [enableLinkSelection docs](https://elyra-ai.github.io/canvas/03.02.01-canvas-config/#enablelinkselection)

---

## Arrow heads

Arrow heads on data links are controlled by `enableCanvasLayout`:

```js
const config = {
  enableCanvasLayout: {
    dataLinkArrowHead: true,           // show default arrow head
    // OR custom SVG path:
    dataLinkArrowHead: "M 0 0 L -5 -2 -5 2 Z",  // filled triangle
  }
};
```

---

## Association links (non-directional)

For diagrams where links just show a relationship (no data flow direction):

```js
const config = {
  enableAssocLinkCreation: true,        // allow creating association links
  enableAssocLinkType: "Straight",      // "Straight" | "RightSideCurve"
};
```

→ [enableAssocLinkCreation docs](https://elyra-ai.github.io/canvas/03.02.01-canvas-config/#enableassoclinkcreation)

---

## Useful link behaviors

```js
const config = {
  // Replace existing link when connecting to an already-connected port:
  enableLinkReplaceOnNewConnection: true,

  // Insert a node by dropping it onto an existing link:
  enableInsertNodeDroppedOnLink: true,

  // Insert a node by dragging a link onto it:
  enableSplitLinkDroppedOnNode: true,

  // Allow self-referencing loops:
  enableSelfRefLinks: true,

  // Draw links above nodes:
  enableLinksOverNodes: false,

  // Highlight unavailable nodes when dragging a new link:
  enableHighlightUnavailableNodes: true,
};
```

---

## Link CSS classes

Links are SVG elements. Each link has a group `<g>` with these classes:

| Purpose | DOM tag | CSS class |
|---|---|---|
| Group | `g` | `d3-link-group` + one of: `d3-node-link`, `d3-object-link`, `d3-comment-link` |
| Selection area (invisible) | `path` | `d3-link-selection-area` |
| Link line | `path` | `d3-link-line` |
| Arrow head | `path` | `d3-link-line-arrow-head` |
| Decorations | `g` | `d3-link-decorations-group` |

Apply a class to a specific link:

```js
// Via API:
canvasController.setLinksClassName([linkId], "my-link-class");
canvasController.setLinkProperties(linkId, { class_name: "my-link-class" });

// In pipeline flow JSON:
link.app_data.ui_data.class_name = "my-link-class";
```

Then in CSS:
```css
/* Style all data links red */
.d3-node-link .d3-link-line {
  stroke: red;
  stroke-width: 2px;
}

/* Style a specific link class */
.my-link-class .d3-link-line {
  stroke: #ff6b35;
  stroke-dasharray: 6, 3;  /* dashed line */
}
```

→ Full SCSS reference: [svg-canvas-d3.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/common-canvas/src/common-canvas/svg-canvas-d3.scss)  
→ See [`06-colors-and-css.md`](./06-colors-and-css.md) for how to scope CSS to your app.

---

## Link data structure (from API)

```js
// Data link
{
  id: "link-abc",
  type: "nodeLink",
  srcNodeId: "node-1",
  srcNodePortId: "output-port-1",   // undefined = first output port
  trgNodeId: "node-2",
  trgNodePortId: "input-port-1",    // undefined = first input port
  decorations: [],
  app_data: { ui_data: { class_name: "my-class" } }
}

// Association link
{ id, type: "associationLink", srcNodeId, trgNodeId, decorations, app_data }

// Comment link
{ id, type: "commentLink", srcNodeId, trgNodeId, app_data }
```
