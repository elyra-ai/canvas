import React from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController } from "common-canvas";

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
			enableConnectionType: "Ports",
			enableLinkType: "Straight",
			enableSaveZoom: "LocalStorage",
			enableSnapToGridType: "After",
			paletteInitialState: true,
			enableDropZoneOnExternalDrag: true,
			enableHightlightNodeOnNewLinkDrag: true,
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				labelAndIconVerticalJustification: "none",
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
				labelPosX: 36,
				labelPosY: 70,
				portRadius: 10,
				inputPortLeftPosX: 0,
				inputPortLeftPosY: 28,
				outputPortRightPosX: 0,
				outputPortRightPosY: 28,
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
