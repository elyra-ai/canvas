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
import ReadonlyTableControl from "../../../src/common-properties/controls/readonlytable";
import { renderWithIntl } from "../../_utils_/intl-utils";
import { Provider } from "react-redux";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import sinon from "sinon";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import Controller from "../../../src/common-properties/properties-controller";

import readonlyTableParamDef from "../../test_resources/paramDefs/readonlyTable_paramDef.json";
import { fireEvent } from "@testing-library/react";

const controller = new Controller();

const control = {
	"name": "keys",
	"label": {
		"text": "Sort by"
	},
	"controlType": "readonlyTable",
	"moveableRows": true,
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
			"sortable": true,
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
	]
};
const propertyId = { name: "keys" };

function genUIItem() {
	return <div />;
}

const mockReadonlyTable = jest.fn();
jest.mock("../../../src/common-properties/controls/readonlytable",
	() => (props) => mockReadonlyTable(props)
);

mockReadonlyTable.mockImplementation((props) => {
	const ReadonlyTableComp = jest.requireActual(
		"../../../src/common-properties/controls/readonlytable",
	).default;
	return <ReadonlyTableComp {...props} />;
});

beforeAll(() => {
	// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
	Element.prototype.getBoundingClientRect = jest.fn()
		.mockReturnValue({
			height: 1000, // This is used to measure the panel height
			width: 1000
		});
});

describe("readonlytable control renders correctly", () => {
	it("props should have been defined", () => {
		renderWithIntl(
			<ReadonlyTableControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				buildUIItem={genUIItem}
				rightFlyout
			/>
		);
		expectJest(mockReadonlyTable).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
			"buildUIItem": genUIItem,
			"rightFlyout": true
		});
	});

	it("should render empty table content for `readonlytable` control", () => {
		// We need getReactIntl() in the controller which will set the empty table text
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(readonlyTableParamDef);
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ReadonlyTableControl
					control={control}
					controller={renderedObject.controller}
					propertyId={propertyId}
					buildUIItem={genUIItem}
					rightFlyout
				/>
			</Provider>
		);
		const { container } = wrapper;
		expect(container.querySelectorAll("div[data-id='properties-keys']")).to.have.length(1);
		// Verify empty table content is rendered
		expect(container.querySelectorAll("div.properties-empty-table")).to.have.length(1);
		expect(container.querySelector("div.properties-empty-table span")
			.textContent).to.be.equal("To begin, click \"Edit\"");
		expect(container.querySelectorAll("button.properties-empty-table-button")).to.have.length(1);
		expect(container.querySelector("button.properties-empty-table-button").textContent).to.be.equal("Edit");
	});

	let wrapper;
	let renderedController;
	const buttonHandler = sinon.spy();
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(readonlyTableParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
		renderedController.setHandlers({
			buttonHandler: buttonHandler
		});
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render a `readonlytable` control with edit button", () => {
		const tables = propertyUtilsRTL.openSummaryPanel(wrapper, "readonlyTable-summary-panel");
		const table = tables.querySelector("div[data-id='properties-ft-readonlyStructureTableControl']");

		// ensure the edit button exists
		const editButton = table.querySelectorAll("button.properties-edit-button");
		expect(editButton).to.have.length(1);
		expect(editButton[0].textContent).to.equal("Edit");

		fireEvent.click(editButton[0]);
		expect(buttonHandler).to.have.property("callCount", 1);
		expect(buttonHandler.calledWith({ type: "edit", propertyId: { name: "readonlyStructureTableControl" } })).to.be.true;
	});

	it("should render a `readonlytable` control with a custom edit button label", () => {
		const tables = propertyUtilsRTL.openSummaryPanel(wrapper, "readonlyTable-summary-panel");
		const table = tables.querySelector("div[data-id='properties-ft-readonlyStructurelistTableControl']");
		const editButton = table.querySelector("button.properties-edit-button");
		expect(editButton.textContent).to.equal("Edit test");
	});

	it("`readonlytable` control should have aria-label", () => {
		const tables = propertyUtilsRTL.openSummaryPanel(wrapper, "readonlyTable-summary-panel");
		const table = tables
			.querySelector("div[data-id='properties-ft-readonlyStructurelistTableControl']")
			.querySelector(".properties-autosized-vt");
		expect(table.getAttribute("aria-label")).to.equal("ReadonlyTable - structurelisteditor");
	});

	it("`readonlytable` control with single row selection should be non-interactive", () => {
		const tables = propertyUtilsRTL.openSummaryPanel(wrapper, "readonlyTable-summary-panel");
		const table = tables
			.querySelector("div[data-id='properties-ft-readonlyStructurelistTableControl']")
			.querySelector(".properties-autosized-vt");
		const rows = table.querySelectorAll("div[data-role='properties-data-row']");
		rows.forEach((row) => {
			expect(row.className.includes("properties-vt-row-non-interactive")).to.equal(true);
		});
	});
});

describe("readonlytable control conditions", () => {
	let wrapper;
	let renderedController;
	const buttonHandler = sinon.spy();
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(readonlyTableParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
		renderedController.setHandlers({
			buttonHandler: buttonHandler
		});
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("a hidden `readonlyTable` control should not be shown", () => {
		const tables = propertyUtilsRTL.openSummaryPanel(wrapper, "readonlyTable-conditions-summary-panel");
		const table = tables.querySelectorAll("div[data-id='properties-ci-readonlyTableHidden']");
		expect(table).to.have.length(0);
	});

	it("a disabled `readonlytable` control should be disabled", () => {
		const tables = propertyUtilsRTL.openSummaryPanel(wrapper, "readonlyTable-conditions-summary-panel");
		const table = tables.querySelector("div[data-id='properties-ci-readonlyTableDisabled']");
		expect(table.outerHTML.includes("disabled")).to.equal(true);
	});
});

describe("readonlyTable classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(readonlyTableParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("readonlyTable should have custom classname defined", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "readonlyTable-summary-panel");
		expect(wrapper.container.querySelectorAll(".readonlytable-control-class")).to.have.length(1);
	});

	it("readonlyTable should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "readonlyTable-summary-panel");
		expect(wrapper.container.querySelectorAll(".nested-parent-readonlytable-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".nested-subpanel-readonlytable-control-class")).to.have.length(3);
	});
});
