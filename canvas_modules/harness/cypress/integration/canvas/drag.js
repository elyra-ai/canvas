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

describe("Test to see if regular selection and drag behavior works " +
"(with dragWithoutSelect set to the default: false)", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test dragging single and multiple selected nodes, " +
  "test dragging a node and comment which is not selected", function() {
		// Try dragging a single selected node
		cy.getNodeForLabel("Execution node").click();
		cy.verifyNodeIsSelected("Execution node");
		cy.verifyNodeIsNotSelected("Binding (entry) node");
		cy.verifyNodeIsNotSelected("Super node");
		cy.verifyNodeIsNotSelected("Binding (exit) node");
		cy.verifyNodeIsNotSelected("Model Node");
		cy.verifyCommentIsNotSelected("The 4 different node types");

		// cy.moveNodeAtPosition("Execution node", 300, 350);
	});
});
