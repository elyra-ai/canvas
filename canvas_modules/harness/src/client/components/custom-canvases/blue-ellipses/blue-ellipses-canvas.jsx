import React from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController } from "common-canvas";

import BlueEllipsesCanvasFlow from "./blueEllipsesCanvas.json";
import ModelerPalette from "../../../../../test_resources/palettes/modelerPalette.json";

export default class BlueEllipsesCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(BlueEllipsesCanvasFlow);
		this.canvasController.setPipelineFlowPalette(ModelerPalette);

		this.config = Object.assign({}, props.config, {
			enableParentClass: "blue-ellipses",
			enableNodeFormatType: "Vertical",
			enableLinkSelection: "None",
			enableNodeLayout:
				{
					bodyPath: "     M  0 30 Q  0  0 60  0 Q 120  0 120 30 Q 120 60 60 60 Q  0 60  0 30 Z",
					selectionPath: "M -5 30 Q -5 -5 60 -5 Q 125 -5 125 30 Q 125 65 60 65 Q -5 65 -5 30 Z",
					defaultNodeWidth: 120,
					defaultNodeHeight: 60,
					labelAndIconVerticalJustification: "none",
					imageWidth: 30,
					imageHeight: 30,
					imagePosX: 20,
					imagePosY: 10,
					labelPosX: 60,
					labelPosY: 39,
					labelWidth: 90,
					labelHeight: 13, // Should match the font size specified in css
					ellipsisDisplay: true,
					ellipsisPosX: 100,
					ellipsisPosY: 20,
					haloDisplay: false,
					haloCenterX: 60,
					haloCenterY: 30,
					haloRadius: 30,
					portPosY: 30
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

BlueEllipsesCanvas.propTypes = {
	config: PropTypes.object
};
