/*
 * Copyright 2017-2022 Elyra Authors
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

import React from "react";
import { mountWithIntl } from "../_utils_/intl-utils";
import PaletteDialog from "../../src/palette/palette-dialog.jsx";
import PaletteDialogTopbar from "../../src/palette/palette-dialog-topbar.jsx";
import PaletteDialogContent from "../../src/palette/palette-dialog-content.jsx";
import CanvasController from "../../src/common-canvas/canvas-controller.js";
import sinon from "sinon";
import { expect } from "chai";


describe("Palette renders correctly", () => {

	it("should use a `.palette-div` CSS class", () => {
		const popupPalette = createPalette();
		expect(popupPalette.find(".palette-dialog-div")).to.have.length(1);
	});

	it("should render one <PaletteTopbar/> component", () => {
		const popupPalette = createPalette();
		expect(popupPalette.find(PaletteDialogTopbar)).to.have.length(1);
	});

	it("should render one <PaletteContent/> component", () => {
		const popupPalette = createPalette();
		expect(popupPalette.find(PaletteDialogContent)).to.have.length(1);
	});

	// WARNING: The data-id attribute is used by host application "walk-me"
	// tours to identify palette elements. Therefore, the attribute name
	// MUST NOT be removed or renamed.
	it("Palette modal categories should have data-id attribute", () => {
		const popupPalette = createPalette();
		const modalPaletteCategories = popupPalette.find(".palette-dialog-category-selected");
		modalPaletteCategories.forEach((category, idx) => {
			expect(category.props()).to.have.property("data-id", paletteSpec.categories[idx].id);
		});
	});
});

const paletteSpec = {
	"categories": [{
		"id": "import",
		"category": "import",
		"label": "Import",
		"node_types": [{
			"label": "Var. File",
			"description": "Imports data from a comma-delimited file",
			"typeId": "variablefile",
			"image": "data:image/svg+xml;base64,..",
			"outputPorts": [{
				"name": "out-data",
				"label": "Output data",
				"cardinality": "1:N"
			}]
		}, {
			"label": "User Input",
			"description": "Allows a user to generate literal data",
			"typeId": "userinput",
			"image": "data:image/svg+xml;base64,..",
			"outputPorts": [{
				"name": "out-data",
				"label": "Output data",
				"cardinality": "1:N"
			}]
		}, {
			"label": "Object Store",
			"description": "Imports data from the Object Store",
			"typeId": "object_storage_import",
			"image": "data:image/svg+xml;base64,..",
			"outputPorts": [{
				"name": "out-data",
				"label": "Output data",
				"cardinality": "1:N"
			}]
		}]
	}]
};

function createPalette() {
	const closePaletteCallback = sinon.spy();
	const createTempNodeCallback = sinon.spy();
	const deleteTempNodeCallback = sinon.spy();
	const canvasController = new CanvasController();
	const popupPalette = mountWithIntl(
		<PaletteDialog paletteJSON={paletteSpec}
			showPalette
			closePalette={closePaletteCallback}
			createTempNode={createTempNodeCallback}
			deleteTempNode={deleteTempNodeCallback}
			parentDivId="parent-div-id"
			canvasController={canvasController}
			isEditingEnabled

		/>
	);
	return popupPalette;
}
