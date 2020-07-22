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
import { CommonProperties } from "../../src/common-properties";
import PropertiesDialog from "../../src/common-properties/components/properties-modal";
import PropertiesEditing from "../../src/common-properties/components/properties-editor";
import propertyUtils from "../_utils_/property-utils";
import tableUtils from "../_utils_/table-utils";
import { mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import editStyleResource from "../test_resources/json/form-editstyle-test.json";
import expressionTestResource from "../test_resources/json/expression-one-category.json";

import numberfieldResource from "../test_resources/paramDefs/numberfield_paramDef.json";
import emptyParamDef from "../test_resources/paramDefs/empty_paramDef.json";
import structureListEditorParamDef from "../test_resources/paramDefs/structurelisteditor_paramDef.json";
import { IntlProvider } from "react-intl";


const applyPropertyChanges = sinon.spy();
const closePropertiesDialog = sinon.spy();

const locale = "en";
const localMessages = {
	"structureTable.addButton.label": "Add Some Stuff",
	"propertiesEdit.applyButton.label": "CONFIRM",
	"propertiesEdit.rejectButton.label": "NOT"
};

const validationErrorMessages = {
	"number_undefined": {
		"type": "error",
		"text": "Required parameter 'Undefined' has no value.",
		"validation_id": "required_number_undefined_272.9520234285945"
	},
	"number_null": {
		"type": "error",
		"text": "Required parameter 'Null' has no value.",
		"validation_id": "required_number_null_401.11526920064296"
	},
	"number_error": {
		"type": "error",
		"text": "Needs to be greaterThan 0",
		"validation_id": "number_error"
	},
	"number_warning": {
		"type": "warning",
		"text": "Needs to be greaterThan 1",
		"validation_id": "number_warning"
	},
	"number_table": {
		"0": {
			"0": {
				"type": "error",
				"text": "Needs to be greaterThan 1",
				"validation_id": "number_table"
			},
			"1": {
				"type": "warning",
				"text": "Needs to be greaterThan 1",
				"validation_id": "number_table"
			}
		}
	}
};

const propertiesInfo = {};
propertiesInfo.parameterDef = editStyleResource.paramDef;
propertiesInfo.appData = {};
propertiesInfo.additionalComponents = {};
propertiesInfo.messages = [
	{
		"id_ref": "samplingSize",
		"validation_id": "samplingSize",
		"type": "warning",
		"text": "Incorrect sample size"
	}
];

const callbacks = {
	applyPropertyChanges: applyPropertyChanges,
	closePropertiesDialog: closePropertiesDialog
};

describe("CommonProperties renders correctly", () => {

	it("all required props should have been defined", () => {
		const wrapper = createCommonProperties("Editing");
		expect(wrapper.prop("propertiesInfo")).to.equal(propertiesInfo);
		expect(wrapper.prop("callbacks")).to.equal(callbacks);
		expect(wrapper.prop("propertiesConfig").containerType).to.equal("Editing");
	});

	it("should render one <PropertiesDialog/> component", () => {
		const wrapper = createCommonProperties("Modal");
		expect(wrapper.find(PropertiesDialog)).to.have.length(1);
	});

	it("should render one <PropertiesEditing/> component", () => {
		const wrapper = createCommonProperties("Editing");
		expect(wrapper.find(PropertiesEditing)).to.have.length(1);
	});

	it("should override a reject label", () => {
		const wrapper = createCommonProperties("Editing", localMessages);
		expect(wrapper.find("button[data-id='properties-cancel-button']").text()).to.equal("NOT");
	});

	it("should override a apply label", () => {
		const wrapper = createCommonProperties("Editing", localMessages);
		expect(wrapper.find("button[data-id='properties-apply-button']").text()).to.equal("CONFIRM");
	});

	it("should override a structure table add button label", () => {
		const wrapper = createCommonProperties("Editing", localMessages);
		const tableButton = wrapper.find("div.properties-column-structure").find("span.properties-icon-button-label");
		expect(tableButton.text()).to.equal("Add Some Stuff");
	});
});

describe("CommonProperties works correctly in flyout", () => {
	let wrapper;
	afterEach(() => {
		wrapper.unmount();
	});

	it("When applyOnBlur=true only the `Close` button should be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const buttonWrapper = wrapper.find("div.properties-modal-buttons");
		expect(buttonWrapper.find("button[data-id='properties-apply-button']").text()).to.equal("Close");
		expect(buttonWrapper.find("button[data-id='properties-cancel-button']")).to.have.length(0);
	});

	it("When applyOnBlur=true applyPropertyChanges should be called only if values have changed", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		const commonProperties = wrapper.find("div.properties-right-flyout").at(1);
		commonProperties.simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		// make some changes
		tableUtils.selectCheckboxes(commonProperties, [0]);

		// ensure remove button is enabled and click it
		const enabledRemoveColumnButton = wrapper.find("button.properties-remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		enabledRemoveColumnButton.simulate("click");

		// save again: should save changes
		commonProperties.simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);

		// force blur should not save because no additional changes happened
		commonProperties.simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);

		// make more changes
		tableUtils.selectCheckboxes(commonProperties, [0]);
		enabledRemoveColumnButton.simulate("click");

		// save again, should trigger a save
		commonProperties.simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 2);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
	});

	it("When applyOnBlur=false `Cancel` and `Save` buttons should be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { applyOnBlur: false });
		wrapper = renderedObject.wrapper;
		expect(wrapper.find("button[data-id='properties-apply-button']").text()).to.equal("Save");
		expect(wrapper.find("button[data-id='properties-cancel-button']").text()).to.equal("Cancel");
	});

	it("When applyOnBlur=false applyPropertyChanges should not be called", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { applyOnBlur: false });
		wrapper = renderedObject.wrapper;
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		// make some changes
		tableUtils.selectCheckboxes(wrapper, [0]);

		// ensure remove button is enabled and click it
		const enabledRemoveColumnButton = wrapper.find("button.properties-remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		enabledRemoveColumnButton.simulate("click");

		// save again: should save changes
		wrapper.find("div.properties-right-flyout").at(1)
			.simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
	});

	it("When enableResize=false resize button should not be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { enableResize: false });
		wrapper = renderedObject.wrapper;
		expect(wrapper.find("button.properties-btn-resize")).to.have.length(0);
	});

	it("When enableSize is omitted resize button should be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef);
		wrapper = renderedObject.wrapper;
		expect(wrapper.find("button.properties-btn-resize")).to.have.length(1);
	});

	it("When enableResize=true resize button should be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		expect(wrapper.find("div.properties-small")).to.have.length(1);
		expect(wrapper.find("div.properties-medium")).to.have.length(0);
		resizeBtn.simulate("click");
		expect(wrapper.find("div.properties-small")).to.have.length(0);
		expect(wrapper.find("div.properties-medium")).to.have.length(1);
		resizeBtn.simulate("click");
		expect(wrapper.find("div.properties-small")).to.have.length(1);
		expect(wrapper.find("div.properties-medium")).to.have.length(0);
	});

	it("When enableResize=true and editor_size=small resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		expect(wrapper.find("div.properties-small")).to.have.length(1);
		expect(wrapper.find("div.properties-medium")).to.have.length(0);
		resizeBtn.simulate("click");
		expect(wrapper.find("div.properties-small")).to.have.length(0);
		expect(wrapper.find("div.properties-medium")).to.have.length(1);
		resizeBtn.simulate("click");
		expect(wrapper.find("div.properties-small")).to.have.length(1);
		expect(wrapper.find("div.properties-medium")).to.have.length(0);
	});

	it("When enableResize=true and editor_size=medium resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
	});

	it("When enableResize=true and editor_size=small and pixel_width min and max are set resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		expect(wrapper.find("div.properties-small")).to.have.length(1);
		expect(wrapper.find("div.properties-medium")).to.have.length(0);
		expect(wrapper.find("div.properties-small").get(0).props.style).to.have.property("width", "400px");
		resizeBtn.simulate("click");
		expect(wrapper.find("div.properties-small")).to.have.length(0);
		expect(wrapper.find("div.properties-medium")).to.have.length(1);
		expect(wrapper.find("div.properties-medium").get(0).props.style).to.have.property("width", "800px");
		resizeBtn.simulate("click");
		expect(wrapper.find("div.properties-small")).to.have.length(1);
		expect(wrapper.find("div.properties-medium")).to.have.length(0);
		expect(wrapper.find("div.properties-small").get(0).props.style).to.have.property("width", "400px");
	});

	it("When enableResize=true and editor_size=medium and pixel_width min and max are set resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		expect(wrapper.find("div.properties-medium")).to.have.length(1);
		expect(wrapper.find("div.properties-large")).to.have.length(0);
		expect(wrapper.find("div.properties-medium").get(0).props.style).to.have.property("width", "400px");
		resizeBtn.simulate("click");
		expect(wrapper.find("div.properties-medium")).to.have.length(0);
		expect(wrapper.find("div.properties-large")).to.have.length(1);
		expect(wrapper.find("div.properties-large").get(0).props.style).to.have.property("width", "800px");
		resizeBtn.simulate("click");
		expect(wrapper.find("div.properties-medium")).to.have.length(1);
		expect(wrapper.find("div.properties-large")).to.have.length(0);
		expect(wrapper.find("div.properties-medium").get(0).props.style).to.have.property("width", "400px");
	});

	it("When enableResize=true and editor_size=small and pixel_width min and max are the same the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 800, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(wrapper.find("div.properties-small")).to.have.length(1);
		expect(wrapper.find("div.properties-small").get(0).props.style).to.have.property("width", "800px");
	});

	it("When enableResize=true and editor_size=medium and pixel_width min and max are the same the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 800, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(wrapper.find("div.properties-medium")).to.have.length(1);
		expect(wrapper.find("div.properties-medium").get(0).props.style).to.have.property("width", "800px");
	});

	it("When enableResize=true and editor_size=large and pixel_width is ommited the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(wrapper.find("div.properties-large")).to.have.length(1);
	});

	it("When enableResize=true and editor_size=large and pixel_width min and max is provided the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(wrapper.find("div.properties-large")).to.have.length(1);
		expect(wrapper.find("div.properties-large").get(0).props.style).to.have.property("width", "800px");
	});

	it("When enableResize=true and editor_size is omitted and pixel_width min and max are the same the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 800, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(wrapper.find("div.properties-small")).to.have.length(1);
		expect(wrapper.find("div.properties-small").get(0).props.style).to.have.property("width", "800px");
	});

	it("When no groups or parameters are defined the flyout should still render", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(emptyParamDef);
		wrapper = renderedObject.wrapper;
		expect(wrapper.find("div.properties-wrapper")).to.have.length(1);
		expect(wrapper.find("div.properties-title-editor")).to.have.length(1);
		expect(wrapper.find("div.properties-custom-container")).to.have.length(1);
		expect(wrapper.find("div.properties-modal-buttons")).to.have.length(1);
	});
});

