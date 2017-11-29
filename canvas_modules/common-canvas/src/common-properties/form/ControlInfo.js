/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { EditStyle } from "./form-constants";

class ControlDef {
	constructor(cname, label, description, controlType, valueDef, role, additionalText,
		orientation, values, valueLabels, valueIcons, sortable, filterable, charLimit, language, summary) {
		this.name = cname;
		this.label = label;
		if (description) {
			this.description = description;
		}
		this.controlType = controlType;
		this.valueDef = valueDef;
		if (role) {
			this.role = role;
		}
		if (additionalText) {
			this.additionalText = additionalText;
		}
		if (orientation) {
			this.orientation = orientation;
		}
		if (values) {
			this.values = values;
		}
		if (valueLabels) {
			this.valueLabels = valueLabels;
		}
		if (valueIcons) {
			this.valueIcons = valueIcons;
		}
		if (typeof sortable === "boolean") {
			this.sortable = sortable;
		}
		if (typeof filterable === "boolean") {
			this.filterable = filterable;
		}
		if (language) {
			this.language = language;
		}
		if (charLimit) {
			this.charLimit = charLimit;
		}
		if (summary) {
			this.summary = summary;
		}
	}
}

export class Control extends ControlDef {
	constructor(cname, label, separateLabel, description, controlType, valueDef, role, additionalText, orientation,
		values, valueLabels, valueIcons, sortable, filterable, noPickColumns, charLimit, subControls, keyIndex, defaultRow,
		childItem, moveableRows, required, language, summary, rowSelection) {
		super(cname, label, description, controlType, valueDef, role, additionalText, orientation, values,
			valueLabels, valueIcons, sortable, filterable, charLimit, language, summary);
		this.separateLabel = separateLabel;
		if (subControls) {
			this.subControls = subControls;
		}
		if (typeof keyIndex === "number") {
			this.keyIndex = keyIndex;
		}
		if (defaultRow) {
			this.defaultRow = defaultRow;
		}
		if (noPickColumns) {
			this.noPickColumns = noPickColumns;
		}
		if (childItem) {
			this.childItem = childItem;
		}
		if (typeof moveableRows === "boolean") {
			this.moveableRows = moveableRows;
		}
		if (typeof required === "boolean") {
			this.required = required;
		}
		if (rowSelection) {
			this.rowSelection = rowSelection;
		}
	}
}

export class SubControl extends ControlDef {
	constructor(cname, label, description, visible, width, controlType, valueDef, role, additionalText,
		orientation, values, valueLabels, valueIcons, sortable, filterable, charLimit, editStyle, isKeyField,
		dmDefault, language, summary) {
		super(cname, label, description, controlType, valueDef, role, additionalText, orientation,
			values, valueLabels, valueIcons, sortable, filterable, charLimit, language, summary);
		if (typeof visible === "boolean") {
			this.visible = visible;
		}
		if (typeof width === "number") {
			this.width = width;
		}
		if (editStyle) {
			this.editStyle = editStyle;
		} else if (!isKeyField) {
			this.editStyle = EditStyle.INLINE;
		}
		if (dmDefault) {
			this.dmDefault = dmDefault;
		}
	}
}
