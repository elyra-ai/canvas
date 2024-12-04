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
			enableLinkType: "Straight",
			enableLinkMethod: "Freeform",
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
				selectionPath: "M 8 0 L 64 0 64 56 8 56 8 0",
				imageWidth: 48,
				imageHeight: 48,
				imagePosX: 12,
				imagePosY: 4,
				labelEditable: true,
				labelPosX: 36,
				labelPosY: 56,
				labelWidth: 120,
				labelHeight: 18,
				portRadius: 10,
				inputPortDisplay: false,
				outputPortRightPosX: 5,
				outputPortRightPosY: 30,
				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg"
			},
			enableCanvasLayout: {
				dataLinkArrowHead: true,
				linkGap: 4,
				displayLinkOnOverlap: false
			}
		});
		return config;
	}

	clickActionHandler(source) {
		// this.addPromptNode();
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
			this.addPromptNode(data.targetObject);
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

	addNodeHandler(nodeTemplate) {
		const promptNode = this.canvasController.getNode(this.promptNodeId);
		this.canvasController.deleteNode(this.promptNodeId);
		this.canvasController.deleteLink("link_to_prompt");

		const newNode = this.canvasController.createNode({
			nodeTemplate: nodeTemplate,
			offsetX: promptNode.x_pos,
			offsetY: promptNode.y_pos
		});
		this.canvasController.addNode(newNode);

		const linksToAdd = this.canvasController.createNodeLinks({
			type: "nodeLink",
			nodes: [{ id: this.sourceNodeId }],
			targetNodes: [{ id: newNode.id }]
		});

		this.canvasController.addLinks(linksToAdd);

	}

	addPromptNode(sourceNode) {
		this.sourceNodeId = sourceNode.id;

		const template = Template;
		template.app_data.prompt_data = {
			addNodeCallback: this.addNodeHandler.bind(this)
		};
		const newNode = this.canvasController.createNode({
			nodeTemplate: template,
			offsetX: sourceNode.x_pos + 200, // Position prompt 200px to right of source node
			offsetY: sourceNode.y_pos
		});

		// Make sure prompt doesn't overlap other nodes.
		this.adjustNodePosition(newNode, 100);

		// Save the ID of the prompt node for removal, later
		this.promptNodeId = newNode.id;

		// Add the prompt node to the canvas with a link
		this.canvasController.addNode(newNode);
		const linksToAdd = this.canvasController.createNodeLinks({
			id: "link_to_prompt",
			type: "nodeLink",
			nodes: [{ id: sourceNode.id }],
			targetNodes: [{ id: this.promptNodeId }]
		});

		this.canvasController.addLinks(linksToAdd);
	}

	adjustNodePosition(node, yInc) {
		let overlapNode = true;
		while (overlapNode) {
			overlapNode = this.canvasController.getNodes().find((n) => n.x_pos === node.x_pos && n.y_pos === node.y_pos);
			if (overlapNode) {
				node.y_pos += yInc;
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
