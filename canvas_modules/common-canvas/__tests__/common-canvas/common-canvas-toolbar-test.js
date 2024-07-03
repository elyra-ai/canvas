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

import CanvasController from "../../src/common-canvas/canvas-controller";
import CommonCanvasToolbar from "../../src/common-canvas/cc-toolbar.jsx";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import { createIntlCommonCanvasToolbar } from "../_utils_/cc-utils.js";
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
	it("should render <CommonCanvasToolbar/> with an empty config object", () => {
		const toolbarConfig = {};
		wrapper = createIntlCommonCanvasToolbar({ toolbarConfig,
			isPaletteEnabled: true, isPaletteOpen: true,
			notificationConfig, isNotificationOpen: true }, canvasController);

		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(5);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.paletteClose-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomIn-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomOut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomToFit-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(1);
	});

	// With empty left bar array and undefined right bar it should create a left
	// bar with a palette icon and a right bar with zoom in, zoom out, zoom to fit and notification icons.
	it("should render <CommonCanvasToolbar/> with an empty leftBar and an undefined rightBar in config object", () => {
		const toolbarConfig = { leftBar: [] };
		wrapper = createIntlCommonCanvasToolbar({ toolbarConfig,
			isPaletteEnabled: true, isPaletteOpen: true,
			notificationConfig, isNotificationOpen: true }, canvasController);

		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(5);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.paletteClose-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomIn-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomOut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomToFit-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(1);
	});

	// With empty left bar and empty right bar in the config it should create a
	// left bar with a palette icon and a right bar with just a notification icon.
	it("should render <CommonCanvasToolbar/> with an empty leftBar and rightBar in config object", () => {
		const toolbarConfig = { leftBar: [], rightBar: [] };
		wrapper = createIntlCommonCanvasToolbar({ toolbarConfig,
			isPaletteEnabled: true, isPaletteOpen: true,
			notificationConfig, isNotificationOpen: true }, canvasController);

		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(2);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.paletteClose-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(1);
	});

	// With items in left bar and an undefined right bar in the config it should create a
	// left bar with a palette icon and the items and a right bar with zoom in,
	// zoom out, zoom to fit and notification icons.
	it("should render <CommonCanvasToolbar/> with a leftBar and an undefined rightBar in config object", () => {
		const toolbarConfig = { leftBar: [
			{ action: "undo", label: "Undo", enable: true },
			{ action: "redo", label: "Redo", enable: true },
			{ divider: true },
			{ action: "cut", label: "Cut", enable: true },
			{ action: "copy", label: "Copy", enable: true },
			{ action: "paste", label: "Paste", enable: true }
		] };
		wrapper = createIntlCommonCanvasToolbar({ toolbarConfig,
			isPaletteEnabled: true, isPaletteOpen: true,
			notificationConfig, isNotificationOpen: true }, canvasController);

		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(10);
		expect(wrapper.find(".toolbar-divider")).to.have.length(3);

		expect(wrapper.find(".toolbar-item.paletteClose-action")).to.have.length(1);
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
	it("should render <CommonCanvasToolbar/> component with a leftBar and rightBar in config object", () => {
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
		wrapper = createIntlCommonCanvasToolbar({ toolbarConfig,
			isPaletteEnabled: true, isPaletteOpen: true,
			notificationConfig, isNotificationOpen: true }, canvasController);

		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(7);
		expect(wrapper.find(".toolbar-divider")).to.have.length(3);

		expect(wrapper.find(".toolbar-item.paletteClose-action")).to.have.length(1);
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
	it("should render <CommonCanvasToolbar/> without a togglePalette action when palette not enabled", () => {
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
		wrapper = createIntlCommonCanvasToolbar({ toolbarConfig,
			isPaletteEnabled: false, isPaletteOpen: true,
			notificationConfig, isNotificationOpen: true }, canvasController);

		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(6);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.paletteClose-action")).to.have.length(0);
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
	it("should render <CommonCanvasToolbar/> without notification icon in rightBar when notifications are NOT enabled", () => {
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

		wrapper = createIntlCommonCanvasToolbar({ toolbarConfig: toolbarConfig,
			isPaletteEnabled: true, isPaletteOpen: true,
			notificationConfig: null, isNotificationOpen: true }, canvasController);

		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		// Should have 6 items (5 in config and also a palette item)
		expect(wrapper.find(".toolbar-item")).to.have.length(6);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.paletteClose-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.undo-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.redo-action")).to.have.length(1);

		expect(wrapper.find(".toolbar-item.cut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.copy-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.paste-action")).to.have.length(1);

		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(0);
	});


	// With items in the left bar including an old "palette" action it should
	// remove the palette action and any following divider and replace it with a
	// togglePalette action and a divider.
	it("should render <CommonCanvasToolbar/> replace an old palette action with a togglePalette action when palette is enabled", () => {
		const toolbarConfig = {
			leftBar: [
				{ action: "palette", label: "Palette", enable: true },
				{ divider: true },
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

		wrapper = createIntlCommonCanvasToolbar({
			toolbarConfig: toolbarConfig, isPaletteEnabled: true, isPaletteOpen: true,
			notificationConfig: null, isNotificationOpen: true }, canvasController);

		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(6);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		// Should NOT have a "palette" action.
		expect(wrapper.find(".toolbar-item.palette-action")).to.have.length(0);

		// Should have a "togglePalette" action.
		expect(wrapper.find(".toolbar-item.paletteClose-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.undo-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.redo-action")).to.have.length(1);

		expect(wrapper.find(".toolbar-item.cut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.copy-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.paste-action")).to.have.length(1);

		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(0);
	});

	// When notification panel is open, toolbar button should have class toolbar-item-selected
	// this class shows blue bottom border for the button
	it("Notifications button in rightBar should have class notification-panel when notification panel is open", () => {
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
		// isNotificationOpen is set to true
		wrapper = createIntlCommonCanvasToolbar({ toolbarConfig,
			isPaletteEnabled: true, isPaletteOpen: true,
			notificationConfig, isNotificationOpen: true }, canvasController);

		expect(wrapper.find(".notification-panel")).to.have.length(1);
	});

	// When notification panel is closed, toolbar button should NOT have class toolbar-item-selected
	it("Notifications button in rightBar should not have class toolbar-item-selected when notification panel is closed", () => {
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
		// isNotificationOpen is set to false
		wrapper = createIntlCommonCanvasToolbar({
			toolbarConfig: toolbarConfig, isPaletteEnabled: true, isPaletteOpen: true,
			notificationConfig: notificationConfig, isNotificationOpen: false }, canvasController);
		expect(wrapper.find(".toggleNotificationPanel-action.toolbar-item-selected")).to.have.length(0);
	});

});

describe("Common Canvas Toolbar renders correctly with config as ARRAY", () => {
	let wrapper;

	afterEach(() => {
		wrapper.unmount();
	});

	// With an array passed as a toolbar config (instead of an object) which is
	// the old config style it creates a toolbar successfully.
	it("should render <CommonCanvasToolbar/> with an empty config ARRAY (not object)", () => {
		const toolbarConfig = [];
		wrapper = createIntlCommonCanvasToolbar({ toolbarConfig, isPaletteEnabled: true, isPaletteOpen: true, notificationConfig, isNotificationOpen: true }, canvasController);
		expect(wrapper.find(CommonCanvasToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(5);
		expect(wrapper.find(".toolbar-divider")).to.have.length(2);

		expect(wrapper.find(".toolbar-item.paletteClose-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomIn-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomOut-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.zoomToFit-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.toggleNotificationPanel-action")).to.have.length(1);
	});

	// With an array passed as a toolbar config (instead of an object) which is
	// the old config style it removes any old "palette" action and replaces it
	// with the new "togglePalette" action.
	it("should convert an existing palette item into a toggle palette action.", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		wrapper = createIntlCommonCanvasToolbar({ toolbarConfig, isPaletteEnabled: true, isPaletteOpen: true, notificationConfig, isNotificationOpen: true }, canvasController);

		expect(wrapper.find(".toolbar-item")).to.have.length(5);

		// Should NOT have a "palette" action.
		expect(wrapper.find(".toolbar-item.palette-action")).to.have.length(0);

		// Should have a "togglePalette" action.
		expect(wrapper.find(".toolbar-item.paletteClose-action")).to.have.length(1);
	});
});
