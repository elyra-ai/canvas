/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
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
import { shallow } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";

const canvasController = new CanvasController();


describe("CommonCanvas renders correctly", () => {

	it("should render one <DialogCanvasD3/> component", () => {
		const config = { enableAutoLayout: "none", canvasController: canvasController };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(DiagramCanvasD3)).to.have.length(1);
	});

	it("should render one <Palette/> component when Palette is enabled", () => {
		const config = { enablePaletteLayout: "Modal", enableAutoLayout: "none", canvasController: canvasController };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(Palette)).to.have.length(1);
	});

	it("should render one <PaletteFlyout/> component when Palette layout is not provided", () => {
		const config = { enableAutoLayout: "none", canvasController: canvasController };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(PaletteFlyout)).to.have.length(1);
	});

	it("should render one <PaletteFlyout/> component when Palette layout is enabled", () => {
		const config = { enablePaletteLayout: "Flyout", enableAutoLayout: "none", canvasController: canvasController };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(PaletteFlyout)).to.have.length(1);
	});

	it("should not render any <Palette/> component when Palette layout is not provided", () => {
		const config = { enableAutoLayout: "none", canvasController: canvasController };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(Palette)).to.have.length(0);
	});

	it("should render one <Toolbar/> component when toolbarConfig is provided", () => {
		const toolbarConfig = [];
		const config = { enableAutoLayout: "none", canvasController: canvasController };
		const wrapper = createCommonCanvas(config, toolbarConfig);
		expect(wrapper.find(Toolbar)).to.have.length(1);
	});

	it("should not render one <Toolbar/> component when there is no toolbarConfig", () => {
		const config = { enableAutoLayout: "none", canvasController: canvasController };
		const wrapper = createCommonCanvas(config);
		expect(wrapper.find(Toolbar)).to.have.length(0);
	});
});

function createCommonCanvas(config, toolbarConfig) {
	canvasController.getObjectModel().setEmptyPipelineFlow();
	canvasController.getObjectModel().setPipelineFlowPalette({});
	const contextMenuHandler = sinon.spy();
	const contextMenuActionHandler = sinon.spy();
	const editDiagramHandler = sinon.spy();
	const clickHandler = sinon.spy();
	const decorationActionHandler = sinon.spy();
	const toolbarMenuActionHandler = sinon.spy();
	const wrapper = shallow(
		<CommonCanvas
			config={config}
			contextMenuHandler={contextMenuHandler}
			contextMenuActionHandler={contextMenuActionHandler}
			editDiagramHandler={editDiagramHandler}
			clickHandler={clickHandler}
			decorationActionHandler={decorationActionHandler}
			toolbarMenuActionHandler={toolbarMenuActionHandler}
			toolbarConfig={toolbarConfig}
			canvasController={canvasController}
		/>
	);
	return wrapper;
}
