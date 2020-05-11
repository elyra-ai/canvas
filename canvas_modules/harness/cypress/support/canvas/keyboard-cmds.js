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

Cypress.Commands.add("shortcutKeysCut", () => {
	// Press Ctrl/Cmnd+x to Cut
	cy.useCtrlOrCmdKey().then((selectedKey) => cy.get("body").type(selectedKey + "{x}", { release: false }));
});

Cypress.Commands.add("shortcutKeysCopy", () => {
	// Press Ctrl/Cmnd+c to Copy
	cy.useCtrlOrCmdKey().then((selectedKey) => cy.get("body").type(selectedKey + "{c}", { release: false }));
});

Cypress.Commands.add("shortcutKeysPaste", () => {
	// Press Ctrl/Cmnd+v to Paste
	cy.useCtrlOrCmdKey().then((selectedKey) => cy.get("body").type(selectedKey + "{v}", { release: false }));
});

Cypress.Commands.add("useCtrlOrCmdKey", () => {
	// Ctrl or Cmd keys are used to select multiple elements
	// Get the os name to decide whether to click ctrl or cmd
	// Cypress.platform returns the underlying OS name
	// For MacOS, Cypress.platform returns "darwin". For windows, Cypress.platform returns "win32"
	// For MacOS, return "{meta}" (which is "command" key) and for windows, return "{ctrl}" (which is "ctrl" key)
	const selectedKey = Cypress.platform === "darwin" ? "{meta}" : "{ctrl}";
	return selectedKey;
});

Cypress.Commands.add("deleteNodeUsingKeyboard", (nodeName) => {
	// Delete node by pressing 'Delete' key on keyboard
	cy.getNodeForLabel(nodeName)
		.click()
		.type("{del}");
	// Verify node is deleted
	cy.verifyNodeIsDeleted(nodeName, true);
});

Cypress.Commands.add("selectAllNodes", () => {
	cy.get("#canvas-div-0").find(".node-image")
		.then((nodes) => {
			// Press and hold the shift key
			cy.get("body")
				.type("{shift}", { release: false });

			// Click all the nodes
			nodes.each((idx, node) => {
				cy.wrap(node)
					.click();
			});

			// Cancel the shift key press
			cy.get("body")
				.type("{shift}", { release: true });
		});
});
