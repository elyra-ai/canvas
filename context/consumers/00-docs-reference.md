# 00 — Docs Reference Map

> **For AI agents:** When you need more detail than the context files provide, fetch the relevant URL below directly. All pages are publicly available at `https://elyra-ai.github.io/canvas/`.

The context files cover the most common patterns. For edge cases, full API signatures, or exhaustive option lists — fetch the exact doc page below.

---

## Base URL

```
https://elyra-ai.github.io/canvas/
```

---

## Full reference map

| Topic | Fetch this URL |
|---|---|
| **Setup & Install** | https://elyra-ai.github.io/canvas/02-set-up/ |
| **Localization / IntlProvider** | https://elyra-ai.github.io/canvas/02.01-localization/ |
| **Getting started / CommonCanvas props** | https://elyra-ai.github.io/canvas/03-common-canvas/ |
| **Canvas config — ALL options** | https://elyra-ai.github.io/canvas/03.02.01-canvas-config/ |
| **Toolbar config** | https://elyra-ai.github.io/canvas/03.02.02-toolbar-config/ |
| **Notification config** | https://elyra-ai.github.io/canvas/03.02.03-notification-config/ |
| **Context menu config** | https://elyra-ai.github.io/canvas/03.02.04-context-menu-config/ |
| **Keyboard config** | https://elyra-ai.github.io/canvas/03.02.05-keyboard-config/ |
| **All callbacks overview** | https://elyra-ai.github.io/canvas/03.03-callbacks/ |
| **contextMenuHandler** | https://elyra-ai.github.io/canvas/03.03.01-context-menu-handler/ |
| **beforeEditActionHandler** | https://elyra-ai.github.io/canvas/03.03.02-before-edit-action-handler/ |
| **editActionHandler** | https://elyra-ai.github.io/canvas/03.03.03-edit-action-handler/ |
| **layoutHandler** | https://elyra-ai.github.io/canvas/03.03.04-layout-handler/ |
| **decorationActionHandler** | https://elyra-ai.github.io/canvas/03.03.05-decoration-action-handler/ |
| **tipHandler** | https://elyra-ai.github.io/canvas/03.03.06-tip-handler/ |
| **idGeneratorHandler** | https://elyra-ai.github.io/canvas/03.03.07-id-generator-handler/ |
| **selectionChangeHandler** | https://elyra-ai.github.io/canvas/03.03.08-selection-change-handler/ |
| **clickActionHandler** | https://elyra-ai.github.io/canvas/03.03.09-click-action-handler/ |
| **actionLabelHandler** | https://elyra-ai.github.io/canvas/03.03.10-action-label-handler/ |
| **Canvas Controller — full API** | https://elyra-ai.github.io/canvas/03.04-canvas-controller/ |
| **Decorations API** | https://elyra-ai.github.io/canvas/03.04.01-decorations/ |
| **API object structure** | https://elyra-ai.github.io/canvas/03.04.02-api-object-structure/ |
| **Creating nodes programmatically** | https://elyra-ai.github.io/canvas/03.04.03-creating-new-canvas-nodes/ |
| **Notification messages** | https://elyra-ai.github.io/canvas/03.04.05-notification-messages/ |
| **Styling objects (style spec)** | https://elyra-ai.github.io/canvas/03.04.06-styling-objects/ |
| **Keyboard shortcuts** | https://elyra-ai.github.io/canvas/03.05-keyboard-support/ |
| **Palette customization** | https://elyra-ai.github.io/canvas/03.06.00-palette-customization/ |
| **Node customization — ALL layout fields** | https://elyra-ai.github.io/canvas/03.06.01-node-customization/ |
| **Comment customization** | https://elyra-ai.github.io/canvas/03.06.02-comment-customization/ |
| **Link customization** | https://elyra-ai.github.io/canvas/03.06.03-link-customization/ |
| **Flow editor / background grid** | https://elyra-ai.github.io/canvas/03.06.04-flow-editor-customization/ |
| **Panels (flyout, top, bottom)** | https://elyra-ai.github.io/canvas/03.06.05-panels-customization/ |
| **External drag-and-drop** | https://elyra-ai.github.io/canvas/03.07-external-objects/ |
| **External pipeline flows** | https://elyra-ai.github.io/canvas/03.08-external-pipeline-flows/ |
| **Read-only / locked canvas** | https://elyra-ai.github.io/canvas/03.09-read-only-or-locked-flows/ |
| **Command stack / custom commands** | https://elyra-ai.github.io/canvas/03.10-command-stack/ |
| **All internal action names (editType)** | https://elyra-ai.github.io/canvas/03.11-internal-actions/ |
| **Node properties management** | https://elyra-ai.github.io/canvas/03.12-node-properties-management/ |
| **Accessibility** | https://elyra-ai.github.io/canvas/03.13-accessibility/ |
| **CommonProperties (properties panel)** | https://elyra-ai.github.io/canvas/04-common-properties/ |
| **FAQ** | https://elyra-ai.github.io/canvas/05-faq/ |

---

## Pipeline flow & palette schemas

These define the exact JSON structure for flows and palettes:

| Schema | URL |
|---|---|
| Pipeline flow v3 | https://github.com/elyra-ai/pipeline-schemas/blob/main/common-pipeline/pipeline-flow/pipeline-flow-v3-schema.json |
| Pipeline flow UI v3 | https://github.com/elyra-ai/pipeline-schemas/blob/main/common-pipeline/pipeline-flow/pipeline-flow-ui-v3-schema.json |
| Palette v3 | https://github.com/elyra-ai/pipeline-schemas/blob/main/common-canvas/palette/palette-v3-schema.json |

---

## All node layout field defaults

The single most useful file to fetch when customising node appearance — contains every layout field with its default value:

```
https://github.com/elyra-ai/canvas/blob/main/canvas_modules/common-canvas/src/object-model/layout-dimensions.js
```

---

## Real example apps (source code)

When you need a complete working example of a specific canvas style:

| Example | Source URL |
|---|---|
| Logic / decision tree | https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/src/client/components/custom-canvases/logic/logic-canvas.jsx |
| Network diagram | https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/src/client/components/custom-canvases/network/network-canvas.jsx |
| Stages / swimlanes | https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/src/client/components/custom-canvases/stages/stages-canvas.jsx |
| React component nodes | https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/src/client/components/custom-canvases/react-nodes-carbon/react-nodes-carbon-canvas.jsx |
| Read-only canvas | https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/src/client/components/custom-canvases/read-only/read-only-canvas.jsx |
| All link types demo | https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/src/client/components/custom-canvases/link-types/link-types-canvas.jsx |
| Minimal (tiny) app | https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/src/client/app-tiny.tsx |
| Small app (more options) | https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/src/client/app-small.js |

---

## How to use this as an AI agent

When a user asks about something not fully covered in the context files:

1. Find the relevant URL in the table above
2. Fetch the page
3. Use it to answer precisely — don't hallucinate API details

Example: user asks "what are all the options for `enableLinkSelection`?" → fetch `https://elyra-ai.github.io/canvas/03.02.01-canvas-config/` and search for `enableLinkSelection`.
