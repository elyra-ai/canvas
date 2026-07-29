# Canvas Studio

Canvas Studio is a no-code UI builder added to the Elyra Canvas test harness. It lets non-technical users visually create palette nodes, configure node property forms, and tune canvas settings — without writing any JSON.

**URL:** `http://localhost:3001/#/studio` 
**Entry point:** Click the Canvas Studio button (window icon) in the top-right of the main harness navbar.

---

## How much can the Studio cover?

The CommonProperties `parameterDef` JSON format is a specification of approximately 200 distinct features. The Studio currently covers a specific subset of those features. The table below shows the full scope:

| Category | Total in format | Studio covers |
|---|---|---|
| Top-level paramDef keys | 9 | 7 (`titleDefinition`, `current_parameters`, `parameters`, `uihints`, `conditions`, `resources`, `group_info` via layout) |
| Parameter types | 8 (`string`, `integer`, `double`, `boolean`, `date`, `time`, `timestamp`, `custom`) | 7 (all except `custom`) |
| Control types | 33 | 9 auto-mapped from type (`textfield`, `numberfield`, `toggletext`, `oneofselect`, `textarea`, `expression`, `datepicker`, `timepicker`, `datetimepicker`) |
| `parameter_info` fields | 42+ | 9 (`label`, `description`, `control_type`, `action_ref`, `place_holder_text`, `helper_text`, `char_limit`, `read_only`, auto) |
| Group/panel types | 14 | 2 (`controls` flat, `tabs`) |
| Condition types | 7 | 3 (`validation`, `enabled`, `visible`) |
| Condition operators | 24+ | 10 (`isNotEmpty`, `isEmpty`, `equals`, `notEquals`, `greaterThan`, `lessThan`, `contains`, `notContains`, `startsWith`, `endsWith`) |
| Action types | 3 (`button`, `image`, `custom`) | 2 (`image`, `button`) |
| Action fields | 9 | 8 (`id`, `label`, `description`, `control`, `image.url`, `image.placement`, `image.size`, `data.parameter_ref`) |

**What's not yet in the Studio** (features in the format that need manual JSON for now): complex types, column selection controls, dataset metadata, and custom controls/actions.

---

## Files Added / Modified

### New files

Most new files live under `canvas_modules/harness/src/client/components/studio/`. The stylesheet is at `canvas_modules/harness/src/styles/studio.scss`.

| File | Purpose |
|------|---------|
| `StudioPage.jsx` | Root page — holds all state, 3-column layout, header with Import/Export |
| `palette-builder/PaletteBuilder.jsx` | Category list with expand/collapse, add/delete |
| `palette-builder/CategoryForm.jsx` | Form for one category's label, description, icon, open-state |
| `palette-builder/NodeTypeForm.jsx` | Form for one node type's label, op, description, icon |
| `palette-builder/PortsEditor.jsx` | Dynamic rows for input/output ports (label + cardinality) |
| `palette-builder/IconPicker.jsx` | Tab grid of SVGs from `assets/images/` + custom URL tab |
| `properties-builder/PropertiesBuilder.jsx` | Node selector, titleDefinition, parameter list, ActionsBuilder, ConditionsBuilder, GroupBuilder, ResourcesEditor |
| `properties-builder/ParameterForm.jsx` | Form for one parameter's label, id, description, type, required, default, placeholder, helper text, char limit, read-only, action_ref, enum values |
| `properties-builder/ConditionsBuilder.jsx` | Rule builder — validation errors, enabled/disabled fields, show/hide fields |
| `properties-builder/ActionsBuilder.jsx` | Action builder — image/icon or button type, id, label, tooltip, image URL, placement, size |
| `properties-builder/GroupBuilder.jsx` | Layout selector (flat / tabs) and tab group definitions |
| `properties-builder/ResourcesEditor.jsx` | Key/value editor for localization resource strings |
| `properties-builder/PropertiesPreview.jsx` | Live `<CommonProperties>` render of the generated paramDef |
| `preview/StudioCanvas.jsx` | Live `<CommonCanvas>` with its own CanvasController and config toggles |
| `utils/palette-generator.js` | Pure function: form state → palette v3.0 JSON |
| `utils/properties-generator.js` | Pure function: form state → CommonProperties parameterDef JSON |
| `src/styles/studio.scss` | All Studio styles |

### Modified files

