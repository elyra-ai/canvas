/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

function _defineConstant(key, value) {
	Object.defineProperty(module.exports, key, {
		value: value,
		enumerable: true,
		writable: false
	});
}

_defineConstant("MESSAGE_KEYS_DEFAULTS", {
	SUBPANEL_BUTTON_TOOLTIP: "Edit",
	STRUCTURELISTEDITOR_ADDBUTTON_LABEL: "Add Value",
	STRUCTURELISTEDITOR_REMOVEBUTTON_TOOLTIP: "Delete selected rows",
	STRUCTURELISTEDITOR_ADDBUTTON_TOOLTIP: "Add new row",
	STRUCTURETABLE_ADDBUTTON_LABEL: "Add Columns",
	STRUCTURETABLE_REMOVEBUTTON_LABEL: "Remove Columns",
	STRUCTURETABLE_ADDBUTTON_TOOLTIP: "Select columns to add",
	STRUCTURETABLE_REMOVEBUTTON_TOOLTIP: "Remove selected columns",
	FIELDPICKER_SAVEBUTTON_LABEL: "Select Fields for",
	FIELDPICKER_SAVEBUTTON_TOOLTIP: "Save and return",
	FIELDPICKER_RESETBUTTON_LABEL: "Reset ",
	FIELDPICKER_RESETBUTTON_TOOLTIP: "Reset to previous values",
	FIELDPICKER_FILTER_LABEL: "Filter:",
	FIELDPICKER_FIELDCOLUMN_LABEL: "Field name",
	FIELDPICKER_SCHEMACOLUMN_LABEL: "Schema name",
	FIELDPICKER_DATATYPECOLUMN_LABEL: "Data type",
	APPLYBUTTON_LABEL: "OK",
	REJECTBUTTON_LABEL: "Cancel",
	PROPERTIESEDIT_CLOSEBUTTON_LABEL: "Close",
	PROPERTIESEDIT_APPLYBUTTON_LABEL: "Save",
	PROPERTIESEDIT_REJECTBUTTON_LABEL: "Cancel",
	TABLE_SEARCH_PLACEHOLDER: "Search in column",
	LONG_TABLE_SUMMARY_PLACEHOLDER: "More than ten fields...",
	ALERTS_TAB_TITLE: "Alerts",
	TITLE_EDITOR_LABEL: "edit title",
	TABLE_SUMMARY_ERROR: "There are {errorMsgCount} error cells. ",
	TABLE_SUMMARY_WARNING: "There are {warningMsgCount} warning cells. ",
	CONTROL_SUMMARY_ERROR: "There are {errorMsgCount} parameters with errors. ",
	CONTROL_SUMMARY_WARNING: "There are {warningMsgCount} parameters with warnings. ",
	CONTROL_SUMMARY_ERROR_WARNING: "There are {errorMsgCount} parameters with errors and {warningMsgCount} parameters with warnings.",
	REQUIRED_ERROR: "Required parameter '{label}' has no value.",
	DATETIME_FORMAT_ERROR: "Invalid {role}. Format should be {format}.",
	INVALID_FIELD_ERROR: "Invalid {label}, field not found in data set.",
	EXPRESSION_OPERATORS_LABEL: "Operators",
	EXPRESSION_VALIDATE_LABEL: "Validate",
	EXPRESSION_BUILDER_TITLE: "Expression Builder",
	EXPRESSION_BUILDER_LABEL: "Expression",
	EXPRESSION_FIELDS_TITLE: "Fields",
	EXPRESSION_VALUES_TITLE: "Values",
	EXPRESSION_FIELD_COLUMN: "Field",
	EXPRESSION_STORAGE_COLUMN: "Storage",
	EXPRESSION_VALUE_COLUMN: "Value",
	EXPRESSION_FUNCTION_COLUMN: "Function",
	EXPRESSION_RETURN_COLUMN: "Return",
	EXPRESSION_FIELD_TAB: "Fields and Values",
	EXPRESSION_FUNCTIONS_TAB: "Functions",
	EXPRESSION_RECENTLY_USED: "Recently Used",
	EXPRESSION_MIN_LABEL: "Min",
	EXPRESSION_MAX_LABEL: "Max",
	EXPRESSION_NO_FUNCTIONS: "No functions found."
});