describe("CommonProperties validates on close in flyout", () => {
	let wrapper;
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate input when applyOnBlur=true the `Close` button pressed", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
		// click close and expect validation error messsages
		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify(validationErrorMessages));
	});

	it("Validate input when applyOnBlur=true and focus changes", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));

		// similate blur with no changes, expect validation error messages
		wrapper.find("div.properties-right-flyout").at(1)
			.simulate("blur");
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify(validationErrorMessages));
	});


	it("Validate input when applyOnBlur=false the `Save` button pressed", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, { applyOnBlur: false });
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
		// click save and expect validation error messsages
		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify(validationErrorMessages));
	});

	it("Do not validate input when applyOnBlur=false the `Cancel` button pressed", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, { applyOnBlur: false });
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
		// click cancel and expect validation error messsages
		wrapper.find("button[data-id='properties-cancel-button']")
			.at(0)
			.simulate("click");
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
	});

	it("Validate returned property values when conditionReturnValueHandling='value'", (done) => {
		const myApplyPropertyChanges = function(values) {
			expect(values.number_hidden).to.equal(10);
			done();
		};
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, { conditionReturnValueHandling: "value" },
			{ applyPropertyChanges: myApplyPropertyChanges });
		wrapper = renderedObject.wrapper;
		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
	});

	it("Validate returned property values when conditionReturnValueHandling not set configuration", (done) => {
		const myApplyPropertyChanges = function(values) {
			expect(values.number_hidden).to.equal(10);
			done();
		};
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, null,
			{ applyPropertyChanges: myApplyPropertyChanges });
		wrapper = renderedObject.wrapper;
		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
	});

	it("Validate returned property values when conditionReturnValueHandling='null'", (done) => {
		const myApplyPropertyChanges = function(values) {
			expect(values.number_hidden).to.be.undefined;
			done();
		};
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, { conditionReturnValueHandling: "null" },
			{ applyPropertyChanges: myApplyPropertyChanges });
		wrapper = renderedObject.wrapper;
		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
	});

});

