import React from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController } from "common-canvas";

import ModelerFlowsCanvasFlow from "./modelerFlowsNewDesignCanvas.json";
import ModelerFlowsPalette from "./modelerFlowsNewDesignPalette.json";


export default class ModelerFlowsCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(ModelerFlowsCanvasFlow);
		this.canvasController.setPipelineFlowPalette(ModelerFlowsPalette);

		this.getConfig = this.getConfig.bind(this);
	}

	getConfig() {
		// this.canvasController = new CanvasController();

		const config = Object.assign({}, this.props.config, {
			enableParentClass: "modeler-flows",
			enableNodeFormatType: "Vertical",
			enableConnectionType: "Ports",
			enableLinkType: "Elbow",
			enableSaveZoom: "LocalStorage",
			enableSnapToGridType: "After",
			paletteInitialState: true,
			enableDropZoneOnExternalDrag: true,
			enableHightlightPortOnNewLinkDrag: true,
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
				outputPortImage: "/images/modeler-flows/decorations/dragStateArrow.svg",
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/modeler-flows/decorations/dragStateArrow.svg"
			},
			enableCanvasLayout: {
				dataLinkArrowHead: true,
				linkGap: 4,
				displayLinkOnOverlap: false,
				alwaysDisplayBackToParentFlow: true
			}
		});
		return config;
	}

	render() {
		const config = this.getConfig();
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				config={config}
			/>
		);
	}
}

ModelerFlowsCanvas.propTypes = {
	config: PropTypes.object
};
