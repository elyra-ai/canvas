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

describe("validating dmMeasurementEquals operator works correctly", () => {
	const controller = new Controller();
	controller.setDatasetMetadata(dataset);
	const measurementEquals = controller.getConditionOp("dmMeasurementEquals");

	function wrapParam(desc) {
		return { value: { link_ref: "0", field_name: desc }, control: { role: "column" } };
	}

	function wrapParamNull() {
		return { value: null, control: { role: "column" } };
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

	it("Test dmMeasurementEquals behaves as expected", () => {
		expect(measurementEquals(wrapParam("Age"), null, "range", controller)).to.equal(true);
		expect(measurementEquals(wrapParam("Na"), wrap("range"), null, controller)).to.equal(true);
		expect(measurementEquals(wrap("Cholesterol"), null, "discrete", controller)).to.equal(true);
		expect(measurementEquals(badWrap("Drug"), null, "discrete", controller)).to.equal(true);
		expect(measurementEquals(wrap("K"), wrap("discrete"), null, controller)).to.equal(false);
		expect(measurementEquals(wrapParam("Cholesterol"), wrap("discrete"), null, controller)).to.equal(true);
		expect(measurementEquals(wrapParamNull(), null, "range", controller)).to.equal(false);
	});

});