describe("CommonProperties validates on open correctly", () => {
	let wrapper;
	afterEach(() => {
		wrapper.unmount();
	});

	it("If messages are passed in then validate (generate errors)", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, null, null, { messages: propertiesInfo.messages });
		wrapper = renderedObject.wrapper;
		expect(wrapper.find("div[data-id='properties-alerts-panel']")).to.have.length(1);
	});

	it("If messages are not passed in then no validation", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource);
		wrapper = renderedObject.wrapper;
		expect(wrapper.find("div[data-id='properties-alerts-panel']")).to.have.length(0);

	});
});

describe("applyPropertiesEditing through an instance outside Common Properties", () => {
	it("If true is passed in, applyPropertiesEditing should trigger a applyPropertiesDialog and closePropertiesDialog callback", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		const commonProperties = renderedObject.wrapper.find("CommonProperties");
		commonProperties.instance().applyPropertiesEditing(true);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
	});
	it("If false is passed in, applyPropertiesEditing should trigger a applyPropertiesDialog and closePropertiesDialog callback", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		const commonProperties = renderedObject.wrapper.find("CommonProperties");
		commonProperties.instance().applyPropertiesEditing(false);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
	});
});

describe("New error messages of a control should be detected and applyPropertyChanges() should be called onBlur and on close", () => {
	it("An error message in expression control should trigger a applyPropertyChanges callback when editor is closed", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(expressionTestResource); // default is applyOnBlur=true
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		renderedObject.wrapper.find("CommonProperties").find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 1);
	});
	it("An error message in expression control should trigger a applyPropertyChanges callback on blur", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(expressionTestResource); // default is applyOnBlur=true
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		renderedObject.wrapper.find("CommonProperties").find("div.properties-title-editor")
			.at(0)
			.simulate("click"); // Focus on the editor
		renderedObject.wrapper.find("div.properties-right-flyout").at(1)
			.simulate("blur"); // On blur
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
	});
});

