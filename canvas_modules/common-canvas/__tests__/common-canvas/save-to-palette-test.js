/*
 * Copyright 2017-2023 Elyra Authors
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

import isEqual from "lodash/isEqual";
import CanvasController from "../../src/common-canvas/canvas-controller";
import { createIntlCommonCanvas } from "../_utils_/common-canvas-utils.js";
import { expect } from "chai";
import sinon from "sinon";

import startPipelineFlow from "../test_resources/json/startPipelineFlow.json";
import supernodeCanvas from "../../../harness/test_resources/diagrams/supernodeCanvas.json";
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

		canvasController.setSelections([
			"id8I6RH2V91XW",
			"idGWRVT47XDV"
		]);

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

		canvasController.setSelections(["7015d906-2eae-45c1-999e-fb888ed957e5"]);
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

		// console.log("expectedPalette = " + JSON.stringify(expectedPalette, null, 2));
		// console.log("paletteData = " + JSON.stringify(paletteData, null, 2));

		expect(isEqual(expectedPalette, paletteData)).to.be.true;
	});
});


function createCommonCanvas(config, canvasController, canvasParams) {
	const contextMenuHandler = sinon.spy();
	const beforeEditActionHandler = null;
	const editActionHandler = sinon.spy();
	const clickActionHandler = sinon.spy();
	const decorationActionHandler = sinon.spy();
	const selectionChangeHandler = sinon.spy();
	const tipHandler = sinon.spy();
	const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
	const notificationConfig = { action: "notification", label: "Notifications", enable: true };
	const contextMenuConfig = null;
	const canvasParameters = canvasParams || {};
	const wrapper = createIntlCommonCanvas(
		config,
		contextMenuHandler,
		beforeEditActionHandler,
		editActionHandler,
		clickActionHandler,
		decorationActionHandler,
		selectionChangeHandler,
		tipHandler,
		canvasParameters.showBottomPanel,
		canvasParameters.showRightFlyout,
		toolbarConfig,
		notificationConfig,
		contextMenuConfig,
		canvasController
	);
	return wrapper;
}
