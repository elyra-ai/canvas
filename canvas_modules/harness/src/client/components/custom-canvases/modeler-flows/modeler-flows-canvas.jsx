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

		this.config = Object.assign({}, props.config, {
			enableParentClass: "modeler-flows",
			enableNodeFormatType: "Vertical",
			enableConnectionType: "Ports",
			enableLinkType: "Elbow",
			enableSaveZoom: "LocalStorage",
			enableSnapToGridType: "After",
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
				defaultNodeWidth: 72,
				defaultNodeHeight: 72,
				selectionPath: "M 8 0 L 64 0 64 56 8 56 8 0",
				ellipsisWidth: 16,
				ellipsisHeight: 22,
				ellipsisPosY: -5,
				ellipsisPosX: 62,
				imageWidth: 48,
				imageHeight: 48,
				imagePosX: 12,
				imagePosY: 4,
				labelPosX: 36,
				labelPosY: 70,
				portRadius: 10,
				inputPortPosX: 0,
				outputPortPosX: 0,
				portPosY: 28,
				outputPortObject: "image",
				outputPortImage: "/images/modeler-flows/decorations/dragStateArrow.svg",
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/modeler-flows/decorations/dragStateArrow.svg"
			},
			enableCanvasLayout: {
				dataLinkArrowHead: true,
				linkGap: 4
			}
		});
	}

	render() {

		return (
			<CommonCanvas
				canvasController={this.canvasController}
				config={this.config}
			/>
		);
	}
}

ModelerFlowsCanvas.propTypes = {
	config: PropTypes.object
};
