/*
 * Copyright 2017-2020 Elyra Authors
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
import Controller from "../../../src/common-properties/properties-controller";


describe("validating equals operator works correctly", () => {
	const controller = new Controller();
	const equals = controller.getConditionOp("equals");
	let undefinedPlaceholder;

	function wrap(val, role = null) {
		return { value: val, control: { controlType: role } };
	}

	function emptyFunc() {
		return;
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test equals behaves as expected for edge cases", () => {
		// passwordfield can't use equals, defaults to true
		expect(equals(wrap(undefinedPlaceholder, "passwordfield"), null, null, controller)).to.equal(true);
		expect(function() {
			equals(wrap(undefinedPlaceholder), undefinedPlaceholder, undefinedPlaceholder, controller);
		}).to.throw();
	});

	it("Test equals behaves as expected comparing paramInfo and paramInfo2", () => {
		expect(equals(wrap(undefinedPlaceholder), undefinedPlaceholder, null, controller)).to.equal(false);
		expect(equals(wrap(undefinedPlaceholder), wrap(undefinedPlaceholder), null, controller)).to.equal(true);

		expect(equals(wrap(true), wrap(true), null, controller)).to.equal(true);
		expect(equals(wrap("string"), wrap("string2"), null, controller)).to.equal(false);

		expect(equals(wrap(1), wrap(1), null, controller)).to.equal(true);
		expect(equals(wrap(null), wrap(null), null, controller)).to.equal(true);
		expect(equals(wrap({ temp: "value" }), wrap({ temp: "value2" }), null, controller)).to.equal(false);
		// pass in a function as a way to hit the default switch case
		expect(equals(wrap(emptyFunc), null, null, controller)).to.equal(true);
	});

	it("Test equals behaves as expected comparing paramInfo and value", () => {
		expect(equals(wrap("string"), undefinedPlaceholder, "string2", controller)).to.equal(false);
		expect(equals(wrap(undefinedPlaceholder), undefinedPlaceholder, "not undefined", controller)).to.equal(false);

		expect(equals(wrap(true), undefinedPlaceholder, true, controller)).to.equal(true);
		expect(equals(wrap("string"), undefinedPlaceholder, "string2", controller)).to.equal(false);

		expect(equals(wrap(1), undefinedPlaceholder, 1, controller)).to.equal(true);
		expect(equals(wrap(null), undefinedPlaceholder, null, controller)).to.equal(true);
		expect(equals(wrap({ temp: "value" }), undefinedPlaceholder, { temp: "value2" }, controller)).to.equal(false);
		// pass in a function as a way to hit the default switch case
		expect(equals(wrap(emptyFunc), undefinedPlaceholder, null, controller)).to.equal(true);
	});


});
