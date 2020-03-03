/*
 * Copyright 2017-2020 IBM Corporation
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
import CanvasController from "../../src/common-canvas/canvas-controller";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import { mountWithIntl } from "../_utils_/intl-utils";
import { expect } from "chai";
import sinon from "sinon";

const canvasController = new CanvasController();

describe("Toolbar renders correctly", () => {
	let wrapper;

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render one <Toolbar/> component without notification icon", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		wrapper = createToolbar(toolbarConfig);
		expect(wrapper.find(Toolbar)).to.have.length(1);

		const actions = wrapper.find(".list-item-containers");
		expect(actions.length).to.equal(4);
	});

	it("should render one <Toolbar/> component with notification icon", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		wrapper = createToolbar(toolbarConfig, notificationConfig);
		expect(wrapper.find(Toolbar)).to.have.length(1);

		const actions = wrapper.find(".list-item-containers");
		expect(actions.length).to.equal(5);
	});

	it("should render one <Toolbar/> component with notification icon disabled", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: false }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: false };
		wrapper = createToolbar(toolbarConfig, notificationConfig);
		expect(wrapper.find(Toolbar)).to.have.length(1);

		const actions = wrapper.find(".list-item-containers");
		expect(actions.length).to.equal(5);

		expect(wrapper.find("button.list-item.list-item-disabled").length).to.equal(1); // Palette is never disabled
	});

	it("should render one <Toolbar/> component with no icons on the left side of the toolbar", () => {
		const toolbarConfig = [];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		wrapper = createToolbar(toolbarConfig, notificationConfig);
		expect(wrapper.find(Toolbar)).to.have.length(1);

		const actions = wrapper.find(".list-item-containers");
		expect(actions.length).to.equal(4);
	});
});

function createToolbar(toolbarConfig, notificationConfig) {
	const setToolbarWidth = sinon.spy();
	const wrapper = mountWithIntl(<Toolbar
		config={toolbarConfig}
		isPaletteOpen
		isNotificationOpen
		notificationConfig={notificationConfig}
		canvasController={canvasController}
		setToolbarWidth={setToolbarWidth}
	/>);
	return wrapper;
}
