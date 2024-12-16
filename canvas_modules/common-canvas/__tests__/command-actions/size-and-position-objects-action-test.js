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

import deepFreeze from "deep-freeze";
import { expect } from "chai";
import CanvasController from "../../src/common-canvas/canvas-controller.js";
import SizeAndPositionObjectsAction from "../../src/command-actions/sizeAndPositionObjectsAction.js";
import startPipelineFlow from "../test_resources/json/startPipelineFlow.json";

const canvasController = new CanvasController();
const objectModel = canvasController.getObjectModel();
deepFreeze(startPipelineFlow);
canvasController.setPipelineFlow(startPipelineFlow);
const nodeIds = canvasController.getNodes().map((node) => node.id);
const newObjectInfo = { objectsInfo: [], detachedLinksInfo: [] };
for (let i = 0; i < nodeIds.length; i++) {
	newObjectInfo.objectsInfo[nodeIds[i]] = {
		id: nodeIds[i],
		x_pos: 50,
		y_pos: 50 + (25 * i),
		width: 70,
		height: 75
	};
}

describe("SizeAndPositionObjectsAction handles calls correctly", () => {
	it("should handle calls, undo, and redo", () => {
		const sizeAndPositionObjects = new SizeAndPositionObjectsAction(newObjectInfo, canvasController);
		const previousObjectsInfo = sizeAndPositionObjects.previousObjectsInfo;
		equalsObjectInfo(previousObjectsInfo, getNodesInfo(nodeIds));

		sizeAndPositionObjects.do();
		equalsObjectInfo(newObjectInfo.objectsInfo, getNodesInfo(nodeIds));

		sizeAndPositionObjects.undo();
		equalsObjectInfo(previousObjectsInfo, getNodesInfo(nodeIds));

		sizeAndPositionObjects.redo();
		equalsObjectInfo(newObjectInfo.objectsInfo, getNodesInfo(nodeIds));
	});
});

// gets the current size and position info of the nodes
function getNodesInfo(inNodeIds) {
	const previousNodesInfo = [];
	nodeIds.forEach((nodeId) => {
		const obj = objectModel.getAPIPipeline().getObject(nodeId);
		if (obj) {
			previousNodesInfo[nodeId] = {
				id: obj.id,
				x_pos: obj.x_pos,
				y_pos: obj.y_pos,
				width: obj.width,
				height: obj.height
			};
		}
	});
	return previousNodesInfo;
}

function equalsObjectInfo(objInfo1, objInfo2) {
	Object.keys(objInfo1).forEach((key) => {
		expect(objInfo1[key]).to.deep.equal(objInfo2[key]);
	});
}
