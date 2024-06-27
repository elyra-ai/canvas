/*
 * Copyright 2024 Elyra Authors
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

import CanvasUtils from "../../src/common-canvas/common-canvas-utils.js";


describe("Test Common Canvas utility functions", () => {
	beforeEach(() => {
		//
	});

	it("should get correct directions from getPortDir()", () => {
		// Create a dummy node
		const node = { width: 70, height: 160 };

		// WEST -- These tests should return "w"
		let dir = CanvasUtils.getPortDir(0, 1, node);
		expect(dir).toEqual("w");
		dir = CanvasUtils.getPortDir(0, node.height - 1, node);
		expect(dir).toEqual("w");
		dir = CanvasUtils.getPortDir(0, (node.height / 2) - 1, node);
		expect(dir).toEqual("w");

		// EAST -- These tests should return "e"
		dir = CanvasUtils.getPortDir(node.width, 1, node);
		expect(dir).toEqual("e");
		dir = CanvasUtils.getPortDir(node.width, node.height - 1, node);
		expect(dir).toEqual("e");
		dir = CanvasUtils.getPortDir(node.width, (node.height / 2), node);
		expect(dir).toEqual("e");

		// NORTH -- These tests should return "n"
		dir = CanvasUtils.getPortDir(node.width - 1, 0, node);
		expect(dir).toEqual("n");
		dir = CanvasUtils.getPortDir(1, 0, node);
		expect(dir).toEqual("n");
		dir = CanvasUtils.getPortDir((node.width / 2), 0, node);
		expect(dir).toEqual("n");

		// SOUTH -- These tests should return "s"
		dir = CanvasUtils.getPortDir(node.width - 1, node.height, node);
		expect(dir).toEqual("s");
		dir = CanvasUtils.getPortDir(1, node.height, node);
		expect(dir).toEqual("s");
		dir = CanvasUtils.getPortDir((node.width / 2), node.height, node);
		expect(dir).toEqual("s");
	});
});
