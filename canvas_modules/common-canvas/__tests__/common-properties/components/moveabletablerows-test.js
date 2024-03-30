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
import MoveableTableRows from "../../../src/common-properties/components/moveable-table-rows";
import FlexibleTable from "../../../src/common-properties/components/flexible-table";
import { mountWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
import sinon from "sinon";
import propertyUtils from "../../_utils_/property-utils";
import Controller from "../../../src/common-properties/properties-controller";

chai.use(chaiEnzyme()); // Note the invocation at the end

const handleRowClick = sinon.spy();
const setScrollToRow = sinon.spy();

const controller = new Controller();
const control = {
	"name": "test-moveabletablerows",
	"controlType": "structuretable",
	"moveableRows": true,
	"addRemoveRows": true,
	"valueDef": {
		"propType": "structure",
		"isList": true,
		"isMap": false
	},
	"subControls": [
		{
			"name": "field",
			"label": {
				"text": "Field"
			},
			"visible": true,
			"width": 28,
			"controlType": "selectcolumn",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false
			},
			"filterable": true
		},
		{
			"name": "sort_order",
			"label": {
				"text": "Order"
			},
			"visible": true,
			"width": 16,
			"controlType": "toggletext",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false
			},
			"values": [
				"Ascending",
				"Descending"
			],
			"valueLabels": [
				"Ascending",
				"Descending"
			],
			"valueIcons": [
				"/images/up-triangle.svg",
				"/images/down-triangle.svg"
			]
		}
	],
	"keyIndex": 0,
	"defaultRow": [
		"Ascending"
	]
};

const controlValue = [
	["Na", "Ascending"],
	["Age", "Descending"],
	["Sex", "Descending"],
	["Gender", "Ascending"],
	["Occupation", "Descending"],
	["Address", "Descending"]
];

const rows = [
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Na" },
			{ column: "sortOrder", content: "Ascending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Age" },
			{ column: "sortOrder", content: "Descending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Sex" },
			{ column: "sortOrder", content: "Descending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Gender" },
			{ column: "sortOrder", content: "Ascending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Occupation" },
			{ column: "sortOrder", content: "Descending" }
		]
	},
	{
		className: "table-row",
		onClickCallback: handleRowClick,
		columns: [
			{ column: "fields", content: "Address" },
			{ column: "sortOrder", content: "Descending" }
		]
	}
];

const headers = [
	{ "key": "fields", "label": "Field Name" },
	{ "key": "sortOrder", "label": "Sort Direction" },
];
const content = (<div>
	<FlexibleTable
		columns={headers}
		data={rows}
		controller={controller}
	/>
</div>
);

propertyUtils.setControls(controller, [control]);

function setControlValues(selection) {
	controller.updatePropertyValue(propertyId, getCopy(controlValue));
	controller.updateSelectedRows(control.name, selection);
}

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}

function setCurrentControlValueSelected(inControlValue, inSelectedRows) {
	controller.updatePropertyValue(propertyId, getCopy(inControlValue));
	controller.updateSelectedRows(control.name, inSelectedRows);
}

const propertyId = { name: "test-moveabletablerows" };

