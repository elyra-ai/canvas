/*
 * Copyright 2023 Elyra Authors
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

import { expect } from "chai";
import { ControlType } from "../../../src/common-properties/constants/form-constants";
import Controller from "../../../src/common-properties/properties-controller";

describe("validating isNotEmpty operator works correctly", () => {
	const controller = new Controller();
	const isNotEmpty = controller.getConditionOp("isNotEmpty");
	let undefinedPlaceholder;

	function wrap(val) {
		return { value: val, control: { controlType: ControlType.TEXTFIELD } }; // controlType can be anything
	}

	function wrapDatepickerRange(val) {
		return { value: val, control: { controlType: ControlType.DATEPICKERRANGE } };
	}

	function emptyFunc() {
		return;
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test isNotEmpty returns as expected when trimSpaces set to true", () => {
		controller.setPropertiesConfig({ trimSpaces: true });
		expect(isNotEmpty(wrap(undefinedPlaceholder), null, null, controller)).to.equal(false);
		expect(isNotEmpty(wrap(true), null, null, controller)).to.equal(true);
		// string cases
		expect(isNotEmpty(wrap(""), null, null, controller)).to.equal(false);
		expect(isNotEmpty(wrap("  "), null, null, controller)).to.equal(false);
		expect(isNotEmpty(wrap("not empty string"), null, null, controller)).to.equal(true);
		// object cases
		expect(isNotEmpty(wrap(1, "textfield"), null, null, controller)).to.equal(true);
		expect(isNotEmpty(wrap([]), null, null, controller)).to.equal(false);
		expect(isNotEmpty(wrap({ temp: "value" }), null, null, controller)).to.equal(true);
		// dates
		expect(isNotEmpty(wrap(new Date("2023-03-22T00:00:00")), null, null, controller)).to.equal(true);
		expect(isNotEmpty(wrap(new Date(null)), null, null, controller)).to.equal(true);
		expect(isNotEmpty(wrapDatepickerRange(["2023-03-22", "2023-03-22"]), null, null, controller)).to.equal(true);
		expect(isNotEmpty(wrapDatepickerRange(["2023-03-22", ""]), null, null, controller)).to.equal(true);
		expect(isNotEmpty(wrapDatepickerRange([" ", "2023-03-22"]), null, null, controller)).to.equal(true);
		expect(isNotEmpty(wrapDatepickerRange([" ", ""]), null, null, controller)).to.equal(false);
		// pass in a function as a way to hit the default switch case
		expect(isNotEmpty(wrap(emptyFunc), null, null, controller)).to.equal(true);
	});

	it("Test isNotEmpty returns as expected when trimSpaces set to false", () => {
		controller.setPropertiesConfig({ trimSpaces: false });
		// string cases
		expect(isNotEmpty(wrap(""), null, null, controller)).to.equal(false);
		expect(isNotEmpty(wrap("  "), null, null, controller)).to.equal(true);
		expect(isNotEmpty(wrap("not empty string"), null, null, controller)).to.equal(true);
	});
});
