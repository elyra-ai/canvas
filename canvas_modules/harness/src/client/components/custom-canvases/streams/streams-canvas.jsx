/*
 * Copyright 2017-2023 Elyra Authors
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

import StreamsCanvasFlow from "./streams.json";

export default class StreamsCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(StreamsCanvasFlow);

		// The below overrides were provided by Mary Komor from the Streams team
		this.config = Object.assign({}, props.config, {
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Elbow",
			enablePaletteLayout: "Flyout",
			enableParentClass: "streams",
			enableLinkSelection: "None",
			enableAutoLayoutVerticalSpacing: 50,
			enableAutoLayoutHorizontalSpacing: 80,
			enableInternalObjectModel: true,
			enableMoveNodesOnSupernodeResize: true,
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
				portArcSpacing: 15,
				labelEditable: true,

				imagePosition: "middleCenter",
				imagePosX: -74,
				imagePosY: -13,

				labelPosition: "middleCenter",
				labelPosX: -42,
				labelPosY: -8,

				errorPosition: "middleCenter",
				errorXPos: -56,
				errorYPos: -14,

				ellipsisPosition: "middleCenter",
				ellipsisPosX: 65,
				ellipsisPosY: -12,
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
