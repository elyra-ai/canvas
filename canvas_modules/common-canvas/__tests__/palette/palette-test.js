/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import React from "react";
import { shallow } from "enzyme";
import Palette from "../../src/palette/palette.jsx";
import PaletteTopbar from "../../src/palette/palette-topbar.jsx";
import PaletteContent from "../../src/palette/palette-content.jsx";
import sinon from "sinon";
import { expect } from "chai";


describe("Palette renders correctly", () => {

	it("should use a `.palette-div` CSS class", () => {
		const popupPalette = createPalette();
		expect(popupPalette.find(".palette-div")).to.have.length(1);
	});

	it("props should have been defined", () => {
		const popupPalette = createPalette();
		expect(popupPalette.paletteJSON).to.be.defined;
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
	const popupPalette = shallow(
    <Palette paletteJSON={paletteSpec}
	showPalette
	closePalette={closePaletteCallback}
	createTempNode={createTempNodeCallback}
	deleteTempNode={deleteTempNodeCallback}>
    </Palette>
  );
	return popupPalette;
}
