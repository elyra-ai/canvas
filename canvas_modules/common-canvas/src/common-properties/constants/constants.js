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
	ALERTS_TAB_TITLE: "Alerts"
});

_defineConstant("MESSAGE_KEYS", {
	SUBPANEL_BUTTON_TOOLTIP: "subPanel.button.tooltip",
	STRUCTURELISTEDITOR_ADDBUTTON_LABEL: "structureListEditor.addButton.label",
	STRUCTURELISTEDITOR_REMOVEBUTTON_TOOLTIP: "structureListEditor.removeButton.tooltip",
	STRUCTURELISTEDITOR_ADDBUTTON_TOOLTIP: "structureListEditor.addButton.tooltip",
	STRUCTURETABLE_ADDBUTTON_LABEL: "structureTable.addButton.label",
	STRUCTURETABLE_ADDBUTTON_TOOLTIP: "structureTable.addButton.tooltip",
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
	ALERTS_TAB_TITLE: "alerts.tab.title"
});

_defineConstant("CHARACTER_LIMITS", {
	NODE_PROPERTIES_DIALOG_TEXT_FIELD: 128,
	NODE_PROPERTIES_DIALOG_TEXT_AREA: 1024
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
	WARNING: "warning"
});

_defineConstant("SPINNER", "spinner");

_defineConstant("VALIDATION_MESSAGE", {
	WARNING: "#efc100",
	ERROR: "#E71D32",
	DISABLED: "#c7c7c7"
});

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

_defineConstant("EDITOR_CONTROL", "editor-control-");

_defineConstant("TOOL_TIP_DELAY", 1000);

_defineConstant("STATES", {
	VISIBLE: "visible",
	HIDDEN: "hidden",
	ENABLED: "enabled",
	DISABLED: "disabled"
});

_defineConstant("ACTIONS", {
	SET_PROPERTIES: "SET_PROPERTIES",
	UPDATE_PROPERTY: "UPDATE_PROPERTY"
});

_defineConstant("CONTROL_TYPE", {
	CONTROL: "control",
	PANEL: "panel"
});

_defineConstant("ORIENTATIONS", {
	VERTICAL: "vertical",
	HORIZONTAL: "horizontal"
});

_defineConstant("DEFAULT_LABEL_EDITABLE", true);
