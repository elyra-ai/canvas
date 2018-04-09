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
// import { mount } from "enzyme";
import { mountWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
import sinon from "sinon";
chai.use(chaiEnzyme()); // Note the invocation at the end

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
			/>
		);

		const table = wrapper.find("#flexible-table-container");
		expect(table).to.have.length(1);
		expect(table.find(".reactable-column-header")).to.have.length(1);
		expect(table.find(".reactable-data")).to.have.length(1);
		expect(table.find(".reactable-data").find("tr")).to.have.length(6);

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
			/>
		);

		const input = wrapper.find("#flexible-table-search");
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
			/>
		);

		const input = wrapper.find(".flexible-table-column");
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
			/>
		);
		const tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		const tableData = tableBody.find(".reactable-data");
		const row = tableData.childAt(0);
		row.simulate("click");
		expect(handleRowClick).to.have.property("callCount", 1);
	});

});
