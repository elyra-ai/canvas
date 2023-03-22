/*
 * Copyright 2017-2022 Elyra Authors
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
import { Provider } from "react-redux";
import ActionImage from ".../../../src/common-properties/actions/image";
import { mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import Controller from "../../../src/common-properties/properties-controller";

import ACTION_PARAMDEF from "../../test_resources/paramDefs/action_paramDef.json";
import propertyUtils from "../../_utils_/property-utils";

const actionHandler = sinon.spy();
const controller = new Controller();
controller.setHandlers({ actionHandler: actionHandler });
const appData = { nodeId: "1234" };
controller.setAppData(appData);
const actionStateId = { name: "moon" };


const action = {
	"name": "moon",
	"label": {
		"text": "moon"
	},
	"description": {
		"text": "Click to rotate through moon phases."
	},
	"actionType": "image",
	"data": {
		"parameter_ref": "moon_phase"
	},
	"image": {
		"url": "/images/moon.jpg",
		"placement": "right",
		"size": {
			"height": 20,
			"width": 25
		}
	}
};

describe("action-image renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);

		const image = wrapper.find("ImageAction");
		expect(image).to.have.length(1);
		expect(image.prop("action")).to.equal(action);
		expect(image.prop("controller")).to.equal(controller);
	});
	it("should render a `ActionImage`", () => {
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const image = wrapper.find("img");
		expect(image).to.have.length(1);
		expect(image.prop("height")).to.equal(20);
		expect(image.prop("width")).to.equal(25);
		expect(wrapper.find(".right")).to.have.length(1);
	});
	it("should fire action when image clicked", (done) => {
		function callback(id, inAppData, data) {
			expect(id).to.equal("moon");
			expect(inAppData).to.eql(appData);
			expect(data.parameter_ref).to.equal("moon_phase");
			done();
		}
		controller.setHandlers({ actionHandler: callback });
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const image = wrapper.find("img");
		image.simulate("click");
	});
	it("action image renders when disabled", () => {
		controller.updateActionState(actionStateId, "disabled");
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const imageWrapper = wrapper.find(".properties-action-image");
		expect(imageWrapper.hasClass("disabled")).to.equal(true);
	});
	it("action image renders when hidden", () => {
		controller.updateActionState(actionStateId, "hidden");
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const imageWrapper = wrapper.find(".properties-action-image");
		expect(imageWrapper.hasClass("hide")).to.equal(true);
	});
	it("action image renders tooltip", () => {
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<ActionImage
					action={action}
					controller={controller}
				/>
			</Provider>
		);
		const tooltip = wrapper.find("div.tooltipContainer");
		expect(tooltip).to.have.length(1);
		expect(tooltip.text()).to.equal("Click to rotate through moon phases.");
	});
});

describe("actions using paramDef", () => {
	it("should fire action when image clicked", (done) => {
		const renderedObject = propertyUtils.flyoutEditorForm(ACTION_PARAMDEF, null, { actionHandler: callback }, { appData: appData });
		const wrapper = renderedObject.wrapper;
		function callback(id, inAppData, data) {
			expect(id).to.equal("moon");
			expect(inAppData).to.eql(appData);
			expect(data.parameter_ref).to.equal("moon_phase");
			done();
		}
		const image = wrapper.find("div[data-id='properties-ctrl-moon_phase']").find("div[data-id='moon'] img");
		image.simulate("click");
	});

});
