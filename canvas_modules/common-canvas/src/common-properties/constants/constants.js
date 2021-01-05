/*
 * Copyright 2017-2020 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function _defineConstant(key, value) {
	Object.defineProperty(module.exports, key, {
		value: value,
		enumerable: true,
		writable: false
	});
}

_defineConstant("MESSAGE_KEYS", {
	SUBPANEL_BUTTON_TOOLTIP: "subPanel.button.tooltip",
	STRUCTURELISTEDITOR_ADDBUTTON_LABEL: "structureListEditor.addButton.label",
	STRUCTURELISTEDITOR_REMOVEBUTTON_LABEL: "structureListEditor.removeButton.label",
	STRUCTURETABLE_ADDBUTTON_LABEL: "structureTable.addButton.label",
	STRUCTURETABLE_REMOVEBUTTON_LABEL: "structureTable.removeButton.label",
	FIELDPICKER_SAVEBUTTON_LABEL: "fieldPicker.saveButton.label",
	FIELDPICKER_SAVEBUTTON_TOOLTIP: "fieldPicker.saveButton.tooltip",
	FIELDPICKER_RESETBUTTON_LABEL: "fieldPicker.resetButton.label",
	FIELDPICKER_FILTER_LABEL: "fieldPicker.filter.label",
	FIELDPICKER_FIELDCOLUMN_LABEL: "fieldPicker.fieldColumn.label",
	FIELDPICKER_SCHEMACOLUMN_LABEL: "fieldPicker.schemaColumn.label",
	FIELDPICKER_DATATYPECOLUMN_LABEL: "fieldPicker.dataTypeColumn.label",
	FIELDPICKER_INTEGER_LABEL: "fieldPicker.integer.label",
	FIELDPICKER_DOUBLE_LABEL: "fieldPicker.double.label",
	FIELDPICKER_STRING_LABEL: "fieldPicker.string.label",
	FIELDPICKER_DATE_LABEL: "fieldPicker.date.label",
	FIELDPICKER_TIME_LABEL: "fieldPicker.time.label",
	FIELDPICKER_TIMESTAMP_LABEL: "fieldPicker.timestamp.label",
	APPLYBUTTON_LABEL: "flyout.applyButton.label",
	REJECTBUTTON_LABEL: "flyout.rejectButton.label",
	PROPERTIESEDIT_CLOSEBUTTON_LABEL: "propertiesEdit.closeButton.label",
	PROPERTIESEDIT_APPLYBUTTON_LABEL: "propertiesEdit.applyButton.label",
	PROPERTIESEDIT_REJECTBUTTON_LABEL: "propertiesEdit.rejectButton.label",
	PROPERTIESEDIT_REVERTBUTTON_LABEL: "propertiesEdit.revertButton.label",
	PROPERTIES_REVERT_MESSAGE: "properties.revert.message",
	PROPERTIES_CLOSE_MESSAGE: "properties.close.message",
	PROPERTIES_SUPPORT_MESSAGE: "properties.support.message",
	PROPERTIES_UNEXPECTED_MESSAGE: "properties.unexpected.message",
	TABLE_SEARCH_HEADER: "table.search.header",
	TABLE_SEARCH_PLACEHOLDER: "table.search.placeholder",
	LONG_TABLE_SUMMARY_PLACEHOLDER: "summary.longTable.placeholder",
	ALERTS_TAB_TITLE: "alerts.tab.title",
	TITLE_EDITOR_LABEL: "title.editor.label",
	TABLE_SUMMARY_ERROR: "table.summary.error",
	TABLE_SUMMARY_WARNING: "table.summary.warning",
	CONTROL_SUMMARY_ERROR: "control.summary.error",
	CONTROL_SUMMARY_WARNING: "control.summary.warning",
	CONTROL_SUMMARY_ERROR_WARNING: "control.summary.error.warning",
	REQUIRED_ERROR: "required.error",
	DATETIME_FORMAT_ERROR: "datetime.format.error",
	INVALID_FIELD_ERROR: "invalid.field.error",
	EXPRESSION_VALIDATE_LABEL: "expression.validate.label",
	EXPRESSION_BUILDER_TITLE: "expression.builder.title",
	EXPRESSION_BUILDER_LABEL: "expression.builder.label",
	EXPRESSION_FIELDS_DROPDOWN_TITLE: "expression.fields.dropdown",
	EXPRESSION_FIELDS_TITLE: "expression.fields.title",
	EXPRESSION_VALUES_TITLE: "expression.values.title",
	EXPRESSION_FIELD_COLUMN: "expression.field.column",
	EXPRESSION_STORAGE_COLUMN: "expression.storage.column",
	EXPRESSION_VALUE_COLUMN: "expression.value.column",
	EXPRESSION_FUNCTION_COLUMN: "expression.function.column",
	EXPRESSION_RETURN_COLUMN: "expression.return.column",
	EXPRESSION_RECENTLY_USED_COLUMN: "expression.recently.used.column",
	EXPRESSION_FIELD_TAB: "expression.field.tab",
	EXPRESSION_FUNCTIONS_TAB: "expression.functions.tab",
	EXPRESSION_RECENTLY_USED: "expression.recently.used",
	EXPRESSION_ALL_FUNCTIONS: "expression.all.functions",
	EXPRESSION_MIN_LABEL: "expression.min.label",
	EXPRESSION_MAX_LABEL: "expression.max.label",
	EXPRESSION_NO_FUNCTIONS: "expression.no.functions",
	MULTI_SELECTED_ROW_LABEL: "multi.selected.row.label",
	MULTI_SELECTED_ROW_ACTION: "multi.selected.row.action",
	MOVEABLE_TABLE_BUTTON_TOP_DESCRIPTION: "moveable.table.button.top",
	MOVEABLE_TABLE_BUTTON_UP_DESCRIPTION: "moveable.table.button.up",
	MOVEABLE_TABLE_BUTTON_DOWN_DESCRIPTION: "moveable.table.button.down",
	MOVEABLE_TABLE_BUTTON_BOTTOM_DESCRIPTION: "moveable.table.button.bottom",
	LIST_TABLE_LABEL: "list.table.label",
	DROPDOWN_TOOLTIP_OPENMENU: "dropdown.tooltip.openMenu",
	DROPDOWN_TOOLTIP_CLOSEMENU: "dropdown.tooltip.closeMenu",
	TRUNCATE_LONG_STRING_ERROR: "truncate.long.string.error",
	PROPERTIES_LABEL: "properties.label",
	READONLYTABLE_EDIT_BUTTON_LABEL: "readonlytable.edit.button.label",
	TOGGLETEXT_ICON_DESCRIPTION: "toggletext.icon.description"
});

_defineConstant("CHARACTER_LIMITS", {
	TEXT_FIELD: 128,
	TEXT_AREA: 1024
});

_defineConstant("TRUNCATE_LIMIT", 10000);

_defineConstant("CONDITION_ERROR_MESSAGE", {
	HIDDEN: "0px",
	VISIBLE: "30px"
});

_defineConstant("DEFAULT_VALIDATION_MESSAGE", {
	type: "info",
	text: ""
});

_defineConstant("CONDITION_MESSAGE_TYPE", {
	INFO: "info",
	ERROR: "error",
	WARNING: "warning",
	SUCCESS: "success"
});

_defineConstant("SPINNER", "spinner");

_defineConstant("DATA_TYPE", {
	INTEGER: "integer",
	DOUBLE: "double",
	STRING: "string",
	DATE: "date",
	TIME: "time",
	TIMESTAMP: "timestamp"
});

_defineConstant("DEFAULT_DATE_FORMAT", "YYYY-M-D");

_defineConstant("DEFAULT_TIME_FORMAT", "H:m:s");

_defineConstant("ELLIPSIS_STRING", "...");

_defineConstant("DISPLAY_CHARS_DEFAULT", 64);

_defineConstant("TOOL_TIP_DELAY", 1000);
_defineConstant("TOOL_TIP_DELAY_ICON", 500);

_defineConstant("STATES", {
	VISIBLE: "visible",
	HIDDEN: "hidden",
	ENABLED: "enabled",
	DISABLED: "disabled"
});

_defineConstant("PANEL_TREE_ROOT", "PanelTreeRoot");


_defineConstant("CONDITION_TYPE", {
	VISIBLE: "visible",
	ENABLED: "enabled",
	FILTEREDENUM: "enum_filter",
	ALLOWCHANGE: "allow_change",
	FILTER: "filter",
	VALIDATION: "validation"
});

_defineConstant("CONDITION_DEFINITION_INDEX", {
	CONTROLS: "controls",
	REFS: "refs"
});

_defineConstant("ACTIONS", {
	SET_PROPERTIES: "SET_PROPERTIES",
	UPDATE_PROPERTY: "UPDATE_PROPERTY"
});

_defineConstant("DEFAULT_LABEL_EDITABLE", true);

_defineConstant("ROW_HEIGHT", 42);

_defineConstant("EXPRESSION_TABLE_ROWS", 7);

_defineConstant("TABLE_SUBPANEL_BUTTON_WIDTH", "36px");

_defineConstant("TABLE_SCROLLBAR_WIDTH", "15px");

_defineConstant("CONDITION_RETURN_VALUE_HANDLING", {
	VALUE: "value",
	NULL: "null"
});

_defineConstant("SORT_DIRECTION", {
	ASC: "ASC",
	DESC: "DESC"
});

_defineConstant("ROW_SELECTION", {
	SINGLE: "single",
	MULTIPLE: "multiple-edit"
});


_defineConstant("CARBON_ICONS", {
	CHEVRONARROWS: {
		UP: "chevron-up",
		DOWN: "chevron-down",
		LEFT: "chevron-left",
		RIGHT: "chevron-right"
	},
	CALCULATOR: "calculator",
	ADD: "add",
	REMOVE: "remove",
	EDIT: "edit",
	MEASUREMENTS: {
		EMPTY: "measurement-empty",
		ORDINAL: "measurement-ordinal",
		NOMINAL: "measurement-nominal",
		SCALE: "measurement-scale",
		FLAG: "measurement-flag",
		DISCRETE: "measurement-discrete"
	},
	INFORMATION: "informationHollow",
	SETTINGS: "settings"
});

_defineConstant("APPLY", "apply");
_defineConstant("CANCEL", "cancel");

_defineConstant("CARBON_MODAL_SIZE_XSMALL", "xs");
_defineConstant("CARBON_MODAL_SIZE_SMALL", "sm");
_defineConstant("CARBON_MODAL_SIZE_LARGE", "lg");
