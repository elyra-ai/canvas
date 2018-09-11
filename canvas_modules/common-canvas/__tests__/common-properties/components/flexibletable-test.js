/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import FlexibleTable from "../../../src/common-properties/components/flexible-table";
import Controller from "../../../src/common-properties/properties-controller";

import { mountWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
import sinon from "sinon";
import propertyUtils from "../../_utils_/property-utils";

import structuretableParamDef from "../../test_resources/paramDefs/structuretable_paramDef.json";

chai.use(chaiEnzyme()); // Note the invocation at the end

const controller = new Controller();

const handleRowClick = sinon.spy();

const rows = [
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Na" },
			{ column: "sortOrder", content: "Ascending" },
			{ column: "junk", content: "one" },
			{ column: "last", content: "five" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Age" },
			{ column: "sortOrder", content: "Descending" },
			{ column: "junk", content: "two" },
			{ column: "last", content: "four" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Sex" },
			{ column: "sortOrder", content: "Descending" },
			{ column: "junk", content: "three" },
			{ column: "last", content: "three" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Gender" },
			{ column: "sortOrder", content: "Ascending" },
			{ column: "junk", content: "four" },
			{ column: "last", content: "two" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Occupation" },
			{ column: "sortOrder", content: "Descending" },
			{ column: "junk", content: "five" },
			{ column: "last", content: "one" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
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
const sortFields = ["fields"];
const filterFields = ["junk"];

function onFilter(filterString) {
	expect(filterString).to.equal("e");
}

function onSort(spec) {
	expect(spec.column).to.equal("fields");
	expect(spec.direction).to.equal(1);
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
		expect(table.find(".reactable-column-header")).to.have.length(1);
		expect(table.find("tbody.reactable-data")).to.have.length(1);
		expect(table.find("tbody.reactable-data").find("tr")).to.have.length(6);

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
		const input = wrapper.find("div.properties-ft-column");
		expect(input).to.have.length(1);
		input.simulate("click");
		// the verification is that the onSort function gets invoked with proper column name
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
			/>
		);
		const tableBody = wrapper.find("div.properties-ft-control-container");
		expect(tableBody).to.have.length(1);
		const tableData = tableBody.find("tbody.reactable-data");
		const row = tableData.childAt(0);
		row.simulate("click");
		expect(handleRowClick).to.have.property("callCount", 1);
	});

});

describe("text cells should display limited text", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("Cell text field display default limited amount", () => {
		let tableSummary = wrapper.find("div[data-id='properties-structuretableReadonlyColumnDefaultIndex-summary-panel']"); // Configure Rename fields
		tableSummary.find("button").simulate("click"); // open the summary panel (modal)
		tableSummary = wrapper.find("div[data-id='properties-structuretableReadonlyColumnDefaultIndex-summary-panel']"); // Configure Rename fields
		// verify the display value is the default limit
		const labelCells = tableSummary.find("td[data-label='new_label']");
		expect(labelCells).to.have.length(2);
		expect(labelCells.at(1).text()).to.equal("blood pressure plus additional characters to test display_chars...");
	});
	it("Cell text field display specified limited amount", () => {
		let tableSummary = wrapper.find("div[data-id='properties-structuretableSortableColumns-summary-panel']"); // Configure Sortable Columns
		tableSummary.find("button").simulate("click"); // open the summary panel (modal)

		tableSummary = wrapper.find("div[data-id='properties-structuretableSortableColumns-summary-panel']"); // Configure Sortable Columns
		// verify the display value is the default limit
		const labelCells = tableSummary.find("td[data-label='new_label']");
		expect(labelCells).to.have.length(2);
		expect(labelCells.at(1).text()).to.equal("blood pre...");
	});

});
