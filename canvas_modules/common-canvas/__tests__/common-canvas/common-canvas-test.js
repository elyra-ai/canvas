/*
 * Copyright 2017-2020 Elyra Authors
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
import CanvasContents from "../../src/common-canvas/cc-contents.jsx";
import PaletteDialog from "../../src/palette/palette-dialog.jsx";
import PaletteFlyout from "../../src/palette/palette-flyout.jsx";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import NotificationPanel from "../../src/notification-panel/notification-panel.jsx";
import { createIntlCommonCanvas } from "../_utils_/common-canvas-utils.js";
import { expect } from "chai";
import sinon from "sinon";


describe("CommonCanvas renders correctly", () => {
	let canvasController;
	beforeEach(() => {
		canvasController = new CanvasController();
	});

	it("should render one <CanvasContents/> component", () => {
		const config = {};
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(CanvasContents)).to.have.length(1);
	});

	it("should render one <PaletteDialog/> component when enablePaletteLayout is set to Modal", () => {
		const config = { enablePaletteLayout: "Modal" };
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(PaletteDialog)).to.have.length(1);
	});

	it("should render one <PaletteFlyout/> component when enablePaletteLayout is not specified", () => {
		const config = {};
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(PaletteFlyout)).to.have.length(1);
	});

	it("should render one <PaletteFlyout/> component when enablePaletteLayout is set to Flyout", () => {
		const config = { enablePaletteLayout: "Flyout" };
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(PaletteFlyout)).to.have.length(1);
	});

	it("should not render any <PaletteDialog/> component when enablePaletteLayout is not specified", () => {
		const config = {};
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(PaletteDialog)).to.have.length(0);
	});

	it("should render one <Toolbar/> component when toolbarConfig is provided", () => {
		const toolbarConfig = [];
		const config = {};
		const wrapper = createCommonCanvas(config, canvasController, toolbarConfig);
		expect(wrapper.find(Toolbar)).to.have.length(1);
	});

	it("should render one <Toolbar/> component when there is no toolbarConfig", () => {
		const config = {};
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(Toolbar)).to.have.length(1);
	});

	it("should render one <NotificationPanel/> component", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = {};
		const wrapper = createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(NotificationPanel)).to.have.length(1);
	});


	it("canvas controller isPaletteOpen() should return true when paletteInitialState is true", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = { paletteInitialState: true };
		createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig);

		// The paletteInitialState config parameter is true
		// therefore the palette should be open initially.
		expect(canvasController.isPaletteOpen() === true).to.be.true;
	});

	it("canvas controller isPaletteOpen() should return false when paletteInitialState is false", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = { paletteInitialState: false };
		createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig);

		// The paletteInitialState config parameter is false
		// therefore the palette should be closed initially.
		expect(canvasController.isPaletteOpen() === false).to.be.true;
	});


	it("canvas controller isPaletteOpen() should return appropriate boolean based on palette state", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = {};
		createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig);

		// The paletteInitialState config parameter is not provided when CommonCanvas
		// is created therefore the palette should be closed initially.
		expect(canvasController.isPaletteOpen() === false).to.be.true;

		// After opening the palette the palette should be open.
		canvasController.openPalette();
		expect(canvasController.isPaletteOpen() === true).to.be.true;

		// After closeing the palette the palette should be closed.
		canvasController.closePalette();
		expect(canvasController.isPaletteOpen() === false).to.be.true;
	});

	it("should call editActionHandler when object model is being edited", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = {};

		const editActionHandler = sinon.spy();
		createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig,
			{ editActionHandler: editActionHandler });

		canvasController.editActionHandler({ editType: "dummayFunction" });

		expect(editActionHandler.called).to.be.true;
	});

	it("should call editActionHandler when object model is being edited and beforeEditActionHandler returns command data", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = {};

		const beforeEditActionHandler = (data) => data; // Just return the data passd in
		const editActionHandler = sinon.spy();

		createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig,
			{ editActionHandler: editActionHandler,
				beforeEditActionHandler: beforeEditActionHandler });

		canvasController.editActionHandler({ editType: "dummayFunction" });

		expect(editActionHandler.called).to.be.true;
	});

	it("should not call editActionHandler when object model is being edited and beforeEditActionHandler returns null", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = {};

		const beforeEditActionHandler = (data) => null; // Return null to stop command being executed
		const editActionHandler = sinon.spy();

		createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig,
			{ editActionHandler: editActionHandler,
				beforeEditActionHandler: beforeEditActionHandler });

		canvasController.editActionHandler({ editType: "dummayFunction" });

		expect(editActionHandler.called).to.be.false;
	});
});

function createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig, handlers) {
	canvasController.getObjectModel().setPipelineFlowPalette({});
	const contextMenuHandler = sinon.spy();
	const beforeEditActionHandler = handlers && handlers.beforeEditActionHandler ? handlers.beforeEditActionHandler : null;
	const editActionHandler = handlers && handlers.editActionHandler ? handlers.editActionHandler : sinon.spy();
	const clickActionHandler = sinon.spy();
	const decorationActionHandler = sinon.spy();
	const selectionChangeHandler = sinon.spy();
	const tipHandler = sinon.spy();
	const contextMenuConfig = null;
	const showRightFlyout = false;
	const wrapper = createIntlCommonCanvas(
		config,
		contextMenuHandler,
		beforeEditActionHandler,
		editActionHandler,
		clickActionHandler,
		decorationActionHandler,
		selectionChangeHandler,
		tipHandler,

		toolbarConfig,
		notificationConfig,
		contextMenuConfig,
		showRightFlyout,
		canvasController
	);

	return wrapper;
}
