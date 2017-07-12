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
import { shallow } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import _ from "underscore";
import oldForm from "../test_resources/json/oldDeriveForm.json";
import deriveDatasetMetadata from "../test_resources/json/deriveDatasetMetadata.json";


const applyPropertyChanges = sinon.spy();
const closePropertiesDialog = sinon.spy();

describe("CommonProperties converts property sets correctly", () => {

	it("should convert currentParameters into currentProperties", () => {
		const wrapper = createCommonProperties1(true);
		const form = wrapper.instance().getForm();
		const currentProperties = form.data.currentProperties;
		const expectedProps = {
			"string": ["string"],
			"number": ["234"],
			"array": ["AAA", "BBB", "CCC"]
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(expectedProps)),
			JSON.parse(JSON.stringify(currentProperties)))).to.be.true;
	});

	it("should convert inputDataModel into datasetMetadata", () => {
		const wrapper = createCommonProperties2(true);
		const form = wrapper.instance().getForm();
		const newDatasetMetadata = form.data.datasetMetadata;
		const expectedDatasetMetadata = deriveDatasetMetadata;
		expect(_.isEqual(JSON.parse(JSON.stringify(expectedDatasetMetadata)),
			JSON.parse(JSON.stringify(newDatasetMetadata)))).to.be.true;
	});

});


function createCommonProperties1(useModalDialog) {
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

function createCommonProperties2(useModalDialog) {
	const showPropertiesDialog = true;
	const propertiesInfo = {};
	propertiesInfo.title = <div><h2>"Test Title"</h2></div>;
	propertiesInfo.formData = oldForm.formData;
	propertiesInfo.appData = {};
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
