/*
 * Copyright 2017-2020 IBM Corporation
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

import React from "react";
import CommonProperties from "../../src/common-properties/common-properties.jsx";
import UiConditionsParser from "../../src/common-properties/ui-conditions/ui-conditions-parser.js";
import { mountWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import cloneDeep from "lodash/cloneDeep";

import CustomTableControl from "./custom-controls/CustomTableControl";
import CustomToggleControl from "./custom-controls/CustomToggleControl";
import CustomOpMax from "./custom-condition-ops/customMax";

import sinon from "sinon";
var renderedController;
function controllerHandler(propertyController) {
	renderedController = propertyController;
}

function flyoutEditorForm(paramDef, propertiesConfigOverrides, callbacksOverrides, propertiesInfoOverrides) {
	const applyPropertyChanges = sinon.spy();
	const closePropertiesDialog = sinon.spy();
	let callbacks = {
		applyPropertyChanges: applyPropertyChanges,
		closePropertiesDialog: closePropertiesDialog,
		controllerHandler: controllerHandler
	};
	if (callbacksOverrides) {
		callbacks = Object.assign(callbacks, callbacksOverrides);
	}

	let propertiesInfo = {
		parameterDef: cloneDeep(paramDef)
	};

	if (propertiesInfoOverrides) {
		propertiesInfo = Object.assign(propertiesInfo, propertiesInfoOverrides);
	}

	let propertiesConfig = {
		applyOnBlur: true,
		rightFlyout: true,
		containerType: "Custom"
	};
	if (propertiesConfigOverrides) {
		propertiesConfig = Object.assign(propertiesConfig, propertiesConfigOverrides);
	}

	const wrapper = mountWithIntl(
		<CommonProperties
			propertiesInfo={propertiesInfo}
			propertiesConfig={propertiesConfig}
			callbacks={callbacks}
			customControls={[CustomTableControl, CustomToggleControl]}
			customConditionOps={[CustomOpMax]}
		/>
	);

	return { wrapper: wrapper, controller: renderedController, callbacks: callbacks };
}

// expectedFields is optional
// fieldsToSelect is an array of field names or objects with name and schema. ex: { "name": "age", "schema": "schema1" }
function fieldPicker(fieldpickerWrapper, fieldsToSelect, expectedFields) {
	const rows = fieldpickerWrapper.find("tr.properties-fp-data-rows");
	if (expectedFields) {
		expect(rows).to.have.length(expectedFields.length);
		for (let i = 0; i < expectedFields.length; ++i) {
			if (typeof expectedFields[i] === "object") {
				const fieldName = rows.at(i).find("td")
					.at(1)
					.text();
				expect(fieldName).to.equal(expectedFields[i].name);
				const fieldSchema = rows.at(i).find("td")
					.at(2)
					.text();
				expect(fieldSchema).to.equal(expectedFields[i].schema);
			} else {
				const field = rows.at(i).find("td")
					.at(1)
					.text();
				expect(field).to.equal(expectedFields[i]);
			}
		}
	}
	for (const field of fieldsToSelect) {
		let schemaName = null;
		let fieldName = null;
		if (field.indexOf(".") !== -1) { // If field to select with name and schema
			schemaName = field.split(".")[0];
			fieldName = field.split(".")[1];
		} else {
			fieldName = field;
		}
		for (let i = 0; i < rows.length; i++) {
			const currField = rows.at(i).find("td[data-label='fieldName']")
				.text();
			let currSchema = null;
			if (schemaName) {
				currSchema = rows.at(i).find("td[data-label='schemaName']")
					.text();
			}
			if (currField === fieldName && currSchema === schemaName) {
				const checkbox = fieldpickerWrapper.find("tr.properties-fp-data-rows")
					.at(i)
					.find("input");
				expect(checkbox).to.have.length(1);
				checkbox.getDOMNode().checked = true;
				checkbox.simulate("change");
				break;
			}
		}
	}
	fieldpickerWrapper.find("button[data-id='properties-apply-button']").simulate("click"); // applies the field picker
}

function selectCheckbox(wrapper, idx, id) {
	const integerCheckbox = wrapper.find("input[type='checkbox']").at(idx);
	integerCheckbox.simulate("change", { target: { checked: true, id: id } });
}

function validateSelectedRowNum(wrapper) {
	return wrapper.find("input[type='checkbox']").filterWhere((checkBox) => checkBox.prop("checked") === true);
}

function setControls(controller, controls) {
	const parsedControls = [];
	for (const control of controls) {
		UiConditionsParser.parseControl(parsedControls, control);
	}
	controller.saveControls(parsedControls);
}

function genLongString(length) {
	let str = "";
	while (length > str.length) {
		str += Math.random().toString(36)
			.substr(2, 1);
	}
	return str;
}

function openSummaryPanel(wrapper, panelId) {
	const summaryPanel = wrapper.find(`div[data-id='properties-${panelId}']`);
	expect(summaryPanel).to.have.length(1);
	summaryPanel.find("button.properties-summary-link-button")
		.simulate("click");
	return wrapper.find("div.properties-wf-content.show");
}

function openFieldPicker(wrapper, dataIdName) {
	const tableWrapper = wrapper.find("div[data-id=\"" + dataIdName + "\"]");
	const addFieldsButtons = tableWrapper.find("button.properties-add-fields-button"); // field picker buttons
	addFieldsButtons.at(0).simulate("click"); // open filter picker
	return wrapper.find("div.properties-fp-table");
}

module.exports = {
	flyoutEditorForm: flyoutEditorForm,
	fieldPicker: fieldPicker,
	selectCheckbox: selectCheckbox,
	setControls: setControls,
	genLongString: genLongString,
	openSummaryPanel: openSummaryPanel,
	openFieldPicker: openFieldPicker,
	validateSelectedRowNum: validateSelectedRowNum
};
