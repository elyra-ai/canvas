/*
 * Copyright 2017-2023 Elyra Authors
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
import CommonProperties from "../../src/common-properties/common-properties.jsx";
import { mount } from "../_utils_/mount-utils.js";
import { IntlProvider } from "react-intl";


import { expect } from "chai";
import sinon from "sinon";
import isEqual from "lodash/isEqual";
import oldForm from "../test_resources/json/oldDeriveForm.json";
import deriveDatasetMetadata from "../test_resources/json/deriveDatasetMetadata.json";


const applyPropertyChanges = sinon.spy();
const closePropertiesDialog = sinon.spy();
let controller = null;
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
	const propertiesInfo = {};
	propertiesInfo.formData = oldForm.formData;
	propertiesInfo.appData = {};
	propertiesInfo.additionalComponents = {};
	const callbacks = {
		applyPropertyChanges: applyPropertyChanges,
		closePropertiesDialog: closePropertiesDialog,
		controllerHandler: controllerHandler
	};

	const locale = "en";
	const wrapper = mount(
		<IntlProvider key="IntlProvider2" locale={ locale } >
			<CommonProperties
				propertiesInfo={propertiesInfo}
				propertiesConfig={{ containerType: container }}
				callbacks={callbacks}
			/>
		</IntlProvider>
	);
	return wrapper;
}
