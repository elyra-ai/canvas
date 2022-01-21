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

import LogicCanvasFlow from "./logicCanvas.json";
import LogicPalette from "./logicPalette.json";


export default class LogicCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(LogicCanvasFlow);
		this.canvasController.setPipelineFlowPalette(LogicPalette);

		this.getConfig = this.getConfig.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);

	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "logic-canvas",
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Straight",
			enableLinkDirection: "TopBottom",
			enableSnapToGridType: "During",
			enableLinkSelection: "LinkOnly",
			paletteInitialState: true,
			enableInsertNodeDroppedOnLink: true,
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
				defaultNodeWidth: 280,
				defaultNodeHeight: 60,
				nodeShape: "rectangle",
				nodeHighlightGap: 6,

				minInitialLine: 20,

				ellipsisPosition: "middleRight",
				ellipsisWidth: 15,
				ellipsisHeight: 30,
				ellipsisPosY: -15,
				ellipsisPosX: -30,

				imageWidth: 40,
				imageHeight: 40,
				imagePosX: 10,
				imagePosY: 10,

				labelPosX: 65,
				labelPosY: 15,
				labelWidth: 180,
				labelHeight: 29,
				labelEditable: true,
				labelSingleLine: true,
				labelOutline: false,

				inputPortTopPosX: 140,
				inputPortTopPosY: -20,
				inputPortWidth: 20,
				inputPortHeight: 20,
				inputPortObject: "image",
				inputPortImage: "/images/custom-canvases/logic/decorations/dragStateArrowDown.svg",

				outputPortBottomPosX: 140,
				outputPortBottomPosY: 20,
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/logic/decorations/dragStateArrowDown.svg",

				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/logic/decorations/dragStateArrowDown.svg",
				outputPortGuideImageRotate: true
			},
			enableCanvasLayout: {
				commentHighlightGap: 6,
				nodeProximity: 50,
				displayLinkOnOverlap: true,

				dataLinkArrowHead: true,
				linkGap: 4,

				snapToGridX: "10%",
				snapToGridY: "20%",
			}
		});
		return config;
	}

	editActionHandler(data, command) {
		// Implement
	}

	render() {
		const config = this.getConfig();
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				editActionHandler={this.editActionHandler}
				config={config}
			/>
		);
	}
}

LogicCanvas.propTypes = {
	config: PropTypes.object
};
