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

import { expect } from "chai";
import { ControlType } from "../../../src/common-properties/constants/form-constants";
import Controller from "../../../src/common-properties/properties-controller";


describe("validating greaterThan operator works correctly", () => {
	const controller = new Controller();
	const greaterThan = controller.getConditionOp("greaterThan");
	let undefinedPlaceholder;

	const dateStart1 = "2023-03-22T00:00:00.00"; // ISO format
	const dateStart1b = "2023-02-22T00:00:00.00"; // ISO format
	const dateEnd2 = "2023-03-23T00:00:00.00"; // ISO format

	function wrap(val, role = null) {
		return { value: val, control: { controlType: role } };
	}

	function wrapDatepickerRange(val) {
		return { value: val, control: { controlType: ControlType.DATEPICKER } };
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test greaterThan behaves as expected for edge cases", () => {
		// only undefined, number, object can be used, string defaults to true
		expect(greaterThan(wrap("string"), null, null, controller)).to.equal(true);
		expect(function() {
			greaterThan(wrap(undefinedPlaceholder), undefinedPlaceholder, undefinedPlaceholder, controller);
		}).to.throw();
		// object paramInfo with 4 switch case branches
		expect(greaterThan(wrap({ temp: "value" }), wrap(null), null, controller)).to.equal(true);
		expect(greaterThan(wrap(null), wrap(0), null, controller)).to.equal(true);
		expect(greaterThan(wrap(null), wrap(null), "value", controller)).to.equal(true);
		expect(greaterThan(wrap({ temp: "value" }), wrap({ temp: "value2" }), "value3", controller)).to.equal(false);
	});

	it("Test greaterThan behaves as expected comparing paramInfo and paramInfo2", () => {
		// type undefined paramInfo
		expect(greaterThan(wrap(undefinedPlaceholder), wrap(1), null, controller)).to.equal(false);
		expect(greaterThan(wrap(undefinedPlaceholder), wrap("bad string"), null, controller)).to.equal(false);
		// type number paramInfo
		expect(greaterThan(wrap(1), wrap(1), null, controller)).to.equal(false);
		expect(greaterThan(wrap(1), wrap("bad string"), null, controller)).to.equal(false);
		// type date
		expect(greaterThan(wrapDatepickerRange(dateStart1), wrapDatepickerRange(dateEnd2), null, controller)).to.equal(false);
		expect(greaterThan(wrapDatepickerRange(dateEnd2), wrapDatepickerRange(dateStart1), null, controller)).to.equal(true);
		expect(greaterThan(wrapDatepickerRange(dateStart1), wrapDatepickerRange(dateStart1b), null, controller)).to.equal(true);
		expect(greaterThan(wrapDatepickerRange(dateStart1), wrapDatepickerRange(dateStart1), null, controller)).to.equal(false);
	});
	it("Test greaterThan behaves as expected comparing paramInfo and value", () => {
		// type undefined paramInfo
		expect(greaterThan(wrap(undefinedPlaceholder), undefinedPlaceholder, 1, controller)).to.equal(false);
		expect(greaterThan(wrap(undefinedPlaceholder), undefinedPlaceholder, null, controller)).to.equal(true);
		// type number paramInfo
		expect(greaterThan(wrap(1), undefinedPlaceholder, 2, controller)).to.equal(false);
		expect(greaterThan(wrap(1), undefinedPlaceholder, null, controller)).to.equal(true);
		// type date
		expect(greaterThan(wrapDatepickerRange(dateStart1), undefinedPlaceholder, dateEnd2, controller)).to.equal(false);
		expect(greaterThan(wrapDatepickerRange(dateEnd2), undefinedPlaceholder, dateStart1, controller)).to.equal(true);
		expect(greaterThan(wrapDatepickerRange(dateStart1), undefinedPlaceholder, dateStart1b, controller)).to.equal(true);
	});

});
