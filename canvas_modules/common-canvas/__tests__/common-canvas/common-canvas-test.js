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

import CanvasController from "../../src/common-canvas/canvas-controller";
import CanvasContents from "../../src/common-canvas/cc-contents.jsx";
import PaletteDialog from "../../src/palette/palette-dialog.jsx";
import PaletteFlyout from "../../src/palette/palette-flyout.jsx";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import CanvasBottomPanel from "../../src/common-canvas/cc-bottom-panel.jsx";
import CommonCanvasRightFlyout from "../../src/common-canvas/cc-right-flyout.jsx";
import CommonCanvasStateTag from "../../src/common-canvas/cc-state-tag.jsx";
import { createCommonCanvas } from "../_utils_/cc-utils.js";
import { expect } from "chai";
import sinon from "sinon";


describe("CommonCanvas renders correctly", () => {
	let canvasController;
	beforeEach(() => {
		canvasController = new CanvasController();
	});

	it("should render one <CanvasBottomPanel/> component when showBottomPanel is true", () => {
		const config = {};
		const canvasParams = { showBottomPanel: true };
		const wrapper = createCommonCanvas(config, canvasController, canvasParams);
		expect(wrapper.find(CanvasBottomPanel)).to.have.length(1);
		expect(canvasController.isBottomPanelOpen() === true).to.be.true;
	});

	it("should render <CanvasBottomPanel/> with a specific height when setBottomPanelHeight() is called", () => {
		const config = {};
		const canvasParams = { showBottomPanel: true };
		canvasController.setBottomPanelHeight(500);
		const wrapper = createCommonCanvas(config, canvasController, canvasParams);

		const bottomPanel = wrapper.find(".bottom-panel");
		const heightStyle = bottomPanel.prop("style");
		expect(heightStyle).to.eql({ "height": "500px" });
	});


	it("should not render one <CanvasBottomPanel/> component when showBottomPanel is false", () => {
		const config = {};
		const canvasParams = { showBottomPanel: false };
		const wrapper = createCommonCanvas(config, canvasController, canvasParams);
		expect(wrapper.find(CanvasBottomPanel)).to.have.length(1);
		expect(canvasController.isBottomPanelOpen() === false).to.be.true;
	});

	it("should not render one <CommonCanvasRightFlyout/> component when showRightFlyout is false", () => {
		const config = {};
		const canvasParams = { showRightFlyout: false };
		const wrapper = createCommonCanvas(config, canvasController, canvasParams);
		// When showRightFlyout is false then Right Flyout should not be visible
		expect(wrapper.find(CommonCanvasRightFlyout)).to.have.length(0);
		expect(canvasController.isRightFlyoutOpen() === false).to.be.true;
	});

	it("should render one <CommonCanvasRightFlyout/> component when showRightFlyout is true", () => {
		const config = {};
		const canvasParams = { showRightFlyout: true };
		const wrapper = createCommonCanvas(config, canvasController, canvasParams);
		expect(wrapper.find(CommonCanvasRightFlyout)).to.have.length(1);
		expect(canvasController.isRightFlyoutOpen() === true).to.be.true;
	});

	it("should NOT render one <CommonCanvasStateTag/> component when enableStateTag = None", () => {
		const config = { enableStateTag: "None" };
		const canvasParams = { };
		const wrapper = createCommonCanvas(config, canvasController, canvasParams);
		expect(wrapper.find(CommonCanvasStateTag)).to.have.length(0);
	});

	it("should render one <CommonCanvasStateTag/> component when enableStateTag = Locked", () => {
		const config = { enableStateTag: "Locked" };
		const canvasParams = { };
		const wrapper = createCommonCanvas(config, canvasController, canvasParams);
		expect(wrapper.find(CommonCanvasStateTag)).to.have.length(1);
		expect(wrapper.find("div.state-tag").text()).to.equal("Locked");
	});

	it("should render one <CommonCanvasStateTag/> component when enableStateTag = ReadOnly", () => {
		const config = { enableStateTag: "ReadOnly" };
		const canvasParams = { };
		const wrapper = createCommonCanvas(config, canvasController, canvasParams);
		expect(wrapper.find(CommonCanvasStateTag)).to.have.length(1);
		expect(wrapper.find("div.state-tag").text()).to.equal("Read-only");
	});

	it("should render one <CanvasContents/> component", () => {
		const config = {};
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(CanvasContents)).to.have.length(1);
	});

	it("should render one <PaletteDialog/> component when enablePaletteLayout is set to Dialog", () => {
		const config = { enablePaletteLayout: "Dialog" };
		const wrapper = createCommonCanvas(config, canvasController);
		canvasController.openPalette();
		wrapper.update();
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
		const canvasParams = {};
		const editActionHandler = sinon.spy();
		createCommonCanvas(config, canvasController, canvasParams, toolbarConfig, notificationConfig,
			{ editActionHandler: editActionHandler });

		canvasController.editActionHandler({ editType: "dummayFunction" });

		expect(editActionHandler.called).to.be.true;
	});

	it("should call editActionHandler when object model is being edited and beforeEditActionHandler returns command data", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = {};
		const canvasParams = {};
		const beforeEditActionHandler = (data) => data; // Just return the data passd in
		const editActionHandler = sinon.spy();

		createCommonCanvas(config, canvasController, canvasParams, toolbarConfig, notificationConfig,
			{ editActionHandler: editActionHandler,
				beforeEditActionHandler: beforeEditActionHandler });

		canvasController.editActionHandler({ editType: "dummayFunction" });

		expect(editActionHandler.called).to.be.true;
	});

	it("should not call editActionHandler when object model is being edited and beforeEditActionHandler returns null", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = {};
		const canvasParams = {};
		const beforeEditActionHandler = (data) => null; // Return null to stop command being executed
		const editActionHandler = sinon.spy();

		createCommonCanvas(config, canvasController, canvasParams, toolbarConfig, notificationConfig,
			{ editActionHandler: editActionHandler,
				beforeEditActionHandler: beforeEditActionHandler });

		canvasController.editActionHandler({ editType: "dummayFunction" });

		expect(editActionHandler.called).to.be.false;
	});
});
