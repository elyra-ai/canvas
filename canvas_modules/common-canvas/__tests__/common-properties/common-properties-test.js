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
import { shallow } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";

const applyPropertyChanges = sinon.spy();
const closePropertiesDialog = sinon.spy();

describe("CommonProperties renders correctly", () => {

	it("all required props should have been defined", () => {
		const wrapper = createCommonProperties(true);

		expect(wrapper.showPropertiesDialog).to.be.defined;
		expect(wrapper.propertiesInfo).to.be.defined;
		expect(wrapper.applyPropertyChanges).to.be.defined;
		expect(wrapper.closePropertiesDialog).to.be.defined;
	});

	it("should render one <PropertiesDialog/> component", () => {
		const wrapper = createCommonProperties(true);
		expect(wrapper.find(PropertiesDialog)).to.have.length(1);
	});

	it("should render one <PropertiesEditing/> component", () => {
		const wrapper = createCommonProperties(false);
		expect(wrapper.find(PropertiesEditing)).to.have.length(1);
	});

	it("should render the applyLabel property", () => {
		const wrapper = createCommonProperties(false);
		expect(wrapper.instance().props.applyLabel).to.equal("Apply");
	});

	it("should render the rejectLabel property", () => {
		const wrapper = createCommonProperties(false);
		expect(wrapper.instance().props.rejectLabel).to.equal("REJECTED");
	});

});

function createCommonProperties(useModalDialog) {
	const showPropertiesDialog = true;
	const propertiesInfo = {};

	propertiesInfo.title = <div><h2>"Test Title"</h2></div>;
	propertiesInfo.formData = {};
	propertiesInfo.appData = {};
	propertiesInfo.additionalComponents = {};
	propertiesInfo.applyPropertyChanges = applyPropertyChanges;
	propertiesInfo.closePropertiesDialog = closePropertiesDialog;

	const wrapper = shallow(
		<CommonProperties
			showPropertiesDialog={showPropertiesDialog}
			propertiesInfo={propertiesInfo}
			useModalDialog={useModalDialog}
			useOwnContainer={false}
			applyLabel="Apply"
			rejectLabel="REJECTED"
		/>
	);

	return wrapper;
}
