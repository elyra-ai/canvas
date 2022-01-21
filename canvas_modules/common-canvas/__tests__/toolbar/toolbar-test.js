/*
 * Copyright 2017-2022 Elyra Authors
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
import { mountWithIntl } from "../_utils_/intl-utils";
import { expect } from "chai";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import sinon from "sinon";

describe("Toolbar renders correctly", () => {

	it("should render a Toolbar with just a left bar defined", () => {
		const toolbarConfig = {
			leftBar: [
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
			]
		};
		const canvasToolbar = createToolbar(toolbarConfig);
		expect(canvasToolbar.find(".toolbar-div")).to.have.length(1);
		expect(canvasToolbar.find(".toolbar-left-bar")).to.have.length(1);
		expect(canvasToolbar.find(".toolbar-right-bar")).to.have.length(1);
		expect(canvasToolbar.find(".toolbar-item")).to.have.length(10);
		expect(canvasToolbar.find(".toolbar-divider")).to.have.length(2);
		expect(canvasToolbar.find(".toolbar-spacer")).to.have.length(10);
	});

	it("should render a Toolbar with just a right bar defined", () => {
		const toolbarConfig = {
			rightBar: [
				{ action: "zoomIn", label: "Cut", enable: false },
				{ action: "zoomOut", label: "Copy", enable: false },
				{ action: "zoomToFit", label: "Zoom To Fit", enable: false },
				{ divider: true },
				{ action: "notifications", label: "Notficiations", enable: true }
			]
		};

		const canvasToolbar = createToolbar(toolbarConfig);
		expect(canvasToolbar.find(".toolbar-div")).to.have.length(1);
		expect(canvasToolbar.find(".toolbar-left-bar")).to.have.length(1);
		expect(canvasToolbar.find(".toolbar-right-bar")).to.have.length(1);
		expect(canvasToolbar.find(".toolbar-item")).to.have.length(4);
		expect(canvasToolbar.find(".toolbar-divider")).to.have.length(1);
		// No spacers created for the right bar
		expect(canvasToolbar.find(".toolbar-spacer")).to.have.length(0);
	});

	it("should register a click when clicked on an enabled toolbar item", () => {
		const toolbarConfig = {
			rightBar: [
				{ action: "zoomIn", label: "Cut", enable: true },
				{ action: "zoomOut", label: "Copy", enable: true },
				{ action: "zoomToFit", label: "Zoom To Fit", enable: false },
				{ divider: true },
				{ action: "notifications", label: "Notficiations", enable: true }
			]
		};
		const toolbarActionHandler = sinon.spy();
		const canvasToolbar = createToolbar(toolbarConfig, toolbarActionHandler);

		canvasToolbar.find(".zoomIn-action button")
			.at(0)
			.simulate("click");
		expect(toolbarActionHandler.calledOnce).to.equal(true);

	});

	it("should NOT register a click when clicked on an disabled toolbar item", () => {
		const toolbarConfig = {
			rightBar: [
				{ action: "zoomIn", label: "Cut", enable: true },
				{ action: "zoomOut", label: "Copy", enable: true },
				{ action: "zoomToFit", label: "Zoom To Fit", enable: false },
				{ divider: true },
				{ action: "notifications", label: "Notficiations", enable: true }
			]
		};
		const toolbarActionHandler = sinon.spy();
		const canvasToolbar = createToolbar(toolbarConfig, toolbarActionHandler);

		canvasToolbar.find(".zoomToFit-action button")
			.at(0)
			.simulate("click");
		expect(toolbarActionHandler.calledOnce).to.equal(false);
	});
});

function createToolbar(config, actionHandler) {
	const toolbarActionHandler = actionHandler || sinon.spy();
	const canvasToolbar = mountWithIntl(
		<Toolbar
			config={config}
			instanceId={0}
			toolbarActionHandler={toolbarActionHandler}
		/>
	);
	return canvasToolbar;
}
