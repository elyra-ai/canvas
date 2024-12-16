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

describe("Test to check if error markers are being displayed OK", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedNodeFormatType": "Vertical" });
		cy.openCanvasDefinition("errorMarkerCanvas.json");
	});

	it("Verify error and warning markers on node and supernode, " +
	"test that error and warning markers are not shown when messages are cleared", function() {
		cy.verifyErrorMarkerOnNode("Error");
		cy.verifyWarningMarkerOnNode("Warning");
		cy.verifyWarningMarkerOnNode("Supernode1");

		cy.verifyErrorMarkerOnNodeInSupernode("Filter", "Supernode3");
		cy.verifyNoErrorOrWarningMarkerOnNodeInSupernode("Select", "Supernode1");

		// Now check to ensure that no error markers are shown when the messages are cleared.
		cy.clearMessagesFromAllNodes();

		cy.verifyNoErrorOrWarningMarkerOnNode("Error");
		cy.verifyNoErrorOrWarningMarkerOnNode("Warning");
		cy.verifyNoErrorOrWarningMarkerOnNode("Supernode1");

		cy.verifyNoErrorOrWarningMarkerOnNodeInSupernode("Filter", "Supernode3");
		cy.verifyNoErrorOrWarningMarkerOnNodeInSupernode("Select", "Supernode1");
	});
});
