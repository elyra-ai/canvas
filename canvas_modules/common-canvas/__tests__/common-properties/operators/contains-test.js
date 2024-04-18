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
import Controller from "../../../src/common-properties/properties-controller";


describe("validating contains operator works correctly", () => {
	const controller = new Controller();
	const contains = controller.getConditionOp("contains");
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

	it("Test contains behaves as expected for edge cases", () => {
		// passwordfield can't use contains, defaults to true
		expect(contains(wrap(undefinedPlaceholder, "passwordfield"), null, null, controller)).to.equal(true);
		expect(function() {
			contains(wrap(undefinedPlaceholder), undefinedPlaceholder, undefinedPlaceholder, controller);
		}).to.throw();
	});

	it("Test contains behaves as expected comparing paramInfo and paramInfo2", () => {
		expect(contains(wrap(undefinedPlaceholder), null, null, controller)).to.equal(false);
		expect(contains(wrap("she believed"), wrap("sbeve"), null, controller)).to.equal(false);
		expect(contains(wrap("sbeve"), wrap("be"), null, controller)).to.equal(true);
		expect(contains(wrap(null), wrap(null), null, controller)).to.equal(false);
		expect(contains(wrap([1, 2, 3]), wrap(2), null, controller)).to.equal(true);
		expect(contains(wrap(["test 1", "test 2"]), wrap("test 1"), null, controller)).to.equal(true);
		expect(contains(wrap(["test 1", "test 2"]), wrap("test"), null, controller)).to.equal(false);
		// pass in a function as a way to hit the default switch case
		expect(contains(wrap(emptyFunc), wrap("string"), null, controller)).to.equal(true);
	});

	it("Test contains behaves as expected comparing paramInfo and value", () => {
		expect(contains(wrap(undefinedPlaceholder), null, null, controller)).to.equal(false);
		expect(contains(wrap("she believed"), undefinedPlaceholder, "sbeve", controller)).to.equal(false);
		expect(contains(wrap("sbeve"), undefinedPlaceholder, "be", controller)).to.equal(true);
		expect(contains(wrap(null), undefinedPlaceholder, null, controller)).to.equal(false);
		expect(contains(wrap([1, 2, 3]), undefinedPlaceholder, 2, controller)).to.equal(true);
		expect(contains(wrap(["test 1", "test 2"]), undefinedPlaceholder, "test 1", controller)).to.equal(true);
		expect(contains(wrap(["test 1", "test 2"]), undefinedPlaceholder, "test", controller)).to.equal(false);
		// pass in a function as a way to hit the default switch case
		expect(contains(wrap(emptyFunc), undefinedPlaceholder, "string", controller)).to.equal(true);
	});


});
