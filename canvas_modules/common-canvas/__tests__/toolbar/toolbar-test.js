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

import React from "react";
import { renderWithIntl } from "../_utils_/intl-utils";
import { expect } from "chai";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import sinon from "sinon";
import { fireEvent } from "@testing-library/react";

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
		const { container } = createToolbar(toolbarConfig);
		expect(container.getElementsByClassName("toolbar-div")).to.have.length(1);
		expect(container.getElementsByClassName("toolbar-left-bar")).to.have.length(1);
		expect(container.getElementsByClassName("toolbar-item")).to.have.length(10);
		expect(container.getElementsByClassName("toolbar-divider")).to.have.length(2);
		expect(container.getElementsByClassName("toolbar-overflow-container")).to.have.length(10);
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

		const { container } = createToolbar(toolbarConfig);

		expect(container.getElementsByClassName("toolbar-left-bar")).to.have.length(1);
		expect(container.getElementsByClassName("toolbar-right-bar")).to.have.length(1);
		expect(container.getElementsByClassName("toolbar-item")).to.have.length(4);
		expect(container.getElementsByClassName("toolbar-divider")).to.have.length(1);
		// No toolbar-overflow-container created for the right bar
		expect(container.getElementsByClassName("toolbar-overflow-container")).to.have.length(0);
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
		const { container } = createToolbar(toolbarConfig, toolbarActionHandler);

		const el = container.querySelector(".zoomIn-action button");
		fireEvent.click(el);
		expect(toolbarActionHandler.calledOnce).to.be.true;

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
		const { container } = createToolbar(toolbarConfig, toolbarActionHandler);

		const toolbar = container.querySelector(".toolbar-div");
		expect(toolbar.getAttribute("tabindex")).to.equal("0");

		const el = container.querySelector(".zoomToFit-action button");
		fireEvent.click(el);
		expect(toolbarActionHandler.calledOnce).to.be.false;
	});

	it("should render a Toolbar with medium size buttons", () => {
		const toolbarConfig = {
			leftBar: [
				{ action: "palette", label: "Palette", enable: true },
				{ divider: true },
				{ action: "stop", label: "Stop Execution", enable: false },
				{ action: "run", label: "Run Pipeline", enable: false },
			]
		};
		const { container } = createToolbar(toolbarConfig, sinon.spy(), "md");
		// Select the toolbar medium buttons
		const overflowButtons = container.querySelectorAll(".toolbar-overflow-item button");
		const defaultButtons = container.querySelectorAll(".toolbar-item.default button");

		expect(overflowButtons).to.have.length(3);
		expect(defaultButtons).to.have.length(3);

		// Verify if the buttons show up with medium size
		overflowButtons.forEach((button) => {
			expect(button.classList.contains("cds--btn--md")).to.be.true;
		});
		defaultButtons.forEach((button) => {
			expect(button.classList.contains("cds--btn--md")).to.be.true;
		});
	});

	it("should render a Toolbar with small size buttons", () => {
		const toolbarConfig = {
			leftBar: [
				{ action: "palette", label: "Palette", enable: true },
				{ divider: true },
				{ action: "stop", label: "Stop Execution", enable: false },
				{ action: "run", label: "Run Pipeline", enable: false },
			]
		};
		const { container } = createToolbar(toolbarConfig, sinon.spy(), "sm");
		// Select the toolbar small buttons
		const overflowButtons = container.querySelectorAll(".toolbar-overflow-item button");
		const defaultButtons = container.querySelectorAll(".toolbar-item.default button");

		expect(overflowButtons).to.have.length(3);
		expect(defaultButtons).to.have.length(3);

		// Verify if the buttons show up with small size
		overflowButtons.forEach((button) => {
			expect(button.classList.contains("cds--btn--sm")).to.be.true;
		});
		defaultButtons.forEach((button) => {
			expect(button.classList.contains("cds--btn--sm")).to.be.true;
		});
	});

	it("should render a Toolbar buttons with only icons ", () => {
		const toolbarConfig = {
			leftBar: [
				{ action: "cut", enable: true, incLabelWithIcon: "no" },
			]
		};
		const { container } = createToolbar(toolbarConfig);
		// Select the toolbar only icons buttons
		const defaultButtons = container.querySelectorAll(".toolbar-item.default button");

		expect(defaultButtons).to.have.length(1);
	});

	it("should render a Toolbar buttons with icon&label ", () => {
		const toolbarConfig = {
			leftBar: [
				{ action: "run", label: "Before - enabled", enable: true, incLabelWithIcon: "before" },
			]
		};
		const { container } = createToolbar(toolbarConfig);
		// Select the toolbar only icons buttons
		const defaultButtons = container.querySelectorAll(".toolbar-item.default button");

		expect(defaultButtons).to.have.length(1);

		defaultButtons.forEach((button) => {
			expect(button.classList.contains(".cds--btn--icon-only")).to.be.false;
		});
	});

	it("should set 'tabindex=-1' if all items are disabled in the toolbar", () => {
		const toolbarConfig = {
			rightBar: [
				{ action: "zoomIn", label: "Cut", enable: false },
				{ action: "zoomOut", label: "Copy", enable: false },
				{ action: "zoomToFit", label: "Zoom To Fit", enable: false },
				{ divider: true },
				{ action: "notifications", label: "Notficiations", enable: false }
			]
		};
		const toolbarActionHandler = sinon.spy();
		const { container } = createToolbar(toolbarConfig, toolbarActionHandler);

		const toolbar = container.querySelector(".toolbar-div");
		expect(toolbar.getAttribute("tabindex")).to.equal("-1");
	});
});

function createToolbar(config, actionHandler, size) {
	const toolbarActionHandler = actionHandler || sinon.spy();
	const canvasToolbar = renderWithIntl(
		<Toolbar
			config={config}
			instanceId={0}
			toolbarActionHandler={toolbarActionHandler}
			size={size}
		/>
	);
	return canvasToolbar;
}
