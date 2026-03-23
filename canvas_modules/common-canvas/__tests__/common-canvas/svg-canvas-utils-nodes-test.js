/*
 * Copyright 2026 Elyra Authors
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

import SvgCanvasNodes from "../../src/common-canvas/svg-canvas-utils-nodes.js";
import { ERROR, WARNING } from "../../src/common-canvas/constants/canvas-constants";

describe("SvgCanvasNodes utility tests", () => {

	describe("isPointInNodeBoundary", () => {
		it("should return true when point is inside node boundary", () => {
			const pos = { x: 50, y: 50 };
			const node = { x_pos: 0, y_pos: 0, width: 100, height: 100 };
			expect(SvgCanvasNodes.isPointInNodeBoundary(pos, node)).toBe(true);
		});

		it("should return false when point is outside node boundary", () => {
			const pos = { x: 150, y: 150 };
			const node = { x_pos: 0, y_pos: 0, width: 100, height: 100 };
			expect(SvgCanvasNodes.isPointInNodeBoundary(pos, node)).toBe(false);
		});

		it("should return true when point is on node boundary edge", () => {
			const pos = { x: 100, y: 100 };
			const node = { x_pos: 0, y_pos: 0, width: 100, height: 100 };
			expect(SvgCanvasNodes.isPointInNodeBoundary(pos, node)).toBe(true);
		});
	});

	describe("getNodeLabelClass", () => {
		it("should return correct class for expanded supernode", () => {
			const node = { isSupernodeInputBinding: false, isSupernodeOutputBinding: false, is_expanded: true, type: "super_node", messages: [] };
			const result = SvgCanvasNodes.getNodeLabelClass(node);
			expect(result).toContain("d3-node-label");
			expect(result).toContain("d3-label-single-line");
		});

		it("should return correct class for single-line label", () => {
			const node = { layout: { labelSingleLine: true, labelAlign: "left" }, messages: [] };
			const result = SvgCanvasNodes.getNodeLabelClass(node);
			expect(result).toContain("d3-label-single-line");
		});

		it("should return correct class for multi-line label", () => {
			const node = { layout: { labelSingleLine: false, labelAlign: "left" }, messages: [] };
			const result = SvgCanvasNodes.getNodeLabelClass(node);
			expect(result).toContain("d3-label-multi-line");
		});

		it("should return correct class for center-aligned label", () => {
			const node = { layout: { labelSingleLine: true, labelAlign: "center" }, messages: [] };
			const result = SvgCanvasNodes.getNodeLabelClass(node);
			expect(result).toContain("d3-label-center");
		});

		it("should include error class when node has error messages", () => {
			const node = { layout: { labelSingleLine: true, labelAlign: "left" }, messages: [{ type: ERROR }] };
			const result = SvgCanvasNodes.getNodeLabelClass(node);
			expect(result).toContain("d3-node-error-label");
		});

		it("should include warning class when node has warning messages", () => {
			const node = { layout: { labelSingleLine: true, labelAlign: "left" }, messages: [{ type: WARNING }] };
			const result = SvgCanvasNodes.getNodeLabelClass(node);
			expect(result).toContain("d3-node-warning-label");
		});
	});

	describe("getMessageLevel", () => {
		it("should return ERROR when error messages exist", () => {
			const messages = [{ type: WARNING }, { type: ERROR }];
			expect(SvgCanvasNodes.getMessageLevel(messages)).toBe(ERROR);
		});

		it("should return WARNING when only warning messages exist", () => {
			const messages = [{ type: WARNING }];
			expect(SvgCanvasNodes.getMessageLevel(messages)).toBe(WARNING);
		});

		it("should return empty string when no messages", () => {
			expect(SvgCanvasNodes.getMessageLevel([])).toBe("");
			expect(SvgCanvasNodes.getMessageLevel(null)).toBe("");
		});
	});

	describe("getNodeCenterPosX", () => {
		it("should calculate center X position correctly", () => {
			const node = { x_pos: 100, width: 200 };
			expect(SvgCanvasNodes.getNodeCenterPosX(node)).toBe(200);
		});
	});

	describe("getNodeCenterPosY", () => {
		it("should calculate center Y position correctly", () => {
			const node = { y_pos: 50, height: 100 };
			expect(SvgCanvasNodes.getNodeCenterPosY(node)).toBe(100);
		});
	});

	describe("getNodeImagePosX", () => {
		it("should return supernode image position for expanded supernode", () => {
			const node = {
				isSupernodeInputBinding: false,
				isSupernodeOutputBinding: false,
				is_expanded: true,
				type: "super_node",
				layout: { supernodeImagePosX: 5 }
			};
			expect(SvgCanvasNodes.getNodeImagePosX(node)).toBe(5);
		});

		it("should calculate image position for regular node", () => {
			const node = {
				width: 100,
				layout: { imagePosX: 10, imagePosition: "topLeft" }
			};
			expect(SvgCanvasNodes.getNodeImagePosX(node)).toBe(10);
		});
	});

	describe("getNodeLabelWidth", () => {
		it("should calculate label width for expanded supernode", () => {
			const node = {
				isSupernodeInputBinding: false,
				isSupernodeOutputBinding: false,
				is_expanded: true,
				type: "super_node",
				width: 200,
				layout: { supernodeLabelPosX: 30, supernodeErrorPosX: -50 }
			};
			expect(SvgCanvasNodes.getNodeLabelWidth(node)).toBe(120); // 200 - 30 + (-50)
		});

		it("should return label width for regular node", () => {
			const node = { layout: { labelWidth: 150 } };
			expect(SvgCanvasNodes.getNodeLabelWidth(node)).toBe(150);
		});
	});

	describe("getNodeEllipsisWidth", () => {
		it("should return supernode ellipsis width for expanded supernode", () => {
			const node = {
				isSupernodeInputBinding: false,
				isSupernodeOutputBinding: false,
				is_expanded: true,
				type: "super_node",
				layout: { supernodeEllipsisWidth: 10 }
			};
			expect(SvgCanvasNodes.getNodeEllipsisWidth(node)).toBe(10);
		});

		it("should return ellipsis width for regular node", () => {
			const node = { layout: { ellipsisWidth: 12 } };
			expect(SvgCanvasNodes.getNodeEllipsisWidth(node)).toBe(12);
		});
	});

	describe("getNodeErrorPosX", () => {
		it("should calculate error position for expanded supernode", () => {
			const node = {
				isSupernodeInputBinding: false,
				isSupernodeOutputBinding: false,
				is_expanded: true,
				type: "super_node",
				width: 200,
				layout: { supernodeErrorPosX: -50 }
			};
			expect(SvgCanvasNodes.getNodeErrorPosX(node)).toBe(150); // 200 + (-50)
		});

		it("should calculate error position for regular node", () => {
			const node = {
				width: 160,
				layout: { errorXPos: -20, errorPosition: "topRight" }
			};
			expect(SvgCanvasNodes.getNodeErrorPosX(node)).toBe(140); // 160 - 20
		});
	});

	describe("getSupernodePortXOffset", () => {
		it("should return X offset for matching port", () => {
			const ports = [
				{ subflow_node_ref: "node1", cx: 100 },
				{ subflow_node_ref: "node2", cx: 150 }
			];
			const node = { layout: { supernodeSVGAreaPadding: 3 } };
			expect(SvgCanvasNodes.getSupernodePortXOffset("node2", ports, node)).toBe(147); // 150 - 3
		});

		it("should return 0 when no ports provided", () => {
			const node = { layout: { supernodeSVGAreaPadding: 3 } };
			expect(SvgCanvasNodes.getSupernodePortXOffset("node1", null, node)).toBe(0);
		});
	});

	describe("getSupernodePortYOffset", () => {
		it("should return Y offset for matching port", () => {
			const ports = [
				{ subflow_node_ref: "node1", cy: 50 },
				{ subflow_node_ref: "node2", cy: 75 }
			];
			expect(SvgCanvasNodes.getSupernodePortYOffset("node1", ports)).toBe(50);
		});

		it("should return 0 when no ports provided", () => {
			expect(SvgCanvasNodes.getSupernodePortYOffset("node1", null)).toBe(0);
		});
	});

	describe("getNodeImage", () => {
		it("should return null when no image", () => {
			const node = { image: null };
			expect(SvgCanvasNodes.getNodeImage(node)).toBeNull();
		});

		it("should return image when provided", () => {
			const node = { image: "path/to/image.svg" };
			expect(SvgCanvasNodes.getNodeImage(node)).toBe("path/to/image.svg");
		});

		it("should return default supernode icon for USE_DEFAULT_ICON", () => {
			const node = { image: "USE_DEFAULT_ICON", type: "super_node" };
			const result = SvgCanvasNodes.getNodeImage(node);
			expect(result).toBeDefined();
		});

		it("should return extended supernode icon for USE_DEFAULT_EXT_ICON", () => {
			const node = { image: "USE_DEFAULT_EXT_ICON", type: "super_node" };
			const result = SvgCanvasNodes.getNodeImage(node);
			expect(result).toBeDefined();
		});
	});

	describe("getImageType", () => {
		it("should return 'svg' for SVG files", () => {
			const config = { enableImageDisplay: "default" };
			expect(SvgCanvasNodes.getImageType("image.svg", null, config)).toBe("svg");
		});

		it("should return 'image' for non-SVG files", () => {
			const config = { enableImageDisplay: "default" };
			expect(SvgCanvasNodes.getImageType("image.png", null, config)).toBe("image");
		});

		it("should return 'image' for SVG when enableImageDisplay is SVGAsImage", () => {
			const config = { enableImageDisplay: "SVGAsImage" };
			expect(SvgCanvasNodes.getImageType("image.svg", null, config)).toBe("image");
		});

		it("should return 'jsx' for valid JSX elements", () => {
			const externalUtils = { isValidJsxElement: () => true };
			const jsxElement = { type: "div" };
			expect(SvgCanvasNodes.getImageType(jsxElement, externalUtils, {})).toBe("jsx");
		});

		it("should return null for invalid input", () => {
			expect(SvgCanvasNodes.getImageType(null, null, {})).toBeNull();
		});
	});

	describe("getNodeNearPos", () => {
		it("should return node at exact position", () => {
			const pos = { x: 50, y: 50 };
			const nodes = [
				{ x_pos: 0, y_pos: 0, width: 100, height: 100, id: "node1" },
				{ x_pos: 200, y_pos: 200, width: 100, height: 100, id: "node2" }
			];
			const result = SvgCanvasNodes.getNodeNearPos(pos, 0, nodes);
			expect(result.id).toBe("node1");
		});

		it("should return node within proximity", () => {
			const pos = { x: 110, y: 110 };
			const nodes = [
				{ x_pos: 0, y_pos: 0, width: 100, height: 100, id: "node1" }
			];
			const result = SvgCanvasNodes.getNodeNearPos(pos, 20, nodes);
			expect(result.id).toBe("node1");
		});

		it("should return null when no node is near", () => {
			const pos = { x: 500, y: 500 };
			const nodes = [
				{ x_pos: 0, y_pos: 0, width: 100, height: 100, id: "node1" }
			];
			const result = SvgCanvasNodes.getNodeNearPos(pos, 0, nodes);
			expect(result).toBeNull();
		});

		it("should return last matching node when multiple nodes overlap", () => {
			const pos = { x: 50, y: 50 };
			const nodes = [
				{ x_pos: 0, y_pos: 0, width: 100, height: 100, id: "node1" },
				{ x_pos: 25, y_pos: 25, width: 100, height: 100, id: "node2" }
			];
			const result = SvgCanvasNodes.getNodeNearPos(pos, 0, nodes);
			expect(result.id).toBe("node2");
		});
	});

	describe("getNodeLabelHoverWidth", () => {
		it("should add 500 for single-line center-aligned label", () => {
			const node = { layout: { labelSingleLine: true, labelAlign: "center", labelWidth: 100 } };
			expect(SvgCanvasNodes.getNodeLabelHoverWidth(node)).toBe(600);
		});

		it("should add 40 for single-line left-aligned label", () => {
			const node = { layout: { labelSingleLine: true, labelAlign: "left", labelWidth: 100 } };
			expect(SvgCanvasNodes.getNodeLabelHoverWidth(node)).toBe(140);
		});

		it("should return original width for multi-line label", () => {
			const node = { layout: { labelSingleLine: false, labelWidth: 100 } };
			expect(SvgCanvasNodes.getNodeLabelHoverWidth(node)).toBe(100);
		});
	});

	describe("getNodeExpansionIconTranslate", () => {
		it("should return correct transform string", () => {
			const node = {
				width: 200,
				layout: { supernodeExpansionIconPosX: -21, supernodeExpansionIconPosY: 4 }
			};
			expect(SvgCanvasNodes.getNodeExpansionIconTranslate(node)).toBe("translate(179, 4)");
		});
	});

	describe("getNodeEllipsisTranslate", () => {
		it("should return correct transform string for regular node", () => {
			const node = {
				width: 160,
				height: 40,
				layout: { ellipsisPosX: -34, ellipsisPosY: 2, ellipsisPosition: "topRight" }
			};
			const result = SvgCanvasNodes.getNodeEllipsisTranslate(node);
			expect(result).toContain("translate(");
		});
	});
});

// Made with Bob
