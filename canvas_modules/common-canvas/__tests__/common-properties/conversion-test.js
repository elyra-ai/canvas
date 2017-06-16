/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import React from "react";
import CommonProperties from "../../src/common-properties/common-properties.jsx";
import { shallow } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import _ from "underscore";

const applyPropertyChanges = sinon.spy();
const closePropertiesDialog = sinon.spy();

describe("CommonProperties converts property sets correctly", () => {

	it("should convert currentParameters into currentProperties", () => {
		const wrapper = createCommonProperties(true);
		const form = wrapper.instance().getForm();
		const currentProperties = form.data.currentProperties;
		const expectedProps = {
			"string": ["string"],
			"number": ["234"],
			"array": ["AAA", "BBB", "CCC"]
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(expectedProps)), JSON.parse(JSON.stringify(currentProperties)))).to.be.true;
	});

});


function createCommonProperties(useModalDialog) {
	const showPropertiesDialog = true;
	const propertiesInfo = {};

	propertiesInfo.title = <div><h2>"Test Title"</h2></div>;
	propertiesInfo.formData = {};
	propertiesInfo.appData = {};
	propertiesInfo.propertyDef = {};
	propertiesInfo.propertyDef.parameters = [];
	propertiesInfo.propertyDef.uihints = {};
	propertiesInfo.propertyDef.currentParameters = {
		"string": "string",
		"number": 234,
		"array": ["AAA", "BBB", "CCC"]
	};
	propertiesInfo.additionalComponents = {};
	propertiesInfo.applyPropertyChanges = applyPropertyChanges;
	propertiesInfo.closePropertiesDialog = closePropertiesDialog;

	const wrapper = shallow(
		<CommonProperties
			showPropertiesDialog={showPropertiesDialog}
			propertiesInfo={propertiesInfo}
			useModalDialog={useModalDialog}
			applyLabel="Apply"
			rejectLabel="REJECTED"
		/>
	);
	return wrapper;
}