describe("CommonProperties should setForm correctly", () => {
	it("getPropertyValue: form should set correctly with the currentParameters converted from object to array in object structure control", () => {
		// Verify input currentParameters converts correctly to internal format
		const renderedObject = propertyUtils.flyoutEditorForm(structureListEditorParamDef); // default is applyOnBlur=true
		const controller = renderedObject.controller;
		const internalFormat = controller.getPropertyValue({ name: "structurelisteditorObjectType" });
		const expected = [[1, "Hello", "World", "string", "Readonly phrase"]];
		expect(internalFormat).to.eql(expected);

		// Verify internal format gets returned correctly as array of objects
		const originalFormat = structureListEditorParamDef.current_parameters.structurelisteditorObjectType;
		const objectFormat = controller.getPropertyValue({ name: "structurelisteditorObjectType" }, { applyProperties: true });
		expect(objectFormat).to.eql(originalFormat);
	});

	it("getPropertyValues: form should set correctly with the currentParameters converted from object to array in object structure control", () => {
		// Verify input currentParameters converts correctly to internal format
		const renderedObject = propertyUtils.flyoutEditorForm(structureListEditorParamDef); // default is applyOnBlur=true
		const controller = renderedObject.controller;
		const internalFormat = controller.getPropertyValues().structurelisteditorObjectType;
		const expected = [[1, "Hello", "World", "string", "Readonly phrase"]];
		expect(internalFormat).to.eql(expected);

		// Verify internal format gets returned correctly as array of objects
		const originalFormat = structureListEditorParamDef.current_parameters.structurelisteditorObjectType;
		const objectFormat = controller.getPropertyValues({ applyProperties: true }).structurelisteditorObjectType;
		expect(objectFormat).to.eql(originalFormat);
	});
});

function createCommonProperties(container, messages) {
	const propertiesConfig = { containerType: container };
	if (container === "Custom") {
		propertiesConfig.rightFlyout = true;
	}
	const	wrapper = mount(
		<IntlProvider key="IntlProvider2" locale={ locale } messages={messages}>
			<CommonProperties
				propertiesInfo={propertiesInfo}
				propertiesConfig={propertiesConfig}
				callbacks={callbacks}
			/>
		</IntlProvider>
	);
	return wrapper.find("CommonProperties");
}
