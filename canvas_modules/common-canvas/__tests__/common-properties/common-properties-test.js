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
import PropertiesDialog from "../../src/common-properties/properties-dialog.jsx";
import PropertiesEditing from "../../src/common-properties/properties-editing.jsx";
import propertyUtils from "../_utils_/property-utils";
import { mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import editStyleResource from "../test_resources/json/form-editstyle-test.json";
import { IntlProvider } from "react-intl";


const applyPropertyChanges = sinon.spy();
const closePropertiesDialog = sinon.spy();

const locale = "en";
const localMessages = {
	"structureTable.addButton.label": "Add Some Stuff",
	"propertiesEdit.applyButton.label": "CONFIRM",
	"propertiesEdit.rejectButton.label": "NOT"
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
		expect(wrapper.find("button[id='properties-cancel-button']").text()).to.equal("NOT");
	});

	it("should override a apply label", () => {
		const wrapper = createCommonProperties("Editing", localMessages);
		expect(wrapper.find("button[id='properties-apply-button']").text()).to.equal("CONFIRM");
	});

	it("should override a structure table add button label", () => {
		const wrapper = createCommonProperties("Editing", localMessages);
		const tableButton = wrapper.find("#field-picker-buttons-container").find("a[id='add-fields-button']");
		expect(tableButton.text()).to.equal("Add Some Stuff");
	});

});

describe("CommonProperties works correctly in flyout", () => {

	it("When applyOnBlur=true only the `Close` button should be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef); // default is applyOnBlur=true
		const wrapper = renderedObject.wrapper;
		expect(wrapper.find("#properties-apply-button").text()).to.equal("Close");
		expect(wrapper.find("#properties-cancel-button")).to.have.length(0);
		wrapper.unmount();
	});

	it("When applyOnBlur=true applyPropertyChanges should be called only if values have changed", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef); // default is applyOnBlur=true
		const wrapper = renderedObject.wrapper;
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		wrapper.find("#common-properties-right-flyout-panel").simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		// make some changes
		const tableBody = wrapper.find("#flexible-table-container").at(0);
		const tableData = tableBody.find(".reactable-data");
		let row = tableData.childAt(0);
		row.simulate("click");

		// ensure remove button is enabled and click it
		const enabledRemoveColumnButton = wrapper.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		enabledRemoveColumnButton.simulate("click");

		// save again: should save changes
		wrapper.find("#common-properties-right-flyout-panel").simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);

		// force blur should not save because no additional changes happened
		wrapper.find("#common-properties-right-flyout-panel").simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);

		// make more changes
		row = tableData.childAt(0);
		row.simulate("click");
		enabledRemoveColumnButton.simulate("click");

		// save again, should trigger a save
		wrapper.find("#common-properties-right-flyout-panel").simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 2);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		wrapper.unmount();
	});

	it("When applyOnBlur=false `Cancel` and `Save` buttons should be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { applyOnBlur: false });
		const wrapper = renderedObject.wrapper;
		expect(wrapper.find("#properties-apply-button").text()).to.equal("Save");
		expect(wrapper.find("#properties-cancel-button").text()).to.equal("Cancel");
		wrapper.unmount();
	});

	it("When applyOnBlur=false applyPropertyChanges should not be called", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { applyOnBlur: false });
		const wrapper = renderedObject.wrapper;
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		// make some changes
		const tableBody = wrapper.find("#flexible-table-container").at(0);
		const tableData = tableBody.find(".reactable-data");
		const row = tableData.childAt(0);
		row.simulate("click");

		// ensure remove button is enabled and click it
		const enabledRemoveColumnButton = wrapper.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);
		enabledRemoveColumnButton.simulate("click");

		// save again: should save changes
		wrapper.find("#common-properties-right-flyout-panel").simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		wrapper.unmount();
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
