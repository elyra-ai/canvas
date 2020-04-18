/*
 * Copyright 2017-2020 IBM Corporation
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
import * as testUtils from "../../utils/eventlog-utils";

describe("Test of canvas comments", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test adding a comment", function() {
		cy.get("#createAutoComment-action").click();
		cy.document().then((doc) => {
			const lastEventLog = testUtils.getLastEventLogData(doc);
			expect("createAutoComment").to.equal(lastEventLog.data.editType);
			expect("toolbar").to.equal(lastEventLog.data.editSource);
			expect(30).to.equal(lastEventLog.data.mousePos.x);
			expect(30).to.equal(lastEventLog.data.mousePos.y);
		});
	});
});
