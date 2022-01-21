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

import FlowsCanvasFlow from "./flowsCanvas.json";
import FlowsPalette from "./flowsPalette.json";
import FlowsLoadingPalette from "./flowsLoadingPalette.json";


export default class FlowsCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(FlowsCanvasFlow);
		this.canvasController.setPipelineFlowPalette(FlowsLoadingPalette);

		this.activateLoadingCanvas();

		this.getConfig = this.getConfig.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "flows",
			enableNodeFormatType: "Vertical",
			enableLinkType: "Straight",
			enableLinkDirection: "LeftRight",
			enableSaveZoom: "LocalStorage",
			enableSnapToGridType: "After",
			enableLinkSelection: "None",
			enableLinkReplaceOnNewConnection: true,
			paletteInitialState: true,
			enableDropZoneOnExternalDrag: true,
			enableHighlightNodeOnNewLinkDrag: true,
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
				defaultNodeHeight: 72,
				selectionPath: "M 8 0 L 64 0 64 56 8 56 8 0",
				ellipsisWidth: 12,
				ellipsisHeight: 16,
				ellipsisPosY: -1,
				ellipsisPosX: 64.5,
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

	decorationActionHandler() {
		this.canvasController.displaySubPipeline({
			pipelineId: "75ed071a-ba8d-4212-a2ad-41a54198dd6b",
			pipelineFlowId: "ac3d3e04-c3d2-4da7-ab5a-2b9573e5e159"
		});
	}

	activateLoadingCanvas() {
		this.canvasController.setCategoryLoadingText("recordOp", "Loading record ops");
		this.canvasController.setCategoryLoadingText("fieldOp", "Loading field ops");
		this.canvasController.setCategoryLoadingText("modeling", "Loading modeling");
		this.canvasController.setCategoryLoadingText("TextMining", "Loading text mining");
		this.canvasController.setCategoryLoadingText("graph", "Loading graphs");
		this.canvasController.setCategoryLoadingText("output", "Loading outputs");
		this.canvasController.setCategoryLoadingText("export", "Loading exports");
		this.canvasController.setCategoryLoadingText("models", "Loading models");
		setTimeout(() => {
			this.canvasController.setPipelineFlowPalette(FlowsPalette);
		}, 3000);
	}

	render() {
		const config = this.getConfig();
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				decorationActionHandler={this.decorationActionHandler}
				config={config}
			/>
		);
	}
}

FlowsCanvas.propTypes = {
	config: PropTypes.object
};
