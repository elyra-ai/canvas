/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CommonProperties from "../../src/common-properties/common-properties.jsx";
import PropertiesDialog from "../../src/common-properties/components/properties-modal";
import PropertiesEditing from "../../src/common-properties/components/properties-editor";
import propertyUtils from "../_utils_/property-utils";
import { mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import editStyleResource from "../test_resources/json/form-editstyle-test.json";
import numberfieldResource from "../test_resources/paramDefs/numberfield_paramDef.json";
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
		"text": "Required parameter 'Undefined' has no value",
		"validation_id": "required_number_undefined_272.9520234285945"
	},
	"number_null": {
		"type": "error",
		"text": "Required parameter 'Null' has no value",
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

const callbacks = {
	applyPropertyChanges: applyPropertyChanges,
	closePropertiesDialog: closePropertiesDialog
};

describe("CommonProperties renders correctly", () => {

	it("all required props should have been defined", () => {
		const wrapper = createCommonProperties("Modal");
		expect(wrapper.prop("propertiesInfo")).to.equal(propertiesInfo);
		expect(wrapper.prop("callbacks")).to.equal(callbacks);
		expect(wrapper.prop("propertiesConfig").containerType).to.equal("Modal");
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
		wrapper.find("div.properties-right-flyout").simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		// make some changes
		const tableData = wrapper.find("tbody.reactable-data");
		let row = tableData.childAt(0);
		row.simulate("click");

		// ensure remove button is enabled and click it
		const enabledRemoveColumnButton = wrapper.find("button.properties-remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		enabledRemoveColumnButton.simulate("click");

		// save again: should save changes
		wrapper.find("div.properties-right-flyout").simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);

		// force blur should not save because no additional changes happened
		wrapper.find("div.properties-right-flyout").simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);

		// make more changes
		row = tableData.childAt(0);
		row.simulate("click");
		enabledRemoveColumnButton.simulate("click");

		// save again, should trigger a save
		wrapper.find("div.properties-right-flyout").simulate("blur");
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
		const tableData = wrapper.find("tbody.reactable-data");
		const row = tableData.childAt(0);
		row.simulate("click");

		// ensure remove button is enabled and click it
		const enabledRemoveColumnButton = wrapper.find("button.properties-remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		enabledRemoveColumnButton.simulate("click");

		// save again: should save changes
		wrapper.find("div.properties-right-flyout").simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
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
		wrapper.find("div.properties-right-flyout").simulate("blur");
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

});

function createCommonProperties(container, messages) {
	const	wrapper = mount(
		<IntlProvider key="IntlProvider2" locale={ locale } messages={messages}>
			<CommonProperties
				propertiesInfo={propertiesInfo}
				propertiesConfig={{ containerType: container }}
				callbacks={callbacks}
			/>
		</IntlProvider>
	);
	return wrapper.find("CommonProperties");
}
