/*
 * Copyright 2017-2021 Elyra Authors
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

import { v4 as uuid4 } from "uuid";

import { CommonCanvas, CanvasController } from "common-canvas";

import DetachedCanvasFlow from "./detachedCanvas.json";
import DetachedPalette from "./detachedPalette.json";


const MAX_PORTS = 2;

export default class DetachedCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(DetachedCanvasFlow);
		this.canvasController.setPipelineFlowPalette(DetachedPalette);

		this.getConfig = this.getConfig.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);

		// Add decorations to the links
		const pId = this.canvasController.getPrimaryPipelineId();
		const pipelineLinkDecorations =
			this.canvasController.getLinks().map((link) => {
				const decs = this.getDecorationsArray(link.id);
				return { linkId: link.id, pipelineId: pId, decorations: decs };
			});
		this.canvasController.setLinksMultiDecorations(pipelineLinkDecorations);

	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "detached-links",
			enableNodeFormatType: "Vertical",
			enableConnectionType: "Ports",
			enableLinkType: "Straight",
			enableLinkDirection: "LeftRight",
			enableSaveZoom: "LocalStorage",
			enableSnapToGridType: "After",
			enableLinkSelection: "Detachable",
			enableInsertNodeDroppedOnLink: true,
			enableDropZoneOnExternalDrag: true,
			enableHightlightNodeOnNewLinkDrag: true,
			enableDisplayFullLabelOnHover: true,
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				drawNodeLinkLineFromTo: "image_center",
				drawCommentLinkLineTo: "image_center",
				defaultNodeWidth: 72,
				defaultNodeHeight: 82,
				selectionPath: "M 8 0 L 64 0 64 56 8 56 8 0",
				ellipsisWidth: 12,
				ellipsisHeight: 16,
				ellipsisPosY: -1,
				ellipsisPosX: 64.5,
				imageWidth: 48,
				imageHeight: 48,
				imagePosX: 12,
				imagePosY: 4,
				labelPosX: 36,
				labelPosY: 56,
				labelWidth: 200,
				labelHeight: 29,
				labelEditable: true,
				labelSingleLine: false,
				labelOutline: false,
				labelMaxCharacters: 64,
				portRadius: 10,
				portArcRadius: 0,
				inputPortDisplay: false,
				outputPortRightPosX: 4,
				outputPortRightPosY: 41,
				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/detached-links/decorations/dragStateArrow.svg",
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/detached-links/decorations/dragStateArrow.svg"
			},
			enableCanvasLayout: {
				dataLinkArrowHead: "M -5 5 L 0 0 -5 -5",
				linkGap: 4,
				displayLinkOnOverlap: false,
				linkStartHandleObject: "image",
				linkStartHandleImage: "/images/custom-canvases/detached-links/decorations/dragStateStart.svg",
				linkStartHandleWidth: 20,
				linkStartHandleHeight: 20,
				linkEndHandleObject: "image",
				linkEndHandleImage: "/images/custom-canvases/detached-links/decorations/dragStateArrow.svg",
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
			{ id: "dec-1", position: "source", image: "images/up-triangle.svg", class_name: "det-tri", distance: 40, x_pos: -5, y_pos: -5, outline: false, temporary: true },
			{ id: "dec-2", position: "target", image: "images/down-triangle.svg", class_name: "det-tri", distance: -40, x_pos: -5, y_pos: -5, outline: false, temporary: true },
			{ id: "dec-3", position: "middle", path: "M -25 -20 L -25 20 25 20 25 -20 Z", class_name: "det-link-label-background", temporary: true },
			{ id: "dec-4", position: "middle", label: linkLabel, x_pos: -16, y_pos: -10, width: 30, height: 25, temporary: true }
		];
		return decs;
	}

	getLinksConnectedTo(port, srcNode) {
		return this.canvasController.getLinks().filter((lnk) =>
			lnk.srcNodeId === srcNode.id && lnk.srcNodePortId === port.id);
	}

	decorationActionHandler() {
		this.canvasController.displaySubPipeline({
			pipelineId: "75ed071a-ba8d-4212-a2ad-41a54198dd6b",
			pipelineFlowId: "ac3d3e04-c3d2-4da7-ab5a-2b9573e5e159"
		});
	}

	editActionHandler(data, command) {
		switch (data.editType) {
		case "linkNodes": {
			this.createDecorations(data.linkIds[0]);
			const nodes = this.canvasController.getNodes(data.pipelineId);
			const link = this.canvasController.getLink(data.linkIds[0], data.pipelineId);
			const srcNode = nodes.find((n) => n.id === link.srcNodeId);
			if (srcNode.outputs.length < MAX_PORTS) {
				this.addNewPortWithMaxCardOfOne(srcNode, data.pipelineId);
			}
			break;
		}
		case "createDetachedLink": {
			const nodes = this.canvasController.getNodes(data.pipelineId);
			const srcNode = nodes.find((n) => n.id === data.srcNodeId);
			if (srcNode.outputs.length < MAX_PORTS) {
				this.addNewPortWithMaxCardOfOne(srcNode, data.pipelineId);
			}
			break;
		}
		case "deleteSelectedObjects": {
			data.selectedObjects.forEach((obj) => {
				if (obj.type === "nodeLink" &&
						obj.srcNodeId) {
					const nodes = this.canvasController.getNodes(data.pipelineId);
					const srcNode = nodes.find((n) => n.id === obj.srcNodeId);
					if (srcNode) {
						srcNode.outputs = srcNode.outputs.filter((op) => op.id !== obj.srcNodePortId);
						const lastPort = srcNode.outputs[srcNode.outputs.length - 1];

						if (this.getLinksConnectedTo(lastPort, srcNode).length > 0) {
							srcNode.outputs.push(this.createNewPortWithMaxCardOfOne(srcNode, data.pipelineId));
						}
						this.canvasController.setNodeProperties(srcNode.id, srcNode, data.pipelineId);
					}
				}
			});
			break;
		}
		case "redo": {
			if (command.data.editType === "linkNodes") {
				this.createDecorations(command.data.linkIds[0]);
			}
			break;
		}
		default:
			break;
		}
	}

	createDecorations(linkId) {
		const linkLabel = "link " + linkId.substring(0, 2);
		const decs = this.getDecorationsArray(linkLabel);
		this.canvasController.setLinkDecorations(linkId, decs);
	}

	addNewPortWithMaxCardOfOne(node, pipelineId) {
		const newPort = this.createNewPortWithMaxCardOfOne();
		node.outputs.push(newPort);
		this.canvasController.setNodeOutputPorts(node.id, node.outputs, pipelineId);
	}

	createNewPortWithMaxCardOfOne() {
		const portId = uuid4();
		return {
			"id": portId,
			"cardinality": {
				"min": 0,
				"max": 1
			},
			"label": "Output Port - " + portId.substring(0, 5)
		};
	}

	render() {
		const config = this.getConfig();
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				decorationActionHandler={this.decorationActionHandler}
				editActionHandler={this.editActionHandler}
				config={config}
			/>
		);
	}
}

DetachedCanvas.propTypes = {
	config: PropTypes.object
};
