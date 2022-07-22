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
import { act } from "react-dom/test-utils";
import { mountWithIntl } from "../_utils_/intl-utils";
import PaletteFlyout from "../../src/palette/palette-flyout.jsx";
import PaletteFlyoutContent from "../../src/palette/palette-flyout-content.jsx";
import PaletteFlyoutContentCategory from "../../src/palette/palette-flyout-content-category.jsx";
import PaletteFlyoutContentFilteredList from "../../src/palette/palette-flyout-content-filtered-list.jsx";
import PaletteFlyoutContentList from "../../src/palette/palette-content-list.jsx";
import PaletteContentListItem from "../../src/palette/palette-content-list-item.jsx";
import { expect } from "chai";
import CanvasController from "../../src/common-canvas/canvas-controller";

import imageTestPalette from "../test_resources/palettes/image-test-palette.json";
import testPalette2 from "../test_resources/palettes/test-palette2.json";
import testPalette3NoDesc from "../test_resources/palettes/test-palette3-no-desc.json";
import paletteMissingFields from "../test_resources/palettes/test-missing-fields.json";


// This describe() function needs to be positioned above the other describe()
// function in this file otherwise the test within it fails. I wasn't able to
// find out why that happens. It seems like the tests in one describe
// should not have affect tests in another describe but somehow they do in this
// case. Anyway, positioning them in this way seems to work OK.
describe("Palette search renders correctly", () => {

	beforeEach(() => {
		jest.useFakeTimers("modern");
	});

	it("should filter nodes based on search text", () => {

		const wrapper = createMountedPalette();

		// Simulate click on search input to open palette with search bar
		const searchInput = wrapper.find("div.palette-flyout-search-container");
		searchInput.simulate("click");

		simulateSearchEntry(searchInput, "data");
		wrapper.update();
		expect(wrapper.find(PaletteContentListItem)).to.have.length(4);
		expect(wrapper.find(PaletteFlyoutContentFilteredList)).to.have.length(1);

		simulateSearchEntry(searchInput, "var");
		wrapper.update();
		expect(wrapper.find(PaletteContentListItem)).to.have.length(1);
		expect(wrapper.find(PaletteFlyoutContentFilteredList)).to.have.length(1);

		simulateSearchEntry(searchInput, "data import");
		wrapper.update();
		expect(wrapper.find(PaletteContentListItem)).to.have.length(4);
		expect(wrapper.find(PaletteFlyoutContentFilteredList)).to.have.length(1);

		simulateSearchEntry(searchInput, "d");
		wrapper.update();
		expect(wrapper.find(PaletteContentListItem)).to.have.length(5);
		expect(wrapper.find(PaletteFlyoutContentFilteredList)).to.have.length(1);

		simulateSearchEntry(searchInput, "import data");
		wrapper.update();
		expect(wrapper.find(PaletteContentListItem)).to.have.length(4);
		expect(wrapper.find(PaletteFlyoutContentFilteredList)).to.have.length(1);

	});

	it("should filter nodes based on search text when fields are missing", () => {

		const wrapper = createMountedPalette({ palette: paletteMissingFields, showPalette: true });

		// Simulate click on search input to open palette with search bar
		const searchInput = wrapper.find("div.palette-flyout-search-container");
		searchInput.simulate("click");

		simulateSearchEntry(searchInput, "t");
		wrapper.update();
		expect(wrapper.find(PaletteContentListItem)).to.have.length(1);

		simulateSearchEntry(searchInput, "test");
		wrapper.update();

		expect(wrapper.find(PaletteContentListItem)).to.have.length(0);
		expect(wrapper.find(PaletteFlyoutContentFilteredList)).to.have.length(1);
	});

	it("should filter nodes based on search text when no node descriptions are present", () => {
		const config = {
			showPalette: true,
			palette: testPalette3NoDesc,
			paletteWidth: 250
		};
		const wrapper = createMountedPalette(config);

		// Simulate click on search input to open palette with search bar
		const searchInput = wrapper.find("div.palette-flyout-search-container");
		searchInput.simulate("click");

		simulateSearchEntry(searchInput, "a");
		wrapper.update();
		const contentListItem = wrapper.find(PaletteContentListItem);
		expect(contentListItem).to.have.length(3);

		const exp = ["ImportVar. File", "OutputsTable", "OutputsData Audit"];
		contentListItem.forEach((item, idx) => {
			expect(item.text()).to.equal(exp[idx]);
		});

		simulateSearchEntry(searchInput, "ta");
		wrapper.update();
		const contentListItem2 = wrapper.find(PaletteContentListItem);
		expect(contentListItem2).to.have.length(2);

		const exp2 = ["OutputsTable", "OutputsData Audit"];
		contentListItem2.forEach((item, idx) => {
			expect(item.text()).to.equal(exp2[idx]);
		});
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
		const flyoutPalette = createMountedPalette();
		expect(flyoutPalette.find(".palette-flyout-div")).to.have.length(1);
	});

	it("should have properties defined", () => {
		const flyoutPalette = createMountedPalette();
		expect(flyoutPalette.prop("paletteJSON")).to.equal(testPalette2);
	});

	it("should render 1 <PaletteFlyoutContent/> component", () => {
		const flyoutPalette = createMountedPalette();
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
		expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(2);
		expect(wrapper.find(PaletteContentListItem)).to.have.length(5);

		const counts = getOpenCategories(wrapper);
		expect(counts).to.have.length(1);

		const outputsCat = findCategoryElement(wrapper, "Outputs");
		outputsCat.simulate("click");
		expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(2);
		expect(wrapper.find(PaletteContentListItem)).to.have.length(5);

		const counts2 = getOpenCategories(wrapper);
		expect(counts2).to.have.length(2);
	});

	it("should close a category when two categories are currently open", () => {
		const wrapper = createMountedPalette();
		const importCat = findCategoryElement(wrapper, "Import");
		importCat.simulate("click");
		const outputsCat = findCategoryElement(wrapper, "Outputs");
		outputsCat.simulate("click");

		const counts = getOpenCategories(wrapper);
		expect(counts).to.have.length(2);
		// We now click the Import category again to close it
		const importCat2 = findCategoryElement(wrapper, "Import");
		importCat2.simulate("click");
		// When the Import category is closed and the Outputs category is opened
		// we should have 2 palettes flyout content lists objects because
		// content lists always exist whether categories are opened or closed.
		expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(2);
		expect(wrapper.find(PaletteContentListItem)).to.have.length(5);

		const counts2 = getOpenCategories(wrapper);
		expect(counts2).to.have.length(1);

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
		const categories = palette.find(PaletteFlyoutContentCategory);
		expect(categories).to.have.length(2);
		const category = findCategoryElement(palette, "Category1");
		category.simulate("click");
		expect(palette.find(PaletteContentListItem)).to.have.length(3);
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
		expect(palette.find(PaletteContentListItem)).to.have.length(3);
		// Category2 should show image when provided
		const category2 = findCategoryElement(palette, "Category2");
		expect(category2.find("img")).to.have.length(1);
	});
});

function createMountedPalette(config) {
	const canvasController = new CanvasController();
	const showPalette = config ? config.showPalette : true;
	const paletteWidth = config ? config.paletteWidth : 64;
	const palette = (config && config.palette) ? config.palette : testPalette2;

	const wrapper = mountWithIntl(
		<PaletteFlyout
			paletteJSON={palette}
			showPalette={showPalette}
			canvasController={canvasController}
			paletteWidth={paletteWidth}
			isEditingEnabled
			enableNarrowPalette
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

function getOpenCategories(wrapper) {
	const categoryList2 = wrapper.find("div.palette-flyout-categories");
	return categoryList2.find(".bx--accordion__item--active");
}
