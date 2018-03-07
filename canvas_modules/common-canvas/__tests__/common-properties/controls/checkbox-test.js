/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// import CheckboxControl from "../../../src/common-properties/editor-controls/checkbox-control.jsx";
import { expect } from "chai";
import propertyUtils from "../../_utils_/property-utils";
import Controller from "../../../src/common-properties/properties-controller";
import isEqual from "lodash/isEqual";

const CONDITIONS_TEST_FORM_DATA = require("../../test_resources/json/conditions-test-formData.json");

const controller = new Controller();

describe("condition messages renders correctly with checkbox control", () => {
	it("checkboxTypes control should have warning message if none are checked", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);

		const input = wrapper.find("#editor-control-checkboxTypes");
		expect(input).to.have.length(1);
		expect(input.find("input[type='checkbox']")).to.have.length(3);
		let checkbox = wrapper.find("input[type='checkbox']").at(1);
		checkbox.simulate("change", { target: { checked: true, id: "string" } });
		wrapper.update();

		const checkboxSingleMessages = {
			"type": "error",
			"text": "Checkbox single should be checked if data type is selected"
		};
		var checkboxTypesMessages = {
			"type": "error",
			"text": "Checkbox single should be checked if data type is selected"
		};
		const actual = controller.getErrorMessage({ name: "checkboxSingle" });
		expect(isEqual(JSON.parse(JSON.stringify(checkboxSingleMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		let actualType = controller.getErrorMessage({ name: "checkboxTypes" });
		expect(isEqual(JSON.parse(JSON.stringify(checkboxTypesMessages)),
			JSON.parse(JSON.stringify(actualType)))).to.be.true;

		expect(wrapper.find(".validation-error-message-icon-checkbox")).to.have.length(1);
		expect(wrapper.find(".validation-error-message-icon-checkboxset")).to.have.length(1);
		expect(wrapper.find(".validation-error-message-color-error")).to.have.length(2);

		checkbox = wrapper.find("input[type='checkbox']").at(1);
		checkbox.simulate("change", { target: { checked: false, id: "string" } });
		wrapper.update();

		checkboxTypesMessages = {
			"type": "warning",
			"text": "No data types are selected"
		};
		actualType = controller.getErrorMessage({ name: "checkboxTypes" });
		expect(isEqual(JSON.parse(JSON.stringify(checkboxTypesMessages)),
			JSON.parse(JSON.stringify(actualType)))).to.be.true;

		expect(wrapper.find(".validation-warning-message-icon-checkboxset")).to.have.length(1);
		expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(1);
	});
});
