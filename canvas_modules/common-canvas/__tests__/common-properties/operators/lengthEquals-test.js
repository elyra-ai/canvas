/*
 * Copyright 2017-2025 Elyra Authors
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


describe("validating lengthEquals operator works correctly", () => {
	const controller = new Controller();
	const lengthEquals = controller.getConditionOp("lengthEquals");
	let undefinedPlaceholder;

	function wrap(val) {
		return { value: val, param: "test" };
	}

	it("Test lengthEquals behaves as expected for edge cases", () => {
		console.warn = jest.fn();
		expect(lengthEquals(wrap("test"), null, null, controller)).to.equal(true); // null/undefined not support for value to check
		expect(console.warn.mock.calls[0][0]).to.equal("[WARNING]: Ignoring condition operation 'lengthEquals' for parameter_ref test: ");
		expect(lengthEquals(wrap(1), null, null, controller)).to.equal(true); // numeric value length not supported
		expect(console.warn.mock.calls[1][0]).to.equal("[WARNING]: Ignoring condition operation 'lengthEquals' for parameter_ref test: ");
		expect(lengthEquals(wrap(undefinedPlaceholder), null, 0, controller)).to.equal(true); // undefined should return a length of 0
		expect(lengthEquals(wrap(undefinedPlaceholder), null, 1, controller)).to.equal(false); // undefined should return a length of 0
		expect(lengthEquals(wrap(null), null, 0, controller)).to.equal(true); // null should return a length of 0
		expect(lengthEquals(wrap(null), null, 1, controller)).to.equal(false); // null should return a length of 0

		// string not supported in paramInfo2
		expect(lengthEquals(wrap([1, 2, 3]), wrap("test"), null, controller)).to.equal(true);
		expect(console.warn.mock.calls[2][0]).to.equal("[WARNING]: Ignoring condition operation 'lengthEquals' for parameter_ref test: ");
		// undefined not supported in paramInfo2
		expect(lengthEquals(wrap("test"), wrap(undefinedPlaceholder), null, controller)).to.equal(true);
		expect(console.warn.mock.calls[3][0]).to.equal("[WARNING]: Ignoring condition operation 'lengthEquals' for parameter_ref test: ");
		// null not supported in paramInfo2
		expect(lengthEquals(wrap("test"), wrap(null), null, controller)).to.equal(true);
		expect(console.warn.mock.calls[4][0]).to.equal("[WARNING]: Ignoring condition operation 'lengthEquals' for parameter_ref test: ");

		// string not supported in value
		expect(lengthEquals(wrap([1, 2, 3]), null, "test", controller)).to.equal(true);
		expect(console.warn.mock.calls[5][0]).to.equal("[WARNING]: Ignoring condition operation 'lengthEquals' for parameter_ref test: ");
		// undefined not supported in value
		expect(lengthEquals(wrap("test"), null, undefinedPlaceholder, controller)).to.equal(true);
		expect(console.warn.mock.calls[6][0]).to.equal("[WARNING]: Ignoring condition operation 'lengthEquals' for parameter_ref test: ");
		// string not supported in value
		expect(lengthEquals(wrap("test"), null, "test", controller)).to.equal(true);
		expect(console.warn.mock.calls[7][0]).to.equal("[WARNING]: Ignoring condition operation 'lengthEquals' for parameter_ref test: ");

		expect(console.warn.mock.calls.length).to.equal(8);
	});

	it("Test lengthEquals behaves as expected comparing paramInfo and paramInfo2", () => {
		console.warn = jest.fn();
		// check string length
		expect(lengthEquals(wrap("test"), wrap(4), null, controller)).to.equal(true);
		expect(lengthEquals(wrap("test"), wrap(5), null, controller)).to.equal(false);
		expect(lengthEquals(wrap("test"), wrap(3), null, controller)).to.equal(false);

		// check array length
		expect(lengthEquals(wrap([1, 2, 3]), wrap(3), null, controller)).to.equal(true);
		expect(lengthEquals(wrap([1, 2, 3]), wrap(4), null, controller)).to.equal(false);
		expect(lengthEquals(wrap([1, 2, 3]), wrap(2), null, controller)).to.equal(false);
		expect(console.warn.mock.calls.length).to.equal(0);
	});

	it("Test lengthEquals behaves as expected comparing paramInfo and value", () => {
		console.warn = jest.fn();
		// check string length
		expect(lengthEquals(wrap("test"), null, 4, controller)).to.equal(true);
		expect(lengthEquals(wrap("test"), null, 5, controller)).to.equal(false);
		expect(lengthEquals(wrap("test"), null, 3, controller)).to.equal(false);

		// check array length
		expect(lengthEquals(wrap([1, 2, 3]), null, 3, controller)).to.equal(true);
		expect(lengthEquals(wrap([1, 2, 3]), null, 4, controller)).to.equal(false);
		expect(lengthEquals(wrap([1, 2, 3]), null, 2, controller)).to.equal(false);
		expect(console.warn.mock.calls.length).to.equal(0);
	});
});
