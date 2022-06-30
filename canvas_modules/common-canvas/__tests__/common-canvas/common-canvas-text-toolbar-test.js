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

import CanvasController from "../../src/common-canvas/canvas-controller";
import CommonCanvasTextToolbar from "../../src/common-canvas/cc-text-toolbar.jsx";
import Toolbar from "../../src/toolbar/toolbar.jsx";
import { createIntlCommonCanvasTextToolbar } from "../_utils_/common-canvas-utils.js";
import { expect } from "chai";

const canvasController = new CanvasController();

describe("Common Canvas Text Toolbar renders correctly", () => {
	let wrapper;

	afterEach(() => {
		wrapper.unmount();
	});


	it("should NOT render <Toolbar> inside <CommonCanvasTextToolbar/> when closed", () => {
		wrapper = createIntlCommonCanvasTextToolbar({}, canvasController);

		expect(wrapper.find(CommonCanvasTextToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(0);
	});

	it("should render <Toolbar> inside <CommonCanvasTextToolbar/> when open", () => {
		wrapper = createIntlCommonCanvasTextToolbar({}, canvasController);
		canvasController.openTextToolbar(100, 200, () => { /**/ });
		wrapper.update();

		expect(wrapper.find(CommonCanvasTextToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);
		expect(wrapper.find(".toolbar-left-bar")).to.have.length(1);
		expect(wrapper.find(".toolbar-right-bar")).to.have.length(1);

		expect(wrapper.find(".toolbar-item")).to.have.length(9);
		expect(wrapper.find(".toolbar-divider")).to.have.length(5);

		expect(wrapper.find(".toolbar-item.header-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.bold-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.italics-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.strikethrough-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.code-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.link-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.quote-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.numberedList-action")).to.have.length(1);
		expect(wrapper.find(".toolbar-item.bulletedList-action")).to.have.length(1);
	});

	it("should render text toolbar in new position when moved", () => {
		wrapper = createIntlCommonCanvasTextToolbar({}, canvasController);
		canvasController.openTextToolbar(100, 200, () => { /**/ });
		wrapper.update();

		expect(wrapper.find(".text-toolbar").get(0).props.style.left).to.equal(100);
		expect(wrapper.find(".text-toolbar").get(0).props.style.top).to.equal(200);

		canvasController.moveTextToolbar(150, 250);
		wrapper.update();

		expect(wrapper.find(".text-toolbar").get(0).props.style.left).to.equal(150);
		expect(wrapper.find(".text-toolbar").get(0).props.style.top).to.equal(250);
	});


	it("should NOT render <Toolbar/> after it is closed", () => {
		wrapper = createIntlCommonCanvasTextToolbar({}, canvasController);
		canvasController.openTextToolbar(100, 200, () => { /**/ });
		wrapper.update();

		expect(wrapper.find(CommonCanvasTextToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(1);

		canvasController.closeTextToolbar();
		wrapper.update();

		expect(wrapper.find(CommonCanvasTextToolbar)).to.have.length(1);
		expect(wrapper.find(Toolbar)).to.have.length(0);
	});
});
