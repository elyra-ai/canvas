/*
 * Copyright 2017-2022 Elyra Authors
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

const ItemType = {
	CONTROL: "control",
	ADDITIONAL_LINK: "additionalLink",
	STATIC_TEXT: "staticText",
	HORIZONTAL_SEPARATOR: "hSeparator",
	PANEL: "panel",
	TEARSHEET: "tearsheet",
	SUB_TABS: "subTabs",
	PRIMARY_TABS: "primaryTabs",
	PANEL_SELECTOR: "panelSelector",
	CUSTOM_PANEL: "customPanel",
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
	TABS: "tabs", // currently not used
	SUB_TABS: "subTabs",
	PANELS: "panels",
	ADDITIONAL: "additional",
	COLUMN_SELECTION: "columnSelection",
	PANEL_SELECTOR: "panelSelector",
	CUSTOM_PANEL: "customPanel",
	SUMMARY_PANEL: "summaryPanel",
	ACTION_PANEL: "actionPanel",
	TEXT_PANEL: "textPanel",
	TWISTY_PANEL: "twistyPanel",
	COLUMN_PANEL: "columnPanel",
	TEARSHEET_PANEL: "tearsheetPanel"
};

const PanelType = {
	GENERAL: "general",
	COLUMN_SELECTION: "columnSelection",
	CUSTOM: "custom",
	SUMMARY: "summary",
	ACTION_PANEL: "actionPanel",
	TWISTY_PANEL: "twisty",
	COLUMN_PANEL: "column",
	TEARSHEET: "tearsheet"
};

const ControlType = {
	CUSTOM: "custom",
	TEXTFIELD: "textfield",
	PASSWORDFIELD: "passwordfield",
	TEXTAREA: "textarea",
	LIST: "list",
	EXPRESSION: "expression",
	NUMBERFIELD: "numberfield",
	DATEFIELD: "datefield",
	TIMEFIELD: "timefield",
	TIMESTAMP: "timestampfield",
	CHECKBOX: "checkbox",
	TOGGLE: "toggle",
	RADIOSET: "radioset",
	CHECKBOXSET: "checkboxset",
	ONEOFSELECT: "oneofselect",
	MULTISELECT: "multiselect",
	SOMEOFSELECT: "someofselect",
	SELECTCOLUMN: "selectcolumn",
	SELECTCOLUMNS: "selectcolumns",
	SELECTSCHEMA: "selectschema",
	STRUCTURETABLE: "structuretable",
	STRUCTUREEDITOR: "structureeditor",
	STRUCTURELISTEDITOR: "structurelisteditor",
	TOGGLETEXT: "toggletext",
	READONLY: "readonly",
	READONLYTABLE: "readonlyTable",
	SPINNER: "spinner",
	CODE: "code",
	HIDDEN: "hidden"
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
	TIMESTAMP: "timestamp",
	STRUCTURE: "structure",
	OBJECT: "object"
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
