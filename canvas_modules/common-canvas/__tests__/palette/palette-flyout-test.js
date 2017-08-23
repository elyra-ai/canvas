/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { shallow, mount } from "enzyme";
import PaletteFlyout from "../../src/palette/palette-flyout.jsx";
import PaletteFlyoutContent from "../../src/palette/palette-flyout-content.jsx";
import PaletteFlyoutContentCategory from "../../src/palette/palette-flyout-content-category.jsx";
import PaletteFlyoutContentList from "../../src/palette/palette-content-list.jsx";
import PaletteFlyoutContentListItem from "../../src/palette/palette-content-list-item.jsx";
import sinon from "sinon";
import { expect } from "chai";


describe("Palette renders correctly", () => {

	it("should use a `.palette-flyout-div` CSS class", () => {
		const flyoutPalette = createPalette();
		expect(flyoutPalette.find(".palette-flyout-div")).to.have.length(1);
	});

	it("should have properties defined", () => {
		const flyoutPalette = createPalette();
		expect(flyoutPalette.paletteJSON).to.be.defined;
	});

	it("should render 1 <PaletteFlyoutContent/> component", () => {
		const flyoutPalette = createPalette();
		expect(flyoutPalette.find(PaletteFlyoutContent)).to.have.length(1);
	});

	it("should show <PaletteFlyoutContent/> when showPalette `true`", () => {
		const flyoutPalette = createPalette();
		expect(flyoutPalette.find(".palette-flyout-div-open")).to.have.length(1);
		expect(flyoutPalette.find(".palette-flyout-div-closed")).to.have.length(0);
	});

	it("should hide <PaletteFlyoutContent/> when showPalette `false`", () => {
		const flyoutPalette = createPaletteHidden();
		expect(flyoutPalette.find(".palette-flyout-div-open")).to.have.length(0);
		expect(flyoutPalette.find(".palette-flyout-div-closed")).to.have.length(1);
	});

	it("should render 1 <PaletteFlyoutContent/> component", () => {
		const flyoutPalette = createMountedPalette();
		expect(flyoutPalette.find(PaletteFlyoutContent)).to.have.length(1);
	});

	it("should render 2 <PaletteFlyoutContentCategory/> component", () => {
		const flyoutPaletteContent = createMountedPalette().find(PaletteFlyoutContent);
		expect(flyoutPaletteContent.find(PaletteFlyoutContentCategory)).to.have.length(2);
	});

	it("should render 1 <PaletteFlyoutContentList/> and 3 <PaletteFlyoutContentListItem/> component", () => {
		const flyoutPaletteContent = createMountedPalette().find(PaletteFlyoutContent);
		const importCat = flyoutPaletteContent.find("#palette-flyout-category-Import");
		importCat.simulate("click");
		expect(flyoutPaletteContent.find(PaletteFlyoutContentList)).to.have.length(1);
		expect(flyoutPaletteContent.find(PaletteFlyoutContentListItem)).to.have.length(3);
		const outputsCat = flyoutPaletteContent.find("#palette-flyout-category-Outputs");
		outputsCat.simulate("click");
		expect(flyoutPaletteContent.find(PaletteFlyoutContentList)).to.have.length(1);
		expect(flyoutPaletteContent.find(PaletteFlyoutContentListItem)).to.have.length(2);
	});

	it("should filter nodes based on search text", () => {
		const flyoutPaletteContent = createMountedPalette().find(PaletteFlyoutContent);
		const importCat = flyoutPaletteContent.find("#palette-flyout-category-Import");
		importCat.simulate("click");
		const input = flyoutPaletteContent.find("#palette-flyout-search-text");
		input.simulate("change", { target: { value: "Var" } });
		expect(flyoutPaletteContent.find(PaletteFlyoutContentListItem)).to.have.length(1);
	});
});

const paletteSpec = {
	"categories": [
		{
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
		},
		{
			"category": "output",
			"label": "Outputs",
			"nodetypes": [
				{
					"label": "Table",
					"description": "Displays results in a table",
					"typeId": "table",
					"image": "data:image/svg+xml;base64,...",
					"inputPorts": [
						{
							"name": "inPort",
							"label": "Input Port",
							"cardinality": "0:1"
						}
					],
					"outputPorts": [
						{
							"name": "outPort",
							"label": "Output Port",
							"cardinality": "0:1"
						}
					]
				},
				{
					"label": "Data Audit",
					"description": "Audits the quality of a data set",
					"typeId": "dataaudit",
					"image": "data:image/svg+xml;base64,...",
					"inputPorts": [
						{
							"name": "inPort",
							"label": "Input Port",
							"cardinality": "0:1"
						}
					],
					"outputPorts": [
						{
							"name": "outPort",
							"label": "Output Port",
							"cardinality": "0:1"
						}
					]
				}
			]
		}
	]
};

function createPalette() {
	const createTempNodeCallback = sinon.spy();
	const deleteTempNodeCallback = sinon.spy();
	const popupPalette = shallow(
		<PaletteFlyout
			paletteJSON={paletteSpec}
			showPalette
			createTempNode={createTempNodeCallback}
			deleteTempNode={deleteTempNodeCallback}
		/>
	);
	return popupPalette;
}
function createPaletteHidden() {
	const createTempNodeCallback = sinon.spy();
	const deleteTempNodeCallback = sinon.spy();
	const popupPalette = shallow(
		<PaletteFlyout
			paletteJSON={paletteSpec}
			showPalette={false}
			createTempNode={createTempNodeCallback}
			deleteTempNode={deleteTempNodeCallback}
		/>
	);
	return popupPalette;
}
function createMountedPalette() {
	const createTempNodeCallback = sinon.spy();
	const deleteTempNodeCallback = sinon.spy();
	const popupPalette = mount(
		<PaletteFlyout
			paletteJSON={paletteSpec}
			showPalette
			createTempNode={createTempNodeCallback}
			deleteTempNode={deleteTempNodeCallback}
		/>
	);
	return popupPalette;
}
