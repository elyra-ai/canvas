/*
 * Copyright 2017-2019 IBM Corporation
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

import React from "react";
import { mount } from "enzyme";
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
			{ action: "addComment", label: "Add Comment", enable: true },
			{ action: "delete", label: "Delete", enable: true }
		];
		const canvasToolbar = createToolbar(toolbarConfig);
		expect(canvasToolbar.find("#canvas-toolbar")).to.have.length(1);
		expect(canvasToolbar.find("#actions-container")).to.have.length(1);
		expect(canvasToolbar.find("#zoom-actions-container")).to.have.length(1);
		expect(canvasToolbar.find(".list-item-disabled")).to.have.length(5);
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
			{ action: "addComment", label: "Add Comment", enable: true },
			{ action: "delete", label: "Delete", enable: true }
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
	const canvasToolbar = mount(
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
