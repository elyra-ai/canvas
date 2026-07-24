# Canvas Studio

Canvas Studio is a no-code UI builder added to the Elyra Canvas test harness. It lets non-technical users visually create palette nodes, configure node property forms, and tune canvas settings — without writing any JSON.

**URL:** `http://localhost:3001/#/studio`
**Entry point:** Click the Canvas Studio button (window icon) in the top-right of the main harness navbar.

---

## How much can the Studio cover?

The CommonProperties `parameterDef` JSON format is a **finite, well-defined specification** of approximately 200 distinct features. It is not infinitely extensible. The Studio currently covers the most commonly used subset. The table below shows the full scope:

| Category | Total in format | Studio covers |
|---|---|---|
| Top-level paramDef keys | 9 | 5 (`titleDefinition`, `current_parameters`, `parameters`, `uihints`, `conditions`) |
| Parameter types | 8 (`string`, `integer`, `double`, `boolean`, `date`, `time`, `timestamp`, `custom`) | 5 (all except `date`, `time`, `timestamp`) |
| Control types | 33 | 5 auto-mapped from type (`textfield`, `numberfield`, `toggletext`, `oneofselect`, custom) |
| `parameter_info` fields | 42+ | 5 (`label`, `description`, `control_type`, `action_ref`, auto) |
| Group/panel types | 14 | 1 (`controls` — single flat group) |
| Condition types | 7 | 1 (`validation`) |
| Condition operators | 24+ | 10 (`isNotEmpty`, `isEmpty`, `equals`, `notEquals`, `greaterThan`, `lessThan`, `contains`, `notContains`, `startsWith`, `endsWith`) |
| Action types | 3 (`button`, `image`, `custom`) | 1 (`image`) |
| Action fields | 9 | 7 (`id`, `label`, `description`, `image.url`, `image.placement`, `image.size`) |

**What's not yet in the Studio** (features in the format that need manual JSON for now): complex types, tabs/sub-panels, column selection controls, date/time pickers, expression editors, `enabled`/`visible` conditions, dataset metadata, localization resource keys, and custom controls/actions.

---

## Files Added / Modified

### New files

All new files live under `canvas_modules/harness/src/client/components/studio/`.

| File | Purpose |
|------|---------|
| `StudioPage.jsx` | Root page — holds all state, 3-column layout, header with Import/Export |
| `palette-builder/PaletteBuilder.jsx` | Category list with expand/collapse, add/delete |
| `palette-builder/CategoryForm.jsx` | Form for one category's label, description, icon, open-state |
| `palette-builder/NodeTypeForm.jsx` | Form for one node type's label, op, description, icon |
| `palette-builder/PortsEditor.jsx` | Dynamic rows for input/output ports (label + cardinality) |
| `palette-builder/IconPicker.jsx` | Tab grid of SVGs from `assets/images/` + custom URL tab |
| `properties-builder/PropertiesBuilder.jsx` | Node selector, titleDefinition, parameter list, ActionsBuilder, ConditionsBuilder |
| `properties-builder/ParameterForm.jsx` | Form for one parameter's label, id, description, type, required, default, action_ref, enum values |
| `properties-builder/ConditionsBuilder.jsx` | Validation rule builder — parameter + operator + error message |
| `properties-builder/ActionsBuilder.jsx` | Image action builder — id, label, tooltip, image URL, placement, size |
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
| "Operation ID" TextInput | `node_types[].op` |
| "Description" TextInput | `node_types[].app_data.ui_data.description` |
| IconPicker selection | `node_types[].app_data.ui_data.image` |
| *(always set)* | `node_types[].type = "execution_node"` |
| *(internal studioId)* | `node_types[].id` |

#### PortsEditor → `inputs[]` / `outputs[]`

| UI control | JSON field |
|------------|-----------|
| "Label" TextInput | `inputs[]/outputs[].app_data.ui_data.label` |
| "Min" NumberInput | `inputs[]/outputs[].app_data.ui_data.cardinality.min` |
| "Max" NumberInput | `inputs[]/outputs[].app_data.ui_data.cardinality.max` |
| *(uuid)* | `inputs[]/outputs[].id` |

#### Equivalent raw JSON

```json
{
  "version": "3.0",
  "categories": [{
    "id": "my-nodes",
    "label": "My Nodes",
    "description": "",
    "image": "/images/carbon/gears.svg",
    "is_open": true,
    "node_types": [{
      "id": "<studioId>",
      "type": "execution_node",
      "op": "com.example.filter",
      "inputs": [{ "id": "<portId>", "app_data": { "ui_data": { "label": "Input", "cardinality": { "min": 0, "max": 1 } } } }],
      "outputs": [{ "id": "<portId>", "app_data": { "ui_data": { "label": "Output", "cardinality": { "min": 0, "max": -1 } } } }],
      "app_data": { "ui_data": { "label": "Filter", "description": "", "image": "/images/carbon/filter.svg" } }
    }]
  }]
}
```

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
| "Required" Toggle | `parameters[].required` |
| "Default value" TextInput | `current_parameters[id]` |
| "Action" Select | `uihints.parameter_info[].action_ref` *(omitted if none)* |
| Enum option rows | `parameters[].enum[]` |

