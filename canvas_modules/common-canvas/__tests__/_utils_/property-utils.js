/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CommonProperties from "../../src/common-properties/common-properties.jsx";
import EditorForm from "../../src/common-properties/components/editor-form";
import UiConditionsParser from "../../src/common-properties/ui-conditions/ui-conditions-parser.js";
import { mountWithIntl, shallowWithIntl } from "enzyme-react-intl";
import { expect } from "chai";

import CustomTableControl from "./custom-controls/CustomTableControl";
import CustomToggleControl from "./custom-controls/CustomToggleControl";
import CustomOpMax from "./custom-condition-ops/customMax";

import sinon from "sinon";
var renderedController;
function controllerHandler(propertyController) {
	renderedController = propertyController;
}

function flyoutEditorForm(paramDef, propertiesConfig) {
	const applyPropertyChanges = sinon.spy();
	const closePropertiesDialog = sinon.spy();
	const callbacks = {
		applyPropertyChanges: applyPropertyChanges,
		closePropertiesDialog: closePropertiesDialog,
		controllerHandler: controllerHandler
	};

	const propertiesInfo = {
		parameterDef: JSON.parse(JSON.stringify(paramDef))
	};
	let applyOnBlur = true;
	if (propertiesConfig && typeof propertiesConfig.applyOnBlur !== "undefined") {
		applyOnBlur = propertiesConfig.applyOnBlur;
	}
	const wrapper = mountWithIntl(
		<CommonProperties
			propertiesInfo={propertiesInfo}
			propertiesConfig={{ containerType: "Custom", rightFlyout: true, applyOnBlur: applyOnBlur }}
			callbacks={callbacks}
			customControls={[CustomTableControl, CustomToggleControl]}
			customConditionOps={[CustomOpMax]}
		/>
	);

	return { wrapper: wrapper, controller: renderedController, callbacks: callbacks };
}

function createEditorForm(state, formData, controller) {
	const additionalComponents = null;
	const showPropertiesButtons = sinon.spy();

	controller.setForm(formData);

	let wrapper;
	const editorForm = (<EditorForm
		ref="editorForm"
		key="editor-form-key"
		controller={controller}
		additionalComponents={additionalComponents}
		showPropertiesButtons={showPropertiesButtons}
	/>);
	if (state === "shallow") {
		wrapper = shallowWithIntl(editorForm);
	} else {
		wrapper = mountWithIntl(editorForm);
	}
	return wrapper;
}

// expectedFields is optional
// fieldsToSelect is an array of field names or objects with name and schema. ex: { "name": "age", "schema": "schema1" }
function fieldPicker(fieldpickerWrapper, fieldsToSelect, expectedFields) {
	if (expectedFields) {
		const rows = fieldpickerWrapper.find("tr.properties-fp-data-rows");
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
		const checkbox = fieldpickerWrapper.find(`input[data-name="${field}"]`);
		expect(checkbox).to.have.length(1);
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
	}

	fieldpickerWrapper.find("button[data-id='properties-apply-button']").simulate("click"); // applies the field picker
}

function selectCheckbox(wrapper, idx, id) {
	const integerCheckbox = wrapper.find("input[type='checkbox']").at(idx);
	integerCheckbox.simulate("change", { target: { checked: true, id: id } });
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
	createEditorForm: createEditorForm,
	fieldPicker: fieldPicker,
	selectCheckbox: selectCheckbox,
	setControls: setControls,
	genLongString: genLongString,
	openSummaryPanel: openSummaryPanel,
	openFieldPicker: openFieldPicker
};
