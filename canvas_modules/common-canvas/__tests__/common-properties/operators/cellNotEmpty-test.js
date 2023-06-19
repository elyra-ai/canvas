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


describe("validating cellNotEmpty operator works correctly", () => {
	const controller = new Controller();
	const cellNotEmpty = controller.getConditionOp("cellNotEmpty");

	function wrap(val, role) {
		return { value: val, control: { controlType: role } };
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test cellNotEmpty behaves as expected", () => {
		expect(cellNotEmpty(wrap("not empty", "structuretable"), null, null, controller)).to.equal(true);
		expect(cellNotEmpty(wrap(null, "structuretable"), null, null, controller)).to.equal(false);
		// defaults to true. TODO: get sinon-chai package approved so that console output can be checked for expected warnings
		expect(cellNotEmpty(wrap("not empty", "wrongcontrol"), null, null, controller)).to.equal(true);
	});


});
