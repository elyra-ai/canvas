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
/* eslint no-undefined: "off" */
/* eslint max-len: "off" */

describe("Test dropping an exit binding node with an output port is OK", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("bindingWithOutputPalette.json");
	});

	it("Test a link can be created from an exit binding node that has an output port", function() {
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 350, 240);

		cy.clickCategory("Export");
		cy.dragNodeToPosition("Object Store", 500, 240);

		// Drag out an exit binding node that has an output port
		cy.dragNodeToPosition("Output Object Store", 500, 350);

		cy.clickCategory("Outputs");
		cy.dragNodeToPosition("Analysis", 650, 350);


		cy.linkNodeOutputPortToNodeInputPort("Var. File", "outPort", "Object Store", "inPort");
		cy.linkNodeOutputPortToNodeInputPort("Var. File", "outPort", "Output Object Store", "inPort");
		cy.linkNodeOutputPortToNodeInputPort("Output Object Store", "outPort", "Analysis", "inPort");

		cy.verifyNumberOfPortDataLinks(3);
	});

});
