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

Cypress.Commands.add("shortcutKeysUndo", () => {
	// Press Ctrl/Cmnd+z to Undo
	cy.useCtrlOrCmdKey().then((selectedKey) => cy.get("body").type(selectedKey + "{z}", { release: false }));
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

// Press 'Delete' key on keyboard
Cypress.Commands.add("useDeleteKey", () => "{del}");

// Press 'shift' key on keyboard
Cypress.Commands.add("useShiftKey", () => "{shift}");
