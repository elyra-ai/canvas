/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { mount } from "enzyme";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import sinon from "sinon";
import { expect } from "chai";

describe("Toolbar renders correctly", () => {

	it("should render a Toolbar", () => {
		const toolbarConfig = {
			toolbarMenuActionHandler: sinon.spy(),
			toolbarDefinition: [
				{ action: "palette", label: "Palette", enable: true },
				{ divider: true },
				{ action: "stop", label: "Stop Execution", enable: false },
				{ action: "run", label: "Run Pipeline", enable: false },
				{ divider: true },
				{ action: "undo", label: "Undo", enable: true },
				{ action: "redo", label: "Redo", enable: true },
				{ action: "cut", label: "Cut", enable: false },
				{ action: "copy", label: "Copy", enable: false },
				{ action: "paste", label: "Paste", enable: false },
				{ action: "addComment", label: "Add Comment", enable: true },
				{ action: "delete", label: "Delete", enable: true }
			]
		};
		const canvasToolbar = createToolbar(toolbarConfig);
		expect(canvasToolbar.find("#canvas-toolbar")).to.have.length(1);
		expect(canvasToolbar.find("#actions-container")).to.have.length(1);
		expect(canvasToolbar.find("#zoom-actions-container")).to.have.length(1);
		expect(canvasToolbar.find(".list-item-disabled")).to.have.length(5);
	});

	it("should render a Toolbar", () => {
		const toolbarConfig = {
			toolbarMenuActionHandler: sinon.spy(),
			toolbarDefinition: [
				{ action: "palette", label: "Palette", enable: true },
				{ divider: true },
				{ action: "stop", label: "Stop Execution", enable: false },
				{ action: "run", label: "Run Pipeline", enable: false },
				{ divider: true },
				{ action: "undo", label: "Undo", enable: true },
				{ action: "redo", label: "Redo", enable: true },
				{ divider: true },
				{ action: "cut", label: "Cut", enable: false },
				{ action: "copy", label: "Copy", enable: false },
				{ action: "paste", label: "Paste", enable: false },
				{ divider: true },
				{ action: "addComment", label: "Add Comment", enable: true },
				{ action: "delete", label: "Delete", enable: true }
			]
		};
		const canvasToolbar = createToolbar(toolbarConfig);
		expect(canvasToolbar.find("#canvas-toolbar")).to.have.length(1);
		expect(canvasToolbar.find(".toolbar-items-container")).to.have.length(2); // include zoom container
		const canvasToolbarItems = canvasToolbar.find("#toolbar-items");
		expect(canvasToolbarItems).to.have.length(1);
		expect(canvasToolbarItems.find(".toolbar-divider")).to.have.length(4);
		expect(canvasToolbarItems.find("#toolbar-icon-overflow")).to.have.length(1);
		expect(canvasToolbarItems.find(".toolbar-icons")).to.have.length(14); // include the overflow icon
	});
});

function createToolbar(config) {
	const closePalette = sinon.spy();
	const openPalette = sinon.spy();
	const zoomIn = sinon.spy();
	const zoomOut = sinon.spy();
	const zoomToFit = sinon.spy();
	const toolbarMenuActionHandler = sinon.spy();
	const canvasToolbar = mount(
		<Toolbar
			config={config}
			paletteState
			paletteType="Flyout"
			closePalette={closePalette}
			openPalette={openPalette}
			zoomIn={zoomIn}
			zoomOut={zoomOut}
			zoomToFit={zoomToFit}
			toolbarMenuActionHandler={toolbarMenuActionHandler}
		/>
	);
	return canvasToolbar;
}
