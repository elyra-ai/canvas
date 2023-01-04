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

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved
import { LINK_SELECTION_LINK_ONLY, PALETTE_LAYOUT_NONE,
	STATE_TAG_NONE, STATE_TAG_LOCKED, STATE_TAG_READ_ONLY }
	from "../../../../../../common-canvas/src/common-canvas/constants/canvas-constants.js";
import DetachedCanvasFlow from "./detachedCanvas.json";
import DetachedPalette from "./detachedPalette.json";

import { Edit16, EditOff16, Locked16 } from "@carbon/icons-react";

export default class ReadOnlyCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			editState: STATE_TAG_READ_ONLY
		};

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(DetachedCanvasFlow);
		this.canvasController.setPipelineFlowPalette(DetachedPalette);

		this.getConfig = this.getConfig.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);
		this.contextMenuHandler = this.contextMenuHandler.bind(this);

		// Add decorations to the links
		const pId = this.canvasController.getPrimaryPipelineId();
		const pipelineLinkDecorations =
			this.canvasController.getLinks().map((link) => {
				const decs = this.getDecorationsArray(link.id);
				return { linkId: link.id, pipelineId: pId, decorations: decs };
			});
		this.canvasController.setLinksMultiDecorations(pipelineLinkDecorations);

	}

	getToolbarConfig() {
		const toolbarConfig = [
			{ action: "undo", label: "Undo" },
			{ action: "redo", label: "Redo" },
			{ action: "cut", label: "Cut", tooltip: "Cut to clipboard" },
			{ action: "copy", label: "Copy", tooltip: "Copy to clipboard" },
			{ action: "paste", label: "Paste", tooltip: "Paste from canvas" },
			{ action: "createAutoComment", label: "Add Comment" },
			{ action: "deleteSelectedObjects", label: "Delete" },
			{ divider: true },
			{ action: "edit", label: "Edit", iconEnabled: (<Edit16 />), enable: true, isSelected: this.state.editState === STATE_TAG_NONE },
			{ action: "readOnly", label: "Read-only", iconEnabled: (<EditOff16 />), enable: true, isSelected: this.state.editState === STATE_TAG_READ_ONLY },
			{ action: "locked", label: "Locked", iconEnabled: (<Locked16 />), enable: true, isSelected: this.state.editState === STATE_TAG_LOCKED },
			{ divider: true }
		];

		return toolbarConfig;
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "writable",
			enableNodeFormatType: "Vertical",
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
				inputPortDisplay: false,
				outputPortRightPosX: 4,
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

		if (this.state.editState === STATE_TAG_READ_ONLY ||
				this.state.editState === STATE_TAG_LOCKED) {
			config.enableStateTag = this.state.editState;
			config.enablePaletteLayout = PALETTE_LAYOUT_NONE;
			config.enableEditingActions = false;
			config.enableNodeLayout.outputPortDisplay = false;
			config.enableLinkSelection = LINK_SELECTION_LINK_ONLY;
			config.enableDropZoneOnExternalDrag = false;
		}

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
			{ id: "dec-4", position: "middle", label: linkLabel, x_pos: -16, y_pos: -10, width: 30, height: 25, temporary: true }
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
		} else if (data.editType === "readOnly") {
			this.setState({ editState: STATE_TAG_READ_ONLY });

		} else if (data.editType === "locked") {
			this.setState({ editState: STATE_TAG_LOCKED });

		} else if (data.editType === "edit") {
			this.setState({ editState: STATE_TAG_NONE });
		}
	}

	contextMenuHandler(source, defaultMenu) {
		// Only add the 'Add Port' option if just one object is selctd AND
		// we are showing an editable canvas.
		if (source.selectedObjectIds.length === 1 &&
				(this.state.editState === STATE_TAG_NONE)) {
			return defaultMenu.concat([
				{ divider: true }, { action: "addPort", label: "Add port" }
			]);
		}
		return defaultMenu;
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

	tipHandler(tipType, data) {
		if (tipType === "tipTypeStateTag") {
			return "This sample application displays a canvas which cannot be edited. (This tooltip text was provided by the sample app code.)";
		}
		return null;
	}

	render() {
		const config = this.getConfig();
		const toolbarConfig = this.getToolbarConfig();
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				decorationActionHandler={this.decorationActionHandler}
				editActionHandler={this.editActionHandler}
				clickActionHandler={this.clickActionHandler}
				contextMenuHandler={this.contextMenuHandler}
				tipHandler={this.tipHandler}
				config={config}
				toolbarConfig={toolbarConfig}
			/>
		);
	}
}

ReadOnlyCanvas.propTypes = {
	config: PropTypes.object
};
