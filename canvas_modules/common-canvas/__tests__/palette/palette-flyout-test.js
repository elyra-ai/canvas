/*
 * Copyright 2017-2023 Elyra Authors
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
import { fireEvent, act, waitFor } from "@testing-library/react";
import { mountWithIntl } from "../_utils_/intl-utils";
import PaletteFlyout from "../../src/palette/palette-flyout.jsx";
import PaletteFlyoutContent from "../../src/palette/palette-flyout-content.jsx";
import PaletteFlyoutContentCategory from "../../src/palette/palette-flyout-content-category.jsx";
import PaletteFlyoutContentFilteredList from "../../src/palette/palette-flyout-content-filtered-list.jsx";
import PaletteFlyoutContentList from "../../src/palette/palette-content-list.jsx";
import PaletteContentListItem from "../../src/palette/palette-content-list-item.jsx";
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

	it("should filter nodes based on search text", async() => {

		const { container } = createMountedPalette();

		// Simulate click on search input to open palette with search bar
		const searchInput = container.querySelector("div.palette-flyout-search-container");
		fireEvent.click(searchInput);

		await simulateSearchEntry(searchInput, "data");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).toHaveLength(4);
			expect(container.getElementsByClassName("palette-scroll")).toHaveLength(1);
		});

		await simulateSearchEntry(searchInput, "var");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).toHaveLength(1);
			expect(container.getElementsByClassName("palette-scroll")).toHaveLength(1);
		});

		await simulateSearchEntry(searchInput, "data import");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).toHaveLength(4);
			expect(container.getElementsByClassName("palette-scroll")).toHaveLength(1);
		});

		await simulateSearchEntry(searchInput, "d");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).toHaveLength(5);
			expect(container.getElementsByClassName("palette-scroll")).toHaveLength(1);
		});

		await simulateSearchEntry(searchInput, "import data");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).toHaveLength(4);
			expect(container.getElementsByClassName("palette-scroll")).toHaveLength(1);
		});

		await simulateSearchEntry(searchInput, "xxxxx");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).toHaveLength(0);
			expect(container.getElementsByClassName("palette-no-results-title")).toHaveLength(1);
		});
	});

	it("should filter nodes based on search text when fields are missing", async() => {

		const { container } = createMountedPalette({ palette: paletteMissingFields, showPalette: true });

		// Simulate click on search input to open palette with search bar
		const searchInput = container.querySelector("div.palette-flyout-search-container");
		fireEvent.click(searchInput);

		await simulateSearchEntry(searchInput, "t");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).toHaveLength(1);
		});

		await simulateSearchEntry(searchInput, "test");

		await simulateSearchEntry(searchInput, "xxxxx");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).toHaveLength(0);
			expect(container.getElementsByClassName("palette-no-results-title")).toHaveLength(1);
		});

	});

	it("should filter nodes based on search text when no node descriptions are present", async() => {
		const config = {
			showPalette: true,
			palette: testPalette3NoDesc
		};
		const { container, getByTestId, getAllByTestId } = createMountedPalette(config);

		// Simulate click on search input to open palette with search bar
		const searchInput = container.querySelector("div.palette-flyout-search-container");
		fireEvent.click(searchInput);

		// Simulate search entry
		fireEvent.change(searchInput.querySelector("input"), { target: { value: "a" } });

		// Wait for re-rendering or update of the component
		const exp = ["ImportVar. File", "OutputsTable", "OutputsData Audit"];
		await waitFor(() => {
			const contentListItems = container.getElementsByClassName("palette-list-item search-result");
			expect(contentListItems).toHaveLength(3);

			exp.forEach((item, idx) => {
				expect(contentListItems[idx].textContent).toContain(item);
			});
		});

		// Simulate new search entry
		fireEvent.change(searchInput.querySelector("input"), { target: { value: "ta" } });

		await waitFor(() => {
			const contentListItems2 = container.getElementsByClassName("palette-list-item search-result");
			expect(contentListItems2).toHaveLength(2);

			// Asserting the text content of the filtered search result
			const exp2 = ["OutputsTable", "OutputsData Audit"];

			exp2.forEach((item, idx) => {
				expect(contentListItems2[idx].textContent).toContain(item);
			});
		});
	});
});

async function simulateSearchEntry(searchInput, searchString) {
	const input = searchInput.querySelector("input");
	fireEvent.change(input, { target: { value: searchString } });
}

describe("Palette renders correctly", () => {

	it("should use a `.palette-flyout-div` CSS class", () => {
		const { container } = createMountedPalette();
		expect(container.getElementsByClassName("palette-flyout-div")).toHaveLength(1);
	});

	// it("should render 1 <PaletteFlyoutContent/> component", () => {
	// 	const flyoutPalette = createMountedPalette();
	// 	expect(flyoutPalette.find(PaletteFlyoutContent)).to.have.length(1);
	// });

	// it("should render 1 <PaletteFlyoutContent/> component", () => {
	// 	const flyoutPalette = createMountedPalette();
	// 	expect(flyoutPalette.find(PaletteFlyoutContent)).to.have.length(1);
	// });

	// it("should render 2 <PaletteFlyoutContentCategory/> component", () => {
	// 	const flyoutPaletteContent = createMountedPalette().find(PaletteFlyoutContent);
	// 	expect(flyoutPaletteContent.find(PaletteFlyoutContentCategory)).to.have.length(2);
	// });

	// it("should leave currently opened category open when a new category is opened", () => {
	// 	const canvasController = new CanvasController();
	// 	const wrapper = createMountedPalette({ canvasController });

	// 	const importCat = findCategoryElement(wrapper, "Import");
	// 	importCat.simulate("click");
	// 	wrapper.setProps({ paletteJSON: canvasController.getPaletteData() });

	// 	expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(1);
	// 	expect(wrapper.find(PaletteContentListItem)).to.have.length(3);

	// 	const counts = getOpenCategories(wrapper);
	// 	expect(counts).to.have.length(1);

	// 	const outputsCat = findCategoryElement(wrapper, "Outputs");

	// 	outputsCat.simulate("click");
	// 	wrapper.setProps({ paletteJSON: canvasController.getPaletteData() });

	// 	expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(2);
	// 	expect(wrapper.find(PaletteContentListItem)).to.have.length(5);

	// 	const counts2 = getOpenCategories(wrapper);
	// 	expect(counts2).to.have.length(2);
	// });

	// it("should close a category when two categories are currently open", () => {
	// 	const canvasController = new CanvasController();
	// 	const wrapper = createMountedPalette({ canvasController });

	// 	const importCat = findCategoryElement(wrapper, "Import");
	// 	importCat.simulate("click");
	// 	wrapper.setProps({ paletteJSON: canvasController.getPaletteData() });

	// 	const outputsCat = findCategoryElement(wrapper, "Outputs");
	// 	outputsCat.simulate("click");
	// 	wrapper.setProps({ paletteJSON: canvasController.getPaletteData() });

	// 	expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(2);
	// 	expect(wrapper.find(PaletteContentListItem)).to.have.length(5);
	// 	const counts = getOpenCategories(wrapper);
	// 	expect(counts).to.have.length(2);

	// 	// We now click the Import category again to close it
	// 	const importCat2 = findCategoryElement(wrapper, "Import");
	// 	importCat2.simulate("click");
	// 	wrapper.setProps({ paletteJSON: canvasController.getPaletteData() });

	// 	// When the Import category is closed and the Outputs category is opened
	// 	// we should have 1 palette flyout content list object because
	// 	// content lists are removed when a category is closed.
	// 	expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(1);
	// 	expect(wrapper.find(PaletteContentListItem)).to.have.length(2);

	// 	const counts2 = getOpenCategories(wrapper);
	// 	expect(counts2).to.have.length(1);

	// });

	// it("should open/close all categories when calling openAllPaletteCategories/closeAllPaletteCategories", () => {
	// 	const canvasController = new CanvasController();
	// 	const wrapper = createMountedPalette({ canvasController });

	// 	canvasController.openAllPaletteCategories();
	// 	wrapper.setProps({ paletteJSON: canvasController.getPaletteData() });

	// 	expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(2);
	// 	expect(wrapper.find(PaletteContentListItem)).to.have.length(5);
	// 	const counts = getOpenCategories(wrapper);
	// 	expect(counts).to.have.length(2);

	// 	canvasController.closeAllPaletteCategories();
	// 	wrapper.setProps({ paletteJSON: canvasController.getPaletteData() });

	// 	expect(wrapper.find(PaletteFlyoutContentList)).to.have.length(0);
	// 	expect(wrapper.find(PaletteContentListItem)).to.have.length(0);
	// 	const counts2 = getOpenCategories(wrapper);
	// 	expect(counts2).to.have.length(0);

	// });

	// // WARNING: The data-id attribute is used by host application "walk-me"
	// // tours to identify palette elements. Therefore, the attribute name
	// // MUST NOT be removed or renamed.
	// it("Palette flyout categories should have data-id attribute", () => {
	// 	const flyoutPaletteContent = createMountedPalette().find(PaletteFlyoutContent);
	// 	const flyoutPaletteCategories = flyoutPaletteContent.find(".palette-flyout-category");
	// 	flyoutPaletteCategories.forEach((category, idx) => {
	// 		expect(category.props()).to.have.property("data-id", testPalette2.categories[idx].id);
	// 	});
	// });

	// // WARNING: The data-id attribute is used by host application "walk-me"
	// // tours to identify palette elements. Therefore, the attribute name
	// // MUST NOT be removed or renamed.
	// it("Palette flyout nodes should have data-id attribute", () => {
	// 	const wrapper = createMountedPalette();
	// 	const importCat = findCategoryElement(wrapper, "Import");
	// 	importCat.simulate("click");
	// 	const outputsCat = findCategoryElement(wrapper, "Outputs");
	// 	outputsCat.simulate("click");
	// 	const ops = [];
	// 	testPalette2.categories.forEach((category) => category.node_types.forEach((node) => ops.push(node.op)));
	// 	const flyoutPaletteNodes = wrapper.find(".palette-list-item");
	// 	flyoutPaletteNodes.forEach((node, idx) => {
	// 		expect(node.props()).to.have.property("data-id", ops[idx]);
	// 	});
	// });

	// it("should show wide palette", () => {
	// 	const palette = createMountedPalette().find(".palette-flyout-div-open");
	// 	expect(palette).to.have.length(1);
	// });

	// it("palette should be hidden", () => {
	// 	const config = {
	// 		showNarrowPalette: false,
	// 		showPalette: false
	// 	};
	// 	const palette = createMountedPalette(config).find(".palette-flyout-div-closed");
	// 	expect(palette).to.have.length(1);
	// });

	// it("open palette should show correct values for category and node with and without an image", () => {
	// 	const canvasController = new CanvasController();
	// 	const config = {
	// 		showPalette: true,
	// 		palette: imageTestPalette,
	// 		canvasController
	// 	};
	// 	const wrapper = createMountedPalette(config);
	// 	const categories = wrapper.find(PaletteFlyoutContentCategory);
	// 	expect(categories).to.have.length(2);

	// 	const category = findCategoryElement(wrapper, "Category1");
	// 	category.simulate("click");
	// 	wrapper.setProps({ paletteJSON: canvasController.getPaletteData() });

	// 	expect(wrapper.find(PaletteContentListItem)).to.have.length(2);
	// });

	// it("narrow palette should show correct values for category and node with and without an image", () => {
	// 	const canvasController = new CanvasController();
	// 	const config = {
	// 		showPalette: false,
	// 		palette: imageTestPalette,
	// 		canvasController
	// 	};
	// 	const wrapper = createMountedPalette(config);

	// 	// 2 categories should be rendered
	// 	const categories = wrapper.find(PaletteFlyoutContentCategory);
	// 	expect(categories).to.have.length(2);

	// 	// Category1 should show `Cat` when no image provided
	// 	const category = findCategoryElement(wrapper, "Category1");
	// 	expect(category.find("span").text()).to.equal("Cat");
	// 	category.simulate("click");
	// 	wrapper.setProps({ paletteJSON: canvasController.getPaletteData() });

	// 	expect(wrapper.find(PaletteContentListItem)).to.have.length(2);

	// 	// Category2 should show image when provided
	// 	const category2 = findCategoryElement(wrapper, "Category2");
	// 	expect(category2.find("img")).to.have.length(1);
	// });
});

function createMountedPalette(config) {
	const canvasController = (config && config.canvasController) ? config.canvasController : new CanvasController();
	const showPalette = (config && typeof config.showPalette === "boolean") ? config.showPalette : true;
	const palette = (config && config.palette) ? config.palette : testPalette2;

	canvasController.setPipelineFlowPalette(palette);

	const wrapper = mountWithIntl(
		<PaletteFlyout
			paletteJSON={palette}
			showPalette={showPalette}
			canvasController={canvasController}
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
