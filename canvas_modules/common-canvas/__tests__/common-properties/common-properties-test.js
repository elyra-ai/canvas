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
import { mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import editStyleResource from "../test_resources/json/form-editstyle-test.json";

const applyPropertyChanges = sinon.spy();
const closePropertiesDialog = sinon.spy();

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
		expect(wrapper.prop("applyLabel")).to.equal("Apply");
		expect(wrapper.prop("rejectLabel")).to.equal("REJECTED");
	});

	it("should render one <PropertiesDialog/> component", () => {
		const wrapper = createCommonProperties("Modal");
		expect(wrapper.find(PropertiesDialog)).to.have.length(1);
	});

	it("should render one <PropertiesEditing/> component", () => {
		const wrapper = createCommonProperties("Editing");
		expect(wrapper.find(PropertiesEditing)).to.have.length(1);
	});

	it("should render the applyLabel property", () => {
		const wrapper = createCommonProperties("Editing");
		expect(wrapper.instance().props.applyLabel).to.equal("Apply");
	});

	it("should render the rejectLabel property", () => {
		const wrapper = createCommonProperties("Editing");
		expect(wrapper.instance().props.rejectLabel).to.equal("REJECTED");
	});

});

function createCommonProperties(container) {
	const wrapper = mount(
		<CommonProperties
			showPropertiesDialog
			propertiesInfo={propertiesInfo}
			containerType={container}
			applyLabel="Apply"
			rejectLabel="REJECTED"
		/>
	);
	return wrapper;
}
