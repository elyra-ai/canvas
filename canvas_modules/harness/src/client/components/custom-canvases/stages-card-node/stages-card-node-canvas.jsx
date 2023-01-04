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

import React from "react";
import PropTypes from "prop-types";

import { get } from "lodash";

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

import StagesCardNodeFlow from "./stagesCardNodeCanvas.json";
import StagesCardNodePalette from "./stagesCardNodePalette.json";

export default class DetachedCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(StagesCardNodeFlow);
		this.canvasController.setPipelineFlowPalette(StagesCardNodePalette);

		this.getConfig = this.getConfig.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);
		this.contextMenuHandler = this.contextMenuHandler.bind(this);

		// Add decorations to the links
		const pId = this.canvasController.getPrimaryPipelineId();
		const pipelineLinkDecorations =
			this.canvasController.getLinks().map((link) => {
				const linkLabel = get(link, "app_data.stages.link_label", "");
				const decs = this.getDecorationsArray(linkLabel);
				return { linkId: link.id, pipelineId: pId, decorations: decs };
			});
		this.canvasController.setLinksMultiDecorations(pipelineLinkDecorations);

		this.canvasController.getNodes().forEach((n) => {
			this.canvasController.setNodeDecorations(n.id, this.getNodeDecorations(n));
		});
	}

	getNodeDecorations(node) {
		return [
			{
				id: "toolbar_background",
				path: "M 0 0 L 26 0 26 26 0 26 Z",
				position: "topRight",
				class_name: "toolbar-background",
				x_pos: -35,
				y_pos: -26,
				temporary: true
			},
			{
				id: "second_label",
				label: get(node, "app_data.stages.secondary_label", ""),
				position: "topLeft",
				x_pos: 60,
				y_pos: 28,
				temporary: true
			}
		];
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "stages-card-node",
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Straight",
			enableLinkDirection: "LeftRight",
			enableSaveZoom: "LocalStorage",
			enableSnapToGridType: "After",
			enableLinkSelection: "Detachable",
			enableInsertNodeDroppedOnLink: true,
			enableDropZoneOnExternalDrag: true,
			enableHighlightNodeOnNewLinkDrag: true,
			enableHighlightUnavailableNodes: true,
			enableDisplayFullLabelOnHover: true,
			enableAutoLinkOnlyFromSelNodes: true,
			enableSingleOutputPortDisplay: true,
			enableMarkdownInComments: true,
			enableResizableNodes: true,
			enableNarrowPalette: false,
			paletteInitialState: true,
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				nodeShape: "rectangle",
				drawNodeLinkLineFromTo: "node_center",
				drawCommentLinkLineTo: "node_center",
				bodyPath: (data) => this.createCurvedNodeOutline(0, 0, data.width, data.height, 10),
				selectionPath: (data) => this.createCurvedNodeOutline(-3, -3, data.width + 6, data.height + 6, 10),
				defaultNodeWidth: 200,
				defaultNodeHeight: 65,
				ellipsisWidth: 24,
				ellipsisHeight: 24,
				ellipsisPosition: "topRight",
				ellipsisPosY: -30,
				ellipsisPosX: -35,
				imageWidth: 32,
				imageHeight: 32,
				imagePosition: "topLeft",
				imagePosX: 20,
				imagePosY: 15,
				labelPosition: "topLeft",
				labelPosX: 60,
				labelPosY: 14,
				labelWidth: 110,
				labelHeight: 29,
				labelEditable: true,
				labelSingleLine: true,
				labelOutline: false,
				labelMaxCharacters: 64,
				labelAllowReturnKey: "save",
				portRadius: 10,
				inputPortDisplay: false,
				outputPortRightPosition: "middleRight",
				outputPortRightPosX: 0,
				outputPortRightPosY: 0,
				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/stages/decorations/dragStateArrow.svg",
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/stages/decorations/dragStateArrow.svg"
			},
			enableCanvasLayout: {
				commentHighlightGap: 3,
				dataLinkArrowHead: "M -5 5 L 0 0 -5 -5",
				linkGap: 4,
				displayLinkOnOverlap: false,
				linkStartHandleObject: "image",
				linkStartHandleImage: "/images/custom-canvases/stages/decorations/dragStateStart.svg",
				linkStartHandleWidth: 20,
				linkStartHandleHeight: 20,
				linkEndHandleObject: "image",
				linkEndHandleImage: "/images/custom-canvases/stages/decorations/dragStateArrow.svg",
				linkEndHandleWidth: 20,
				linkEndHandleHeight: 20,
				linkHandleRaiseToTop: true
			}
		});
		return config;
	}

	getDecorationsArray(linkLabel) {
		const decs = [
			{ id: "dec-0", position: "source", path: "M 0 -5 A 5 5 0 1 1 0 5 A 5 5 0 1 1 0 -5", class_name: "det-link-dot", temporary: true },
			{ id: "dec-1", position: "source", image: "images/up-triangle.svg", class_name: "det-tri",
				distance: 40, x_pos: -16, y_pos: -16, width: 36, height: 36, outline: true, tooltip: "Up Triangle", temporary: true },
			{ id: "dec-2", position: "target", image: "images/down-triangle.svg", class_name: "det-tri",
				distance: -40, x_pos: -16, y_pos: -16, width: 36, height: 36, outline: true, tooltip: "Down Triangle", temporary: true },
			{ id: "dec-3", position: "middle", path: "M -25 -20 L -25 20 25 20 25 -20 Z", class_name: "det-link-label-background", temporary: true },
			{ id: "link-label", position: "middle", label: linkLabel, label_editable: true, label_allow_return_key: "save",
				x_pos: -16, y_pos: -10, width: 30, height: 25, temporary: true }
		];
		return decs;
	}

	getNewPort(i) {
		return {
			"id": "outPort" + i,
			"cardinality": {
				"min": 0,
				"max": 1
			},
			"label": "Output Port " + i
		};
	}

	createCurvedNodeOutline(startX, startY, width, height, corner) {
		const topEdge = startY;
		const bottomEdge = startY + height;
		const leftEdge = startX;
		const rightEdge = startX + width;
		return `M ${leftEdge + corner} ${topEdge} L ${rightEdge - corner} ${topEdge}` +
			`Q ${rightEdge} ${topEdge} ${rightEdge} ${topEdge + corner} ` +
			`L ${rightEdge} ${bottomEdge - corner} ` +
			`Q ${rightEdge} ${bottomEdge} ${rightEdge - corner} ${bottomEdge} ` +
			`L ${leftEdge + corner} ${bottomEdge} ` +
			`Q ${leftEdge} ${bottomEdge} ${leftEdge} ${bottomEdge - corner} ` +
			`L ${leftEdge} ${topEdge + corner} ` +
			`Q ${leftEdge} ${topEdge} ${leftEdge + corner} ${topEdge} Z`;
	}

	decorationActionHandler() {
		this.canvasController.displaySubPipeline({
			pipelineId: "75ed071a-ba8d-4212-a2ad-41a54198dd6b",
			pipelineFlowId: "ac3d3e04-c3d2-4da7-ab5a-2b9573e5e159"
		});
	}

	editActionHandler(data, command) {
		if (data.editType === "linkNodes") {
			this.createDecorations(data.linkIds[0]);
		} else if (data.editType === "redo" && command.data.editType === "linkNodes") {
			this.createDecorations(command.data.linkIds[0]);
		} else if (data.editType === "createSuperNode" ||
								data.editType === "redo" && command.data.editType === "createSuperNode") {
			const newNodeProps =
				{ label: "Local Container",
					description: "A Data Stage Container that is local",
					image: "/images/custom-canvases/flows/palette/icons/supernode.svg" };

			this.canvasController.setNodeProperties(
				command.supernode.id,
				newNodeProps,
				command.apiPipeline.pipelineId);
		} else if (data.editType === "addPort") {
			const outputs = this.canvasController.getNodeOutputPorts(data.selectedObjects[0].id);
			const newOutputs = outputs.concat(this.getNewPort(outputs.length + 1));
			this.canvasController.setNodeOutputPorts(data.selectedObjects[0].id, newOutputs);
		} else if (data.editType === "renameLinkLabel") {
			this.canvasController.setLinkDecorationLabelEditingMode("link-label", data.id, data.pipelineId);
		}
	}

	contextMenuHandler(source, defaultMenu) {
		const newMenu = defaultMenu;

		if (source.type === "link") {
			newMenu.unshift(
				{ action: "renameLinkLabel", label: "Rename" }
			);
		}

		if (source.selectedObjectIds.length === 1) {
			return newMenu.concat([
				{ divider: true }, { action: "addPort", label: "Add port" }
			]);
		}
		return newMenu;
	}

	clickActionHandler(source) {
		if (source.clickType === "DOUBLE_CLICK") {
			const node = this.canvasController.getNode(source.id, source.pipelineId);
			if (node && node.type === "super_node") {
				this.canvasController.displaySubPipelineForSupernode(source.id, source.pipelineId);
			}
		}
	}

	createDecorations(linkId) {
		const linkLabel = "link " + linkId.substring(0, 2);
		const decs = this.getDecorationsArray(linkLabel);
		this.canvasController.setLinkDecorations(linkId, decs);
	}

	render() {
		const config = this.getConfig();
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				decorationActionHandler={this.decorationActionHandler}
				editActionHandler={this.editActionHandler}
				clickActionHandler={this.clickActionHandler}
				contextMenuHandler={this.contextMenuHandler}
				config={config}
			/>
		);
	}
}

DetachedCanvas.propTypes = {
	config: PropTypes.object
};
