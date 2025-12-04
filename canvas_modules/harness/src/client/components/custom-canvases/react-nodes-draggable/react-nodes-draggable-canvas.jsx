/*
 * Copyright 2025 Elyra Authors
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

import { CommonCanvas, CanvasController } from "@elyra/canvas";

import PersonNode from "./person-node.jsx";

import ReactNodesFlow from "./react-nodes-draggable-flow.json";


export default class ReactNodesCarbonCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(ReactNodesFlow);

		this.getConfig = this.getConfig.bind(this);
	}

	onDrop() {
		window.alert(`${document.objBeingDragged} dropped on Drop Zone`);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "react-nodes-draggable",
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Elbow",
			enableLinkSelection: "None",
			enableMarkdownInComments: true,
			enableDropZoneOnExternalDrag: true,
			enableContextToolbar: true,
			enablePaletteLayout: "None",
			enableKeyboardNavigation: true,
			tipConfig: {
				palette: true,
				nodes: false,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				drawNodeLinkLineFromTo: "node_center",
				drawCommentLinkLineTo: "node_center",
				nodeShapeDisplay: false,
				nodeShape: "rectangle",
				nodeHighlightGap: 2,
				nodeMovable: false,
				nodeExternalObject: PersonNode,
				onFocusAllowDefaultAction: true,
				defaultNodeWidth: 100,
				defaultNodeHeight: 40,
				contextToolbarPosition: "topRight",
				ellipsisPosition: "topRight",
				ellipsisWidth: 30,
				ellipsisHeight: 30,
				ellipsisPosY: -35,
				ellipsisPosX: -30,
				imageDisplay: false,
				labelDisplay: false,

				inputPortDisplay: false,
				outputPortDisplay: false,

				// Position of ports adjust the start and end of the
				// elbow link lines (even though the ports are not displayed)
				inputPortPositions: [
					{ x_pos: -10, y_pos: 0, pos: "middleLeft" }
				],
				outputPortPositions: [
					{ x_pos: 10, y_pos: 0, pos: "middleRight" }
				],


			},
			enableCanvasLayout: {
				dataLinkArrowHead: true,
				linkGap: 10
			}
		});
		return config;
	}

	getCanvasController() {
		return this.canvasController;
	}

	getRightFlyoutContent() {
		const nodeData1 = {
			label: "WILLIAM",
			image: "images/custom-canvases/flows/palette/icons/userinput.svg"
		};
		const nodeData2 = {
			label: "ERIC",
			image: "images/custom-canvases/flows/palette/icons/userinput.svg"
		};

		return (
			<div className={"node-container"}>
				<span>Drag a node from the drag zone to the hierarchy or drag a node from the hierarchy to the drop zone.</span>
				<div className={"node-zone"} >
					<h6>Drag Zone.</h6>
					<PersonNode nodeData={nodeData1} />
					<PersonNode nodeData={nodeData2} />
				</div>
				<div className={"drop-zone"} onDrop={this.onDrop.bind(this)} >
					<h6>Drop Zone.</h6>
				</div>
			</div>
		);
	}

	editActionHandler(data) {
		if (data.editType === "createExternalNode") {
			window.alert(`${data.label} dropped on canvas background at ${data.offsetX}, ${data.offsetY}`);
		}
	}

	contextMenuHandler() {
		return [];
	}


	render() {
		const config = this.getConfig();
		const rfContent = this.getRightFlyoutContent();

		return (
			<CommonCanvas
				canvasController={this.canvasController}
				config={config}
				editActionHandler={this.editActionHandler}
				contextMenuHandler={this.contextMenuHandler}
				showRightFlyout
				rightFlyoutContent={rfContent}
			/>
		);
	}
}

ReactNodesCarbonCanvas.propTypes = {
	config: PropTypes.object
};