| File | Change |
|------|--------|
| `src/client/index.js` | Added `<Route exact path="/studio" component={StudioPage} />` |
| `src/client/App.js` | Added Studio button to `rightBar` in `getNavigationBar()` + `case "studio"` in `toolbarActionHandler` |
| `assets/styles/harness.scss` | Added `@forward "../../src/styles/studio.scss"` |

---

## UI ↔ JSON ↔ Old Harness Parallel

### 1. Palette Builder → Palette JSON

**Old harness:** Users picked a file from the "Pipeline Flow file" dropdown in the side panel (`sidepanel-canvas.jsx`), or uploaded their own `.json` file. Those files live in `test_resources/palettes/` (e.g. `commonPalette.json`, `carbonPalette.json`).

**New Studio:** The Palette Builder forms write to `StudioPage` state. `palette-generator.js` converts that state to the identical JSON structure on every render and feeds it live to the canvas.

#### CategoryForm → `categories[]`

| UI control | JSON field |
|------------|-----------|
| "Category Label" TextInput | `categories[].label` |
| "Description" TextInput | `categories[].description` |
| IconPicker selection | `categories[].image` |
| "Open by default" Toggle | `categories[].is_open` |
| *(slugified from label)* | `categories[].id` |

#### NodeTypeForm → `categories[].node_types[]`

| UI control | JSON field |
|------------|-----------|
| "Label" TextInput | `node_types[].app_data.ui_data.label` |
| "Operation ID (op)" TextInput | `node_types[].op` |
| "Description" TextInput | `node_types[].app_data.ui_data.description` |
| IconPicker selection | `node_types[].app_data.ui_data.image` |
| *(always set)* | `node_types[].type = "execution_node"` |
| *(internal studioId)* | `node_types[].id` |

#### PortsEditor → `inputs[]` / `outputs[]`

| UI control | JSON field |
|------------|-----------|
| "Label" TextInput | `inputs[]/outputs[].app_data.ui_data.label` |
| "Min" number input | `inputs[]/outputs[].app_data.ui_data.cardinality.min` |
| "Max" number input | `inputs[]/outputs[].app_data.ui_data.cardinality.max` |
| *(uuid)* | `inputs[]/outputs[].id` |

---

### 2. Properties Builder → Common Properties parameterDef JSON

**Old harness:** Users picked a file from the "Parameter Defs file" dropdown in the Properties side panel, or uploaded their own. Files live in `test_resources/parameterDefs/`.

**New Studio:** All form fields write to `StudioPage.state.paramDefs[nodeStudioId]`. `properties-generator.js` converts that state to the identical JSON that `<CommonProperties propertiesInfo={{ parameterDef }}>` consumes.

#### Dialog Title (titleDefinition section)

| UI control | JSON field |
|------------|-----------|
| "Title" TextInput | `titleDefinition.title` |
| "Title editable by user" Toggle | `titleDefinition.editable` |

#### ParameterForm → `parameters[]` + `uihints.parameter_info[]`

| UI control | JSON field |
|------------|-----------|
| "Display Label" TextInput | `uihints.parameter_info[].label.default` |
| "Field ID" TextInput | `parameters[].id`, `parameter_info[].parameter_ref`, key in `current_parameters` |
| "Description" TextInput | `uihints.parameter_info[].description.default` *(omitted if blank)* |
| "Type" → `string` | `parameters[].type = "string"`, `control_type = "textfield"` |
| "Type" → `integer` | `parameters[].type = "integer"`, `control_type = "numberfield"` |
| "Type" → `double` | `parameters[].type = "double"`, `control_type = "numberfield"` |
| "Type" → `boolean` | `parameters[].type = "boolean"`, `control_type = "toggletext"` |
| "Type" → `enum` | `parameters[].type = "string"`, `parameters[].enum[]`, `control_type = "oneofselect"` |
| "Type" → `textarea` | `parameters[].type = "string"`, `control_type = "textarea"` |
| "Type" → `expression` | `parameters[].type = "string"`, `control_type = "expression"` |
| "Type" → `date` | `parameters[].type = "date"`, `control_type = "datepicker"` |
| "Type" → `time` | `parameters[].type = "time"`, `control_type = "timepicker"` |
| "Type" → `timestamp` | `parameters[].type = "timestamp"`, `control_type = "datetimepicker"` |
| "Required" Toggle | `parameters[].required` |
| "Default value" TextInput | `current_parameters[id]` *(hidden for boolean and enum)* |
| "Placeholder text" TextInput | `uihints.parameter_info[].place_holder_text.default` *(omitted if blank; hidden for boolean and enum)* |
| "Helper text" TextInput | `uihints.parameter_info[].helper_text.default` *(omitted if blank)* |
| "Character limit" number input | `uihints.parameter_info[].char_limit` *(omitted if 0; shown for string/textarea/expression only)* |
| "Read-only" Toggle | `uihints.parameter_info[].read_only` *(omitted if false)* |
| "Action" Select | `uihints.parameter_info[].action_ref` *(omitted if none; only shown when actions exist)* |
| Enum option rows | `parameters[].enum[]` *(only shown when type = enum)* |

