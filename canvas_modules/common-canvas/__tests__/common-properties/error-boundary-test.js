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
import editStyleResource from "../test_resources/json/form-editstyle-test.json";

import { expect } from "chai";
import sinon from "sinon";

const applyPropertyChanges = sinon.spy();
const closePropertiesDialog = sinon.spy();

const locale = "en";

describe("The error boundary class should catch errors and display a fallback UI", () => {
	const propertiesInfo = {};
	propertiesInfo.parameterDef = editStyleResource.paramDef;
	propertiesInfo.appData = {};
	propertiesInfo.additionalComponents = {};
	function throwAnError() {
		throw new Error("This is a fake error thrown for testing purposes.");
	}
	it("When an error is thrown in the constructor of Properties-Main, the error should be caught with a fallback UI containing a button", () => {
		const propertiesConfig = {
			rightFlyoutPanel: true,
			containerType: "Custom"
		};
		const callbacks = {
			applyPropertyChanges: applyPropertyChanges,
			closePropertiesDialog: closePropertiesDialog,
			propertyListener: throwAnError
		};
		const	wrapper = mount(
			<IntlProvider key="IntlProvider2" locale={ locale }>
				<CommonProperties
					propertiesInfo={propertiesInfo}
					callbacks={callbacks}
					propertiesConfig={propertiesConfig}
				/>
			</IntlProvider>
		);
		expect(wrapper.find("div.properties-flyout-error-container")).to.have.length(1);
		expect(wrapper.find("button.properties-apply-button.cds--btn.cds--btn--sm.cds--btn--primary")).to.have.length(1);
		expect(wrapper.find("button.properties-apply-button.cds--btn.cds--btn--sm.cds--btn--secondary")).to.have.length(0);
	});
});
