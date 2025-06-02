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
import { MARKDOWN } from "../../src/common-canvas/constants/canvas-constants.js";
import { createIntlCommonCanvasTextToolbar } from "../_utils_/cc-utils.js";
import { expect } from "chai";
import { cleanup, waitFor } from "@testing-library/react";

const canvasController = new CanvasController();

describe("Common Canvas Text Toolbar renders correctly", () => {
	afterEach(() => {
		cleanup();
	});

	it("should NOT render <Toolbar> inside <CommonCanvasTextToolbar/> when closed", () => {
		const { container } = createIntlCommonCanvasTextToolbar({}, canvasController);

		expect(container.querySelectorAll("div.text-toolbar")).to.have.length(0);
		expect(container.querySelectorAll("div.toolbar-div")).to.have.length(0);
	});

	it("should render <Toolbar> inside <CommonCanvasTextToolbar/> when open", async() => {
		const { container } = createIntlCommonCanvasTextToolbar({}, canvasController);
		canvasController.openTextToolbar(100, 200, [], MARKDOWN, () => { /**/ });

		await waitFor(() => {
			expect(container.querySelectorAll("div.text-toolbar")).to.have.length(1);
			expect(container.querySelectorAll("div.toolbar-div")).to.have.length(1);
			expect(container.querySelectorAll(".toolbar-left-bar")).to.have.length(1);
			expect(container.querySelectorAll(".toolbar-right-bar")).to.have.length(1);

			expect(container.querySelectorAll(".toolbar-item")).to.have.length(9);
			expect(container.querySelectorAll(".toolbar-divider")).to.have.length(5);

			expect(container.querySelectorAll(".toolbar-item.headerStyle-action")).to.have.length(1);
			expect(container.querySelectorAll(".toolbar-item.bold-action")).to.have.length(1);
			expect(container.querySelectorAll(".toolbar-item.italics-action")).to.have.length(1);
			expect(container.querySelectorAll(".toolbar-item.strikethrough-action")).to.have.length(1);
			expect(container.querySelectorAll(".toolbar-item.code-action")).to.have.length(1);
			expect(container.querySelectorAll(".toolbar-item.link-action")).to.have.length(1);
			expect(container.querySelectorAll(".toolbar-item.quote-action")).to.have.length(1);
			expect(container.querySelectorAll(".toolbar-item.numberedList-action")).to.have.length(1);
			expect(container.querySelectorAll(".toolbar-item.bulletedList-action")).to.have.length(1);
		});
	});

	it("should render text toolbar in new position when moved", async() => {
		const { container } = createIntlCommonCanvasTextToolbar({}, canvasController);
		canvasController.openTextToolbar(100, 200, [], () => { /**/ });

		await waitFor(() => {
			expect(container.querySelectorAll(".text-toolbar")[0].style.left).to.equal("100px");
			expect(container.querySelectorAll(".text-toolbar")[0].style.top).to.equal("200px");
		});

		canvasController.moveTextToolbar(150, 250);

		await waitFor(() => {
			expect(container.querySelectorAll(".text-toolbar")[0].style.left).to.equal("150px");
			expect(container.querySelectorAll(".text-toolbar")[0].style.top).to.equal("250px");
		});
	});

	it("should NOT render <Toolbar/> after it is closed", async() => {
		const { container } = createIntlCommonCanvasTextToolbar({}, canvasController);
		canvasController.openTextToolbar(100, 200, [], () => { /**/ });

		await waitFor(() => {
			expect(container.querySelectorAll("div.text-toolbar")).to.have.length(1);
			expect(container.querySelectorAll("div.toolbar-div")).to.have.length(1);
		});

		canvasController.closeTextToolbar();

		await waitFor(() => {
			expect(container.querySelectorAll("div.text-toolbar")).to.have.length(0);
			expect(container.querySelectorAll("div.toolbar-div")).to.have.length(0);
		});
	});
});