#### ActionsBuilder → `uihints.action_info[]`

| UI control | JSON field |
|------------|-----------|
| "Action type" Select | `action_info[].control` (`"image"` or `"button"`) |
| "Action ID" TextInput | `action_info[].id` |
| "Label" TextInput | `action_info[].label.default` |
| "Description" TextInput | `action_info[].description.default` |
| "Image URL" TextInput *(image type only)* | `action_info[].image.url` |
| "Placement" Select *(image type only)* | `action_info[].image.placement` (`"right"` or `"left"`) |
| "Width" number input *(image type only)* | `action_info[].image.size.width` |
| "Height" number input *(image type only)* | `action_info[].image.size.height` |
| "Parameter ref" TextInput *(button type only)* | `action_info[].data.parameter_ref` *(omitted if blank)* |

#### ConditionsBuilder → `conditions[]`

Each condition row produces one of three JSON shapes depending on the "Condition type" Select:

**Validation error** (`conditionType = "validation"`):

| UI control | JSON field |
|------------|-----------|
| "Condition type" Select | selects `conditions[].validation` shape |
| "Parameter" Select | `validation.fail_message.focus_parameter_ref` and `evaluate.condition.parameter_ref` |
| "Rule" Select | `validation.evaluate.condition.op` |
| "Value" TextInput *(shown for comparison ops)* | `validation.evaluate.condition.value` |
| "Error message" TextInput | `validation.fail_message.message.default` |
| *(always set)* | `fail_message.type = "error"` |

**Enable / disable a field** (`conditionType = "enabled"`) or **Show / hide a field** (`conditionType = "visible"`):

| UI control | JSON field |
|------------|-----------|
| "Condition type" Select | selects `conditions[].enabled` or `conditions[].visible` shape |
| "Enable/Show this field" Select | `enabled.parameter_refs[0]` / `visible.parameter_refs[0]` |
| "When this parameter" Select | `enabled.evaluate.condition.parameter_ref` |
| "Rule" Select | `enabled.evaluate.condition.op` |
| "Value" TextInput *(shown for comparison ops)* | `enabled.evaluate.condition.value` |

#### GroupBuilder → `uihints.group_info[]`

| UI control | JSON field |
|------------|-----------|
| "Panel layout" Select → `flat` | `group_info: [{ id: "main-group", type: "controls", parameter_refs: [...all params] }]` |
| "Panel layout" Select → `tabs` | `group_info: [{ id: "main-tabs", type: "tabs", group_info: [...tabs] }]` |
| Tab "Tab label" TextInput | `group_info[].group_info[].label.default` |
| Tab parameter checkboxes | `group_info[].group_info[].parameter_refs[]` |

#### ResourcesEditor → `resources{}`

| UI control | JSON field |
|------------|-----------|
| "Key" TextInput | key in `resources` object |
| "Value" TextInput | value in `resources` object |

---

### 3. Canvas Config Toggles → `canvasConfig` prop

**Old harness:** The "Common Canvas Options" side panel (`sidepanel-canvas.jsx`) had `RadioButtonGroup`, `Toggle`, and `Select` controls that each called `setStateValue()` to update `App.js` state.

**New Studio:** The config row at the top of the canvas preview column does the same thing, calling `StudioPage.handleCanvasConfigChange(key, value)`.

| Studio UI control | `canvasConfig` key | Old harness equivalent |
|-------------------|--------------------|----------------------|
| "Snap" Select | `enableSnapToGridType` | "Snap to Grid" RadioButtonGroup |
| "Links" Select | `enableLinkType` | "Link Type" RadioButtonGroup |
| "Direction" Select | `enableLinkDirection` | "Link Direction" RadioButtonGroup |
| "Method" Select | `enableLinkMethod` | "Link Method" RadioButtonGroup |
| "Narrow palette" Toggle | `enableNarrowPalette` | "Narrow Palette" Toggle |

