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


describe("validating notMatches operator works correctly", () => {
	const controller = new Controller();
	const notMatches = controller.getConditionOp("notMatches");

	function wrapParam(desc) {
		return { value: desc, control: { controlType: "string" } };
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test notMatches behaves as expected", () => {
		expect(notMatches(wrapParam("foob"), null, "foo?b", controller)).to.equal(false);
		expect(notMatches(wrapParam("foob"), wrapParam("foo?b"), null, controller)).to.equal(false);
		expect(notMatches(wrapParam("foooob"), null, "^g", controller)).to.equal(true);
		expect(notMatches(wrapParam("foooob"), wrapParam("^g"), null, controller)).to.equal(true);
		expect(notMatches(wrapParam(), null, "foo", controller)).to.equal(true);
		expect(notMatches(wrapParam(""), null, "foo", controller)).to.equal(true);

		// error test cases.  These generate a console.log warning and return true.
		expect(notMatches(wrapParam("foooob"), null, null, controller)).to.equal(true);
		expect(notMatches(wrapParam(1), null, "foo", controller)).to.equal(true);
	});

});
