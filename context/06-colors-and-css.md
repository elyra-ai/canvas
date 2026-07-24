# 06 — Colors & CSS Customization

> **Full doc reference:** [elyra-ai.github.io/canvas/03.04.06-styling-objects](https://elyra-ai.github.io/canvas/03.04.06-styling-objects/)
> **SCSS source (every class):** [svg-canvas-d3.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/common-canvas/src/common-canvas/svg-canvas-d3.scss)

---

## How CSS scoping works

The most important pattern: use `enableParentClass` to scope all your overrides so they win over default canvas styles:

```js
const config = {
  enableParentClass: "my-app",   // adds this class to CommonCanvas's root element
};
```

Then prefix all your CSS with `.my-app`:

```css
/* Without scoping — may be overridden by canvas defaults */
.d3-node-body-outline { fill: orange; }

/* With scoping — wins every time */
.my-app .d3-node-body-outline { fill: orange; }
```

---

## Carbon themes

Wrap in a `<Theme>` to switch the entire UI between Carbon color themes:

```jsx
import { Theme } from "@carbon/react";

// options: "white" (default), "g10" (light gray), "g90" (dark), "g100" (darkest)
<Theme theme="g10">
  <CommonCanvas canvasController={canvasController} />
</Theme>
```

---

## Node CSS classes

| Purpose | CSS class |
|---|---|
| Node group (top-level) | `d3-node-group` |
| Selection highlight rect | `d3-node-selection-highlight` |
| Node body outline shape | `d3-node-body-outline` |
| Node icon | `d3-node-image` |
| Label container | `d3-foreign-object-node-label` |
| Input port group | `d3-node-port-input` |
| Output port group | `d3-node-port-output` |
| Decorations group | `d3-node-decorations-group` |
| Branch highlight state | `d3-branch-highlight` |

---

## Link CSS classes

| Purpose | CSS class |
|---|---|
| Link group | `d3-link-group` |
| Data link (node-to-node) | `d3-node-link` |
| Association link | `d3-object-link` |
| Comment-to-node link | `d3-comment-link` |
| Link visible line | `d3-link-line` |
| Arrow head | `d3-link-line-arrow-head` |

---

## Color a single node

```js
// Method 1 — assign a CSS class name via API
canvasController.setNodeProperties("node-123", { class_name: "error-node" });

// Method 2 — inline style via API
canvasController.setObjectsStyle(
  [{ pipelineId: "pipeline-1", objId: "node-123" }],
  { body: { default: "fill: #ffcccc; stroke: red;" } },
  true  // temporary = true (not saved to pipeline flow)
);
```

```css
/* Method 1 CSS */
.my-app .error-node .d3-node-body-outline {
  fill: #ffcccc;
  stroke: #cc0000;
  stroke-width: 2px;
}
```

---

## Color multiple nodes at once

```js
canvasController.setNodesClassName(["node-1", "node-2", "node-3"], "warning-node");
```

---

## Color a single link

```js
canvasController.setLinksClassName(["link-abc"], "active-link");
```

```css
.my-app .active-link .d3-link-line {
  stroke: #00aa00;
  stroke-width: 3px;
}
```

---

## Inline style API — style spec object

Use `setObjectsStyle` for runtime-only styling (e.g. execution status highlighting). The style spec shape varies by object type:

```js
// NODE style spec
const nodeStyle = {
  body:             { default: "fill: #e8f5e9; stroke: #4caf50;", hover: "fill: #c8e6c9;" },
  image:            { default: "opacity: 0.5;" },
  label:            { default: "fill: #1b5e20;" },
  selection_outline:{ default: "stroke: #4caf50;" }
};

// COMMENT style spec
const commentStyle = {
  body:             { default: "fill: #fffde7; stroke: #f9a825;", hover: "fill: #fff9c4;" },
  text:             { default: "fill: #333;" },
  selection_outline:{ default: "stroke: #f9a825;" }
};

// LINK style spec
const linkStyle = {
  line: { default: "stroke: #4caf50; stroke-width: 2px;", hover: "stroke: #388e3c;" }
};
```

Apply them:
```js
// Single object
canvasController.setObjectsStyle(
  { "pipeline-id": ["node-1", "node-2"] },  // note: keyed by pipelineId
  nodeStyle,
  true   // true = temporary (not saved to flow); false = permanent
);

// Multiple objects with different styles at once
canvasController.setObjectsMultiStyle([
  { pipelineId: "pipeline-id", objId: "node-1", style: nodeStyle },
  { pipelineId: "pipeline-id", objId: "node-2", style: { body: { default: "fill: red;" } } }
], true);

// Style links
canvasController.setLinksStyle(
  { "pipeline-id": ["link-1"] },
  linkStyle,
  true
);
canvasController.setLinksMultiStyle([
  { pipelineId: "pipeline-id", linkId: "link-1", style: linkStyle }
], true);

// Remove all temporary styles
canvasController.removeAllStyles(true);
```

> ⚠️ **CSP note:** `setObjectsStyle` applies inline styles. Your Content Security Policy must include `'unsafe-inline'` in `style-src` if you use these methods.

→ [Styling objects docs](https://elyra-ai.github.io/canvas/03.04.06-styling-objects/)

---

## Branch highlighting

When the user chooses "Highlight" from a node's context menu, Common Canvas adds `d3-branch-highlight` to nodes and links in the branch:

```css
/* Override default branch highlight colors */
.my-app .d3-node-group.d3-branch-highlight .d3-node-body-outline {
  stroke: #6366f1;
  stroke-width: 2px;
}

.my-app .d3-node-link.d3-branch-highlight .d3-link-line {
  stroke: #6366f1;
}
```

---

## Comment CSS classes

| Purpose | DOM tag | CSS class |
|---|---|---|
| Comment group | `g` | `d3-comment-group` |
| Sizing area | `path` | `d3-comment-sizing` |
| Selection highlight | `path` | `d3-comment-selection-highlight` |
| Comment body/background | `path` | `d3-comment-rect` |
| Text container | `foreignObject` | `d3-foreign-object-comment-text` |
| Decorations | `g` | `d3-comment-decorations-group` |

```css
.my-app .d3-comment-rect {
  fill: #fffde7;
  stroke: #f9a825;
}
.my-app .d3-foreign-object-comment-text div {
  color: #333;
  font-style: italic;
}
```

Assign class to a comment:
```js
canvasController.setCommentProperties(commentId, { class_name: "my-comment-class" });
canvasController.setCommentsClassName([commentId], "my-comment-class");
```

---

## Read-only / locked canvas CSS

When `enableEditingActions: false` is set, Common Canvas adds `config-edit-actions-false` to the root div. Use it to style disabled state:

```css
.config-edit-actions-false .d3-node-group .d3-node-label {
  color: #999;
}
.config-edit-actions-false .d3-link-line {
  stroke: #ccc;
}
```

→ See [`12-advanced.md`](./12-advanced.md) for the full read-only canvas guide.
