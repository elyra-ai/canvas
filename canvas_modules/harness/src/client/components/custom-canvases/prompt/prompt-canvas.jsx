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

import React from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved
import { Menu } from "@carbon/react/icons";
import Flow from "./prompt-flow.json";
import Palette from "./prompt-palette.json";
import Template from "./prompt-template.json";
import PromptReactNode from "./prompt-react.jsx";

export default class PromptCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.propertiesRef = React.createRef();
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(Flow);
		this.canvasController.setPipelineFlowPalette(Palette);

		this.getConfig = this.getConfig.bind(this);
		this.addNodeHandler = this.addNodeHandler.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "prompt",
			enableNodeFormatType: "Vertical",
			enableLinkType: "Curve",
			enableLinkMethod: "Ports",
			enableLinkDirection: "LeftRight",
			enableSnapToGridType: "After",
			enableLinkSelection: "None",
			enableMarkdownInComments: true,
			enableContextToolbar: true,
			tipConfig: {
				palette: true,
				nodes: false,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				drawNodeLinkLineFromTo: "image_center",
				drawCommentLinkLineTo: "image_center",
				defaultNodeWidth: 72,
				defaultNodeHeight: 72,
				imageWidth: 48,
				imageHeight: 48,
				imagePosX: 12,
				imagePosY: 4,
				labelPosX: 36,
				labelPosY: 54,
				labelWidth: 120,
				labelHeight: 18,

				inputPortDisplayObjects: [
					{ type: "circleWithArrow" }
				],

				outputPortDisplayObjects: [
					{ type: "image", src: "/images/custom-canvases/prompt/number_1.svg", width: 16, height: 16 },
					{ type: "image", src: "/images/custom-canvases/prompt/number_2.svg", width: 16, height: 16 },
					{ type: "image", src: "/images/custom-canvases/prompt/number_3.svg", width: 16, height: 16 }
				],
				outputPortGuideObjects: [
					{ type: "image", src: "/images/custom-canvases/prompt/number_1.svg", width: 16, height: 16 },
					{ type: "image", src: "/images/custom-canvases/prompt/number_2.svg", width: 16, height: 16 },
					{ type: "image", src: "/images/custom-canvases/prompt/number_3.svg", width: 16, height: 16 }
				],
			},
			enableCanvasLayout: {
				// dataLinkArrowHead: "M -15 0 l 0 -5 10 5 -10 5 Z",
				dataLinkArrowHead: false,
				linkGap: 4,
				displayLinkOnOverlap: false
			}
		});
		return config;
	}

	clickActionHandler(source) {
		if (source.objectType === "port" &&
			source.clickType === "SINGLE_CLICK") {
			this.addPromptNode(source.nodeId, source.id);
		}
	}

	layoutHandler(node) {
		if (node.op === "prompt_node") {
			return {
				defaultNodeHeight: 220,
				defaultNodeWidth: 150,
				nodeExternalObject: PromptReactNode,
				imageDisplay: false,
				labelDisplay: false,
				nodeShapeDisplay: true,
				selectionPath: null
			};
		}
		return {};
	}

	editActionHandler(data) {
		if (data.editType === "app_addPropmpt") {
			this.addPromptNode(data.targetObject.id);
		}
	}

	contextMenuHandler(source, defaultMenu) {
		if (source.type === "node") {
			if (source.targetObject.op === "prompt_node") {
				return [];
			}
			defaultMenu.push({
				action: "app_addPropmpt",
				label: "Add node with prompt",
				enable: true,
				toolbarItem: true,
				icon: (<Menu />)
			});
		}
		return defaultMenu;
	}

	addNodeHandler(srcNodeId, srcPortId, nodeTemplate, promptNodeId) {
		const promptNode = this.canvasController.getNode(promptNodeId);
		this.canvasController.deleteNode(promptNodeId);
		this.canvasController.deleteLink(this.genPromptLinkId(srcNodeId, srcPortId));

		const newNode = this.canvasController.createNode({
			nodeTemplate: nodeTemplate,
			offsetX: promptNode.x_pos,
			offsetY: promptNode.y_pos
		});
		this.canvasController.addNode(newNode);

		const linksToAdd = this.canvasController.createNodeLinks({
			type: "nodeLink",
			nodes: [{ id: srcNodeId, portId: srcPortId }],
			targetNodes: [{ id: newNode.id }]
		});

		this.canvasController.addLinks(linksToAdd);
	}

	addPromptNode(srcNodeId, srcPortId) {
		const srcNode = this.canvasController.getNode(srcNodeId);

		const template = Template;
		template.app_data.prompt_data = {
			addNodeCallback: this.addNodeHandler.bind(this, srcNodeId, srcPortId)
		};
		const promptNode = this.canvasController.createNode({
			nodeTemplate: template,
			offsetX: srcNode.x_pos + 200, // Position prompt 200px to right of source node
			offsetY: srcNode.y_pos
		});

		// Make sure prompt doesn't overlap other nodes.
		this.adjustNodePosition(promptNode);

		// Add the prompt node to the canvas with a link
		this.canvasController.addNode(promptNode);
		const linksToAdd = this.canvasController.createNodeLinks({
			id: this.genPromptLinkId(srcNodeId, srcPortId),
			type: "nodeLink",
			nodes: [{ id: srcNodeId, portId: srcPortId }],
			targetNodes: [{ id: promptNode.id }]
		});

		this.canvasController.addLinks(linksToAdd);
	}

	genPromptLinkId(srcNodeId, srcPortId) {
		return "link_to_prompt_" + srcNodeId + "_" + srcPortId;
	}

	adjustNodePosition(node) {
		let overlapNode = true;
		while (overlapNode) {
			overlapNode = this.canvasController.getNodes().find((n) =>
				node.x_pos >= n.x_pos &&
				node.x_pos <= n.x_pos + n.height &&
				node.y_pos >= n.y_pos &&
				node.y_pos <= n.y_pos + n.width
			);
			if (overlapNode) {
				node.y_pos += overlapNode.height + 20;
			}
		}
	}

	render() {
		const config = this.getConfig();

		return (
			<CommonCanvas
				canvasController={this.canvasController}
				config={config}
				clickActionHandler={this.clickActionHandler}
				layoutHandler={this.layoutHandler}
				contextMenuHandler={this.contextMenuHandler}
				editActionHandler={this.editActionHandler}
			/>
		);
	}
}

PromptCanvas.propTypes = {
	config: PropTypes.object
};
