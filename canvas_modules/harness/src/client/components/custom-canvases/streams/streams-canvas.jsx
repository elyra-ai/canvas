import React from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController } from "common-canvas";

import StreamsCanvasFlow from "./streams.json";

export default class StreamsCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(StreamsCanvasFlow);

		// The below overrides were provided by Mary Komor from the Streams team
		this.config = Object.assign({}, props.config, {
			enableConnectionType: "Ports",
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Elbow",
			enablePaletteLayout: "Flyout",
			enableParentClass: "streams",
			enableAutoLayoutVerticalSpacing: 50,
			enableAutoLayoutHorizontalSpacing: 80,
			enableInternalObjectModel: true,
			enableMoveNodesOnSupernodeResize: true,
			enableDisplayFullLabelOnHover: true,
			enableDropZoneOnExternalDrag: true,
			enableNarrowPalette: false,
			schemaValidation: true,
			tipConfig: {
				palette: false,
				nodes: true,
				ports: true,
				links: true
			},
			enableNodeLayout: {
				minInitialLine: 75,
				portArcSpacing: 15
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

StreamsCanvas.propTypes = {
	config: PropTypes.object,
};
