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
import * as ControlUtils from "./../../../src/common-properties/util/control-utils.js";

const propertyId = {
	name: "test"
};
const rowPropertyId = {
	name: "test",
	row: 1
};
const cellPropertyId = {
	name: "test",
	row: 1,
	col: 10
};

describe("control util tests", () => {
	it("test control id generation", () => {
		let id1 = ControlUtils.getControlId(propertyId);
		let id2 = ControlUtils.getControlId(propertyId);
		expect(id1).to.not.equal(id2);
		id1 = ControlUtils.getControlId(rowPropertyId);
		id2 = ControlUtils.getControlId(rowPropertyId);
		expect(id1).to.not.equal(id2);
		id1 = ControlUtils.getControlId(cellPropertyId);
		id2 = ControlUtils.getControlId(cellPropertyId);
		expect(id1).to.not.equal(id2);
		id1 = ControlUtils.getControlId(propertyId, "myId");
		expect(id1).to.equal(`properties-${propertyId.name}-myId`);
	});
});
