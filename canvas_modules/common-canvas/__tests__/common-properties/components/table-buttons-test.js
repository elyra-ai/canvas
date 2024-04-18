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
import TableButtons from "../../../src/common-properties/components/table-buttons";
import Controller from "../../../src/common-properties/properties-controller";
import { expect } from "chai";
import { mountWithIntl } from "../../_utils_/intl-utils";
import sinon from "sinon";

import { STATES } from "./../../../src/common-properties/constants/constants";

const controller = new Controller();
const form = {
	componentId: "test-id"
};
controller.setForm(form);

const propertyId = { name: "testCustomTableButtons" };
const customButtons = [
	{
		"id": "button_1",
		"icon": "/images/up-triangle.svg",
		"description": {
			"text": "Custom svg icon path. Disabled"
		}
	},
	{
		"id": "button_2",
		"icon": "/images/up-triangle.svg",
		"enabled": true,
		"description": {
			"text": "Custom svg icon path."
		}
	},
	{
		"id": "button_3",
		"carbon_icon": "Edit32",
		"enabled": false,
		"description": {
			"text": "Carbon icon disabled"
		},
		"divider": "before"
	},
	{
		"id": "button_4",
		"carbon_icon": "Edit32",
		"enabled": true,
		"description": {
			"text": "Carbon icon"
		},
		"divider": "after"
	},
	{
		"id": "button_5",
		"label": {
			"text": "Label btn"
		},
		"description": {
			"text": "Custom button label only."
		}
	},
	{
		"id": "button_6",
		"label": {
			"text": "Label icon"
		},
		"carbon_icon": "Edit32",
		"enabled": true,
		"description": {
			"text": "Custom label button with Carbon icon"
		}
	}
];
const customButtonsState = { "button_1": false, "button_2": true, "button_3": false, "button_4": true };

describe("Table buttons renders correctly", () => {
	let wrapper;

	afterEach(() => {
		wrapper.unmount();
	});

	it("Convert table buttons to toolbar config correctly", () => {
		wrapper = mountWithIntl(
			<TableButtons
				controller={controller}
				propertyId={propertyId}
				customButtons={customButtons}
				tableState=""
				customButtonsState={customButtonsState}
			/>
		);

		const expected = [
			{
				"action": "button_1",
				"enable": false,
				"iconEnabled": "/images/up-triangle.svg",
				"tooltip": "Custom svg icon path. Disabled"
			},
			{
				"action": "button_2",
				"enable": true,
				"iconEnabled": "/images/up-triangle.svg",
				"tooltip": "Custom svg icon path."
			},
			{
				"divider": true
			},
			{
				"action": "button_3",
				"enable": false,
				"tooltip": "Carbon icon disabled"
			},
			{
				"action": "button_4",
				"enable": true,
				"tooltip": "Carbon icon"
			},
			{
				"divider": true
			},
			{
				"action": "button_5",
				"enable": false,
				"label": "Label btn",
				"incLabelWithIcon": "before",
				"kind": "ghost",
				"tooltip": "Custom button label only."
			},
			{
				"action": "button_6",
				"enable": true,
				"label": "Label icon",
				"incLabelWithIcon": "before",
				"kind": "ghost",
				"tooltip": "Custom label button with Carbon icon"
			}
		];

		const instance = wrapper.find("TableButtons").instance();
		const actual = instance.convertToolbarConfig("", customButtons);
		expect(actual).to.eql(expected);
	});

	it("Convert table buttons to toolbar config correctly when table state is disable", () => {
		wrapper = mountWithIntl(
			<TableButtons
				controller={controller}
				propertyId={propertyId}
				customButtons={customButtons}
				tableState=""
				customButtonsState={customButtonsState}
			/>
		);

		const expected = [
			{
				"action": "button_1",
				"enable": false,
				"iconEnabled": "/images/up-triangle.svg",
				"tooltip": "Custom svg icon path. Disabled"
			},
			{
				"action": "button_2",
				"enable": false,
				"iconEnabled": "/images/up-triangle.svg",
				"tooltip": "Custom svg icon path."
			},
			{
				"divider": true
			},
			{
				"action": "button_3",
				"enable": false,
				"tooltip": "Carbon icon disabled"
			},
			{
				"action": "button_4",
				"enable": false,
				"tooltip": "Carbon icon"
			},
			{
				"divider": true
			},
			{
				"action": "button_5",
				"enable": false,
				"label": "Label btn",
				"incLabelWithIcon": "before",
				"kind": "ghost",
				"tooltip": "Custom button label only."
			},
			{
				"action": "button_6",
				"enable": false,
				"label": "Label icon",
				"incLabelWithIcon": "before",
				"kind": "ghost",
				"tooltip": "Custom label button with Carbon icon"
			}
		];

		const instance = wrapper.find("TableButtons").instance();
		const actual = instance.convertToolbarConfig(STATES.DISABLED, customButtons);
		expect(actual).to.eql(expected);
	});

	it("customButtonIconCallback calls buttonIconHandler with correct data", () => {
		const buttonIconHandler = sinon.spy();
		controller.setHandlers({
			buttonIconHandler: buttonIconHandler
		});
		wrapper = mountWithIntl(
			<TableButtons
				controller={controller}
				propertyId={propertyId}
				customButtons={customButtons}
				tableState=""
				customButtonsState={customButtonsState}
			/>
		);

		const instance = wrapper.find("TableButtons").instance();
		instance.customButtonIconCallback(customButtons[2].id, customButtons[2].carbonIcon);
		const expectedData = {
			type: "customButtonIcon",
			propertyId: propertyId,
			buttonId: customButtons[2].id,
			carbonIcon: customButtons[2].carbonIcon
		};
		expect(buttonIconHandler.calledOnce).to.equal(true);
		expect(buttonIconHandler.calledWith(expectedData)).to.equal(true);
	});

	it("customButtonOnClick calls buttonHandler with correct data", () => {
		const buttonHandler = sinon.spy();
		controller.setHandlers({
			buttonHandler: buttonHandler
		});
		wrapper = mountWithIntl(
			<TableButtons
				controller={controller}
				propertyId={propertyId}
				customButtons={customButtons}
				tableState=""
				customButtonsState={customButtonsState}
			/>
		);

		const instance = wrapper.find("TableButtons").instance();
		instance.customButtonOnClick(customButtons[3].id);
		const expectedData = {
			type: "custom_button",
			propertyId: propertyId,
			buttonId: customButtons[3].id
		};
		expect(buttonHandler.calledOnce).to.equal(true);
		expect(buttonHandler.calledWith(expectedData)).to.equal(true);
	});
});