---

### 4. Live Canvas Preview → CanvasController

**Old harness:** `App.js` held a single `CanvasController`. When the user selected a palette file, it called `this.canvasController.setPipelineFlowPalette(json)`.

**New Studio:** `StudioCanvas.jsx` owns its own `CanvasController` (created in constructor, same pattern as `flows-canvas.jsx`). `componentDidUpdate` detects when `paletteJSON` prop changed and calls `setPipelineFlowPalette` again.

```
Old harness                              New Studio
────────────────────────────────         ──────────────────────────────────
User picks file from dropdown       →    User edits a form field
↓                                        ↓
FormsService fetches JSON from       →    palette-generator.js converts
test_resources/palettes/                  StudioPage state to JSON
↓                                        ↓
canvasController                    →    canvasController
  .setPipelineFlowPalette(json)            .setPipelineFlowPalette(json)
↓                                        ↓
CommonCanvas re-renders palette      →    CommonCanvas re-renders palette
```

Double-clicking a node on the canvas opens its configured properties panel in the right flyout via `properties-generator.js`.

---

### 5. Export / Import → JSON bundle

**Old harness:** JSON files in `test_resources/` were static files. To create a new configuration you had to write it by hand.

**New Studio:** "Export JSON" downloads `studio-config.json`. The exported `palette` block is identical in format to any file in `test_resources/palettes/` and can be used directly in the existing harness dropdown.

```json
{
  "version": "1.0",
  "studio": {
    "categories": [...],
    "paramDefs": { "<nodeStudioId>": { "titleDefinition": {}, "parameters": [], "conditions": [], "actions": [], "groups": [], "groupLayout": "flat", "resources": {} } },
    "canvasConfig": {},
    "pipelineFlow": { "version": "3.0", "pipelines": [...] }
  },
  "palette": { "version": "3.0", "categories": [...] }
}
```

---

## State Architecture

All Studio state lives in `StudioPage` and flows down as props. No Redux, no separate context.

```
StudioPage.state
├── categories[]                  → PaletteBuilder → palette-generator.js → StudioCanvas
│   └── nodeTypes[]
├── paramDefs{}                   → PropertiesBuilder → properties-generator.js
│   └── [nodeStudioId]:
│       ├── titleDefinition       → titleDefinition section
│       ├── parameters[]          → ParameterForm rows
│       ├── conditions[]          → ConditionsBuilder rows
│       ├── actions[]             → ActionsBuilder rows
│       ├── groupLayout           → GroupBuilder layout selector
│       ├── groups[]              → GroupBuilder tab definitions
│       └── resources{}           → ResourcesEditor key/value pairs
├── selectedNodeStudioId          → PaletteBuilder (highlights selected) + PropertiesBuilder (shows params)
├── canvasConfig{}                → StudioCanvas config toggles → CommonCanvas
├── pipelineFlow                  → captured from StudioCanvas on every edit; included in Export JSON
└── importedFlow                  → one-shot trigger: set on Import/mount, consumed by StudioCanvas, then cleared
```

`categories`, `paramDefs`, `canvasConfig`, and `pipelineFlow` are persisted to `localStorage` in `componentDidUpdate` and restored in `componentDidMount`, so navigating away from `/#/studio` and returning does not lose the canvas state. `importedFlow` is never persisted — it is only used to hand a restored flow to `StudioCanvas` on remount.

The two generator utilities (`palette-generator.js`, `properties-generator.js`) are pure functions called on every render. Edit a field → state updates → generator runs → JSON changes → canvas/preview re-renders.

---

## What Could Be Added Next

Features in the CommonProperties format not yet in the Studio:

| Feature | JSON key | Note |
|---|---|---|
| Complex types (tables) | `complex_types[]` | Requires a ComplexTypeBuilder sub-editor for defining struct/table schemas |
| Column selection controls | `control = "selectcolumn"` | Requires `dataset_metadata` — runtime external data (column names from a dataset) |
| Resource key on fields | `parameter_info[].resource_key` | Would replace `label.default` with a key into the `resources` object — ResourcesEditor is already implemented |
| Sub-tabs / nested groups | `group_info[].type = "subTabs"` | Currently only top-level tabs are supported |
| Multiple targets per enabled/visible condition | `enabled.parameter_refs[]` | Currently one target parameter per rule; multi-select would allow controlling several at once |
