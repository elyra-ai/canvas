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

// Click the canvas at position {x,y}
Cypress.Commands.add("clickCanvasAt", (x, y) => {
	cy.get("#canvas-div-0").click(x, y);
});

// Trigger mouse up and mouse down on the canvas at the position {x, y}.
// This is sometimes needed in place of the clickCanvasAt method for test
// cases to run OK on the build machine.
Cypress.Commands.add("mouseUpDownOnCanvasAt", (x, y) => {
	cy.window().then((win) => {
		cy.get("#canvas-div-0")
			.trigger("mousedown", x, y, { which: 1, view: win });
		cy.get("#canvas-div-0")
			.trigger("mouseup", x, y, { which: 1, view: win });
	});
});

// Pan the canvas by a specified amount
Cypress.Commands.add("panCanvasToPosition", (canvasX, canvasY) => {
	cy.window().then((win) => {
		cy.getCanvasTranslateCoords()
			.then((transform) => {
				// Pressing space is needed for "Carbon" and "Trackpad" interaction types
				// but does not do any harm if used with the "Mouse" interaction type.
				cy.get("#canvas-div-0")
					.trigger("keydown", { code: "Space", keyCode: 32, release: false });
				cy.get("#canvas-div-0")
					.trigger("mousedown", 1, 1, { which: 1, view: win }); // Start at position 1, 1 as using topLeft doesn't work
				cy.get("#canvas-div-0")
					.trigger("mousemove", canvasX + transform.x + 1, canvasY + transform.y + 1, { view: win });
				cy.get("#canvas-div-0")
					.trigger("mouseup", { which: 1, view: win });
			});
	});
});

// Move the mouse to the {x,y} position
Cypress.Commands.add("moveMouseToCoordinates", (x, y) => {
	cy.get(".d3-svg-canvas-div").trigger("mousemove", x, y);
});

// Move the mouse to the {x,y} position in the palette
Cypress.Commands.add("moveMouseToPaletteArea", (x, y) => {
	cy.get(".palette-flyout-div").trigger("mousemove", x, y);
});

// Selects a region on the canvas by 'pulling out' a rectangle over
// the canvas background to encompass objects to be selected.
Cypress.Commands.add("selectWithRegion", (x1, y1, x2, y2) => {
	cy.window().then((win) => {
		cy.getCanvasTranslateCoords()
			.then((transform) => {
				cy.get(".d3-svg-canvas-div")
					.trigger("mousedown", x1 + transform.x, y1 + transform.y, { shiftKey: true, which: 1, view: win });
				cy.get("#canvas-div-0")
					.trigger("mousemove", x2 + transform.x, y2 + transform.y, { view: win });
				cy.get("#canvas-div-0")
					.trigger("mouseup", x2 + transform.x, y2 + transform.y, { which: 1, view: win });
			});
	});

});


Cypress.Commands.add("moveBottomPanelDivider", (y) => {
	cy.window().then((win) => {
		cy.get(".bottom-panel .bottom-panel-drag")
			.trigger("mousedown", "center", { view: win, button: 0 });
		cy.get("#canvas-div-0")
			.trigger("mousemove", 200, y, { view: win, force: true });
		cy.get("#canvas-div-0")
			.trigger("mouseup", 200, y, { view: win, force: true });
	});
});

Cypress.Commands.add("moveRightFlyoutDivider", (x) => {
	cy.window().then((win) => {
		cy.get(".right-flyout-container .right-flyout-drag")
			.trigger("mousedown", "center", { view: win, button: 0, force: true });
		cy.get("#canvas-div-0")
			.trigger("mousemove", x, 200, { viewe: win, force: true });
		cy.get("#canvas-div-0")
			.trigger("mouseup", x, 200, { view: win, force: true });
	});
});
