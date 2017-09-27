/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import Expression from "../../../src/common-properties/editor-controls/expression-control.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end


const control = {
	name: "test-areafield",
	charLimit: 256,
	additionalText: "Add expression",
	valueDef: {
		isList: false
	},
	language: "CLEM"
};
const controlId = "test-areafield";
const validationDefinitions = {};
const controlStates = {};

function valueAccessor() {
	return "Test value";
}

function updateControlValue(id, controlValue) {
	expect(id).to.equal(controlId);
}

describe("expression-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<Expression control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controlStates")).to.equal(controlStates);
		expect(wrapper.prop("valueAccessor")).to.equal(valueAccessor);
		expect(wrapper.prop("validationDefinitions")).to.equal(validationDefinitions);
	});

	it("should render a `Expression`", () => {
		const wrapper = mount(
			<Expression control={control}
				valueAccessor={valueAccessor}
				validationDefinitions={validationDefinitions}
				controlStates={controlStates}
				updateControlValue={updateControlValue}
			/>
		);
		const input = wrapper.find(".ReactCodeMirror");
		expect(input).to.have.length(1);
	});

});
