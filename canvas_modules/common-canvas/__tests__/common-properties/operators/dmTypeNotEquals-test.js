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
import dataset from "../../test_resources/json/deriveDatasetMetadata.json";

describe("validating dmTypeNotEquals operators works correctly", () => {
	const controller = new Controller();
	controller.setDatasetMetadata(dataset);
	const typeNotEquals = controller.getConditionOp("dmTypeNotEquals");

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

	it("Test dmTypeNotEquals behaves as expected", () => {
		expect(typeNotEquals(wrapParam("Age"), null, "integer", controller)).to.equal(false);
		expect(typeNotEquals(wrapParam("Na"), wrap("double"), null, controller)).to.equal(false);
		expect(typeNotEquals(wrap("Cholesterol"), null, "string", controller)).to.equal(false);
		expect(typeNotEquals(badWrap("Drug"), null, "integer", controller)).to.equal(true);
		expect(typeNotEquals(wrap("K"), wrap("string"), null, controller)).to.equal(true);
		expect(typeNotEquals(wrapParam("Cholesterol"), wrap("string"), null, controller)).to.equal(false);
	});

});