describe("MoveableTableRows renders correctly", () => {

	it("props should have been defined", () => {
		setControlValues([]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		expect(wrapper.prop("setScrollToRow")).to.equal(setScrollToRow);
		expect(wrapper.prop("setCurrentControlValueSelected")).to.equal(setCurrentControlValueSelected);
	});

	it("should select no rows and all move buttons disabled", () => {
		setControlValues([]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer).to.have.length(1);
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(4);
	});

	it("should select top row and move down one row", () => {
		setControlValues([0]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer).to.have.length(1);
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(2);
		buttonContainer.find("button.table-row-move-button[disabled=false]")
			.at(0)
			.simulate("click");

		// validate the first row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[1][0]).to.equal("Na");
	});

	it("should select top row and move down to bottom row", () => {
		setControlValues([0]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(2);
		buttonContainer.find("button.table-row-move-button[disabled=false]")
			.at(1)
			.simulate("click");

		// validate the first row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[rows.length - 1][0]).to.equal("Na");


	});

	it("should select bottom row and move up one row", () => {
		setControlValues([rows.length - 1]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(2);
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
		buttonContainer.find("button.table-row-move-button[disabled=false]")
			.at(1)
			.simulate("click");

		// validate the bottom row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[rows.length - 2][0]).to.equal("Address");
		expect(tableRows[rows.length - 1][0]).to.equal("Occupation");
	});

	it("should select bottom row and move up to top row", () => {
		setControlValues([rows.length - 1]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(2);
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
		buttonContainer.find("button.table-row-move-button[disabled=false]")
			.at(0)
			.simulate("click");

		// validate the last row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Address");
		expect(tableRows[rows.length - 1][0]).to.equal("Occupation");
	});


	it("should select middle row and all move buttons enabled ", () => {
		setControlValues([2]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);

		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(4);
	});

	it("should disable move buttons for all propertyIds passed in controller method ", () => {
		// By default when middle row is selected, all move buttons are enabled
		setControlValues([2]);
		const wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate all move buttons are enabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(4);
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(0);

		// Disable move buttons for given propertyId
		const propertyIds = [propertyId];
		controller.setDisableRowMoveButtons(propertyIds);
		// Verify propertyIds are correctly set in the redux
		expect(controller.getDisableRowMoveButtons()).to.equal(propertyIds);
		expect(controller.isDisableRowMoveButtons(propertyId)).to.equal(true);

		// Validate all move buttons are disabled
		wrapper.update();
		const buttonContainerUpdated = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainerUpdated.find("button.table-row-move-button[disabled=false]")).to.have.length(0);
		expect(buttonContainerUpdated.find("button.table-row-move-button[disabled=true]")).to.have.length(4);

	});

	it("Table should have presentation role", () => {
		const wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		expect(wrapper.find(".properties-mr-table-container").props()).to.have.property("role", "presentation");
	});

	it("should disable all move buttons when first row is static and selected", () => {
		setControlValues([0]);
		let wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		controller.updateStaticRows(propertyId, [0]);
		wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(4);
	});

	it("should disable up move buttons when first row is static and second row is selected", () => {
		setControlValues([1]);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		let wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		controller.updateStaticRows(propertyId, [0]);
		wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
	});

	it("should disable all move buttons when last row is static and selected", () => {
		setControlValues([rows.length - 1]);
		let wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		controller.updateStaticRows(propertyId, [rows.length - 1]);
		wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(4);
	});

	it("should disable down move buttons when last row is static and second last row is selected", () => {
		setControlValues([rows.length - 2]);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		let wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		controller.updateStaticRows(propertyId, [rows.length - 1]);
		wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
	});

	it("should enable all move buttons when last row is static and third last row is selected", () => {
		setControlValues([rows.length - 3]);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		let wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		controller.updateStaticRows(propertyId, [rows.length - 1]);
		wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(4);
	});

	it("should enable all move buttons when first row is static and third row is selected", () => {
		setControlValues([2]);
		const isDisableRowMoveButtons = controller.isDisableRowMoveButtons(propertyId);
		if (isDisableRowMoveButtons === true) {
			controller.setDisableRowMoveButtons([]);
		}
		let wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		controller.updateStaticRows(propertyId, [0]);
		wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(4);
	});

	it("should select bottom row and move up to top row after the static rows", () => {
		setControlValues([rows.length - 1]);
		let wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		controller.updateStaticRows(propertyId, [0]);
		wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(2);
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
		buttonContainer.find("button.table-row-move-button[disabled=false]")
			.at(0)
			.simulate("click");

		// validate the last row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[1][0]).to.equal("Address");
		expect(tableRows[rows.length - 1][0]).to.equal("Occupation");
	});

	it("should select top row and move down to the row before the static rows", () => {
		setControlValues([0]);
		let wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		controller.updateStaticRows(propertyId, [rows.length - 1]);
		wrapper = mountWithIntl(
			<MoveableTableRows
				store={controller.getStore()}
				tableContainer={content}
				control={control}
				controller={controller}
				propertyId={propertyId}
				setScrollToRow={setScrollToRow}
				setCurrentControlValueSelected={setCurrentControlValueSelected}
			/>
		);
		// validate the proper buttons are enabled/disabled
		const buttonContainer = wrapper.find("div.properties-mr-button-container");
		expect(buttonContainer.find("button.table-row-move-button[disabled=true]")).to.have.length(2);
		expect(buttonContainer.find("button.table-row-move-button[disabled=false]")).to.have.length(2);
		buttonContainer.find("button.table-row-move-button[disabled=false]")
			.at(1)
			.simulate("click");

		// validate the first row is moved
		const tableRows = controller.getPropertyValue(propertyId);
		expect(tableRows[0][0]).to.equal("Age");
		expect(tableRows[rows.length - 2][0]).to.equal("Na");
	});


});
