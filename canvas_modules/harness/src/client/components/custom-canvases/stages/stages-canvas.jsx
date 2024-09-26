/*
 * Copyright 2017-2024 Elyra Authors
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
/* eslint no-alert: "off" */

import React from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController, Palette } from "common-canvas"; // eslint-disable-line import/no-unresolved

import { Button } from "@carbon/react";
import { Edit, OpenPanelFilledLeft, Search } from "@carbon/react/icons";

import MultiCommandPanel from "./multi-command-panel";
import AppDecoration from "./app-decoration.jsx";

import StagesFlow from "./stages-flow.json";
import StagesPalette from "../../../../../test_resources/palettes/stagesPalette.json";

export default class StagesCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			leftFlyout: null,
			showLeftFlyout: false
		};

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(StagesFlow);
		this.canvasController.setPipelineFlowPalette(StagesPalette);

		this.getConfig = this.getConfig.bind(this);
		this.getToolbarConfig = this.getToolbarConfig.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
		this.contextMenuHandler = this.contextMenuHandler.bind(this);

		// Add decorations to the links
		const pId = this.canvasController.getPrimaryPipelineId();
		const pipelineLinkDecorations =
			this.canvasController.getLinks().map((link) => {
				const decs = this.getDecorationsArray(link.id);
				return { linkId: link.id, pipelineId: pId, decorations: decs };
			});
		this.canvasController.setLinksMultiDecorations(pipelineLinkDecorations);

		// Palette header object - used in a real application to open an asset browser.
		this.paletteHeader = (
			<div style={{ borderBottom: "1px solid lightgray", height: "fit-content", padding: "20px 18px 20px" }} >
				<Button kind="tertiary" size="sm" onClick={() => window.alert("In a real application an Asset Browser would open now.")}>
					Add asset to canvas +
				</Button>
			</div>
		);
	}

	getToolbarConfig() {
		// The code below can be used if flipping between the two palette icons with the arrow is needed
		// const icon = this.state.showLeftFlyout ? (<SidePanelCloseFilled />) : (<SidePanelOpenFilled />);

		const icon = (<OpenPanelFilledLeft />);

		const toolbarConfig = {
			leftBar: [
				{ action: "left-flyout-palette", enable: true, iconEnabled: icon },
				{ action: "left-flyout-search", enable: true, iconEnabled: (<Search size={32} />) },
				{ divider: true },
				{ action: "undo",
					label: "Undo",
					purpose: "dual",
					subPanel: MultiCommandPanel,
					subPanelData: { canvasController: this.canvasController, command: "undo" } },
				{ action: "redo",
					label: "Redo",
					purpose: "dual",
					subPanel: MultiCommandPanel,
					subPanelData: { canvasController: this.canvasController, command: "redo" } },
				{ divider: true },
				{ action: "cut", label: "Cut", enable: true },
				{ action: "copy", label: "Copy", enable: true },
				{ action: "paste", label: "Paste", enable: true },
				{ divider: true },
				{ action: "createAutoComment", label: "Add Comment", enable: true },
				{ action: "deleteSelectedObjects", label: "Delete", enable: true }
			],
			rightBar: [
				{ divider: true },
				{ action: "zoomIn", label: "Zoom In", enable: true },
				{ action: "zoomOut", label: "Zoom Out", enable: true },
				{ action: "zoomToFit", label: "Zoom To Fit", enable: true }
			]
		};
		return toolbarConfig;
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "stages",
			enableNodeFormatType: "Vertical",
			enablePaletteLayout: "None",
			enableNarrowPalette: false,
			enableLeftFlyoutUnderToolbar: true,
			enableRightFlyoutUnderToolbar: true,
			enableLinkType: "Straight",
			enableLinkMethod: "Freeform",
			enableLinkDirection: "LeftRight",
			enableSaveZoom: "LocalStorage",
			enableSnapToGridType: "After",
			enableSnapToGridX: "33%",
			enableSnapToGridY: "33%",
			enableLinkSelection: "Detachable",
			enableInsertNodeDroppedOnLink: true,
			enableDropZoneOnExternalDrag: true,
			enableHighlightNodeOnNewLinkDrag: true,
			enableHighlightUnavailableNodes: true,
			enableDisplayFullLabelOnHover: true,
			enableAutoLinkOnlyFromSelNodes: true,
			enableSingleOutputPortDisplay: true,
			enableMarkdownInComments: true,
			enableContextToolbar: true,
			enableResizableNodes: true,
			enablePaletteHeader: this.paletteHeader,
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				drawNodeLinkLineFromTo: "node_center",
				drawCommentLinkLineTo: "node_center",
				defaultNodeWidth: 72,
				defaultNodeHeight: 82,
				ellipsisWidth: 14,
				ellipsisHeight: 18,
				ellipsisPosition: "middleCenter",
				ellipsisPosY: -30,
				ellipsisPosX: 20,
				imageWidth: 48,
				imageHeight: 48,
				imagePosition: "middleCenter",
				imagePosX: -24,
				imagePosY: -30,
				labelPosition: "middleCenter",
				labelPosX: 0,
				labelPosY: 20,
				labelWidth: 200,
				labelHeight: 29,
				labelEditable: true,
				labelSingleLine: false,
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
				linkHandleRaiseToTop: true,
				linkContextToolbarPosX: 0,
				linkContextToolbarPosY: -15,
				linkLengthForAltDecorations: 150,
				linkAltDecorations: [
					{ id: "alt-123", path: "M -25 -20 L -25 20 25 20 25 -20 Z", class_name: "det-link-label-background" },
					{ id: "alt-456", label: "XXX", x_pos: -10, y_pos: -10 }
				]
			}
		});
		return config;
	}

	getDecorationsArray(linkLabel) {
		const decs = [
			{ id: "dec-0", position: "source", path: "M 0 -5 A 5 5 0 1 1 0 5 A 5 5 0 1 1 0 -5", class_name: "det-link-dot", temporary: true },
			{ id: "dec-1", position: "source", image: "images/custom-canvases/stages/decorations/tri-up.svg", class_name: "det-tri",
				distance: 40, x_pos: -7, y_pos: -7, width: 14, height: 14, outline: true, tooltip: "Up Triangle", temporary: true },
			{ id: "dec-2", position: "target", image: "images/custom-canvases/stages/decorations/tri-down.svg", class_name: "det-tri",
				distance: -40, x_pos: -7, y_pos: -7, width: 14, height: 14, outline: true, tooltip: "Down Triangle", temporary: true },
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

	editActionHandler(data, command) {
		if (data.editType === "left-flyout-palette") {
			if (this.state.leftFlyout === "palette") {
				this.setState({ leftFlyout: null, showLeftFlyout: false });

			} else {
				this.setState({ leftFlyout: "palette", showLeftFlyout: true });
			}

		} else if (data.editType === "left-flyout-search") {
			if (this.state.leftFlyout === "search") {
				this.setState({ leftFlyout: null, showLeftFlyout: false });

			} else {
				this.setState({ leftFlyout: "search", showLeftFlyout: true });
			}

		} else if (data.editType === "linkNodes") {
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
				{ action: "renameLinkLabel", label: "Rename", icon: (<Edit />) }
			);
		}

		return newMenu;
	}

	clickActionHandler(source) {
		if (source.objectType === "node" &&
				source.clickType === "DOUBLE_CLICK") {
			const node = this.canvasController.getNode(source.id, source.pipelineId);

			if (node && node.type === "super_node") {
				this.canvasController.displaySubPipelineForSupernode(source.id, source.pipelineId);

			} else {
				const decs = (this.canvasController.getNodeDecorations(source.id))
					? null
					: [{
						id: "123",
						jsx: (<AppDecoration node={node} />),
						x_pos: -10,
						y_pos: -115,
						width: 250,
						height: 90
					}];
				this.canvasController.setNodeDecorations(source.id, decs);
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
		const toolbarConfig = this.getToolbarConfig();

		let leftFlyoutContent = null;

		if (this.state.leftFlyout === "palette") {
			leftFlyoutContent = (<Palette canvasController={this.canvasController} />);

		} else if (this.state.leftFlyout === "search") {
			leftFlyoutContent = (
				<div style={{ width: "300px", padding: "20px" }}>
					This panel could contain Search controls to provde a sophisticated search experience.
				</div>
			);
		}

		return (
			<CommonCanvas
				canvasController={this.canvasController}
				editActionHandler={this.editActionHandler}
				clickActionHandler={this.clickActionHandler}
				contextMenuHandler={this.contextMenuHandler}
				toolbarConfig={toolbarConfig}
				config={config}
				showLeftFlyout={this.state.showLeftFlyout}
				leftFlyoutContent={leftFlyoutContent}
			/>
		);
	}
}

StagesCanvas.propTypes = {
	config: PropTypes.object
};
