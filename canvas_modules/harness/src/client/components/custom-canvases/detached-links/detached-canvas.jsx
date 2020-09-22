import React from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController } from "common-canvas";

import DetachedCanvasFlow from "./detachedCanvas.json";
import DetachedPalette from "./detachedPalette.json";


export default class DetachedCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(DetachedCanvasFlow);
		this.canvasController.setPipelineFlowPalette(DetachedPalette);

		this.getConfig = this.getConfig.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "detached-links",
			enableNodeFormatType: "Vertical",
			enableConnectionType: "Ports",
			enableLinkType: "Straight",
			enableSaveZoom: "LocalStorage",
			enableSnapToGridType: "After",
			enableLinkSelection: "Detachable",
			enableInsertNodeDroppedOnLink: true,
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
				outputPortRightPosX: 4,
				outputPortRightPosY: 30,
				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/detached-links/decorations/dragStateArrow.svg",
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/detached-links/decorations/dragStateArrow.svg"
			},
			enableCanvasLayout: {
				dataLinkArrowHead: true,
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

	decorationActionHandler() {
		this.canvasController.displaySubPipeline({
			pipelineId: "75ed071a-ba8d-4212-a2ad-41a54198dd6b",
			pipelineFlowId: "ac3d3e04-c3d2-4da7-ab5a-2b9573e5e159"
		});
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

DetachedCanvas.propTypes = {
	config: PropTypes.object
};
