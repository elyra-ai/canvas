/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
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
propertiesInfo.applyPropertyChanges = applyPropertyChanges;
propertiesInfo.closePropertiesDialog = closePropertiesDialog;

describe("CommonProperties renders correctly", () => {

	it("all required props should have been defined", () => {
		const wrapper = createCommonProperties("Modal");
		expect(wrapper.prop("showPropertiesDialog")).to.equal(true);
		expect(wrapper.prop("propertiesInfo")).to.equal(propertiesInfo);
		expect(wrapper.prop("containerType")).to.equal("Modal");
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
	let renderedObject;
	beforeEach(() => {
		renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef);
	});

	afterEach(() => {
		renderedObject.wrapper.unmount();
	});
	it("When forceApplyProperties set applyPropertyChanges should be called", () => {
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		renderedObject.wrapper.setProps({ forceApplyProperties: true });
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		renderedObject.wrapper.setProps({ forceApplyProperties: false });
		renderedObject.wrapper.setProps({ forceApplyProperties: true });
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 2);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
	});
});

function createCommonProperties(container, messages) {
	const	wrapper = mount(
		<IntlProvider key="IntlProvider2" locale={ locale } messages={messages}>
			<CommonProperties
				showPropertiesDialog
				propertiesInfo={propertiesInfo}
				containerType={container}
				forceApplyProperties={false}
			/>
		</IntlProvider>
	);
	return wrapper.find("CommonProperties");
}
