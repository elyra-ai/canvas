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
/* eslint no-console: "off" */

import React from "react";
import isEqual from "lodash/isEqual";
import CanvasController from "../../src/common-canvas/canvas-controller";
import CommonCanvas from "../../src/common-canvas/common-canvas.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";

import startPipelineFlow from "../test_resources/json/startPipelineFlow.json";
import supernodeCanvas from "../test_resources/json/supernodeCanvas.json";
import paletteJson from "../test_resources/palettes/test-palette.json";
import expectedPaletteNode from "../test_resources/palettes/expected-add-node.json";
import expectedPaletteSupernode from "../test_resources/palettes/expected-add-supernode.json";

describe("Expand and Collapse Supernode Action", () => {
	let canvasController;

	beforeEach(() => {
		canvasController = new CanvasController();
		const config = { enableAutoLayout: "none", enableInternalObjectModel: true };
		createCommonCanvas(config, canvasController);
	});

	it("should save nodes from the canvas to the palette", () => {
		canvasController.setPipelineFlowPalette(paletteJson);
		canvasController.setPipelineFlow(startPipelineFlow);

		const source = {
			selectedObjectIds: [
				"id8I6RH2V91XW",
				"idGWRVT47XDV"
			],
			pipelineId: "153651d6-9b88-423c-b01b-861f12d01489"
		};

		canvasController.contextMenuHandler(source);
		canvasController.contextMenuActionHandler("saveToPalette");

		const paletteData = canvasController.getPaletteData();

		// There should now be two categories in the palette.
		expect(isEqual(paletteData.categories.length, 2)).to.be.true;

		// The two added node_types in the palette will have new IDs assigned
		// to them so remove them for the comparison. Also their position will
		// be set to 0,0 so remove them too.
		delete paletteData.categories[1].node_types[0].id;
		delete paletteData.categories[1].node_types[0].app_data.ui_data.x_pos;
		delete paletteData.categories[1].node_types[0].app_data.ui_data.y_pos;
		delete paletteData.categories[1].node_types[1].id;
		delete paletteData.categories[1].node_types[1].app_data.ui_data.x_pos;
		delete paletteData.categories[1].node_types[1].app_data.ui_data.y_pos;

		// Also, need to do the same to the expected palette JSON so the
		// comparison will work.
		const expectedPalette = JSON.parse(JSON.stringify(expectedPaletteNode));
		delete expectedPalette.categories[1].node_types[0].id;
		delete expectedPalette.categories[1].node_types[0].app_data.ui_data.x_pos;
		delete expectedPalette.categories[1].node_types[0].app_data.ui_data.y_pos;
		delete expectedPalette.categories[1].node_types[1].id;
		delete expectedPalette.categories[1].node_types[1].app_data.ui_data.x_pos;
		delete expectedPalette.categories[1].node_types[1].app_data.ui_data.y_pos;

		// console.log("JSON = " + JSON.stringify(expectedPalette, null, 2));
		// console.log("JSON = " + JSON.stringify(paletteData, null, 2));

		expect(isEqual(expectedPalette, paletteData)).to.be.true;
	});

	it("should save a supernode from the canvas to the palette", () => {
		canvasController.setPipelineFlowPalette(paletteJson);
		canvasController.setPipelineFlow(supernodeCanvas);

		const source = {
			selectedObjectIds: [
				"7015d906-2eae-45c1-999e-fb888ed957e5"
			],
			pipelineId: "153651d6-9b88-423c-b01b-861f12d01489"
		};

		canvasController.contextMenuHandler(source);
		canvasController.contextMenuActionHandler("saveToPalette");

		const paletteData = canvasController.getPaletteData();

		// There should now be two categories in the palette.
		expect(isEqual(paletteData.categories.length, 2)).to.be.true;

		// The two added node_types in the palette will have new IDs assigned
		// to them so remove them for the comparison. Also their position will
		// be set to 0,0 so remove them too.
		delete paletteData.categories[1].node_types[0].id;
		delete paletteData.categories[1].node_types[0].app_data.ui_data.x_pos;
		delete paletteData.categories[1].node_types[0].app_data.ui_data.y_pos;

		// Also, need to do the same to the expected palette JSON so the
		// comparison will work.
		const expectedPalette = JSON.parse(JSON.stringify(expectedPaletteSupernode));
		delete expectedPalette.categories[1].node_types[0].id;
		delete expectedPalette.categories[1].node_types[0].app_data.ui_data.x_pos;
		delete expectedPalette.categories[1].node_types[0].app_data.ui_data.y_pos;

		// console.log("JSON = " + JSON.stringify(expectedPalette, null, 2));
		// console.log("JSON = " + JSON.stringify(paletteData, null, 2));

		expect(isEqual(expectedPalette, paletteData)).to.be.true;
	});
});


function createCommonCanvas(config, canvasController) {
	const contextMenuHandler = sinon.spy();
	const contextMenuActionHandler = sinon.spy();
	const editActionHandler = sinon.spy();
	const clickActionHandler = sinon.spy();
	const decorationActionHandler = sinon.spy();
	const selectionChangeHandler = sinon.spy();
	const tipHandler = sinon.spy();
	const toolbarMenuActionHandler = sinon.spy();
	const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
	const notificationConfig = { action: "notification", label: "Notifications", enable: true };

	const wrapper = mount(
		<CommonCanvas
			config={config}
			contextMenuHandler={contextMenuHandler}
			contextMenuActionHandler={contextMenuActionHandler}
			editActionHandler={editActionHandler}
			clickActionHandler={clickActionHandler}
			decorationActionHandler={decorationActionHandler}
			selectionChangeHandler={selectionChangeHandler}
			tipHandler={tipHandler}
			toolbarConfig={toolbarConfig}
			notificationConfig={notificationConfig}
			showRightFlyout={false}
			toolbarMenuActionHandler={toolbarMenuActionHandler}
			canvasController={canvasController}
		/>
	);
	return wrapper;
}
