/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CanvasController from "../../src/common-canvas/canvas-controller";
import CommonCanvas from "../../src/common-canvas/common-canvas.jsx";
import DiagramCanvasD3 from "../../src/common-canvas/diagram-canvas-d3.jsx";
import Palette from "../../src/palette/palette.jsx";
import PaletteFlyout from "../../src/palette/palette-flyout.jsx";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import NotificationPanel from "../../src/notification-panel/notification-panel.jsx";
import { expect } from "chai";
import sinon from "sinon";
import { mountWithIntl } from "../_utils_/intl-utils";


describe("CommonCanvas renders correctly", () => {
	let canvasController;
	beforeEach(() => {
		canvasController = new CanvasController();
	});

	it("should render one <DialogCanvasD3/> component", () => {
		const config = { enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(DiagramCanvasD3)).to.have.length(1);
	});

	it("should render one <Palette/> component when Palette is enabled", () => {
		const config = { enablePaletteLayout: "Modal", enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(Palette)).to.have.length(1);
	});

	it("should render one <PaletteFlyout/> component when Palette layout is not provided", () => {
		const config = { enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(PaletteFlyout)).to.have.length(1);
	});

	it("should render one <PaletteFlyout/> component when Palette layout is enabled", () => {
		const config = { enablePaletteLayout: "Flyout", enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(PaletteFlyout)).to.have.length(1);
	});

	it("should not render any <Palette/> component when Palette layout is not provided", () => {
		const config = { enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(Palette)).to.have.length(0);
	});

	it("should render one <Toolbar/> component when toolbarConfig is provided", () => {
		const toolbarConfig = [];
		const config = { enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config, canvasController, toolbarConfig);
		expect(wrapper.find(Toolbar)).to.have.length(1);
	});

	it("should render one <Toolbar/> component when there is no toolbarConfig", () => {
		const config = { enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config, canvasController);
		expect(wrapper.find(Toolbar)).to.have.length(1);
	});

	it("should render one <NotificationPanel/> component", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = { enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(NotificationPanel)).to.have.length(1);
	});


	it("canvas controller isPaletteOpen() should return true when paletteInitialState is true", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = { enableAutoLayout: "none", paletteInitialState: true };
		createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig);

		// The paletteInitialState config parameter is true
		// therefore the palette should be open initially.
		expect(canvasController.isPaletteOpen() === true).to.be.true;
	});

	it("canvas controller isPaletteOpen() should return false when paletteInitialState is false", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = { enableAutoLayout: "none", paletteInitialState: false };
		createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig);

		// The paletteInitialState config parameter is false
		// therefore the palette should be closed initially.
		expect(canvasController.isPaletteOpen() === false).to.be.true;
	});


	it("canvas controller isPaletteOpen() should return appropriate boolean based on palette state", () => {
		const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
		const notificationConfig = { action: "notification", label: "Notifications", enable: true };
		const config = { enableAutoLayout: "none" };
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

});

function createCommonCanvas(config, canvasController, toolbarConfig, notificationConfig) {
	canvasController.getObjectModel().setPipelineFlowPalette({});
	const contextMenuHandler = sinon.spy();
	const contextMenuActionHandler = sinon.spy();
	const editActionHandler = sinon.spy();
	const clickActionHandler = sinon.spy();
	const decorationActionHandler = sinon.spy();
	const selectionChangeHandler = sinon.spy();
	const tipHandler = sinon.spy();
	const toolbarMenuActionHandler = sinon.spy();
	const wrapper = mountWithIntl(
		<CommonCanvas
			config={config}
			contextMenuHandler={contextMenuHandler}
			contextMenuActionHandler={contextMenuActionHandler}
			editActionHandler={editActionHandler}
			clickActionHandler={clickActionHandler}
			decorationActionHandler={decorationActionHandler}
			selectionChangeHandler={selectionChangeHandler}
			tipHandler={tipHandler}
			toolbarConfig={toolbarConfig}
			notificationConfig={notificationConfig}
			showRightFlyout={false}
			toolbarMenuActionHandler={toolbarMenuActionHandler}
			canvasController={canvasController}
		/>
	);
	return wrapper;
}
