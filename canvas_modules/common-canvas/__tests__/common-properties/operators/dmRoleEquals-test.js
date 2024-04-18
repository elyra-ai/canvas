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
import dataset from "../../test_resources/json/deriveDatasetMetadata.json";

describe("validating dmRoleEquals operator works correctly", () => {
	const controller = new Controller();
	controller.setDatasetMetadata(dataset);
	const roleEquals = controller.getConditionOp("dmRoleEquals");

	function wrapParam(desc) {
		return { value: { link_ref: "0", field_name: desc }, control: { role: "column" } };
	}

	function badWrap(desc) {
		return { value: desc, control: { role: "checkbox" } };
	}

	function wrap(desc) {
		return { value: desc, control: { role: "column" } };
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test dmRoleEquals behaves as expected", () => {
		expect(roleEquals(wrapParam("Age"), null, "input", controller)).to.equal(true);
		expect(roleEquals(wrapParam("Na"), wrap("input"), null, controller)).to.equal(true);
		expect(roleEquals(wrap("Cholesterol"), null, "input", controller)).to.equal(true);
		expect(roleEquals(badWrap("Drug"), null, "partition", controller)).to.equal(false);
	});

});
