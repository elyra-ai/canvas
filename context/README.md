# @elyra/canvas — AI Context

> **How to use this folder**
> Copy the contents of this `context/` folder into your project (or paste individual files into your AI chat).
> Then tell your AI assistant: _"I am building a canvas app with @elyra/canvas. Use the context files I've shared."_
> The AI will ask what kind of canvas you need and guide you from zero to running in hours.

---

## What is @elyra/canvas?

`@elyra/canvas` is a React component library for building **visual flow editors** — think pipeline builders, workflow designers, network diagrams, logic trees, and similar node-link UIs.

- **Package:** [npmjs.com/package/@elyra/canvas](https://www.npmjs.com/package/@elyra/canvas)
- **Full docs:** [elyra-ai.github.io/canvas](https://elyra-ai.github.io/canvas/)
- **Live demo / test harness:** [elyra-canvas-test-harness](https://elyra-canvas-test-harness.u20youmx4sm.us-south.codeengine.appdomain.cloud/)

It delivers two decoupled React components:

| Component | Purpose |
|---|---|
| `<CommonCanvas>` | Visual flow editor — nodes, links, palette, toolbar, context menus |
| `<CommonProperties>` | Dynamic properties panel driven by a JSON schema |

This context focuses on **CommonCanvas** (the flow editor).

---

## Files in this folder

| File | What it covers |
|---|---|
| `starter-palette.json` | ⭐ **Drop-in palette** — 3 categories, 6 node types, self-contained SVG icons (no server needed) |
| `starter-flow.json` | ⭐ **Drop-in flow** — 3 pre-connected nodes ready to display immediately |
| `01-setup.md` | Install, peer deps, CSS, fonts |
| `02-quick-start.md` | Minimal working app + 6-step guide |
| `03-canvas-types.md` | **Start here to pick your canvas style** — the AI will ask questions and point you to the right config |
| `04-nodes.md` | Node layout, shapes, SVG/JSX images, ports, resizing |
| `05-links.md` | Link types (Curve/Elbow/Straight), methods, selection, detachable |
| `06-colors-and-css.md` | Theming, CSS class overrides, per-node/per-link coloring |
| `07-decorations.md` | Badges, icons, labels, shapes on nodes/links/comments |
| `08-callbacks.md` | editActionHandler, clickActionHandler, contextMenuHandler, all editType values |
| `09-canvas-controller-api.md` | Programmatic control — add/remove nodes, get flow, **undo/redo**, custom commands |
| `10-examples.md` | Real config snippets from the official examples |
| `11-toolbar.md` | Custom toolbar, built-in action names, sub-menus, sub-panels, notification panel |
| `12-advanced.md` | Read-only canvas, keyboard shortcuts, flyout panels, schema validation, markdown comments |

---

## Suggested AI prompt to get started

Paste this into your AI chat along with the context files:

```
I want to build a visual canvas app using @elyra/canvas (React).
I've included the context files from the elyra-canvas context folder.

Please ask me:
1. What kind of canvas do I need? (pipeline/workflow, network diagram, logic/decision tree, free-form, other)
2. What do the nodes represent in my use case?
3. Do I need custom node shapes or colors?
4. What link style do I want? (curved, elbow, straight)
5. Do I need a palette (sidebar with draggable node types)?

Then generate a minimal working React component I can run immediately.
```

---

## Key concepts (quick mental model)

```
<CommonCanvas>
  ├── canvasController    ← required — the brains (JS class, not a React component)
  ├── config              ← optional — controls node format, link type, toolbar, zoom, etc.
  ├── [handlers]          ← optional callbacks — editAction, click, contextMenu, layout...
  └── [panels]            ← optional — left/right flyout, top/bottom panels
```

The **`CanvasController`** manages all data:
- `setPipelineFlow(json)` — loads a saved flow
- `setPipelineFlowPalette(json)` — loads node types into the palette
- `getPipelineFlow()` — saves the current flow back to JSON

Everything on the canvas is ultimately stored in a **pipeline flow JSON document** which conforms to the [pipeline-flow schema](https://github.com/elyra-ai/pipeline-schemas/tree/main/common-pipeline/pipeline-flow).

---

## Need more detail?

These context files are a curated on-ramp — they cover the most common patterns and point to the right doc sections.

For the **complete API reference**, the full documentation source lives alongside these files in the same repo:

- **Docs site:** [elyra-ai.github.io/canvas](https://elyra-ai.github.io/canvas/)
- **Docs source (Markdown):** [`docs/pages/`](https://github.com/elyra-ai/canvas/tree/main/docs/pages/) in this repo

When your AI needs deeper detail on a specific topic, point it at the relevant file in `docs/pages/` — for example:
- Full canvas config options → `docs/pages/03.02.01-canvas-config.md`
- Full Canvas Controller API → `docs/pages/03.04-canvas-controller.md`
- All node layout fields → `docs/pages/03.06.01-node-customization.md`
