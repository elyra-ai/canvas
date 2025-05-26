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

import key from "../../support/canvas/key.js";

Cypress.Commands.add("shortcutKeysCut", () => {
	cy.get("#canvas-div-0 > .svg-area").trigger("keydown", key.cut);
});

Cypress.Commands.add("shortcutKeysCopy", () => {
	cy.get("#canvas-div-0 > .svg-area").trigger("keydown", key.copy);
});

Cypress.Commands.add("shortcutKeysPaste", () => {
	cy.get("#canvas-div-0 > .svg-area").trigger("keydown", key.paste);
});

Cypress.Commands.add("shortcutKeysUndo", () => {
	cy.get("#d3-svg-canvas-div-0 > .svg-area").click(1, 1); // Put foucs on the SVG area, ready for key press
	cy.get("#d3-svg-canvas-div-0 > .svg-area").trigger("keydown", key.undo);
});

Cypress.Commands.add("shortcutKeysRedo", () => {
	cy.get("#d3-svg-canvas-div-0 > .svg-area").click(1, 1); // Put foucs on the SVG area, ready for key press
	cy.get("#d3-svg-canvas-div-0 > .svg-area").trigger("keydown", key.redo);
});

Cypress.Commands.add("shortcutKeysDelete", () => {
	cy.get("#d3-svg-canvas-div-0 > .svg-area").trigger("keydown", key.delete);
});

Cypress.Commands.add("shortcutKeysSelectAllCanvasObjects", () => {
	cy.get("#d3-svg-canvas-div-0 > .svg-area").click(1, 1); // Put foucs on the SVG area, ready for key press
	cy.get("#d3-svg-canvas-div-0 > .svg-area").trigger("keydown", key.selectAll);
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

// Press 'backspace' key on keyboard
Cypress.Commands.add("useBackspaceKey", () => "{backspace}");

/* ------------------------------------------------------------------ */
/* Text Toolbar Keyboard shortcuts                                    */
/* ------------------------------------------------------------------ */
Cypress.Commands.add("shortcutKeysMarkdown", (action) => {
	cy.useCtrlOrCmdKey().then((cmndCtrlKey) => {
		switch (action) {
		case "increaseHashes": {
			cy.get("body").type(cmndCtrlKey + "{rightArrow}");
			break;
		}
		case "decreaseHashes": {
			cy.get("body").type(cmndCtrlKey + "{leftArrow}");
			break;
		}
		case "bold": {
			cy.get("body").type(cmndCtrlKey + "{b}");
			break;
		}
		case "italics": {
			cy.get("body").type(cmndCtrlKey + "{i}");
			break;
		}
		case "strikethrough": {
			cy.get("body").type(cmndCtrlKey + "{shift}{x}");
			break;
		}
		case "code": {
			cy.get("body").type(cmndCtrlKey + "{e}");
			break;
		}
		case "quote": {
			cy.get("body").type(cmndCtrlKey + "{shift}{i}");
			break;
		}
		case "link": {
			cy.get("body").type(cmndCtrlKey + "{k}");
			break;
		}
		case "numberedList": {
			cy.get("body").type(cmndCtrlKey + "{shift}{7}");
			break;
		}
		case "bulletedList": {
			cy.get("body").type(cmndCtrlKey + "{shift}{8}");
			break;
		}
		default:
		}
	});
});
