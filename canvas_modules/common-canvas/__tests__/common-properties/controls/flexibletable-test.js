/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import FlexibleTable from "../../../src/common-properties/editor-controls/flexible-table.jsx";
import { shallow, mount } from "enzyme";
import { Tr, Td } from "reactable";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
import sinon from "sinon";
chai.use(chaiEnzyme()); // Note the invocation at the end

const handleRowClick = sinon.spy();

const rows = [
	<Tr key={0} onClick={handleRowClick}>
		<Td key={0} column="fields">"Na"</Td>
		<Td key={1} column="sortOrder">"Ascending"</Td>
		<Td key={2} column="junk">"one"</Td>
		<Td key={3} column="last">"five"</Td>
	</Tr>,
	<Tr key={0} onClick={handleRowClick}>
		<Td key={0} column="fields">"Age"</Td>
		<Td key={1} column="sortOrder">"Descending"</Td>
		<Td key={2} column="junk">"two"</Td>
		<Td key={3} column="last">"four"</Td>
	</Tr>,
	<Tr key={0} onClick={handleRowClick}>
		<Td key={0} column="fields">"Sex"</Td>
		<Td key={1} column="sortOrder">"Descending"</Td>
		<Td key={2} column="junk">"three"</Td>
		<Td key={3} column="last">"three"</Td>
	</Tr>,
	<Tr key={0} onClick={handleRowClick}>
		<Td key={0} column="fields">"Gender"</Td>
		<Td key={1} column="sortOrder">"Ascending"</Td>
		<Td key={2} column="junk">"four"</Td>
		<Td key={3} column="last">"two"</Td>
	</Tr>,
	<Tr key={0} onClick={handleRowClick}>
		<Td key={0} column="fields">"Occupation"</Td>
		<Td key={1} column="sortOrder">"Descending"</Td>
		<Td key={2} column="junk">"five"</Td>
		<Td key={3} column="last">"one"</Td>
	</Tr>,
	<Tr key={0} onClick={handleRowClick}>
		<Td key={0} column="fields">"Age"</Td>
		<Td key={1} column="sortOrder">"Descending"</Td>
		<Td key={2} column="junk">"two"</Td>
		<Td key={3} column="last">"four"</Td>
	</Tr>
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
		const wrapper = shallow(
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

		expect(wrapper.sortable).to.be.defined;
		expect(wrapper.filterable).to.be.defined;
		expect(wrapper.columns).to.be.defined;
		expect(wrapper.data).to.be.defined;
		expect(wrapper.scrollToRow).to.be.defined;
		expect(wrapper.alignTop).to.be.defined;
		expect(wrapper.onFilter).to.be.defined;
		expect(wrapper.onSort).to.be.defined;
	});

	it("should render a `FlexibleTable`", () => {
		const wrapper = mount(
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

		expect(wrapper.find("#table-header")).to.have.length(1);
		expect(wrapper.find(".flexible-table-header")).to.have.length(1);
		const tableBody = wrapper.find("#flexible-table-container");
		expect(tableBody).to.have.length(1);
		const tableData = tableBody.find(".reactable-data");
		expect(tableData).to.have.length(1);
		expect(tableData.find("tr")).to.have.length(6);

	});

	it("should return filter text in `FlexibleTable`", () => {
		const wrapper = mount(
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
		const wrapper = mount(
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

		const input = wrapper.find(".sort_icon-column");
		expect(input).to.have.length(1);
		input.simulate("click");
		// the verification is that the onSort function gets invoked with proper column name
	});

	it("should handle row click in `FlexibleTable`", () => {
		const wrapper = mount(
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
