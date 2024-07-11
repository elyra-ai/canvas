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
import FlexibleTable from "../../../src/common-properties/components/flexible-table";
import Controller from "../../../src/common-properties/properties-controller";
import tableUtils from "./../../_utils_/table-utils";

import { mountWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";
import sinon from "sinon";
import fieldPickerParamDef from "./../../test_resources/paramDefs/fieldpicker_paramDef.json";
import glmmParamDef from "./../../test_resources/paramDefs/glmm_paramDef.json";
import propertyUtils from "../../_utils_/property-utils";

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


describe("FlexibleTable renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mountWithIntl(
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

		expect(wrapper.prop("sortable")).to.equal(sortFields);
		expect(wrapper.prop("filterable")).to.equal(filterFields);
		expect(wrapper.prop("columns")).to.equal(headers);
		expect(wrapper.prop("data")).to.equal(rows);
		expect(wrapper.prop("scrollToRow")).to.equal(scrollToRow);
		expect(wrapper.prop("alignTop")).to.equal(alignTop);
		expect(wrapper.prop("onFilter")).to.equal(onFilter);
		expect(wrapper.prop("onSort")).to.equal(onSort);
	});

	it("should render a `FlexibleTable`", () => {
		const wrapper = mountWithIntl(
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
		const table = wrapper.find("div.properties-ft-control-container");
		expect(table).to.have.length(1);
		expect(tableUtils.getTableHeaderRows(table)).to.have.length(1);
		expect(table.find(".properties-ft-container-panel")).to.have.length(1);
		expect(tableUtils.getTableRows(table)).to.have.length(6);

	});

	it("should return filter text in `FlexibleTable`", () => {
		const wrapper = mountWithIntl(
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

		const input = wrapper.find("div.properties-ft-search-container").find("input");
		expect(input).to.have.length(1);
		input.simulate("change", { target: { value: "e" } });
		// the verification is that the onFilter function gets the text as input
	});

	it("should return sort text in `FlexibleTable`", () => {
		const wrapper = mountWithIntl(
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
		// verify that no columns are active sort column class
		var input = wrapper.find(".properties-vt-column.sort-column-active");
		expect(input).to.have.length(0);

		// sort the first sort column
		tableUtils.clickHeaderColumnSort(wrapper, 0);
		// the verification is that the onSort function gets invoked with proper column name

		// verify that the first sort column has the active sort column class
		input = wrapper.find(".properties-vt-column.sort-column-active");
		expect(input).to.have.length(1);
		expect(input.find("div.tooltip-trigger").text()).to.equals("Field Name");

		// sort the second sort column
		tableUtils.clickHeaderColumnSort(wrapper, 1);
		expect(input).to.have.length(1);
		// the verification is that the onSort function gets invoked with proper column name

		// verify that the first sort column is not active and the second sort column is active
		input = wrapper.find(".ReactVirtualized__Table__sortableHeaderColumn").find(".properties-vt-column");
		expect(input).to.have.length(2);
		expect(input.at(0).hasClass("sort-column-active")).to.be.false;
		expect(input.at(1).hasClass("sort-column-active")).to.be.true;
	});

	it("should handle row click in `FlexibleTable`", () => {
		const wrapper = mountWithIntl(
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
		const tableBody = wrapper.find("div.properties-ft-control-container");
		expect(tableBody).to.have.length(1);
		tableUtils.clickTableRows(tableBody, [0]);
		expect(updateRowSelections).to.have.property("callCount", 1);
	});

	it("search bar in `FlexibleTable` should have label", () => {
		// We need getReactIntl() in the controller which will set the tableLabel in searchBarLabel
		const renderedObject = propertyUtils.flyoutEditorForm(fieldPickerParamDef);
		const wrapper = mountWithIntl(
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

		const searchBarLabel = wrapper.find("div.properties-ft-search-container").text();
		expect(searchBarLabel).to.equal("Search in example table");
	});

	it("search bar in `FlexibleTable` can have custom placeholder", () => {
		// To set custom search placeholder, pass the prop "searchPlaceholder" when calling flexible table
		const searchPlaceholder = "Custom search placeholder";
		const wrapper = mountWithIntl(
			<FlexibleTable
				columns={headers}
				filterable={filterFields}
				onFilter={onFilter}
				data={[]}
				searchPlaceholder={searchPlaceholder}
			/>
		);

		const searchBar = wrapper.find("div.properties-ft-search-container").find("input");
		expect(searchBar.props()).to.have.property("placeholder", searchPlaceholder);
	});

	it("search bar in `FlexibleTable` shows default placeholder when searchPlaceholder is not passed", () => {
		const wrapper = mountWithIntl(
			<FlexibleTable
				columns={headers}
				filterable={filterFields}
				onFilter={onFilter}
				data={[]}
			/>
		);

		const searchBar = wrapper.find("div.properties-ft-search-container").find("input");
		expect(searchBar.props()).to.have.property("placeholder", "Find in column Filter Field");
	});


	it("Empty `FlexibleTable` should have emptyTablePlaceholder text", () => {
		const emptyTablePlaceholder = "This is an empty table placeholder";
		const wrapper = mountWithIntl(
			<FlexibleTable
				columns={headers}
				data={[]}
				emptyTablePlaceholder={emptyTablePlaceholder}
			/>
		);

		const tableBody = wrapper.find("div.properties-ft-control-container");
		expect(tableBody).to.have.length(1);
		const emptyTableDiv = tableBody.find("div.properties-ft-empty-table");
		expect(emptyTableDiv).to.have.length(1);
		expect(emptyTableDiv.text()).to.equal(emptyTablePlaceholder);
	});

	it("Empty `FlexibleTable` should have emptyTablePlaceholder react element", () => {
		const emptyTablePlaceholder = (
			<div className="empty-table-text">
				<p>This is an empty table placeholder element.</p>
			</div>
		);
		const wrapper = mountWithIntl(
			<FlexibleTable
				columns={headers}
				data={[]}
				emptyTablePlaceholder={emptyTablePlaceholder}
			/>
		);

		const tableBody = wrapper.find("div.properties-ft-control-container");
		expect(tableBody).to.have.length(1);
		const emptyTableDiv = tableBody.find("div.properties-ft-empty-table");
		expect(emptyTableDiv).to.have.length(1);
		expect(emptyTableDiv.find("div.empty-table-text")).to.have.length(1);
		expect(emptyTableDiv.text()).to.equal("This is an empty table placeholder element.");
	});

	it("Empty `FlexibleTable` shows blank text when emptyTablePlaceholder is not defined", () => {
		const wrapper = mountWithIntl(
			<FlexibleTable
				columns={headers}
				data={[]}
			/>
		);

		const tableBody = wrapper.find("div.properties-ft-control-container");
		expect(tableBody).to.have.length(1);
		const emptyTableDiv = tableBody.find("div.properties-ft-empty-table");
		expect(emptyTableDiv).to.have.length(1);
		expect(emptyTableDiv.text()).to.equal("");
	});

	it("Empty `FlexibleTable` uses place_holder_text from uiHints", () => {
		// TODO revert this test to use rightFlyout once https://github.com/carbon-design-system/carbon/issues/16944 is fixed
		const renderedObject = propertyUtils.flyoutEditorForm(glmmParamDef, { rightFlyout: false, containerType: "Tearsheet" });
		const wrapper = renderedObject.wrapper;

		// Terms table is an empty table using place_holder_text default value
		const termsTable = wrapper.find("div[data-id='properties-ctrl-emeansUI']");
		expect(termsTable).to.have.length(1);
		const emptyTableDiv = termsTable.find("div.properties-ft-empty-table");
		expect(emptyTableDiv).to.have.length(1);
		expect(emptyTableDiv.text()).to.equal("No terms added");


		// Fields table is an empty table using place_holder_text resource_key
		const fieldsTable = wrapper.find("div[data-id='properties-ctrl-covariance_list']");
		expect(fieldsTable).to.have.length(1);
		const emptyTableDiv1 = fieldsTable.find("div.properties-ft-empty-table");
		expect(emptyTableDiv1).to.have.length(1);
		expect(emptyTableDiv1.text()).to.equal(glmmParamDef.resources["covariance_list.placeholder.label"]);
	});

	it("should readjust height when row changes", () => {
		const wrapper = mountWithIntl(
			<FlexibleTable
				columns={headers}
				data={rows}
				rows={5}
			/>
		);
		const orgTableHeight = wrapper.find("FlexibleTable").state("tableHeight");
		expect(orgTableHeight).to.equal(192);

		wrapper.setProps({ rows: 2 });
		const newTableHeight = wrapper.find("FlexibleTable").state("tableHeight");
		expect(newTableHeight).to.equal(96);
	});
});
