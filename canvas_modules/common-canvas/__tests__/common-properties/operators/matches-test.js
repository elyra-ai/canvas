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


describe("validating matches operator works correctly", () => {
	const controller = new Controller();
	const matches = controller.getConditionOp("matches");

	function wrapParam(desc) {
		return { value: desc, param: "test", control: { controlType: "string" } };
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test matches behaves as expected", () => {
		expect(matches(wrapParam("foo bar"), null, "foo", controller)).to.equal(true);
		expect(matches(wrapParam("foo bar"), wrapParam("foo"), null, controller)).to.equal(true);
		expect(matches(wrapParam("bar bar"), null, "foo", controller)).to.equal(false);
		expect(matches(wrapParam("bar bar"), wrapParam("foo"), null, controller)).to.equal(false);
		expect(matches(wrapParam("foob"), null, "foo?b", controller)).to.equal(true);
		expect(matches(wrapParam("foob"), wrapParam("foo?b"), null, controller)).to.equal(true);
		expect(matches(wrapParam("foooob"), null, "foo?b", controller)).to.equal(false);
		expect(matches(wrapParam("foooob"), wrapParam("foo?b"), null, controller)).to.equal(false);
		expect(matches(wrapParam(), null, "foo", controller)).to.equal(false);
		expect(matches(wrapParam(""), null, "foo", controller)).to.equal(false);

		// error test cases.  These generate a console.log warning and return true.
		expect(matches(wrapParam("foooob"), null, null, controller)).to.equal(true);
		expect(matches(wrapParam(1), null, "foo", controller)).to.equal(true);
	});

});
