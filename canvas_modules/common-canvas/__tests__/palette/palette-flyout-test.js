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
import { expect } from "chai";
import CanvasController from "../../src/common-canvas/canvas-controller";

import testPalette from "../test_resources/palettes/image-test-palette.json";

const canvasController = new CanvasController();


describe("Palette renders correctly", () => {

	it("should use a `.palette-flyout-div` CSS class", () => {
		const flyoutPalette = createPalette();
		expect(flyoutPalette.find(".palette-flyout-div")).to.have.length(1);
	});

	it("should have properties defined", () => {
		const flyoutPalette = createMountedPalette();
		expect(flyoutPalette.prop("paletteJSON")).to.equal(paletteSpec);
	});

	it("should render 1 <PaletteFlyoutContent/> component", () => {
		const flyoutPalette = createPalette();
		expect(flyoutPalette.find(PaletteFlyoutContent)).to.have.length(1);
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
		const wrapper = createMountedPalette();
		const importCat = findCategoryElement(wrapper, "Import");
		importCat.simulate("click");
		expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(1);
		expect(wrapper.find(PaletteFlyoutContentListItem)).to.have.length(3);
		const outputsCat = findCategoryElement(wrapper, "Outputs");
		outputsCat.simulate("click");
		expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(1);
		expect(wrapper.find(PaletteFlyoutContentListItem)).to.have.length(2);
	});

	it("should filter nodes based on search text", () => {
		const wrapper = createMountedPalette();
		const importCat = findCategoryElement(wrapper, "Import");
		importCat.simulate("click");
		// Simulate click on search icon to open palette with search bar
		const searchIcon = wrapper.find("div.palette-flyout-search-icon");
		searchIcon.simulate("click");

		const input = wrapper.find(".palette-flyout-search input");
		input.simulate("change", { target: { value: "Var" } });
		expect(wrapper.find(PaletteFlyoutContentListItem)).to.have.length(1);

		input.simulate("change", { target: { value: "VAR" } });
		expect(wrapper.find(PaletteFlyoutContentListItem)).to.have.length(1);
	});

	it("should show narrow palette", () => {
		const config = {
			showNarrowPalette: true,
			showPalette: false
		};
		const wrapper = createMountedPalette(config);
		const palette = wrapper.find(".palette-flyout-div-closed-narrow");
		expect(palette).to.have.length(1);
	});

	it("should show wide palette", () => {
		const palette = createMountedPalette().find(".palette-flyout-div-open");
		expect(palette).to.have.length(1);
	});

	it("palette should be hidden", () => {
		const config = {
			showNarrowPalette: false,
			showPalette: false
		};
		const palette = createMountedPalette(config).find(".palette-flyout-div-closed-none");
		expect(palette).to.have.length(1);
	});
	it("open palette should show correct values for category and node with and without an image", () => {
		const config = {
			showNarrowPalette: true,
			showPalette: true,
			palette: testPalette
		};
		const palette = createMountedPalette(config);
		// 2 categories should be rendered
		const categories = palette.find(PaletteFlyoutContentCategory);
		expect(categories).to.have.length(2);
		const category = findCategoryElement(palette, "Category1");
		category.simulate("click");
		// 2 nodes should be rendered
		expect(palette.find(PaletteFlyoutContentListItem)).to.have.length(2);
	});
	it("narrow palette should show correct values for category and node with and without an image", () => {
		const config = {
			showNarrowPalette: true,
			showPalette: false,
			palette: testPalette
		};
		const palette = createMountedPalette(config);
		// 2 categories should be rendered
		const categories = palette.find(PaletteFlyoutContentCategory);
		expect(categories).to.have.length(2);
		// Category1 should show `Cat` when no image provided
		const category = findCategoryElement(palette, "Category1");
		expect(category.find("span").text()).to.equal("Cat");
		category.simulate("click");
		// 2 nodes should be rendered
		expect(palette.find(PaletteFlyoutContentListItem)).to.have.length(2);
		// Category2 should show image when provided
		const category2 = findCategoryElement(palette, "Category2");
		expect(category2.find("img")).to.have.length(1);
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
	const popupPalette = shallow(
		<PaletteFlyout
			paletteJSON={paletteSpec}
			showPalette
			canvasController={canvasController}
		/>
	);
	return popupPalette;
}
function createMountedPalette(config) {
	const showPalette = config ? config.showPalette : true;
	const showNarrowPalette = config ? config.showNarrowPalette : true;
	const palette = (config && config.palette) ? config.palette : paletteSpec;
	const wrapper = mount(
		<PaletteFlyout
			paletteJSON={palette}
			showPalette={showPalette}
			canvasController={canvasController}
			showNarrowPalette={showNarrowPalette}
		/>
	);
	return wrapper;
}


function findCategoryElement(flyoutPaletteContent, categoryName) {
	var categories = flyoutPaletteContent.find(".palette-flyout-category");
	for (var idx = 0; idx < categories.length; idx++) {
		const category = flyoutPaletteContent.find(".palette-flyout-category").at(idx);
		if (category.props().value === categoryName) {
			return category;
		}
	}
	return null;
}
