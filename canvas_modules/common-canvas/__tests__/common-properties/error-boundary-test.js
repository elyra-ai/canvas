/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CommonProperties from "../../src/common-properties/common-properties.jsx";
import { mount } from "enzyme";
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
		expect(wrapper.find("button.properties-apply-button.bx--btn.bx--btn--sm.bx--btn--primary")).to.have.length(1);
		expect(wrapper.find("button.properties-apply-button.bx--btn.bx--btn--sm.bx--btn--secondary")).to.have.length(0);
	});
});
