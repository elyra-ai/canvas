/*
 * Copyright 2023 Elyra Authors
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

import CardNodeWrapper from "./wrapper-card-node.jsx";
import ShapeNodeWrapper from "./wrapper-shape-node.jsx";

import ReactNodesFlow from "./react-nodes-carbon-flow.json";
import ReactNodesPalette from "./react-nodes-carbon-palette.json";


export default class ReactNodesCarbonCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(ReactNodesFlow);
		this.canvasController.setPipelineFlowPalette(ReactNodesPalette);

		this.getConfig = this.getConfig.bind(this);
		this.layoutHandler = this.layoutHandler.bind(this);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "react-nodes-carbon",
			enableNodeFormatType: "Vertical",
			enableLinkType: "Curve",
			enableLinkDirection: "LeftRight",
			enableSnapToGridType: "After",
			enableLinkSelection: "None",
			enableLinkReplaceOnNewConnection: true,
			paletteInitialState: true,
			enableResizableNodes: true,
			enableMarkdownInComments: true,
			enableDropZoneOnExternalDrag: true,
			enableHighlightNodeOnNewLinkDrag: true,
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				drawNodeLinkLineFromTo: "node_center",
				drawCommentLinkLineTo: "node_center",
				nodeShapeDisplay: false,
				nodeExternalObject: CardNodeWrapper,
				defaultNodeWidth: 220,
				defaultNodeHeight: 100,
				contextToolbarPosition: "topRight",
				ellipsisPosition: "topRight",
				ellipsisWidth: 30,
				ellipsisHeight: 30,
				ellipsisPosY: -35,
				ellipsisPosX: -30,
				imageDisplay: false,
				labelDisplay: false,
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
				supernodeTopAreaHeight: 28,
				supernodeSVGAreaPadding: 5
			}
		});
		return config;
	}

	getCanvasController() {
		return this.canvasController;
	}

	layoutHandler(node) {
		if (node.op === "shape-node") {
			const config = {
				selectionPath: "M -4 -4 h 36 v 36 h -36 Z",
				nodeExternalObject: ShapeNodeWrapper,
				defaultNodeWidth: 28,
				defaultNodeHeight: 70,
				className: "shape-node",
				contextToolbarPosition: "topCenter",
				inputPortDisplay: false,
				inputPortLeftPosX: -12,
				inputPortLeftPosY: 15,
				outputPortRightPosX: 12,
				outputPortRightPosY: 15
			};
			return config;
		}
		return null;
	}

	render() {
		const config = this.getConfig();
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				config={config}
				layoutHandler={this.layoutHandler}
			/>
		);
	}
}

ReactNodesCarbonCanvas.propTypes = {
	config: PropTypes.object
};
