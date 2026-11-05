# 11 — Toolbar Configuration

> **Full doc reference:** [elyra-ai.github.io/canvas/03.02.02-toolbar-config](https://elyra-ai.github.io/canvas/03.02.02-toolbar-config/)

---

## Default toolbar

If you don't pass `toolbarConfig`, Common Canvas shows a sensible default toolbar with undo, redo, cut, copy, paste, delete, add comment, arrange, zoom in/out/fit.

---

## Custom toolbar

Pass `toolbarConfig` to `<CommonCanvas>` to replace the default:

```jsx
<CommonCanvas
  canvasController={canvasController}
  toolbarConfig={toolbarConfig}
/>
```

```js
import { Bookmark, Run, Stop } from "@carbon/react/icons";

const toolbarConfig = {
  leftBar: [
    { action: "undo",   label: "Undo" },
    { action: "redo",   label: "Redo" },
    { divider: true },
    { action: "cut",    label: "Cut" },
    { action: "copy",   label: "Copy" },
    { action: "paste",  label: "Paste" },
    { divider: true },
    { action: "deleteSelectedObjects", label: "Delete" },
    { action: "createAutoComment",     label: "Add Comment", enable: true },
    { divider: true },
    // Custom app action — handled in editActionHandler
    { action: "run-flow", label: "Run", enable: true, iconEnabled: (<Run size={32} />) },
  ],
  rightBar: [
    { action: "stop-flow", label: "Stop", enable: false, iconEnabled: (<Stop size={32} />) },
    // If rightBar is omitted, zoom-in/out/fit are added automatically.
    // If you provide rightBar, you must add zoom manually if you want it:
    { divider: true },
    { action: "zoomIn" },
    { action: "zoomOut" },
    { action: "zoomToFit" },
  ],
  size: "md"   // "sm" | "md" | "lg"
};
```

---

## Built-in action names (no icon needed — canvas provides them)

| action | Default icon | Auto enable/disable |
|---|---|---|
| `undo` | ↩ Undo | ✅ when stack has items |
| `redo` | ↪ Redo | ✅ when stack has items |
| `cut` | Scissors | ✅ when objects selected |
| `copy` | Copy | ✅ when objects selected |
| `paste` | Paste | ✅ when clipboard has items |
| `deleteSelectedObjects` | Trash | ✅ when objects selected |
| `createAutoComment` | Comment | always enabled |
| `arrangeHorizontally` | — | always enabled |
| `arrangeVertically` | — | always enabled |
| `zoomIn` | + | always enabled |
| `zoomOut` | - | always enabled |
| `zoomToFit` | Fit | always enabled |

> **Auto enable/disable:** By default Common Canvas manages enable/disable state for these standard actions. Set `overrideAutoEnableDisable: true` to control it yourself via the `enable` field.

---

## Handle custom toolbar actions

When a user clicks your custom action button, `editActionHandler` is called with `data.editType` set to your action name:

```js
editActionHandler(data, command) {
  if (data.editType === "run-flow") {
    this.executeFlow(this.canvasController.getPipelineFlow());
  }
  if (data.editType === "my-bookmark") {
    this.saveBookmark();
  }
}
```

---

## Toolbar action object — all fields

```js
{
  action: "my-action",         // required — unique string ID
  label: "My Action",          // tooltip text (or shown next to icon if incLabelWithIcon set)
  enable: true,                // boolean — enabled/disabled state
  iconEnabled: (<MyIcon />),   // JSX or "/path/to/icon.svg"
  iconDisabled: (<MyIcon />),  // optional — falls back to iconEnabled if omitted
  incLabelWithIcon: "after",   // "no" | "before" | "after" | "label-only"
  kind: "default",             // "default" | "primary" | "secondary" | "danger" | "ghost"
  tooltip: "Runs the flow",    // overrides label as tooltip if provided
  isSelected: false,           // true = shows selection highlight (for toggle buttons)
  className: "my-btn-class",   // extra CSS class on the button div
  textContent: "3",            // badge text overlaid on the icon (e.g. message count)
}
```

---

## Divider

```js
{ divider: true }
```

---

## Sub-menu (dropdown list from toolbar button)

```js
import { TextScale } from "@carbon/react/icons";

{
  action: "text-size",
  label: "Text Size",
  enable: true,
  iconEnabled: (<TextScale size={32} />),
  incLabelWithIcon: "after",
  closeSubAreaOnClick: true,   // close menu after a choice is made
  subMenu: [
    { action: "size-sm", label: "Small",  enable: true },
    { action: "size-md", label: "Medium", enable: true },
    { action: "size-lg", label: "Large",  enable: true },
  ]
}
```

---

## Sub-panel (custom React component under toolbar button)

```js
import { Settings } from "@carbon/react/icons";
import MySettingsPanel from "./my-settings-panel";

{
  action: "settings",
  label: "Settings",
  enable: true,
  iconEnabled: (<Settings />),
  subPanel: MySettingsPanel,
  subPanelData: {              // passed as props to your panel component
    onSave: (settings) => this.applySettings(settings)
  }
}
```

---

## Dual-purpose button (icon click + chevron for sub-panel)

```js
{
  action: "undo",
  label: "Undo",
  enable: true,
  purpose: "dual",             // left side = action, right chevron = sub-panel
  subPanel: UndoHistoryPanel,
  subPanelData: {}
}
```

---

## Notification panel button (auto-added)

If you pass `notificationConfig` to `<CommonCanvas>`, a bell icon is automatically added to the right of the toolbar. To customize its position or appearance, include it explicitly:

```js
import { Notification } from "@carbon/react/icons";

toolbarConfig.leftBar.push(
  { action: "toggleNotificationPanel", iconEnabled: (<Notification />), label: "Alerts" }
);
```

→ [notificationConfig docs](https://elyra-ai.github.io/canvas/03.02.03-notification-config/)

---

## Notification config (wire up the panel)

```js
const notificationConfig = {
  action: "notification",
  label: "Notifications",
  enable: true,
  notificationHeader: "Pipeline Messages",
  emptyMessage: "No notifications yet.",
  clearAllMessage: "Clear all",
  keepOpen: false,
  clearAllCallback: () => canvasController.clearNotificationMessages()
};

// Then add messages programmatically:
canvasController.setNotificationMessages([
  {
    id: "err-1",
    type: "error",        // "info" | "success" | "warning" | "error"
    title: "Missing input",
    content: "Node 'Filter' has no connected input.",
    timestamp: new Date().toLocaleTimeString(),
    callback: () => canvasController.setSelections(["node-filter-001"])
  }
]);
```

→ [Notification messages docs](https://elyra-ai.github.io/canvas/03.04.05-notification-messages/)
