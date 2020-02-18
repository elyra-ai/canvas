/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { mountWithIntl } from "../_utils_/intl-utils";
import { expect } from "chai";
import CanvasController from "../../src/common-canvas/canvas-controller";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import sinon from "sinon";

const canvasController = new CanvasController();

describe("Toolbar renders correctly", () => {

	it("should render a Toolbar", () => {
		const toolbarConfig = [
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
			{ action: "createAutoComment", label: "Add Comment", enable: true },
			{ action: "deleteSelectedObjects", label: "Delete", enable: true }
		];
		const canvasToolbar = createToolbar(toolbarConfig);
		expect(canvasToolbar.find("#canvas-toolbar")).to.have.length(1);
		expect(canvasToolbar.find("#actions-container")).to.have.length(1);
		expect(canvasToolbar.find("#zoom-actions-container")).to.have.length(1);
		expect(canvasToolbar.find(".list-item-disabled").hostNodes()).to.have.length(5);
	});

	it("should render a Toolbar", () => {
		const toolbarConfig = [
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
			{ action: "createAutoComment", label: "Add Comment", enable: true },
			{ action: "deleteSelectedObjects", label: "Delete", enable: true }
		];
		const canvasToolbar = createToolbar(toolbarConfig);
		expect(canvasToolbar.find("#canvas-toolbar")).to.have.length(1);
		expect(canvasToolbar.find(".toolbar-items-container")).to.have.length(2); // include zoom container
		const canvasToolbarItems = canvasToolbar.find("#toolbar-items");
		expect(canvasToolbarItems).to.have.length(1);
		expect(canvasToolbarItems.find(".toolbar-divider")).to.have.length(4);
		expect(canvasToolbarItems.find(".toolbar-item svg")).to.have.length(13); // include the overflow icon
	});
});

function createToolbar(config) {
	const setToolbarWidth = sinon.spy();
	const canvasToolbar = mountWithIntl(
		<Toolbar
			config={config}
			isPaletteOpen
			isNotificationOpen
			canvasController={canvasController}
			setToolbarWidth={setToolbarWidth}
		/>
	);
	return canvasToolbar;
}
