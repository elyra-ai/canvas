/*
 * Copyright 2017-2021 Elyra Authors
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
import { act } from "react-dom/test-utils";
import { mountWithIntl } from "../_utils_/intl-utils";
import PaletteFlyout from "../../src/palette/palette-flyout.jsx";
import PaletteFlyoutContent from "../../src/palette/palette-flyout-content.jsx";
import PaletteFlyoutContentCategory from "../../src/palette/palette-flyout-content-category.jsx";
import PaletteFlyoutContentList from "../../src/palette/palette-content-list.jsx";
import PaletteContentListItem from "../../src/palette/palette-content-list-item.jsx";
import { expect } from "chai";
import CanvasController from "../../src/common-canvas/canvas-controller";

import imageTestPalette from "../test_resources/palettes/image-test-palette.json";
import testPalette2 from "../test_resources/palettes/test-palette2.json";


const canvasController = new CanvasController();

// This describe() function needs to be positioned above the other describe()
// function in this file otherwise the test within it fails. I wasn't able to
// find out why that happens. It seems like the tests in one describe
// should not have affect tests in another describe but somehow they do in this
// case. Anyway, positioning them in this way seems to work OK.
describe("Palette search renders correctly", () => {

	beforeEach(() => {
		jest.useFakeTimers("modern");
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("should filter nodes based on search text", () => {

		const wrapper = createMountedPalette();

		// Simulate click on search input to open palette with search bar
		const searchInput = wrapper.find("div.palette-flyout-search-container");
		searchInput.simulate("click");

		simulateSearchEntry(searchInput, "data");
		wrapper.update();
		expect(wrapper.find(PaletteContentListItem)).to.have.length(4);

		simulateSearchEntry(searchInput, "var");
		wrapper.update();
		expect(wrapper.find(PaletteContentListItem)).to.have.length(1);

		simulateSearchEntry(searchInput, "data import");
		wrapper.update();
		expect(wrapper.find(PaletteContentListItem)).to.have.length(4);

		simulateSearchEntry(searchInput, "d");
		wrapper.update();
		expect(wrapper.find(PaletteContentListItem)).to.have.length(5);

		simulateSearchEntry(searchInput, "import data");
		wrapper.update();
		expect(wrapper.find(PaletteContentListItem)).to.have.length(4);

	});
});

function simulateSearchEntry(searchInput, searchString) {
	act(() => {
		const input = searchInput.find("input");
		input.simulate("change", { target: { value: searchString } });
		jest.advanceTimersByTime(500);
	});
}

describe("Palette renders correctly", () => {

	it("should use a `.palette-flyout-div` CSS class", () => {
		const flyoutPalette = createPalette();
		expect(flyoutPalette.find(".palette-flyout-div")).to.have.length(1);
	});

	it("should have properties defined", () => {
		const flyoutPalette = createMountedPalette();
		expect(flyoutPalette.prop("paletteJSON")).to.equal(testPalette2);
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

	it("should leave currently opened category open when a new category is opened", () => {
		const wrapper = createMountedPalette();
		const importCat = findCategoryElement(wrapper, "Import");
		importCat.simulate("click");
		expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(1);
		expect(wrapper.find(PaletteContentListItem)).to.have.length(3);
		const outputsCat = findCategoryElement(wrapper, "Outputs");
		outputsCat.simulate("click");
		expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(2);
		expect(wrapper.find(PaletteContentListItem)).to.have.length(5);
	});

	it("should close a category when two categories are currently open", () => {
		const wrapper = createMountedPalette();
		const importCat = findCategoryElement(wrapper, "Import");
		importCat.simulate("click");
		const outputsCat = findCategoryElement(wrapper, "Outputs");
		outputsCat.simulate("click");
		const importCat2 = findCategoryElement(wrapper, "Import");
		importCat2.simulate("click");
		expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(1);
		expect(wrapper.find(PaletteContentListItem)).to.have.length(2);
	});

	// WARNING: The data-id attribute is used by host application "walk-me"
	// tours to identify palette elements. Therefore, the attribute name
	// MUST NOT be removed or renamed.
	it("Palette flyout categories should have data-id attribute", () => {
		const flyoutPaletteContent = createMountedPalette().find(PaletteFlyoutContent);
		const flyoutPaletteCategories = flyoutPaletteContent.find(".palette-flyout-category");
		flyoutPaletteCategories.forEach((category, idx) => {
			expect(category.props()).to.have.property("data-id", testPalette2.categories[idx].id);
		});
	});

	// WARNING: The data-id attribute is used by host application "walk-me"
	// tours to identify palette elements. Therefore, the attribute name
	// MUST NOT be removed or renamed.
	it("Palette flyout nodes should have data-id attribute", () => {
		const wrapper = createMountedPalette();
		const importCat = findCategoryElement(wrapper, "Import");
		importCat.simulate("click");
		const outputsCat = findCategoryElement(wrapper, "Outputs");
		outputsCat.simulate("click");
		const ops = [];
		testPalette2.categories.forEach((category) => category.node_types.forEach((node) => ops.push(node.op)));
		const flyoutPaletteNodes = wrapper.find(".palette-list-item");
		flyoutPaletteNodes.forEach((node, idx) => {
			expect(node.props()).to.have.property("data-id", ops[idx]);
		});
	});

	it("should show wide palette", () => {
		const palette = createMountedPalette().find(".palette-flyout-div-open");
		expect(palette).to.have.length(1);
	});

	it("palette should be hidden", () => {
		const config = {
			showNarrowPalette: false,
			showPalette: false,
			paletteWidth: 0
		};
		const palette = createMountedPalette(config).find(".palette-flyout-div-closed");
		expect(palette).to.have.length(1);
	});

	it("open palette should show correct values for category and node with and without an image", () => {
		const config = {
			showPalette: true,
			palette: imageTestPalette,
			paletteWidth: 250
		};
		const palette = createMountedPalette(config);
		// 2 categories should be rendered
		const categories = palette.find(PaletteFlyoutContentCategory);
		expect(categories).to.have.length(2);
		const category = findCategoryElement(palette, "Category1");
		category.simulate("click");
		// 2 nodes should be rendered
		expect(palette.find(PaletteContentListItem)).to.have.length(2);
	});

	it("narrow palette should show correct values for category and node with and without an image", () => {
		const config = {
			showPalette: false,
			palette: imageTestPalette,
			paletteWidth: 64
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
		expect(palette.find(PaletteContentListItem)).to.have.length(2);
		// Category2 should show image when provided
		const category2 = findCategoryElement(palette, "Category2");
		expect(category2.find("img")).to.have.length(1);
	});
});

function createPalette() {
	const popupPalette = mountWithIntl(
		<PaletteFlyout
			paletteJSON={testPalette2}
			showPalette
			canvasController={canvasController}
			paletteWidth={64}
		/>
	);
	return popupPalette;
}

function createMountedPalette(config) {
	const showPalette = config ? config.showPalette : true;
	const paletteWidth = config ? config.paletteWidth : 64;
	const palette = (config && config.palette) ? config.palette : testPalette2;

	const wrapper = mountWithIntl(
		<PaletteFlyout
			paletteJSON={palette}
			showPalette={showPalette}
			canvasController={canvasController}
			paletteWidth={paletteWidth}
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