_defineConstant("MESSAGE_KEYS", {
	SUBPANEL_BUTTON_TOOLTIP: "subPanel.button.tooltip",
	STRUCTURELISTEDITOR_ADDBUTTON_LABEL: "structureListEditor.addButton.label",
	STRUCTURELISTEDITOR_REMOVEBUTTON_TOOLTIP: "structureListEditor.removeButton.tooltip",
	STRUCTURELISTEDITOR_ADDBUTTON_TOOLTIP: "structureListEditor.addButton.tooltip",
	STRUCTURETABLE_ADDBUTTON_LABEL: "structureTable.addButton.label",
	STRUCTURETABLE_ADDBUTTON_TOOLTIP: "structureTable.addButton.tooltip",
	STRUCTURETABLE_REMOVEBUTTON_LABEL: "structureTable.removeButton.label",
	STRUCTURETABLE_REMOVEBUTTON_TOOLTIP: "structureTable.removeButton.tooltip",
	FIELDPICKER_SAVEBUTTON_LABEL: "fieldPicker.saveButton.label",
	FIELDPICKER_SAVEBUTTON_TOOLTIP: "fieldPicker.saveButton.tooltip",
	FIELDPICKER_RESETBUTTON_LABEL: "fieldPicker.resetButton.label",
	FIELDPICKER_RESETBUTTON_TOOLTIP: "fieldPicker.resetButton.tooltip",
	FIELDPICKER_FILTER_LABEL: "fieldPicker.filter.label",
	FIELDPICKER_FIELDCOLUMN_LABEL: "fieldPicker.fieldColumn.label",
	FIELDPICKER_SCHEMACOLUMN_LABEL: "fieldPicker.schemaColumn.label",
	FIELDPICKER_DATATYPECOLUMN_LABEL: "fieldPicker.dataTypeColumn.label",
	APPLYBUTTON_LABEL: "flyout.applyButton.label",
	REJECTBUTTON_LABEL: "flyout.rejectButton.label",
	PROPERTIESEDIT_CLOSEBUTTON_LABEL: "propertiesEdit.closeButton.label",
	PROPERTIESEDIT_APPLYBUTTON_LABEL: "propertiesEdit.applyButton.label",
	PROPERTIESEDIT_REJECTBUTTON_LABEL: "propertiesEdit.rejectButton.label",
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
	EXPRESSION_OPERATORS_LABEL: "expression.operators.label",
	EXPRESSION_VALIDATE_LABEL: "expression.validate.label",
	EXPRESSION_BUILDER_TITLE: "expression.builder.title",
	EXPRESSION_BUILDER_LABEL: "expression.builder.label",
	EXPRESSION_FIELDS_TITLE: "expression.fields.title",
	EXPRESSION_VALUES_TITLE: "expression.values.title",
	EXPRESSION_FIELD_COLUMN: "expression.field.column",
	EXPRESSION_STORAGE_COLUMN: "expression.storage.column",
	EXPRESSION_VALUE_COLUMN: "expression.value.column",
	EXPRESSION_FUNCTION_COLUMN: "expression.function.column",
	EXPRESSION_RETURN_COLUMN: "expression.return.column",
	EXPRESSION_FIELD_TAB: "expression.field.tab",
	EXPRESSION_FUNCTIONS_TAB: "expression.functions.tab",
	EXPRESSION_RECENTLY_USED: "expression.recently.used",
	EXPRESSION_MIN_LABEL: "expression.min.label",
	EXPRESSION_MAX_LABEL: "expression.max.label",
	EXPRESSION_NO_FUNCTIONS: "expression.no.functions"
});

_defineConstant("CHARACTER_LIMITS", {
	TEXT_FIELD: 128,
	TEXT_AREA: 1024
});

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

_defineConstant("DATA_TYPES", [
	"integer",
	"double",
	"string",
	"date",
	"time",
	"timestamp"
]);

_defineConstant("DEFAULT_DATE_FORMAT", "YYYY-M-D");

_defineConstant("DEFAULT_TIME_FORMAT", "H:m:s");

_defineConstant("ELLIPSIS_STRING", "...");

_defineConstant("DISPLAY_CHARS_DEFAULT", 64);

_defineConstant("TOOL_TIP_DELAY", 1000);

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

_defineConstant("FP_CHECKBOX_WIDTH", "40px");

_defineConstant("EXPRESSION_TABLE_ROWS", 6);

_defineConstant("TABLE_SUBPANEL_BUTTON_WIDTH", "36px");

_defineConstant("TABLE_SCROLLBAR_WIDTH", "15px");
