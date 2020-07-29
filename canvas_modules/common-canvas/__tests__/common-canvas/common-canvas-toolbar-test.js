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

import CanvasController from "../../src/common-canvas/canvas-controller";
import CommonCanvasToolbar from "../../src/common-canvas/common-canvas-toolbar.jsx";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import { createIntlCommonCanvasToolbar } from "../_utils_/common-canvas-utils.js";
import { expect } from "chai";

const canvasController = new CanvasController();

const notificationConfig = {
	action: "notification",
	label: "Notifications Panel",
	enable: true,
	notificationHeader: "Notifications",
};


describe("Common Canvas Toolbar renders correctly with config as OBJECT", () => {
	let wrapper;

	afterEach(() => {
		wrapper.unmount();
	});


	// With empty config object it should create a left bar with a palette icon and
	// a right bar with zoom in, zoom out, zoom to fit and notification icons.
	it("should render one <CommonCanvasToolbar/> component with an empty config object", () => {
		const toolbarConfig = {};
		wrapper = createIntlCommonCanvasToolbar(toolbarConfig, true, true, notificationConfig, true, canvasController);
		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(5);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.togglePalette-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomIn-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomOut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomToFit-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(1);
	});

	// With empty left bar array and undefined right bar it should create a left
	// bar with a palette icon and a right bar with zoom in, zoom out, zoom to fit and notification icons.
	it("should render one <CommonCanvasToolbar/> component with an undefined rightBar in config object", () => {
		const toolbarConfig = { leftBar: [] };
		wrapper = createIntlCommonCanvasToolbar(toolbarConfig, true, true, notificationConfig, true, canvasController);
		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(5);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.togglePalette-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomIn-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomOut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomToFit-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(1);
	});

	// With empty left bar and empty right bar in the config it should create a
	// left bar with a palette icon and a right bar with just a notification icon.
	it("should render one <CommonCanvasToolbar/> component with an undefined rightBar in config object", () => {
		const toolbarConfig = { leftBar: [], rightBar: [] };
		wrapper = createIntlCommonCanvasToolbar(toolbarConfig, true, true, notificationConfig, true, canvasController);
		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(2);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.togglePalette-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(1);
	});

	// With items in left bar and an undfined right bar in the config it should create a
	// left bar with a palette icon and the items and a right bar with zoom in,
	// zoom out, zoom to fit and notification icons.
	it("should render one <CommonCanvasToolbar/> component with an undefined rightBar in config object", () => {
		const toolbarConfig = { leftBar: [
			{ action: "undo", label: "Undo", enable: true },
			{ action: "redo", label: "Redo", enable: true },
			{ divider: true },
			{ action: "cut", label: "Cut", enable: true },
			{ action: "copy", label: "Copy", enable: true },
			{ action: "paste", label: "Paste", enable: true }
		] };
		wrapper = createIntlCommonCanvasToolbar(toolbarConfig, true, true, notificationConfig, true, canvasController);
		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(10);
		expect(wrapper.find(".toolbar-divider")).to.have.length(3);

		expect(wrapper.find(".toolbar-item.togglePalette-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.undo-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.redo-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.cut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.copy-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.paste-action")).to.have.length(1);

		expect(wrapper.find(".toolbar-item.zoomIn-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomOut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomToFit-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(1);
	});

	// With items in the left bar and the right bar in the config it should create a
	// left bar with a palette icon and the items and a right bar the items and a notification icons.
	it("should render one <CommonCanvasToolbar/> component with an undefined rightBar in config object", () => {
		const toolbarConfig = {
			leftBar: [
				{ action: "undo", label: "Undo", enable: true },
				{ action: "redo", label: "Redo", enable: true },
			],
			rightBar: [
				{ divider: true },
				{ action: "cut", label: "Cut", enable: true },
				{ action: "copy", label: "Copy", enable: true },
				{ action: "paste", label: "Paste", enable: true }
			]
		};
		wrapper = createIntlCommonCanvasToolbar(toolbarConfig, true, true, notificationConfig, true, canvasController);
		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(7);
		expect(wrapper.find(".toolbar-divider")).to.have.length(3);

		expect(wrapper.find(".toolbar-item.togglePalette-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.undo-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.redo-action")).to.have.length(1);

		expect(wrapper.find(".toolbar-item.cut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.copy-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.paste-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(1);
	});

	// With items in the left bar and the right bar in the config and palette not
	// enabled it should create a left bar with the items but no palette icon
	// and a right bar the items and a notification icons.
	it("should render one <CommonCanvasToolbar/> component with an undefined rightBar in config object", () => {
		const toolbarConfig = {
			leftBar: [
				{ action: "undo", label: "Undo", enable: true },
				{ action: "redo", label: "Redo", enable: true },
			],
			rightBar: [
				{ divider: true },
				{ action: "cut", label: "Cut", enable: true },
				{ action: "copy", label: "Copy", enable: true },
				{ action: "paste", label: "Paste", enable: true }
			]
		};
		// false indicate palette not enabled
		wrapper = createIntlCommonCanvasToolbar(toolbarConfig, false, true, notificationConfig, true, canvasController);
		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(6);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.togglePalette-action")).to.have.length(0);
		expect(wrapper.find(".toolbar-item.undo-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.redo-action")).to.have.length(1);

		expect(wrapper.find(".toolbar-item.cut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.copy-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.paste-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(1);
	});


	// With items in the left bar and the right bar in the config and notification not
	// enabled it should create a left bar with the palette and items
	// and a right bar the items but without a notification icon.
	it("should render one <CommonCanvasToolbar/> component with an undefined rightBar in config object", () => {
		const toolbarConfig = {
			leftBar: [
				{ action: "undo", label: "Undo", enable: true },
				{ action: "redo", label: "Redo", enable: true },
			],
			rightBar: [
				{ divider: true },
				{ action: "cut", label: "Cut", enable: true },
				{ action: "copy", label: "Copy", enable: true },
				{ action: "paste", label: "Paste", enable: true }
			]
		};
		// null indicates notification not enabled
		wrapper = createIntlCommonCanvasToolbar(toolbarConfig, true, true, null, true, canvasController);
		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(6);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.togglePalette-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.undo-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.redo-action")).to.have.length(1);

		expect(wrapper.find(".toolbar-item.cut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.copy-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.paste-action")).to.have.length(1);

		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(0);
	});

});

describe("Common Canvas Toolbar renders correctly with config as ARRAY", () => {
	let wrapper;

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render one <CommonCanvasToolbar/> component with and empty config ARRAY (not object)", () => {
		const toolbarConfig = [];
		wrapper = createIntlCommonCanvasToolbar(toolbarConfig, true, true, notificationConfig, true, canvasController);
		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(5);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.togglePalette-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomIn-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomOut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomToFit-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(1);
	});

	it("should convert an existing palette item into a toggle palette action.", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		wrapper = createIntlCommonCanvasToolbar(toolbarConfig, true, true, notificationConfig, true, canvasController);

		expect(wrapper.find(".toolbar-item")).to.have.length(5);
		expect(wrapper.find(".toolbar-item.togglePalette-action")).to.have.length(1);
	});

});
