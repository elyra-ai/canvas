/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const ItemType = {
	CONTROL: "control",
	ADDITIONAL_LINK: "additionalLink",
	STATIC_TEXT: "staticText",
	HORIZONTAL_SEPARATOR: "hSeparator",
	PANEL: "panel",
	SUB_TABS: "subTabs",
	PRIMARY_TABS: "primaryTabs",
	PANEL_SELECTOR: "panelSelector",
	CHECKBOX_SELECTOR: "checkboxSelector",
	CUSTOM_PANEL: "customPanel",
	SUMMARY_PANEL: "summaryPanel", // deprecated
	ACTION: "action",
	TEXT_PANEL: "textPanel"
};

const EditStyle = {
	INLINE: "inline",
	SUBPANEL: "subpanel",
	ON_PANEL: "on_panel"
};

const Size = {
	LARGE: "large",
	MEDIUM: "medium",
	SMALL: "small"
};

const GroupType = {
	CONTROLS: "controls",
	TABS: "tabs",
	SUB_TABS: "subTabs",
	PANELS: "panels",
	ADDITIONAL: "additional",
	COLUMN_ALLOCATION: "columnAllocation", // deprecated
	COLUMN_SELECTION: "columnSelection",
	PANEL_SELECTOR: "panelSelector",
	CHECKBOX_PANEL: "checkboxPanel",
	CUSTOM_PANEL: "customPanel",
	SUMMARY_PANEL: "summaryPanel",
	ACTION_PANEL: "actionPanel",
	TEXT_PANEL: "textPanel",
	TWISTY_PANEL: "twistyPanel"
};

const PanelType = {
	GENERAL: "general",
	COLUMN_ALLOCATION: "columnAllocation", // deprecated
	COLUMN_SELECTION: "columnSelection",
	CHECKBOX_PANEL: "checkboxPanel",
	CUSTOM: "custom",
	SUMMARY: "summary",
	ACTION_PANEL: "actionPanel",
	TWISTY_PANEL: "twisty"
};

const ControlType = {
	CUSTOM: "custom",
	TEXTFIELD: "textfield",
	PASSWORDFIELD: "passwordfield",
	TEXTAREA: "textarea",
	EXPRESSION: "expression",
	NUMBERFIELD: "numberfield",
	DATEFIELD: "datefield",
	TIMEFIELD: "timefield",
	CHECKBOX: "checkbox",
	RADIOSET: "radioset",
	CHECKBOXSET: "checkboxset",
	ONEOFSELECT: "oneofselect",
	SOMEOFSELECT: "someofselect",
	SELECTCOLUMN: "selectcolumn",
	SELECTCOLUMNS: "selectcolumns",
	SELECTSCHEMA: "selectschema",
	ONEOFCOLUMNS: "oneofcolumns", // deprecate, replace with SELECTCOLUMN
	SOMEOFCOLUMNS: "someofcolumns", // deprecated, replaced by SELECTCOLUMNS
	STRUCTURETABLE: "structuretable",
	STRUCTUREEDITOR: "structureeditor", // deprecated, no longer supported
	STRUCTURELISTEDITOR: "structurelisteditor",
	TOGGLETEXT: "toggletext",
	READONLY: "readonly",
	SPINNER: "spinner"
};

const ParamRole = {
	TEXT: "text",
	ENUM: "enum",
	COLUMN: "column",
	NEW_COLUMN: "new_column",
	EXPRESSION: "expression",
	EMAIL: "email",
	URL: "url",
	COLOR: "color",
	INTERVAL_YEAR: "interval_year",
	INTERVAL_DAY: "interval_day",
	INTERVAL_SECOND: "interval_second",
	CUSTOM: "custom",
	UNSPECIFIED: ""
};

const Type = {
	BOOLEAN: "boolean",
	INTEGER: "integer",
	LONG: "long",
	DOUBLE: "double",
	STRING: "string",
	PASSWORD: "password",
	DATE: "date",
	TIME: "time",
	STRUCTURE: "structure"
};

const Separator = {
	BEFORE: "before",
	AFTER: "after"
};

const ORIENTATIONS = {
	VERTICAL: "vertical",
	HORIZONTAL: "horizontal"
};

function hasValue(Enum, value) {
	for (var key in Enum) {
		if (value === Enum[key]) {
			return true;
		}
	}
	return false;
}

export { GroupType, PanelType, Type, ParamRole, ControlType, hasValue, EditStyle, Size, ItemType, Separator, ORIENTATIONS };
