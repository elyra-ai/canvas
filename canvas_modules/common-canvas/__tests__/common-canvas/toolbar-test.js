/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CanvasController from "../../src/common-canvas/canvas-controller";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import { mount } from "enzyme";
import { expect } from "chai";

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

		expect(wrapper.find(".list-item.list-item-disabled").length).to.equal(2);
	});
});

function createToolbar(toolbarConfig, notificationConfig) {
	const wrapper = mount(<Toolbar
		config={toolbarConfig}
		isPaletteOpen
		isNotificationOpen
		notificationConfig={notificationConfig}
		canvasController={canvasController}
	/>);
	return wrapper;
}
