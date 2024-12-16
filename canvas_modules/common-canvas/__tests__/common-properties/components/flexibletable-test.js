/*
 * Copyright 2017-2025 Elyra Authors
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
import FlexibleTable from "../../../src/common-properties/components/flexible-table";
import Controller from "../../../src/common-properties/properties-controller";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import { renderWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import sinon from "sinon";
import fieldPickerParamDef from "./../../test_resources/paramDefs/fieldpicker_paramDef.json";
import glmmParamDef from "./../../test_resources/paramDefs/glmm_paramDef.json";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import { fireEvent } from "@testing-library/react";

const controller = new Controller();

const updateRowSelections = sinon.spy();

const rows = [
	{
		className: "table-row",
		columns: [
			{ column: "fields", content: "Na" },
			{ column: "sortOrder", content: "Ascending" },
			{ column: "junk", content: "one" },
			{ column: "last", content: "five" }
		]
	},
	{
		className: "table-row",
		columns: [
			{ column: "fields", content: "Age" },
			{ column: "sortOrder", content: "Descending" },
			{ column: "junk", content: "two" },
			{ column: "last", content: "four" }
		]
	},
	{
		className: "table-row",
		columns: [
			{ column: "fields", content: "Sex" },
			{ column: "sortOrder", content: "Descending" },
			{ column: "junk", content: "three" },
			{ column: "last", content: "three" }
		]
	},
	{
		className: "table-row",
		columns: [
			{ column: "fields", content: "Gender" },
			{ column: "sortOrder", content: "Ascending" },
			{ column: "junk", content: "four" },
			{ column: "last", content: "two" }
		]
	},
	{
		className: "table-row",
		columns: [
			{ column: "fields", content: "Occupation" },
			{ column: "sortOrder", content: "Descending" },
			{ column: "junk", content: "five" },
			{ column: "last", content: "one" }
		]
	},
	{
		className: "table-row",
		columns: [
			{ column: "fields", content: "Age" },
			{ column: "sortOrder", content: "Descending" },
			{ column: "junk", content: "two" },
			{ column: "last", content: "four" }
		]
	}
];

const headers = [
	{ "key": "fields", "label": "Field Name" },
	{ "key": "sortOrder", "label": "Sort Direction" },
	{ "key": "junk", "label": "Filter Field" },
	{ "key": "last", "label": "Last Column" }
];
const sortFields = ["fields", "last"];
const filterFields = ["junk"];

function onFilter(filterString) {
	expect(filterString).to.equal("e");
}

function onSort(spec) {
	let valid = false;
	if (spec.column === "fields" || spec.column === "last") {
		valid = true;
	}
	expect(valid).to.be.true;
	expect(spec.direction).to.equal("ASC");
}

const alignTop = true;
const scrollToRow = 3;


const mockFlexibleTable = jest.fn();
jest.mock("../../../src/common-properties/components/flexible-table",
	() => (props) => mockFlexibleTable(props)
);

mockFlexibleTable.mockImplementation((props) => {
	const FlexibleTableComp = jest.requireActual(
		"../../../src/common-properties/components/flexible-table",
	).default;
	return <FlexibleTableComp {...props} />;
});

describe("FlexibleTable renders correctly", () => {

	it("props should have been defined", () => {
		renderWithIntl(
			<FlexibleTable
				sortable={sortFields}
				filterable={filterFields}
				columns={headers}
				data={rows}
				scrollToRow={scrollToRow}
				alignTop={alignTop}
				onFilter={onFilter}
				onSort={onSort}
				controller={controller}
			/>
		);

		expectJest(mockFlexibleTable).toHaveBeenCalledWith({
			"sortable": sortFields,
			"filterable": filterFields,
			"columns": headers,
			"data": rows,
			"scrollToRow": scrollToRow,
			"alignTop": alignTop,
			"onFilter": onFilter,
			"onSort": onSort,
			"controller": controller,
		});
	});

	it("should render a `FlexibleTable`", () => {
		const wrapper = renderWithIntl(
			<FlexibleTable
				sortable={sortFields}
				filterable={filterFields}
				columns={headers}
				data={rows}
				scrollToRow={scrollToRow}
				alignTop={alignTop}
				onFilter={onFilter}
				onSort={onSort}
				controller={controller}
			/>
		);
		const { container } = wrapper;

		const table = container.getElementsByClassName("properties-ft-control-container");
		expect(table).to.have.length(1);
		expect(tableUtilsRTL.getTableHeaderRows(table[0])).to.have.length(1);
		expect(table[0].querySelectorAll(".properties-ft-container-panel")).to.have.length(1);
		expect(tableUtilsRTL.getTableRows(table[0])).to.have.length(6);

	});

	it("should return filter text in `FlexibleTable`", () => {
		const wrapper = renderWithIntl(
			<FlexibleTable
				sortable={sortFields}
				filterable={filterFields}
				columns={headers}
				data={rows}s
				scrollToRow={scrollToRow}
				alignTop={alignTop}
				onFilter={onFilter}
				onSort={onSort}
				controller={controller}
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("div.properties-ft-search-container").querySelectorAll("input");
		expect(input).to.have.length(1);
		fireEvent.change(input[0], { target: { value: "e" } });
		// the verification is that the onFilter function gets the text as input
	});

	it("should return sort text in `FlexibleTable`", () => {
		const wrapper = renderWithIntl(
			<FlexibleTable
				sortable={sortFields}
				filterable={filterFields}
				columns={headers}
				data={rows}
				scrollToRow={scrollToRow}
				alignTop={alignTop}
				onFilter={onFilter}
				onSort={onSort}
				controller={controller}
			/>
		);
		const { container } = wrapper;
		// verify that no columns are active sort column class
		let input = container.querySelectorAll(".properties-vt-column.sort-column-active");
		expect(input).to.have.length(0);

		// sort the first sort column
		tableUtilsRTL.clickHeaderColumnSort(container, 0);
		// the verification is that the onSort function gets invoked with proper column name

		// verify that the first sort column has the active sort column class
		input = container.querySelectorAll(".properties-vt-column.sort-column-active");
		expect(input).to.have.length(1);
		expect(input[0].querySelector("div.tooltip-trigger").textContent).to.equals("Field Name");

		// sort the second sort column
		tableUtilsRTL.clickHeaderColumnSort(container, 1);
		expect(input).to.have.length(1);
		// the verification is that the onSort function gets invoked with proper column name

		// verify that the first sort column is not active and the second sort column is active
		const sortCol = container.querySelectorAll(".ReactVirtualized__Table__sortableHeaderColumn");
		input = [];
		for (let i = 0; i < sortCol.length; i++) {
			input.push(sortCol[i].querySelector(".properties-vt-column"));
		}
		expect(input).to.have.length(2);
		expect(input[0].className.includes("sort-column-active")).to.be.false;
		expect(input[1].className.includes("sort-column-active")).to.be.true;
	});

	it("should handle row click in `FlexibleTable`", () => {
		const wrapper = renderWithIntl(
			<FlexibleTable
				sortable={sortFields}
				filterable={filterFields}
				columns={headers}
				data={rows}
				scrollToRow={scrollToRow}
				alignTop={alignTop}
				onFilter={onFilter}
				onSort={onSort}
				controller={controller}
				rowSelection={"single"}
				updateRowSelections={updateRowSelections}
			/>
		);
		const { container } = wrapper;
		const tableBody = container.querySelectorAll("div.properties-ft-control-container");
		expect(tableBody).to.have.length(1);
		tableUtilsRTL.clickTableRows(tableBody[0], [0]);
		expect(updateRowSelections).to.have.property("callCount", 1);
	});

	it("search bar in `FlexibleTable` should have label", () => {
		// We need getReactIntl() in the controller which will set the tableLabel in searchBarLabel
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(fieldPickerParamDef);
		const wrapper = renderWithIntl(
			<FlexibleTable
				sortable={sortFields}
				filterable={filterFields}
				columns={headers}
				data={rows}
				scrollToRow={scrollToRow}
				alignTop={alignTop}
				onFilter={onFilter}
				onSort={onSort}
				controller={renderedObject.controller}
				tableLabel="example"
			/>
		);
		const { container } = wrapper;
		const searchBarLabel = container.querySelector("div.properties-ft-search-container").textContent;
		expect(searchBarLabel).to.equal("Search in example table");
	});

	it("search bar in `FlexibleTable` can have custom placeholder", () => {
		// To set custom search placeholder, pass the prop "searchPlaceholder" when calling flexible table
		const searchPlaceholder = "Custom search placeholder";
		const wrapper = renderWithIntl(
			<FlexibleTable
				columns={headers}
				filterable={filterFields}
				onFilter={onFilter}
				data={[]}
				searchPlaceholder={searchPlaceholder}
			/>
		);
		const { container } = wrapper;
		const searchBar = container.querySelector("div.properties-ft-search-container").querySelector("input");
		expect(searchBar.placeholder).to.equal(searchPlaceholder);
	});

	it("search bar in `FlexibleTable` shows default placeholder when searchPlaceholder is not passed", () => {
		const wrapper = renderWithIntl(
			<FlexibleTable
				columns={headers}
				filterable={filterFields}
				onFilter={onFilter}
				data={[]}
			/>
		);
		const { container } = wrapper;
		const searchBar = container.querySelector("div.properties-ft-search-container").querySelector("input");
		expect(searchBar.placeholder).to.equal("Find in column Filter Field");
	});


	it("Empty `FlexibleTable` should have emptyTablePlaceholder text", () => {
		const emptyTablePlaceholder = "This is an empty table placeholder";
		const wrapper = renderWithIntl(
			<FlexibleTable
				columns={headers}
				data={[]}
				emptyTablePlaceholder={emptyTablePlaceholder}
			/>
		);
		const { container } = wrapper;
		const tableBody = container.querySelectorAll("div.properties-ft-control-container");
		expect(tableBody).to.have.length(1);
		const emptyTableDiv = tableBody[0].querySelectorAll("div.properties-ft-empty-table");
		expect(emptyTableDiv).to.have.length(1);
		expect(emptyTableDiv[0].textContent).to.equal(emptyTablePlaceholder);
	});

	it("Empty `FlexibleTable` should have emptyTablePlaceholder react element", () => {
		const emptyTablePlaceholder = (
			<div className="empty-table-text">
				<p>This is an empty table placeholder element.</p>
			</div>
		);
		const wrapper = renderWithIntl(
			<FlexibleTable
				columns={headers}
				data={[]}
				emptyTablePlaceholder={emptyTablePlaceholder}
			/>
		);
		const { container } = wrapper;
		const tableBody = container.querySelectorAll("div.properties-ft-control-container");
		expect(tableBody).to.have.length(1);
		const emptyTableDiv = tableBody[0].querySelectorAll("div.properties-ft-empty-table");
		expect(emptyTableDiv).to.have.length(1);
		expect(emptyTableDiv[0].querySelectorAll("div.empty-table-text")).to.have.length(1);
		expect(emptyTableDiv[0].textContent).to.equal("This is an empty table placeholder element.");
	});

	it("Empty `FlexibleTable` shows blank text when emptyTablePlaceholder is not defined", () => {
		const wrapper = renderWithIntl(
			<FlexibleTable
				columns={headers}
				data={[]}
			/>
		);
		const { container } = wrapper;

		const tableBody = container.querySelectorAll("div.properties-ft-control-container");
		expect(tableBody).to.have.length(1);
		const emptyTableDiv = tableBody[0].querySelectorAll("div.properties-ft-empty-table");
		expect(emptyTableDiv).to.have.length(1);
		expect(emptyTableDiv[0].textContent).to.equal("");
	});

	it("Empty `FlexibleTable` uses place_holder_text from uiHints", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(glmmParamDef);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		// Terms table is an empty table using place_holder_text default value
		const termsTable = container.querySelectorAll("div[data-id='properties-ctrl-emeansUI']");
		expect(termsTable).to.have.length(1);
		const emptyTableDiv = termsTable[0].querySelectorAll("div.properties-ft-empty-table");
		expect(emptyTableDiv).to.have.length(1);
		expect(emptyTableDiv[0].textContent).to.equal("No terms added");


		// Fields table is an empty table using place_holder_text resource_key
		const fieldsTable = container.querySelectorAll("div[data-id='properties-ctrl-covariance_list']");
		expect(fieldsTable).to.have.length(1);
		const emptyTableDiv1 = fieldsTable[0].querySelectorAll("div.properties-ft-empty-table");
		expect(emptyTableDiv1).to.have.length(1);
		expect(emptyTableDiv1[0].textContent).to.equal(glmmParamDef.resources["covariance_list.placeholder.label"]);
	});

	it("should readjust height when row changes", () => {
		const wrapper = renderWithIntl(
			<FlexibleTable
				columns={headers}
				data={rows}
				rows={5}
			/>
		);
		const { container, rerender } = wrapper;
		const orgTable = container.querySelector(".properties-ft-container-wrapper");
		expect(orgTable.style.height).to.equal("192px");

		rerender(<FlexibleTable columns={headers} data={rows} rows={2} />);
		const newTable = container.querySelector(".properties-ft-container-wrapper");
		expect(newTable.style.height).to.equal("96px");
	});
});
