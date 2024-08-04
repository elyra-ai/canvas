/*
 * Copyright 2017-2024 Elyra Authors
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
import { renderWithIntl } from "../_utils_/intl-utils.js";
import PaletteDialogUnder from "../../src/palette/palette-dialog-under.jsx";
import CanvasController from "../../src/common-canvas/canvas-controller.js";

describe("Palette Dialog renders correctly", () => {

	it("should use a `.palette-div` CSS class", () => {
		const { container: popupPaletteContainer } = createPalette();
		expect(popupPaletteContainer.getElementsByClassName("palette-dialog-div")).toHaveLength(1);
	});

	it("should render one <PaletteTopbar/> component", () => {
		const { container: popupPaletteContainer } = createPalette();
		expect(popupPaletteContainer.getElementsByClassName("palette-dialog-topbar")).toHaveLength(1);
	});

	it("should render one <PaletteContent/> component", () => {
		const { container: popupPaletteContainer } = createPalette();
		expect(popupPaletteContainer.getElementsByClassName("palette-dialog-content")).toHaveLength(1);
	});

	// WARNING: The data-id attribute is used by host application "walk-me"
	// tours to identify palette elements. Therefore, the attribute name
	// MUST NOT be removed or renamed.
	it("Palette modal categories should have data-id attribute", () => {
		const { container: popupPaletteContainer } = createPalette();
		const modalPaletteCategories = popupPaletteContainer.querySelectorAll("palette-dialog-category-selected");
		modalPaletteCategories.forEach((category, idx) => {
			expect(category).toHaveAttribute("data-id", paletteSpec.categories[idx].id);
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
	// const closePaletteCallback = sinon.spy();
	// const createTempNodeCallback = sinon.spy();
	// const deleteTempNodeCallback = sinon.spy();
	const canvasController = new CanvasController();

	const popupPalette = renderWithIntl(
		<PaletteDialogUnder
			paletteJSON={paletteSpec}
			containingDivId="parent-div-id"
			canvasController={canvasController}
			isEditingEnabled

		/>
	);
	return popupPalette;
}
