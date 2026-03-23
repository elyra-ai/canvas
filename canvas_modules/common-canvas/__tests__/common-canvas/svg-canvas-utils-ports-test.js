/*
 * Copyright 2017-2026 Elyra Authors
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

import SvgCanvasPorts from "../../src/common-canvas/svg-canvas-utils-ports.js";
import { LINK_DIR_TOP_BOTTOM, LINK_DIR_LEFT_RIGHT } from "../../src/common-canvas/constants/canvas-constants";

describe("SvgCanvasPorts utility tests", () => {

	describe("getNodePortPosX", () => {
		it("should calculate port X position for topLeft position", () => {
			const posInfo = { x_pos: 10, pos: "topLeft" };
			const node = { width: 100 };
			const result = SvgCanvasPorts.getNodePortPosX(posInfo, node);
			expect(result).toBe(10);
		});

		it("should calculate port X position for topCenter position", () => {
			const posInfo = { x_pos: 5, pos: "topCenter" };
			const node = { width: 100 };
			const result = SvgCanvasPorts.getNodePortPosX(posInfo, node);
			expect(result).toBe(55); // 50 (center) + 5 (offset)
		});

		it("should calculate port X position for topRight position", () => {
			const posInfo = { x_pos: -10, pos: "topRight" };
			const node = { width: 100 };
			const result = SvgCanvasPorts.getNodePortPosX(posInfo, node);
			expect(result).toBe(90); // 100 (right) - 10 (offset)
		});
	});

	describe("getNodePortPosY", () => {
		it("should calculate port Y position for topLeft position", () => {
			const posInfo = { y_pos: 10, pos: "topLeft" };
			const node = { height: 80 };
			const result = SvgCanvasPorts.getNodePortPosY(posInfo, node);
			expect(result).toBe(10);
		});

		it("should calculate port Y position for middleLeft position", () => {
			const posInfo = { y_pos: 5, pos: "middleLeft" };
			const node = { height: 80 };
			const result = SvgCanvasPorts.getNodePortPosY(posInfo, node);
			expect(result).toBe(45); // 40 (middle) + 5 (offset)
		});

		it("should calculate port Y position for bottomLeft position", () => {
			const posInfo = { y_pos: -10, pos: "bottomLeft" };
			const node = { height: 80 };
			const result = SvgCanvasPorts.getNodePortPosY(posInfo, node);
			expect(result).toBe(70); // 80 (bottom) - 10 (offset)
		});
	});

	describe("setPortPositionsForNode - vertical layout", () => {
		it("should set port positions for single input and output port", () => {
			const node = {
				width: 70,
				height: 75,
				inputs: [{ id: "inPort" }],
				outputs: [{ id: "outPort" }],
				inputPortsWidth: 10,
				outputPortsWidth: 10,
				layout: {
					defaultNodeWidth: 70,
					defaultNodeHeight: 75,
					portArcRadius: 5,
					portArcSpacing: 4,
					portArcOffset: 0,
					inputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "topCenter" }],
					outputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "bottomCenter" }],
					inputPortAutoPosition: true,
					outputPortAutoPosition: true
				}
			};

			const canvasLayout = {
				linkDirection: LINK_DIR_TOP_BOTTOM,
				supernodeSVGAreaPadding: 3
			};

			const config = {
				enableSingleOutputPortDisplay: false
			};

			SvgCanvasPorts.setPortPositionsForNode(node, canvasLayout, config, 1);

			// Single port should be positioned at the center
			expect(node.inputs[0].cx).toBe(35); // center of 70px width
			expect(node.inputs[0].cy).toBe(0);
			expect(node.inputs[0].dir).toBeDefined();

			expect(node.outputs[0].cx).toBe(35);
			expect(node.outputs[0].cy).toBe(75);
			expect(node.outputs[0].dir).toBeDefined();
		});

		it("should set port positions for multiple input ports with auto-positioning", () => {
			const node = {
				width: 100,
				height: 75,
				inputs: [
					{ id: "inPort1" },
					{ id: "inPort2" },
					{ id: "inPort3" }
				],
				outputs: [],
				inputPortsWidth: 38, // 3 ports: (5*2)*3 + 4*2 = 38
				outputPortsWidth: 0,
				layout: {
					defaultNodeWidth: 70,
					defaultNodeHeight: 75,
					portArcRadius: 5,
					portArcSpacing: 4,
					portArcOffset: 0,
					inputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "topCenter" }],
					outputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "bottomCenter" }],
					inputPortAutoPosition: true,
					outputPortAutoPosition: true
				}
			};

			const canvasLayout = {
				linkDirection: LINK_DIR_TOP_BOTTOM,
				supernodeSVGAreaPadding: 3
			};

			const config = {
				enableSingleOutputPortDisplay: false
			};

			SvgCanvasPorts.setPortPositionsForNode(node, canvasLayout, config, 1);

			// Ports should be evenly distributed
			expect(node.inputs[0].cx).toBeGreaterThan(0);
			expect(node.inputs[1].cx).toBeGreaterThan(node.inputs[0].cx);
			expect(node.inputs[2].cx).toBeGreaterThan(node.inputs[1].cx);

			// All ports should have same Y position (top)
			expect(node.inputs[0].cy).toBe(0);
			expect(node.inputs[1].cy).toBe(0);
			expect(node.inputs[2].cy).toBe(0);

			// All ports should have direction set
			expect(node.inputs[0].dir).toBeDefined();
			expect(node.inputs[1].dir).toBeDefined();
			expect(node.inputs[2].dir).toBeDefined();
		});
	});

	describe("setPortPositionsForNode - horizontal layout", () => {
		it("should set port positions for horizontal link direction", () => {
			const node = {
				width: 70,
				height: 75,
				inputs: [{ id: "inPort" }],
				outputs: [{ id: "outPort" }],
				inputPortsHeight: 10,
				outputPortsHeight: 10,
				layout: {
					defaultNodeWidth: 70,
					defaultNodeHeight: 75,
					portArcRadius: 5,
					portArcSpacing: 4,
					portArcOffset: 0,
					inputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "middleLeft" }],
					outputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "middleRight" }],
					inputPortAutoPosition: true,
					outputPortAutoPosition: true
				}
			};

			const canvasLayout = {
				linkDirection: LINK_DIR_LEFT_RIGHT,
				supernodeSVGAreaPadding: 3
			};

			const config = {
				enableSingleOutputPortDisplay: false
			};

			SvgCanvasPorts.setPortPositionsForNode(node, canvasLayout, config, 1);

			// Single port should be positioned at the middle
			expect(node.inputs[0].cx).toBe(0);
			expect(node.inputs[0].cy).toBe(37.5); // middle of 75px height
			expect(node.inputs[0].dir).toBeDefined();

			expect(node.outputs[0].cx).toBe(70);
			expect(node.outputs[0].cy).toBe(37.5);
			expect(node.outputs[0].dir).toBeDefined();
		});
	});

	describe("getNodeLinkCoordsForPortsConnection", () => {
		it("should get link coordinates when ports have cx/cy values", () => {
			const srcNode = {
				id: "node1",
				x_pos: 100,
				y_pos: 200,
				outputs: [
					{ id: "outPort", cx: 35, cy: 75, dir: "s" }
				]
			};

			const trgNode = {
				id: "node2",
				x_pos: 300,
				y_pos: 400,
				inputs: [
					{ id: "inPort", cx: 35, cy: 0, dir: "n" }
				]
			};

			const coords = SvgCanvasPorts.getNodeLinkCoordsForPortsConnection(
				srcNode, "outPort", trgNode, "inPort"
			);

			expect(coords.x1).toBe(135); // 100 + 35
			expect(coords.y1).toBe(275); // 200 + 75
			expect(coords.x2).toBe(335); // 300 + 35
			expect(coords.y2).toBe(400); // 400 + 0
			expect(coords.srcDir).toBe("s");
			expect(coords.trgDir).toBe("n");
		});

		it("should calculate link coordinates when ports don't have cx/cy values", () => {
			const srcNode = {
				id: "node1",
				x_pos: 100,
				y_pos: 200,
				width: 70,
				height: 75,
				outputs: [],
				layout: {
					outputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "bottomCenter" }]
				}
			};

			const trgNode = {
				id: "node2",
				x_pos: 300,
				y_pos: 400,
				width: 70,
				height: 75,
				inputs: [],
				layout: {
					inputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "topCenter" }]
				}
			};

			const coords = SvgCanvasPorts.getNodeLinkCoordsForPortsConnection(
				srcNode, "outPort", trgNode, "inPort"
			);

			expect(coords.x1).toBe(135); // 100 + 35 (center of 70)
			expect(coords.y1).toBe(275); // 200 + 75 (bottom)
			expect(coords.x2).toBe(335); // 300 + 35 (center of 70)
			expect(coords.y2).toBe(400); // 400 + 0 (top)
			expect(coords.srcDir).toBeDefined();
			expect(coords.trgDir).toBeDefined();
		});
	});

	describe("Port positioning with expanded supernodes", () => {
		it("should position ports correctly for expanded supernode", () => {
			const node = {
				width: 200,
				height: 150,
				type: "super_node",
				is_expanded: true,
				inputs: [{ id: "inPort1" }, { id: "inPort2" }],
				outputs: [{ id: "outPort1" }],
				inputPortsWidth: 18,
				outputPortsWidth: 10,
				layout: {
					defaultNodeWidth: 70,
					defaultNodeHeight: 75,
					portArcRadius: 5,
					portArcSpacing: 4,
					portArcOffset: 0,
					inputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "topCenter" }],
					outputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "bottomCenter" }],
					inputPortAutoPosition: true,
					outputPortAutoPosition: true
				}
			};

			const canvasLayout = {
				linkDirection: LINK_DIR_TOP_BOTTOM,
				supernodeSVGAreaPadding: 3
			};

			const config = {
				enableSingleOutputPortDisplay: false
			};

			SvgCanvasPorts.setPortPositionsForNode(node, canvasLayout, config, 1);

			// Ports should be positioned within the SVG area (accounting for padding)
			expect(node.inputs[0].cx).toBeGreaterThan(0);
			expect(node.inputs[0].cx).toBeLessThan(200);
			expect(node.inputs[1].cx).toBeGreaterThan(node.inputs[0].cx);

			// All input ports should have same Y position
			expect(node.inputs[0].cy).toBe(0);
			expect(node.inputs[1].cy).toBe(0);

			// Output port should be at bottom
			expect(node.outputs[0].cy).toBe(150);
		});
	});

	describe("Port positioning with zoom scale for binding nodes", () => {
		it("should adjust port spacing for binding nodes with zoom scale", () => {
			const node = {
				width: 100,
				height: 75,
				type: "binding",
				subflow_ref: {
					pipeline_id_ref: "pipeline1"
				},
				inputs: [
					{ id: "inPort1" },
					{ id: "inPort2" }
				],
				outputs: [],
				inputPortsWidth: 18,
				outputPortsWidth: 0,
				layout: {
					defaultNodeWidth: 70,
					defaultNodeHeight: 75,
					portArcRadius: 5,
					portArcSpacing: 4,
					portArcOffset: 0,
					inputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "topCenter" }],
					outputPortPositions: [{ x_pos: 0, y_pos: 0, pos: "bottomCenter" }],
					inputPortAutoPosition: true,
					outputPortAutoPosition: true
				}
			};

			const canvasLayout = {
				linkDirection: LINK_DIR_TOP_BOTTOM,
				supernodeSVGAreaPadding: 3
			};

			const config = {
				enableSingleOutputPortDisplay: false
			};

			const zoomScale = 0.5; // 50% zoom

			SvgCanvasPorts.setPortPositionsForNode(node, canvasLayout, config, zoomScale);

			// With zoom scale, port spacing should be adjusted
			const spacing = node.inputs[1].cx - node.inputs[0].cx;

			// Spacing should be greater than normal due to inverse zoom multiplier
			expect(spacing).toBeGreaterThan(9); // Normal would be 9 (5 + 4)
			expect(node.inputs[0].dir).toBeDefined();
			expect(node.inputs[1].dir).toBeDefined();
		});
	});
});

// Made with Bob
