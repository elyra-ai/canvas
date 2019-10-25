/*
 * Copyright 2017-2019 IBM Corporation
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
import { shallow } from "enzyme";
import Palette from "../../src/palette/palette.jsx";
import PaletteTopbar from "../../src/palette/palette-topbar.jsx";
import PaletteContent from "../../src/palette/palette-content.jsx";
import CanvasController from "../../src/common-canvas/canvas-controller.js";
import sinon from "sinon";
import { expect } from "chai";


describe("Palette renders correctly", () => {

	it("should use a `.palette-div` CSS class", () => {
		const popupPalette = createPalette();
		expect(popupPalette.find(".palette-div")).to.have.length(1);
	});

	it("should render one <PaletteTopbar/> component", () => {
		const popupPalette = createPalette();
		expect(popupPalette.find(PaletteTopbar)).to.have.length(1);
	});

	it("should render one <PaletteContent/> component", () => {
		const popupPalette = createPalette();
		expect(popupPalette.find(PaletteContent)).to.have.length(1);
	});
});

const paletteSpec = {
	"categories": [{
		"category": "import",
		"label": "Import",
		"nodetypes": [{
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
	const popupPalette = shallow(
		<Palette paletteJSON={paletteSpec}
			showPalette
			closePalette={closePaletteCallback}
			createTempNode={createTempNodeCallback}
			deleteTempNode={deleteTempNodeCallback}
			parentDivId="parent-div-id"
			canvasController={canvasController}

		/>
	);
	return popupPalette;
}
