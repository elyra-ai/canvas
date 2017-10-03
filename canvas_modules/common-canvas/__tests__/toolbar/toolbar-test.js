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
				{ action: "palette", label: "Palette", disable: false },
				{ divider: true, overflow: false },
				{ action: "stop", label: "Stop Execution", disable: true },
				{ action: "run", label: "Run Pipeline", disable: true },
				{ divider: true, overflow: false },
				{ action: "undo", label: "Undo", disable: false },
				{ action: "redo", label: "Redo", disable: false },
				{ action: "cut", label: "Cut", disable: true },
				{ action: "copy", label: "Copy", disable: true },
				{ action: "paste", label: "Paste", disable: true },
				{ action: "addComment", label: "Add Comment", disable: false },
				{ action: "delete", label: "Delete", disable: false },
				{ divider: true, overflow: true }
			]
		};
		const canvasToolbar = createToolbar(toolbarConfig);
		expect(canvasToolbar.find("#canvas-toolbar")).to.have.length(1);
		expect(canvasToolbar.find("#actions-container0")).to.have.length(1);
		expect(canvasToolbar.find("#actions-container1")).to.have.length(1);
		expect(canvasToolbar.find(".list-item-disabled")).to.have.length(6); // include zoomToFit
	});

	it("should render a Toolbar", () => {
		const toolbarConfig = {
			toolbarMenuActionHandler: sinon.spy(),
			toolbarDefinition: [
				{ action: "palette", label: "Palette", disable: false },
				{ divider: true, overflow: false },
				{ action: "stop", label: "Stop Execution", disable: true },
				{ action: "run", label: "Run Pipeline", disable: true },
				{ divider: true, overflow: false },
				{ action: "undo", label: "Undo", disable: false },
				{ action: "redo", label: "Redo", disable: false },
				{ divider: true, overflow: false },
				{ action: "cut", label: "Cut", disable: true },
				{ action: "copy", label: "Copy", disable: true },
				{ action: "paste", label: "Paste", disable: true },
				{ divider: true, overflow: true },
				{ action: "addComment", label: "Add Comment", disable: false },
				{ action: "delete", label: "Delete", disable: false },
				{ divider: true, overflow: true }
			]
		};
		const canvasToolbar = createToolbar(toolbarConfig);
		expect(canvasToolbar.find("#canvas-toolbar")).to.have.length(1);
		expect(canvasToolbar.find(".toolbar-items-container")).to.have.length(6); // include zoom container
		const canvasToolbarItems = canvasToolbar.find("#toolbar-items");
		expect(canvasToolbarItems.find(".toolbar-icons")).to.have.length(15);
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
