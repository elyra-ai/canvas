/*
 * Copyright 2022 Elyra Authors
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
			.trigger("mousedown", x, y, { which: 1, view: win })
			.trigger("mouseup", x, y, { which: 1, view: win });
	});
});

// Pan the canvas by a specified amount
Cypress.Commands.add("panCanvasToPosition", (canvasX, canvasY) => {
	cy.window().then((win) => {
		cy.getCanvasTranslateCoords()
			.then((transform) => {
				cy.get("#canvas-div-0")
					.trigger("keydown", { keyCode: 32, release: false })
					.trigger("mousedown", "topLeft", { which: 1, view: win })
					.trigger("mousemove", canvasX + transform.x, canvasY + transform.y, { view: win })
					.trigger("mouseup", { which: 1, view: win });
			});
	});
});

// Move the mouse to the {x,y} position
Cypress.Commands.add("moveMouseToCoordinates", (x, y) => {
	cy.get(".d3-svg-canvas-div").trigger("mousemove", x, y);
});

// Within ZoomIn or ZoomOut, move the mouse to the {x,y} position
Cypress.Commands.add("moveMouseToPaletteArea", (x, y) => {
	cy.get(".palette-flyout-categories").trigger("mousemove", x, y);
});

// Selects a region on the canvas by 'pulling out' a rectangle over
// the canvas background to encompass objects to be selected.
Cypress.Commands.add("selectWithRegion", (x1, y1, x2, y2) => {
	cy.window().then((win) => {
		cy.getCanvasTranslateCoords()
			.then((transform) => {
				cy.get(".d3-svg-canvas-div")
					.trigger("mousedown", x1 + transform.x, y1 + transform.y, { shiftKey: true, which: 1, view: win })
					.trigger("mousemove", x2 + transform.x, y2 + transform.y, { view: win })
					.trigger("mouseup", x2 + transform.x, y2 + transform.y, { which: 1, view: win });
			});
	});

});


Cypress.Commands.add("moveBottomPanelDivider", (y) => {
	cy.window().then((win) => {
		cy.get(".bottom-panel .bottom-panel-drag")
			.trigger("mousedown", "center", { view: win, button: 0 });
		cy.get("#canvas-div-0")
			.trigger("mousemove", 200, y, { view: win, force: true })
			.trigger("mouseup", 200, y, { view: win, force: true });
	});
});
