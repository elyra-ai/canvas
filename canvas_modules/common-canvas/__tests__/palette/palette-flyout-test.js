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
import { fireEvent, waitFor } from "@testing-library/react";
import { renderWithIntl } from "../_utils_/intl-utils";
import PaletteFlyout from "../../src/palette/palette-flyout.jsx";
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

	it("should filter nodes based on search text", async() => {

		const { container } = createMountedPalette();

		// Simulate click on search input to open palette with search bar
		const searchInput = container.querySelector("div.palette-flyout-search-container");
		fireEvent.click(searchInput);

		await simulateSearchEntry(searchInput, "data");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).to.have.length(4);
			expect(container.getElementsByClassName("palette-scroll")).to.have.length(1);
		});

		await simulateSearchEntry(searchInput, "var");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).to.have.length(1);
			expect(container.getElementsByClassName("palette-scroll")).to.have.length(1);
		});

		await simulateSearchEntry(searchInput, "data import");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).to.have.length(4);
			expect(container.getElementsByClassName("palette-scroll")).to.have.length(1);
		});

		await simulateSearchEntry(searchInput, "d");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).to.have.length(5);
			expect(container.getElementsByClassName("palette-scroll")).to.have.length(1);
		});

		await simulateSearchEntry(searchInput, "import data");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).to.have.length(4);
			expect(container.getElementsByClassName("palette-scroll")).to.have.length(1);
		});

		await simulateSearchEntry(searchInput, "xxxxx");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).to.have.length(0);
			expect(container.getElementsByClassName("palette-no-results-title")).to.have.length(1);
		});
	});

	it("should filter nodes based on search text when fields are missing", async() => {

		const { container } = createMountedPalette({ palette: paletteMissingFields, showPalette: true });

		// Simulate click on search input to open palette with search bar
		const searchInput = container.querySelector("div.palette-flyout-search-container");
		fireEvent.click(searchInput);

		await simulateSearchEntry(searchInput, "t");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).to.have.length(1);
		});

		await simulateSearchEntry(searchInput, "test");

		await simulateSearchEntry(searchInput, "xxxxx");
		await waitFor(() => {
			expect(container.getElementsByClassName("palette-list-item search-result")).to.have.length(0);
			expect(container.getElementsByClassName("palette-no-results-title")).to.have.length(1);
		});

	});

	it("should filter nodes based on search text when no node descriptions are present", async() => {
		const config = {
			showPalette: true,
			palette: testPalette3NoDesc
		};
		const { container } = createMountedPalette(config);

		// Simulate click on search input to open palette with search bar
		const searchInput = container.querySelector("div.palette-flyout-search-container");
		fireEvent.click(searchInput);

		// Simulate search entry
		fireEvent.change(searchInput.querySelector("input"), { target: { value: "a" } });

		// Wait for re-rendering or update of the component
		const exp = ["ImportVar. File", "OutputsTable", "OutputsData Audit"];
		await waitFor(() => {
			const contentListItems = container.getElementsByClassName("palette-list-item search-result");
			expect(contentListItems).to.have.length(3);

			exp.forEach((item, idx) => {
				expect(contentListItems[idx].textContent).to.equal(item);
			});
		});

		// Simulate new search entry
		fireEvent.change(searchInput.querySelector("input"), { target: { value: "ta" } });

		await waitFor(() => {
			const contentListItems2 = container.getElementsByClassName("palette-list-item search-result");
			expect(contentListItems2).to.have.length(2);

			// Asserting the text content of the filtered search result
			const exp2 = ["OutputsTable", "OutputsData Audit"];

			exp2.forEach((item, idx) => {
				expect(contentListItems2[idx].textContent).to.equal(item);
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
		expect(container.getElementsByClassName("palette-flyout-div")).to.have.length(1);
	});

	it("should render 2 <PaletteFlyoutContentCategory/> component", () => {
		const { container } = createMountedPalette();
		expect(container.getElementsByClassName("palette-flyout-category")).to.have.length(2);
	});

	it("should leave currently opened category open when a new category is opened", () => {
		const canvasController = new CanvasController();
		const { getByText, container, rerender } = createMountedPalette({ canvasController });

		const importCat = getByText("Import");
		fireEvent.click(importCat);
		rerender(<PaletteFlyout
			paletteJSON={canvasController.getPaletteData()}
			canvasController={canvasController}
			isEditingEnabled
			isPaletteWide
		/>);

		expect(container.querySelectorAll(".palette-content-list")).to.have.length(1);
		expect(container.querySelectorAll(".palette-list-item-icon-and-text")).to.have.length(3);

		const counts = getOpenCategories(container);
		expect(counts).to.have.length(1);


		const outputsCat = getByText("Outputs");
		fireEvent.click(outputsCat);
		rerender(<PaletteFlyout
			paletteJSON={canvasController.getPaletteData()}
			canvasController={canvasController}
			isEditingEnabled
			isPaletteWide
		/>);

		expect(container.querySelectorAll(".palette-content-list")).to.have.length(2);
		expect(container.querySelectorAll(".palette-list-item-icon-and-text")).to.have.length(5);

		const counts2 = getOpenCategories(container);
		expect(counts2).to.have.length(2);
	});

	it("should close a category when two categories are currently open", () => {
		const canvasController = new CanvasController();
		const { container, rerender, getByText } = createMountedPalette({ canvasController });

		const importCat = getByText("Import");
		fireEvent.click(importCat);

		rerender(<PaletteFlyout paletteJSON={canvasController.getPaletteData()}
			canvasController={canvasController}
			isEditingEnabled
			isPaletteWide
		/>);

		const outputsCat = getByText("Outputs");
		fireEvent.click(outputsCat);

		rerender(<PaletteFlyout paletteJSON={canvasController.getPaletteData()}
			canvasController={canvasController}
			isEditingEnabled
			isPaletteWide
		/>);

		expect(container.getElementsByClassName("palette-content-list")).to.have.length(2);
		expect(container.getElementsByClassName("palette-list-item-icon-and-text")).to.have.length(5);

		const counts = getOpenCategories(container);
		expect(counts).to.have.length(2);

		// We now click the Import category again to close it
		const importCat2 = getByText("Import");
		fireEvent.click(importCat2);
		rerender(<PaletteFlyout paletteJSON={canvasController.getPaletteData()}
			canvasController={canvasController}
			isEditingEnabled
			isPaletteWide
		/>);

		// When the Import category is closed and the Outputs category is opened
		// we should have 1 palette flyout content list object because
		// content lists are removed when a category is closed.
		expect(container.getElementsByClassName("palette-content-list")).to.have.length(1);
		expect(container.getElementsByClassName("palette-list-item-icon-and-text")).to.have.length(2);

		const counts2 = getOpenCategories(container);
		expect(counts2).to.have.length(1);


	});

	it("should open/close all categories when calling openAllPaletteCategories/closeAllPaletteCategories", () => {
		const canvasController = new CanvasController();
		const { container, rerender } = createMountedPalette({ canvasController });

		canvasController.openAllPaletteCategories();
		rerender(<PaletteFlyout paletteJSON={canvasController.getPaletteData()}
			canvasController={canvasController}
			isEditingEnabled
			isPaletteWide
		/>);

		expect(container.getElementsByClassName("palette-content-list")).to.have.length(2);
		expect(container.getElementsByClassName("palette-list-item-icon-and-text")).to.have.length(5);
		const counts = getOpenCategories(container);
		expect(counts).to.have.length(2);

		canvasController.closeAllPaletteCategories();
		rerender(<PaletteFlyout paletteJSON={canvasController.getPaletteData()}
			canvasController={canvasController}
			isEditingEnabled
			isPaletteWide
		/>);

		expect(container.getElementsByClassName("palette-content-list")).to.have.length(0);
		expect(container.getElementsByClassName("palette-list-item-icon-and-text")).to.have.length(0);
		const counts2 = getOpenCategories(container);
		expect(counts2).to.have.length(0);

	});

	// // WARNING: The data-id attribute is used by host application "walk-me"
	// // tours to identify palette elements. Therefore, the attribute name
	// // MUST NOT be removed or renamed.
	it("Palette flyout categories should have data-id attribute", () => {
		const canvasController = new CanvasController();
		const { container } = createMountedPalette({ canvasController });
		const flyoutCategories = container.querySelectorAll(".palette-flyout-category");
		flyoutCategories.forEach((category, idx) => {
			expect(category.getAttribute("data-id")).to.equal(testPalette2.categories[idx].id);
		});
	});


	// WARNING: The data-id attribute is used by host application "walk-me"
	// tours to identify palette elements. Therefore, the attribute name
	// MUST NOT be removed or renamed.
	it("Palette flyout nodes should have data-id attribute", () => {
		const { container, getByText } = createMountedPalette();
		const importCat = getByText("Import");
		fireEvent.click(importCat);
		const outputsCat = getByText("Outputs");
		fireEvent.click(outputsCat);
		const ops = [];
		testPalette2.categories.forEach((category) => category.node_types.forEach((node) => ops.push(node.op)));
		const flyoutPaletteNodes = container.querySelectorAll("palette-list-item");
		flyoutPaletteNodes.forEach((node, idx) => {
			expect(node.getAttribute("data-id")).to.equal(ops[idx]);
		});
	});

	it("should show wide palette", () => {
		const { container } = createMountedPalette();

		expect(container.getElementsByClassName("palette-flyout-div-open")).to.have.length(1);
	});

	it("open palette should show correct values for category and node with and without an image", () => {
		const canvasController = new CanvasController();
		const config = {
			showPalette: true,
			palette: imageTestPalette,
			canvasController
		};
		const { container, getByText, rerender } = createMountedPalette(config);
		const categories = container.getElementsByClassName("palette-flyout-category");
		expect(categories).to.have.length(2);

		const category = getByText("Category1");
		fireEvent.click(category);

		rerender(<PaletteFlyout paletteJSON={canvasController.getPaletteData()}
			canvasController={canvasController}
			isEditingEnabled
			isPaletteWide
		/>);

		expect(container.getElementsByClassName("palette-list-item-icon-and-text")).to.have.length(2);
	});

	it("narrow palette should show correct values for category and node with and without an image", () => {
		const canvasController = new CanvasController();
		const config = {
			showPalette: true,
			palette: imageTestPalette,
			canvasController
		};
		const { container, rerender } = createMountedPalette(config);

		// 2 categories should be rendered
		const categories = container.getElementsByClassName("palette-flyout-category");
		expect(categories).to.have.length(2);

		// Category1 should show `Cat` when no image provided
		const category = findCategoryElement(container, "canvas-no-image");
		expect(category.textContent).to.equal("Category1");
		fireEvent.click(category);

		rerender(<PaletteFlyout
			paletteJSON={canvasController.getPaletteData()}
			canvasController={canvasController}
			isEditingEnabled
			isPaletteWide
		/>);

		expect(container.getElementsByClassName("palette-list-item-icon-and-text")).to.have.length(2);

		// Category2 should show image when provided
		const category2 = findCategoryElement(container, "category-image");
		expect(category2.querySelectorAll("img")).to.have.length(1);
	});


	it("should display a header area when one is specified in the config", async() => {
		const config = {
			showPalette: true,
			palette: testPalette3NoDesc,
			paletteHeader: (<div className="test-header" style={{ height: "50px" }}><span>Test text</span></div>)
		};
		const { container } = createMountedPalette(config);

		expect(container.getElementsByClassName("test-header")).to.have.length(1);

	});
});

function createMountedPalette(config) {
	const canvasController = (config && config.canvasController) ? config.canvasController : new CanvasController();
	const palette = (config && config.palette) ? config.palette : testPalette2;
	const isEditingEnabled = (config && config.isEditingEnabled) ? config.isEditingEnabled : true;
	const paletteHeader = (config && config.paletteHeader) ? config.paletteHeader : null;

	canvasController.setPipelineFlowPalette(palette);

	const wrapper = renderWithIntl(
		<PaletteFlyout
			paletteJSON={palette}
			canvasController={canvasController}
			isEditingEnabled={isEditingEnabled}
			paletteHeader={paletteHeader}
			isPaletteWide
		/>
	);
	return wrapper;
}

function findCategoryElement(flyoutPaletteContent, categoryName) {
	var categories = flyoutPaletteContent.getElementsByClassName("palette-flyout-category");
	for (const item of categories) {
		if (item.getAttribute("data-id") === categoryName) {
			return item;
		}
	}
	return null;
}

function getOpenCategories(wrapper) {
	const categoryList2 = wrapper.querySelector("div.palette-flyout-categories");
	return categoryList2.querySelectorAll(".cds--accordion__item--active");
}