#### ActionsBuilder → `uihints.action_info[]`

| UI control | JSON field |
|------------|-----------|
| "Action ID" TextInput | `action_info[].id` |
| "Label" TextInput | `action_info[].label.default` |
| "Description" TextInput | `action_info[].description.default` |
| "Image URL" TextInput | `action_info[].image.url` |
| "Placement" Select | `action_info[].image.placement` (`"right"` or `"left"`) |
| "Width" NumberInput | `action_info[].image.size.width` |
| "Height" NumberInput | `action_info[].image.size.height` |
| *(always set)* | `action_info[].control = "image"`, `action_info[].data = {}` |

#### ConditionsBuilder → `conditions[]`

| UI control | JSON field |
|------------|-----------|
| "Parameter" Select | `conditions[].validation.fail_message.focus_parameter_ref` and `evaluate.condition.parameter_ref` |
| "Rule" Select | `conditions[].validation.evaluate.condition.op` |
| "Value" TextInput *(shown for comparison ops)* | `conditions[].validation.evaluate.condition.value` |
| "Error message" TextInput | `conditions[].validation.fail_message.message.default` |
| *(always set)* | `fail_message.type = "error"` |

#### Equivalent raw JSON (matching the example file from the user)

```json
{
  "titleDefinition": { "title": "Action Image Alignment Test", "editable": false },
  "current_parameters": { "text_right": "", "text_left": "" },
  "parameters": [
    { "id": "text_right", "type": "string", "required": true },
    { "id": "dropdown_right", "type": "string", "required": true, "enum": ["Alpha", "Beta", "Gamma"] }
  ],
  "uihints": {
    "id": "action_image_alignment_test",
    "parameter_info": [
      { "parameter_ref": "text_right", "label": { "default": "Text input — action RIGHT" }, "action_ref": "moon_right" },
      { "parameter_ref": "dropdown_right", "label": { "default": "Dropdown — action RIGHT" }, "control_type": "oneofselect", "action_ref": "moon_right" }
    ],
    "action_info": [{
      "id": "moon_right",
      "label": { "default": "Moon" },
      "description": { "default": "Moon action tooltip" },
      "control": "image",
      "data": {},
      "image": { "url": "/images/moon.jpg", "placement": "right", "size": { "height": 20, "width": 25 } }
    }],
    "group_info": [{ "id": "main-group", "type": "controls", "parameter_refs": ["text_right", "dropdown_right"] }]
  },
  "conditions": [{
    "validation": {
      "fail_message": { "type": "error", "focus_parameter_ref": "text_right", "message": { "default": "This field is required." } },
      "evaluate": { "condition": { "parameter_ref": "text_right", "op": "isNotEmpty" } }
    }
  }]
}
```

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
    "paramDefs": { "<nodeStudioId>": { "titleDefinition": {}, "parameters": [], "conditions": [], "actions": [] } },
    "canvasConfig": {}
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
│       └── actions[]             → ActionsBuilder rows
├── selectedNodeStudioId          → PaletteBuilder (highlights selected) + PropertiesBuilder (shows params)
└── canvasConfig{}                → StudioCanvas config toggles → CommonCanvas
```

The two generator utilities (`palette-generator.js`, `properties-generator.js`) are pure functions called on every render. Edit a field → state updates → generator runs → JSON changes → canvas/preview re-renders.

---

## What Could Be Added Next

Features in the CommonProperties format not yet in the Studio, roughly ordered by how commonly they appear in real paramDef files:

| Feature | JSON key | Complexity to add |
|---|---|---|
| Placeholder text per field | `parameter_info[].place_holder_text` | Low — one TextInput in ParameterForm |
| `enabled` / `visible` conditions | `conditions[].enabled`, `conditions[].visible` | Low — extend ConditionsBuilder with type selector |
| Panel tabs / sub-tabs | `group_info[].type = "tabs"` | Medium — GroupBuilder component |
| Date / time fields | `type = "date"`, `control = "datepicker"` | Medium — add types to ParameterForm |
| Button-type actions | `action_info[].control = "button"` | Low — add type toggle to ActionsBuilder |
| Character limit per field | `parameter_info[].char_limit` | Low — one NumberInput in ParameterForm |
| Helper text per field | `parameter_info[].helper_text` | Low — one TextInput in ParameterForm |
| Read-only fields | `parameter_info[].read_only` | Low — one Toggle in ParameterForm |
| Textarea (multi-line) | `control_type = "textarea"` | Low — add to type options |
| Expression editor | `control_type = "expression"` | Low — add to type options |
| Complex types (tables) | `complex_types[]` | High — requires a separate ComplexTypeBuilder |
| Column selection controls | `control = "selectcolumn"` | High — requires dataset_metadata |
| Localization resources | `resources{}`, `resource_key` | Medium — ResourcesEditor |
