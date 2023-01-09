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

import { get } from "lodash";

import { EditStyle } from "../constants/form-constants";


export class Control {
	constructor(settings) {
		this.name = settings.name;
		if (settings.label) {
			this.label = settings.label;
		}
		if (settings.description) {
			this.description = settings.description;
		}
		if (typeof settings.labelVisible === "boolean") {
			this.labelVisible = settings.labelVisible;
		}
		if (settings.controlType) {
			this.controlType = settings.controlType;
		}
		if (settings.valueDef) {
			this.valueDef = settings.valueDef;
		}
		if (settings.role) {
			this.role = settings.role;
		}
		if (settings.additionalText) {
			this.additionalText = settings.additionalText;
		}
		if (settings.orientation) {
			this.orientation = settings.orientation;
		}
		if (settings.values) {
			this.values = settings.values;
		}
		if (settings.valueLabels) {
			this.valueLabels = settings.valueLabels;
		}
		if (settings.valueDescs) {
			this.valueDescs = settings.valueDescs;
		}
		if (settings.valueIcons) {
			this.valueIcons = settings.valueIcons;
		}
		if (typeof settings.sortable === "boolean") {
			this.sortable = settings.sortable;
		}
		if (typeof settings.filterable === "boolean") {
			this.filterable = settings.filterable;
		}
		if (typeof settings.resizable === "boolean") {
			this.resizable = settings.resizable;
		}
		if (settings.language) {
			this.language = settings.language;
		}
		if (settings.enableMaximize) {
			this.enableMaximize = settings.enableMaximize;
		}
		if (settings.charLimit) {
			this.charLimit = settings.charLimit;
		}
		if (settings.summary) {
			this.summary = settings.summary;
		}
		if (settings.increment) {
			this.increment = settings.increment;
		}
		if (settings.generatedValues) {
			this.generatedValues = {};
			if (settings.generatedValues.operation) {
				this.generatedValues.operation = settings.generatedValues.operation;
			}
			if (settings.generatedValues.start_value) {
				this.generatedValues.startValue = settings.generatedValues.start_value;
			}
		}
		if (settings.dateFormat) {
			this.dateFormat = settings.dateFormat;
		}
		if (settings.timeFormat) {
			this.timeFormat = settings.timeFormat;
		}
		if (settings.customControlId) {
			this.customControlId = settings.customControlId;
		}
		if (settings.data) {
			this.data = settings.data;
		}
		if (settings.rows) {
			this.rows = settings.rows;
		}
		if (settings.displayChars) {
			this.displayChars = settings.displayChars;
		}
		if (settings.action) {
			this.action = settings.action;
		}
		if (settings.structureType) {
			this.structureType = settings.structureType;
		}
		if (settings.subControls) {
			this.subControls = settings.subControls;
		}
		if (settings.childItem) {
			this.childItem = settings.childItem;
		}
		if (settings.layout) {
			this.layout = settings.layout;
		}
		if (typeof settings.keyIndex === "number") {
			this.keyIndex = settings.keyIndex;
		}
		if (settings.defaultRow) {
			this.defaultRow = settings.defaultRow;
		}
		if (typeof settings.moveableRows === "boolean") {
			this.moveableRows = settings.moveableRows;
		}
		if (typeof settings.required === "boolean") {
			this.required = settings.required;
		}
		if (settings.rowSelection) {
			this.rowSelection = settings.rowSelection;
		}
		if (typeof settings.addRemoveRows === "boolean") {
			this.addRemoveRows = settings.addRemoveRows;
		}

		if (typeof settings.hideEditButton === "boolean") {
			this.hideEditButton = settings.hideEditButton;
		}

		if (typeof settings.header === "boolean") {
			this.header = settings.header;
		}
		if (typeof settings.uionly === "boolean") {
			this.uionly = settings.uionly;
		}
		if (typeof settings.includeAllFields === "boolean") {
			this.includeAllFields = settings.includeAllFields;
		}
		if (settings.dmImage) {
			this.dmImage = settings.dmImage;
		}

		if (typeof settings.visible === "boolean") {
			this.visible = settings.visible;
		}
		if (typeof settings.width === "number") {
			this.width = settings.width;
		}
		if (settings.editStyle) {
			this.editStyle = settings.editStyle;
		} else if (!settings.isKeyField && typeof settings.structureType !== "undefined") {
			this.editStyle = EditStyle.INLINE; // Should only be set for structure controls
		}
		if (settings.dmDefault) {
			this.dmDefault = settings.dmDefault;
		}
		if (settings.dmImage) {
			this.dmImage = settings.dmImage;
		}
		if (settings.customValueAllowed) {
			this.customValueAllowed = settings.customValueAllowed;
		}
		if (settings.className) {
			this.className = settings.className;
		}
		if (settings.buttons) {
			this.buttons = settings.buttons;
		}
		if (settings.trimSpaces) {
			this.trimSpaces = settings.trimSpaces;
		}
		this.light = get(settings, "light", true);
	}
}
