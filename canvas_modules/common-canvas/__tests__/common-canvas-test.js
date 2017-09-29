/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CommonCanvas from "../src/common-canvas.jsx";
import DiagramCanvas from "../src/diagram-canvas.jsx";
import Palette from "../src/palette/palette.jsx";
import PaletteFlyout from "../src/palette/palette-flyout.jsx";
import Toolbar from "../src/toolbar/toolbar.jsx";
import { shallow } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import { OverlayTrigger } from "react-bootstrap";
import ObjectModel from "../src/object-model/object-model.js";


describe("CommonCanvas renders correctly", () => {

	it("should render one <DialogEditor/> component", () => {
		const config = { enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(DiagramCanvas)).to.have.length(1);
	});

	it("should render one <Palette/> component when Palette is enabled", () => {
		const config = { enablePalette: true, enablePaletteLayout: "Modal", enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(Palette)).to.have.length(1);
	});

	it("should render one <OverlayTrigger/> component when Palette is enabled", () => {
		const config = { enablePalette: true, enablePaletteLayout: "Modal", enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(OverlayTrigger)).to.have.length(1);
	});

	it("should render one <Palette/> component when Palette is enabled", () => {
		const config = { enablePalette: true, enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(PaletteFlyout)).to.have.length(1);
	});

	it("should render one <OverlayTrigger/> component when Palette is enabled", () => {
		const config = { enablePalette: true, enablePaletteLayout: "Flyout", enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(PaletteFlyout)).to.have.length(1);
	});

	it("should not render any <Palette/> component when Palette is disabled", () => {
		const config = { enablePalette: false, enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(Palette)).to.have.length(0);
	});

	it("should not render any <OverlayTrigger/> component when Palette is disabled", () => {
		const config = { enablePalette: false, enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(OverlayTrigger)).to.have.length(0);
	});

	it("should render one <Toolbar/> component when toolbarConfig is provided", () => {
		const toolbarMenuActionHandler = sinon.spy();
		const toolbarConfig = { enablePalette: true, toolbarMenuActionHandler: toolbarMenuActionHandler };
		const config = { enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config, toolbarConfig);
		expect(wrapper.find(Toolbar)).to.have.length(1);
	});

	it("should not render one <Toolbar/> component when there is no toolbarConfig", () => {
		const config = { enableAutoLayout: "none" };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(Toolbar)).to.have.length(0);
	});
});

function createCommonCanvas(config, toolbarConfig) {
	ObjectModel.setEmptyPipelineFlow();
	ObjectModel.setPipelineFlowPalette({});
	const contextMenuHandler = sinon.spy();
	const contextMenuActionHandler = sinon.spy();
	const editDiagramHandler = sinon.spy();
	const clickHandler = sinon.spy();
	const decorationActionHandler = sinon.spy();
	const wrapper = shallow(
		<CommonCanvas
			config={config}
			contextMenuHandler={contextMenuHandler}
			contextMenuActionHandler={contextMenuActionHandler}
			editDiagramHandler={editDiagramHandler}
			clickHandler={clickHandler}
			decorationActionHandler={decorationActionHandler}
			toolbarConfig={toolbarConfig}
		/>
	);
	return wrapper;
}
