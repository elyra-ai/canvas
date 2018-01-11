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
import { mount } from "enzyme";
import { IntlProvider } from "react-intl";


import { expect } from "chai";
import sinon from "sinon";
import isEqual from "lodash/isEqual";
import oldForm from "../test_resources/json/oldDeriveForm.json";
import deriveDatasetMetadata from "../test_resources/json/deriveDatasetMetadata.json";


const applyPropertyChanges = sinon.spy();
const closePropertiesDialog = sinon.spy();
var controller = null;
function controllerHandler(inController) {
	controller = inController;
}

describe("CommonProperties converts property sets correctly", () => {

	it("should convert inputDataModel into datasetMetadata", () => {
		createCommonProperties2("Modal");
		const form = controller.getForm();
		const newDatasetMetadata = form.data.datasetMetadata;
		const expectedDatasetMetadata = deriveDatasetMetadata;
		// console.log("Expected1: " + JSON.stringify(expectedDatasetMetadata));
		// console.log("Actual1  : " + JSON.stringify(newDatasetMetadata));
		expect(isEqual(JSON.parse(JSON.stringify(expectedDatasetMetadata)),
			JSON.parse(JSON.stringify(newDatasetMetadata)))).to.be.true;
	});
});

function createCommonProperties2(container) {
	const showPropertiesDialog = true;
	const propertiesInfo = {};
	propertiesInfo.formData = oldForm.formData;
	propertiesInfo.appData = {};
	propertiesInfo.additionalComponents = {};
	propertiesInfo.applyPropertyChanges = applyPropertyChanges;
	propertiesInfo.closePropertiesDialog = closePropertiesDialog;

	const locale = "en";
	const wrapper = mount(
		<IntlProvider key="IntlProvider2" locale={ locale } >
			<CommonProperties
				showPropertiesDialog={showPropertiesDialog}
				propertiesInfo={propertiesInfo}
				containerType={container}
				controllerHandler={controllerHandler}
			/>
		</IntlProvider>
	);
	return wrapper;
}
